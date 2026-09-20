import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useGeolocation from '../../hooks/useGeolocation';
import socket from '../../services/socket';
import GoogleHospitalMap from '../../components/map/GoogleHospitalMap';
import HospitalCard from '../../components/hospital/HospitalCard';
import HospitalDetailPanel from '../../components/hospital/HospitalDetailPanel';
import EmergencyModal from '../../components/emergency/EmergencyModal';
import LocationModal from '../../components/location/LocationModal';
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
  Navigation,
  PhoneCall,
  Award,
  ArrowRight,
  ExternalLink,
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
  const [selectedRadius, setSelectedRadius] = useState(15); // default 15 km to focus on local hospitals
  const [sortBy, setSortBy] = useState('distance');

  // ── Geolocation via shared hook (GPS → ipapi.co → Google Places / Manual Search → Delhi default) ──
  const {
    location: userLocation,
    locationName,
    locationSource,
    locating,
    detectLocation,
    refreshLiveGps,
    setManualLocation,
    searchPlaces,
    resolveAndSetPlace,
  } = useGeolocation();

  const [mobileTab, setMobileTab] = useState('list');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Autocomplete state
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Click outside listener for search suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Live Autocomplete Search across all 2,600+ hospitals in India
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let isCurrent = true;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const params = {
          q: searchQuery.trim(),
          ...(userLocation?.lat && { lat: userLocation.lat, lng: userLocation.lng }),
        };
        const res = await api.get('/hospitals/search', { params });
        if (isCurrent && res.data.success) {
          setSearchSuggestions(res.data.data || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.warn('Autocomplete search error:', err);
      } finally {
        if (isCurrent) setIsSearching(false);
      }
    }, 200);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [searchQuery, userLocation]);

  const handleSelectHospitalOption = (hosp) => {
    setShowSuggestions(false);
    setSelectedHospital(hosp);
    setShowDetailModal(true);

    // Prepend to hospitals list so its marker and card appear immediately
    setHospitals((prev) => {
      const exists = prev.some((h) => h._id === hosp._id);
      if (!exists) {
        return [hosp, ...prev];
      }
      return prev;
    });
  };

  // Trigger location detection once on mount
  useEffect(() => {
    detectLocation();
  }, []);

  // Fetch hospitals only after location is resolved (not null)
  useEffect(() => {
    if (userLocation !== null) {
      fetchNearby();
    }
  }, [userLocation, selectedSpecialty, emergencyOnly, selectedRadius]);

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

  const fetchNearby = async (retryCount = 0) => {
    setLoading(true);
    try {
      const params = {
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: selectedRadius,
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
    setShowDetailModal(true);
  };

  const handleMapMarkerSelect = (hosp) => {
    setSelectedHospital(hosp);
    setShowDetailModal(true);
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
      if (sortBy === 'distance') return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
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
  const nearestHospital = filteredHospitals.length > 0 ? filteredHospitals[0] : null;

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
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input with Live Autocomplete Suggestions */}
            <div ref={searchContainerRef} className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search any hospital (e.g. Apollo, AIIMS, Surya), specialty or city..."
                value={searchQuery}
                onFocus={() => {
                  if (searchSuggestions.length > 0) setShowSuggestions(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (searchSuggestions.length > 0) {
                      handleSelectHospitalOption(searchSuggestions[0]);
                    }
                  }
                }}
                className="w-full pl-9 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {/* Floating Autocomplete Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-96 overflow-y-auto divide-y divide-slate-100">
                  <div className="p-2.5 bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 flex items-center justify-between">
                    <span>
                      {searchSuggestions.length > 0
                        ? `Found ${searchSuggestions.length} hospitals for "${searchQuery}"`
                        : 'Searching hospitals...'}
                    </span>
                    <span className="text-[10px] text-slate-400">Click to view location &amp; doctors</span>
                  </div>

                  {searchSuggestions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No hospitals found matching "{searchQuery}". Try searching "Apollo", "AIIMS", or "District Hospital".
                    </div>
                  ) : (
                    searchSuggestions.map((hosp) => (
                      <div
                        key={hosp._id}
                        onClick={() => handleSelectHospitalOption(hosp)}
                        className="p-3 hover:bg-sky-50/80 cursor-pointer transition-colors flex items-start justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                              {hosp.name}
                            </h4>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase border border-slate-200">
                              {hosp.hospitalType || 'Hospital'}
                            </span>
                            {hosp.emergencyAvailable && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                                🚨 Emergency Active
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            📍 {hosp.address}, {hosp.city}, {hosp.state}
                          </p>

                          <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-medium">
                            <span>
                              🛏️ General: <strong className="text-slate-700">{hosp.capacitySummary?.general?.available || 0}</strong> beds
                            </span>
                            <span>
                              ❤️ ICU: <strong className="text-slate-700">{hosp.capacitySummary?.icu?.available || 0}</strong> beds
                            </span>
                          </div>
                        </div>

                        {/* Distance Badge */}
                        <div className="text-right shrink-0">
                          {hosp.distanceKm !== null && hosp.distanceKm !== undefined && (
                            <span className="text-xs font-black text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-lg block">
                              {hosp.distanceKm < 0.1 ? '< 100 m' : `${hosp.distanceKm} km`}
                            </span>
                          )}
                          <span className="text-[9px] font-bold text-sky-600 group-hover:underline mt-1 block">
                            View On Map &rarr;
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="px-3.5 py-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm group"
                title="Click to search city/town or change location"
              >
                <MapPin className={`w-3.5 h-3.5 text-sky-600 group-hover:scale-110 transition-transform ${locating ? 'animate-bounce' : ''}`} />
                <span className="truncate max-w-[180px] sm:max-w-[240px]">{locating ? 'Locating...' : locationName}</span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-md bg-sky-200 text-sky-800 ml-1">Change</span>
              </button>

              <select
                value={selectedRadius}
                onChange={(e) => setSelectedRadius(Number(e.target.value))}
                className="px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                title="Filter hospitals by maximum distance"
              >
                <option value={10}>Radius: 10 km (Local)</option>
                <option value={15}>Radius: 15 km (District)</option>
                <option value={35}>Radius: 35 km (Extended)</option>
                <option value={60}>Radius: 60 km (All Regional)</option>
              </select>

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

          {/* 📍 Current Live Location Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-gradient-to-r from-sky-50 via-teal-50 to-white border border-sky-200 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <MapPin className={`w-4 h-4 ${locating ? 'animate-bounce' : ''}`} />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Aapki Present Live Location
                </p>
                <p className="text-xs font-black text-slate-900 truncate">
                  {locating ? 'Detecting current live GPS coordinates...' : locationName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => detectLocation(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Navigation className="w-3 h-3 text-sky-400" />
                <span>Update Live GPS</span>
              </button>
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Change Area
              </button>
            </div>
          </div>

          {/* Quick Location Pills for Instant 1-Tap Proximity */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 text-xs text-slate-600">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">📍 Quick Area:</span>
            <button
              type="button"
              onClick={() => setManualLocation(26.7751, 83.0542, '📍 Khalilabad, Sant Kabir Nagar')}
              className="px-2.5 py-1 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold shrink-0 transition-all cursor-pointer shadow-xs border border-sky-200"
            >
              Khalilabad (Main)
            </button>
            <button
              type="button"
              onClick={() => setManualLocation(26.7725, 83.0640, '📍 Katai Bazar, Sant Kabir Nagar')}
              className="px-2.5 py-1 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold shrink-0 transition-all cursor-pointer shadow-xs border border-sky-200"
            >
              Katai Bazar
            </button>
            <button
              type="button"
              onClick={() => setManualLocation(26.7606, 83.3732, '📍 Gorakhpur')}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium shrink-0 transition-colors cursor-pointer"
            >
              Gorakhpur
            </button>
            <button
              type="button"
              onClick={() => setManualLocation(26.7950, 82.7820, '📍 Basti')}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium shrink-0 transition-colors cursor-pointer"
            >
              Basti
            </button>
            <button
              type="button"
              onClick={() => detectLocation(true)}
              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <Navigation className="w-3 h-3 text-sky-400" />
              <span>Capture Live GPS</span>
            </button>
          </div>
        </div>

        {/* 1. TOP: FULL-WIDTH SATELLITE MAP (Google Maps Platform Powered) */}
        <div ref={mapSectionRef} className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                🛰️ Live Satellite Radar Map (Google Maps Platform)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Click anywhere on map or drag pin to set location
            </span>
          </div>

          <div className="w-full h-[460px] sm:h-[520px] rounded-3xl overflow-hidden shadow-xl border border-slate-800/30">
            <GoogleHospitalMap
              hospitals={filteredHospitals}
              userLocation={userLocation}
              selectedHospital={selectedHospital}
              onSelectHospital={handleMapMarkerSelect}
              onLocateMe={() => detectLocation(true)}
              onMapClick={(lat, lng) => setManualLocation(lat, lng, '📍 Selected Location')}
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

          {/* 🏆 Sabse Nearest Hospital Spotlight Card */}
          {!loading && nearestHospital && (
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white p-5 sm:p-6 shadow-xl border border-sky-600/30 relative overflow-hidden space-y-4">
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1.5 min-w-0">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-extrabold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>🏆 Sabse Nearest Hospital</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                    {nearestHospital.name}
                  </h3>

                  <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{nearestHospital.address}, {nearestHospital.city}, {nearestHospital.state}</span>
                  </p>
                </div>

                {/* Distance & ETA Badge */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Road Distance</p>
                    <p className="text-lg font-black text-sky-300">
                      {nearestHospital.distanceKm !== null ? `${nearestHospital.distanceKm} km door` : 'Closest'}
                    </p>
                  </div>

                  {nearestHospital.estTravelMinutes && (
                    <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Est. Travel Time</p>
                      <p className="text-lg font-black text-emerald-300">
                        ~{nearestHospital.estTravelMinutes} mins
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Capacity & Live Facilities Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/10 relative z-10 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 font-bold block">General Beds</span>
                  <span className="text-sm font-black text-white">
                    {nearestHospital.capacitySummary?.general?.available ?? 0} Available
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 font-bold block">ICU Beds</span>
                  <span className="text-sm font-black text-emerald-400">
                    {nearestHospital.capacitySummary?.icu?.available ?? 0} Available
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 font-bold block">Emergency Status</span>
                  <span className="text-sm font-black text-rose-400">
                    {nearestHospital.emergencyAvailable ? '🚨 24/7 Active' : 'Regular OPD'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 font-bold block">Data Freshness</span>
                  <span className="text-sm font-black text-sky-400">
                    {nearestHospital.freshness?.label || 'Live Verified'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2 relative z-10">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat || ''},${userLocation?.lng || ''}&destination=${nearestHospital.location?.coordinates?.[1] || ''},${nearestHospital.location?.coordinates?.[0] || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Driving Directions (Google Maps)</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedHospital(nearestHospital);
                    setShowDetailModal(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>View Doctors &amp; Full Hospital Details</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                </button>

                {nearestHospital.phone && (
                  <a
                    href={`tel:${nearestHospital.phone}`}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call: {nearestHospital.phone}</span>
                  </a>
                )}
              </div>
            </div>
          )}

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

      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelectLocation={setManualLocation}
        onResolvePlace={resolveAndSetPlace}
        onUseGps={() => detectLocation(true)}
        searchPlaces={searchPlaces}
        currentLocationName={locationName}
      />

      {/* Rich Hospital Detail & Doctor Roster Modal */}
      {showDetailModal && selectedHospital && (
        <HospitalDetailPanel
          hospital={selectedHospital}
          userLocation={userLocation}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default ExploreHospitalsPage;
