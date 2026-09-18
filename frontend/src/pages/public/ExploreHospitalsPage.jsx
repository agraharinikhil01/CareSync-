import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import socket from '../../services/socket';
import HospitalMap from '../../components/map/HospitalMap';
import HospitalCard from '../../components/hospital/HospitalCard';
import EmergencyModal from '../../components/emergency/EmergencyModal';
import {
  Compass,
  MapPin,
  Search,
  Filter,
  Siren,
  SlidersHorizontal,
  RefreshCw,
  List,
  Map as MapIcon,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

const SPECIALTIES = [
  'All Specialties',
  'Cardiology',
  'Emergency Medicine',
  'Orthopedics',
  'Pediatrics',
  'Neurology',
  'General Surgery',
  'Pulmonology',
];

const ExploreHospitalsPage = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [sortBy, setSortBy] = useState('distance');

  // Geolocation state — null = not yet resolved
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState('Detecting location...');
  const [locationSource, setLocationSource] = useState(''); // 'gps' | 'ip' | 'default'
  const [locating, setLocating] = useState(false);

  const [mobileTab, setMobileTab] = useState('list');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // --- Detect location once on mount, then trigger fetch ---
  useEffect(() => {
    detectLocation();
  }, []);

  // fetchNearby only after userLocation is resolved (not null)
  useEffect(() => {
    if (userLocation !== null) {
      fetchNearby();
    }
  }, [userLocation, selectedSpecialty, emergencyOnly]);

  useEffect(() => {
    socket.on('hospital:availability_updated', (data) => {
      setHospitals((prev) =>
        prev.map((h) => {
          if (h._id === data.hospitalId) {
            return {
              ...h,
              capacitySummary: data.capacitySummary || h.capacitySummary,
              emergencyAvailable:
                data.emergencyAvailable !== undefined
                  ? data.emergencyAvailable
                  : h.emergencyAvailable,
              lastStatusUpdate: data.updatedAt || new Date(),
              freshness: { state: 'live', label: 'Updated just now' },
            };
          }
          return h;
        })
      );
    });

    return () => {
      socket.off('hospital:availability_updated');
    };
  }, []);

  // Step 1: Try precise GPS → Step 2: IP-based fallback → Step 3: Default Delhi
  const detectLocation = () => {
    setLocating(true);
    setLocationName('Detecting location...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          setLocationName('📍 Your Live GPS Location');
          setLocationSource('gps');
          setLocating(false);
          toast.success('📍 Live GPS location acquired!');
        },
        async (err) => {
          console.warn('GPS denied/failed:', err.message, '— trying IP fallback...');
          // Step 2: IP-based geolocation (ipapi.co — free, no API key)
          await fetchIpLocation();
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    } else {
      // Browser doesn't support geolocation at all
      fetchIpLocation();
    }
  };

  const fetchIpLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(6000) });
      if (!response.ok) throw new Error('ipapi fetch failed');
      const data = await response.json();
      if (data.latitude && data.longitude) {
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        setUserLocation({ lat, lng });
        const city = data.city || data.region || 'Your City';
        setLocationName(`📡 ${city} (IP Location)`);
        setLocationSource('ip');
        setLocating(false);
        toast.success(`📡 Location detected via network: ${city}`);
        return;
      }
      throw new Error('No lat/lng from ipapi');
    } catch (ipErr) {
      console.warn('IP geolocation failed:', ipErr.message, '— using default Delhi fallback');
      // Step 3: Hard fallback to New Delhi
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
      setLocationName('🏙️ New Delhi (Default)');
      setLocationSource('default');
      setLocating(false);
      toast('📍 Could not detect location — showing New Delhi hospitals.', { icon: 'ℹ️' });
    }
  };

  const fetchNearby = async (retryCount = 0) => {
    setLoading(true);
    try {
      const params = {
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: 35,
        ...(selectedSpecialty !== 'All Specialties' && { specialty: selectedSpecialty }),
        ...(emergencyOnly && { emergencyOnly: 'true' }),
        ...(searchQuery && { search: searchQuery }),
      };

      const res = await api.get('/hospitals/nearby', { params });
      if (res.data.success) {
        setHospitals(res.data.data || []);
        if (res.data.data?.length > 0 && !selectedHospital) {
          setSelectedHospital(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching nearby hospitals:', err);
      if (retryCount < 1) {
        setTimeout(() => fetchNearby(retryCount + 1), 1500);
      } else {
        toast.error(err.response?.data?.message || 'Unable to fetch live hospitals. Please refresh or try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const [availabilityFilter, setAvailabilityFilter] = useState('ALL'); // ALL, AVAILABLE_ONLY, EMERGENCY_ONLY, ICU_ONLY
  const mapSectionRef = useRef(null);
  const hospitalsListRef = useRef(null);

  const handleCardSelect = (hosp) => {
    setSelectedHospital(hosp);
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleMapMarkerSelect = (hosp) => {
    setSelectedHospital(hosp);
  };

  const filteredHospitals = hospitals
    .filter((h) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        h.name?.toLowerCase().includes(q) ||
        h.city?.toLowerCase().includes(q) ||
        h.departments?.some((d) => d.toLowerCase().includes(q))
      );
    })
    .filter((h) => {
      const genAvail = h.capacitySummary?.general?.available || 0;
      const icuAvail = h.capacitySummary?.icu?.available || 0;
      if (availabilityFilter === 'AVAILABLE_ONLY') {
        return genAvail > 0 || icuAvail > 0;
      }
      if (availabilityFilter === 'EMERGENCY_ONLY') {
        return h.emergencyAvailable;
      }
      if (availabilityFilter === 'ICU_ONLY') {
        return icuAvail > 0;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'distance') return (a.distanceKm || 999) - (b.distanceKm || 999);
      if (sortBy === 'availability') {
        const aAvail = (a.capacitySummary?.general?.available || 0) + (a.capacitySummary?.icu?.available || 0);
        const bAvail = (b.capacitySummary?.general?.available || 0) + (b.capacitySummary?.icu?.available || 0);
        return bAvail - aAvail;
      }
      return a.name.localeCompare(b.name);
    });

  const availableCount = hospitals.filter(
    (h) => (h.capacitySummary?.general?.available || 0) > 0 || (h.capacitySummary?.icu?.available || 0) > 0
  ).length;
  const emergencyCount = hospitals.filter((h) => h.emergencyAvailable).length;
  const icuCount = hospitals.filter((h) => (h.capacitySummary?.icu?.available || 0) > 0).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <div className="h-4 w-px bg-slate-200"></div>
            <span className="text-base font-black text-slate-900">
              Care<span className="text-sky-600">Sync</span>
            </span>
            <span className="hidden sm:inline-flex text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
              Live Satellite Radar
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmergencyModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Siren className="w-3.5 h-3.5" /> 🚨 Emergency
            </button>
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto w-full p-4 sm:p-6 space-y-6 flex-1 flex flex-col">
        {/* Search, GPS Location & Filters Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search hospitals by name, area, specialty (Cardiology, ICU)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={detectLocation}
              disabled={locating}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Detect current GPS coordinates"
            >
              <MapPin className={`w-3.5 h-3.5 text-sky-600 ${locating ? 'animate-bounce' : ''}`} />
              <span>{locating ? 'Locating...' : locationName}</span>
            </button>

            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="distance">Nearest Distance</option>
              <option value="availability">Highest Bed Capacity</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* 1. TOP: FULL-WIDTH SATELLITE MAP (MapTiler Powered) */}
        <div ref={mapSectionRef} className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                🛰️ Live Satellite Radar Map (MapTiler Earth View)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Click any pin to inspect real-time bed availability
            </span>
          </div>

          <div className="w-full h-[460px] sm:h-[520px] rounded-3xl overflow-hidden shadow-xl border border-slate-800/30">
            <HospitalMap
              hospitals={filteredHospitals}
              userLocation={userLocation}
              selectedHospital={selectedHospital}
              onSelectHospital={handleMapMarkerSelect}
              onLocateMe={detectLocation}
              height="100%"
            />
          </div>
        </div>

        {/* 2. BOTTOM: AVAILABLE HOSPITALS GRID (Directly Below Map) */}
        <div ref={hospitalsListRef} className="space-y-4 pt-2">
          {/* Section Title & Quick Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                🏥 Available Hospitals Near You
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  {filteredHospitals.length} Found
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time capacity, general &amp; ICU bed counters, and instant navigation
              </p>
            </div>

            {/* Availability Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setAvailabilityFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  availabilityFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All ({hospitals.length})
              </button>

              <button
                type="button"
                onClick={() => setAvailabilityFilter('AVAILABLE_ONLY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  availabilityFilter === 'AVAILABLE_ONLY'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                🟢 Beds Available ({availableCount})
              </button>

              <button
                type="button"
                onClick={() => setAvailabilityFilter('EMERGENCY_ONLY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  availabilityFilter === 'EMERGENCY_ONLY'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
                }`}
              >
                🚨 24/7 Emergency ({emergencyCount})
              </button>

              <button
                type="button"
                onClick={() => setAvailabilityFilter('ICU_ONLY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  availabilityFilter === 'ICU_ONLY'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-sky-700 hover:bg-sky-50'
                }`}
              >
                🫀 ICU Ready ({icuCount})
              </button>
            </div>
          </div>

          {/* Hospitals Grid */}
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-9 h-9 rounded-full border-4 border-sky-600 border-t-transparent animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-slate-500">Scanning hospital capacity and bed availability...</p>
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
              <Compass className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">No Hospitals Found</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No hospitals matched your current filter criteria. Try resetting the filters or widening your search.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setAvailabilityFilter('ALL');
                  setSelectedSpecialty('All Specialties');
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredHospitals.map((hosp) => (
                <HospitalCard
                  key={hosp._id}
                  hospital={hosp}
                  isSelected={selectedHospital?._id === hosp._id}
                  onSelect={handleCardSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <EmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        userLocation={userLocation}
        nearestHospitals={hospitals}
      />
    </div>
  );
};

export default ExploreHospitalsPage;
