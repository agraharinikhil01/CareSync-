import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import socket from '../../services/socket';
import DashboardLayout from '../../layouts/DashboardLayout';
import HospitalMap from '../../components/map/HospitalMap';
import HospitalCard from '../../components/hospital/HospitalCard';
import EmergencyModal from '../../components/emergency/EmergencyModal';
import {
  Compass,
  MapPin,
  Search,
  Filter,
  Siren,
  Bed,
  HeartPulse,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  RefreshCw,
  List,
  Map as MapIcon,
  SlidersHorizontal,
  ChevronDown,
  Activity,
  Layers,
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

const PatientDashboard = () => {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [minBeds, setMinBeds] = useState('');
  const [minIcu, setMinIcu] = useState('');
  const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'availability' | 'name'

  // Geolocation state
  const [userLocation, setUserLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Default Delhi
  const [locationName, setLocationName] = useState('New Delhi, India');
  const [locating, setLocating] = useState(false);

  // View state (for mobile toggle: 'split' | 'list' | 'map')
  const [mobileTab, setMobileTab] = useState('list'); // 'list' | 'map'
  const [showFilters, setShowFilters] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Real-time update indicator
  const [lastLiveUpdate, setLastLiveUpdate] = useState(null);

  useEffect(() => {
    // Attempt HTML5 Geolocation on initial load
    detectLocation();
  }, []);

  useEffect(() => {
    fetchNearbyHospitals();
  }, [userLocation, selectedSpecialty, emergencyOnly]);

  // Real-time Socket.IO Listener for instant hospital updates
  useEffect(() => {
    socket.on('hospital:availability_updated', (data) => {
      setLastLiveUpdate(data.hospitalName || 'A hospital');
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

  const detectLocation = () => {
    if ('geolocation' in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          setLocationName('Your Current GPS Location');
          setLocating(false);
          toast.success('📍 Location acquired! Discovering nearest hospitals.');
        },
        (err) => {
          console.warn('Geolocation denied/unavailable, fallback to Delhi center:', err.message);
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const fetchNearbyHospitals = async () => {
    setLoading(true);
    try {
      const params = {
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: 35, // km
        ...(selectedSpecialty !== 'All Specialties' && { specialty: selectedSpecialty }),
        ...(emergencyOnly && { emergencyOnly: 'true' }),
        ...(minBeds && { minBeds }),
        ...(minIcu && { minIcu }),
        ...(searchQuery && { search: searchQuery }),
      };

      const res = await api.get('/hospitals/nearby', { params });
      if (res.data.success) {
        setHospitals(res.data.data);
        if (res.data.data.length > 0 && !selectedHospital) {
          setSelectedHospital(res.data.data[0]);
        }
      }
    } catch (err) {
      toast.error('Unable to fetch live hospitals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort Hospitals Client-side
  const displayedHospitals = hospitals
    .filter((h) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = h.name?.toLowerCase().includes(q);
      const matchCity = h.city?.toLowerCase().includes(q);
      const matchDepts = h.departments?.some((d) => d.toLowerCase().includes(q));
      return matchName || matchCity || matchDepts;
    })
    .sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distanceKm || 999) - (b.distanceKm || 999);
      }
      if (sortBy === 'availability') {
        const aAvail = (a.capacitySummary?.general?.available || 0) + (a.capacitySummary?.icu?.available || 0);
        const bAvail = (b.capacitySummary?.general?.available || 0) + (b.capacitySummary?.icu?.available || 0);
        return bAvail - aAvail;
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <DashboardLayout>
      <div className="space-y-4 font-sans max-w-[1600px] mx-auto">
        {/* Top Radar Bar: Search, Location, & Emergency CTA */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search hospitals, specialties, ICU beds, emergency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Location & Emergency Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating}
                className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Use current GPS location"
              >
                <MapPin className={`w-3.5 h-3.5 text-sky-600 ${locating ? 'animate-bounce' : ''}`} />
                <span className="truncate max-w-[150px]">{locating ? 'Locating...' : locationName}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showFilters
                    ? 'bg-sky-50 border-sky-300 text-sky-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>

              {/* 🚨 Emergency Mode Button */}
              <button
                type="button"
                onClick={() => setShowEmergencyModal(true)}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-extrabold text-xs shadow-md shadow-rose-600/25 flex items-center gap-1.5 transition-all cursor-pointer animate-pulse-subtle"
              >
                <Siren className="w-4 h-4" />
                <span>🚨 Emergency Mode</span>
              </button>
            </div>
          </div>

          {/* Expandable Filter Bar */}
          {showFilters && (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs animate-fadeIn">
              {/* Specialty Selector */}
              <div>
                <label className="font-bold text-slate-500 block mb-1">Specialty / Department</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="font-bold text-slate-500 block mb-1">Sort Results By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="distance">Distance (Nearest First)</option>
                  <option value="availability">Highest Bed Availability</option>
                  <option value="name">Hospital Name (A-Z)</option>
                </select>
              </div>

              {/* Min Beds Filter */}
              <div>
                <label className="font-bold text-slate-500 block mb-1">Min Available Beds</label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 5"
                  value={minBeds}
                  onChange={(e) => setMinBeds(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {/* 24/7 Emergency Toggle */}
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={emergencyOnly}
                    onChange={(e) => setEmergencyOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>24/7 Emergency Only</span>
                </label>
              </div>
            </div>
          )}

          {/* Real-time Socket Live Sync Notification Pill */}
          {lastLiveUpdate && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-800 animate-fadeIn">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Live update received from <strong>{lastLiveUpdate}</strong></span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-600">Map &amp; Cards Refreshed</span>
            </div>
          )}
        </div>

        {/* Mobile View Toggle Buttons */}
        <div className="flex lg:hidden items-center justify-center p-1 bg-slate-200/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-600'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Hospital List ({displayedHospitals.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'map' ? 'bg-white shadow text-slate-900' : 'text-slate-600'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Live Radar Map</span>
          </button>
        </div>

        {/* RailRadar Split Layout: Left List + Right Interactive Leaflet Map */}
        <div className="grid lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Hospital List */}
          <div
            className={`lg:col-span-5 space-y-3 ${
              mobileTab === 'map' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {displayedHospitals.length} Hospitals Discovered
              </p>
              <button
                type="button"
                onClick={fetchNearbyHospitals}
                className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {loading ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-2">
                <div className="w-8 h-8 rounded-full border-4 border-sky-600 border-t-transparent animate-spin mx-auto"></div>
                <p className="text-xs font-bold text-slate-500">Scanning hospital grid &amp; bed counters...</p>
              </div>
            ) : displayedHospitals.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-2">
                <Compass className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800">No Hospitals Found</h4>
                <p className="text-xs text-slate-500">
                  Try adjusting your radius, specialty filter, or search keywords.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {displayedHospitals.map((hosp) => (
                  <HospitalCard
                    key={hosp._id}
                    hospital={hosp}
                    isSelected={selectedHospital?._id === hosp._id}
                    onSelect={(h) => {
                      setSelectedHospital(h);
                      // On mobile switch to map view if user tapped card
                      if (window.innerWidth < 1024) {
                        setMobileTab('map');
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Interactive Leaflet Map */}
          <div
            className={`lg:col-span-7 h-[calc(100vh-260px)] min-h-[500px] sticky top-20 ${
              mobileTab === 'list' ? 'hidden lg:block' : 'block'
            }`}
          >
            <HospitalMap
              hospitals={displayedHospitals}
              userLocation={userLocation}
              selectedHospital={selectedHospital}
              onSelectHospital={(h) => setSelectedHospital(h)}
              onLocateMe={detectLocation}
            />
          </div>
        </div>
      </div>

      {/* Emergency Assistance Modal */}
      <EmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        userLocation={userLocation}
        nearestHospitals={hospitals}
      />
    </DashboardLayout>
  );
};

export default PatientDashboard;
