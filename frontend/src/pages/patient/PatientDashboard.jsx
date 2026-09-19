import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useGeolocation from '../../hooks/useGeolocation';
import socket from '../../services/socket';
import DashboardLayout from '../../layouts/DashboardLayout';
import GoogleHospitalMap from '../../components/map/GoogleHospitalMap';
import HospitalCard from '../../components/hospital/HospitalCard';
import EmergencyModal from '../../components/emergency/EmergencyModal';
import LocationModal from '../../components/location/LocationModal';
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
  Navigation,
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
  const [selectedRadius, setSelectedRadius] = useState(15);
  const [sortBy, setSortBy] = useState('distance');

  // ── Geolocation via shared hook (GPS → ipapi.co → Google Places / Manual Search → Delhi default) ──
  const {
    location: userLocation,
    locationName,
    locationSource,
    locating,
    detectLocation,
    setManualLocation,
    searchPlaces,
    resolveAndSetPlace,
  } = useGeolocation();

  // View state
  const [mobileTab, setMobileTab] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [lastLiveUpdate, setLastLiveUpdate] = useState(null);

  // Trigger location detection once on mount
  useEffect(() => {
    detectLocation();
  }, []);

  // Fetch hospitals only after location is resolved (not null)
  useEffect(() => {
    if (userLocation !== null) {
      fetchNearbyHospitals();
    }
  }, [userLocation, selectedSpecialty, emergencyOnly, selectedRadius, minBeds, minIcu]);

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

  const fetchNearbyHospitals = async (retryCount = 0) => {
    setLoading(true);
    try {
      const params = {
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: selectedRadius, // km
        ...(selectedSpecialty !== 'All Specialties' && { specialty: selectedSpecialty }),
        ...(emergencyOnly && { emergencyOnly: 'true' }),
        ...(minBeds && { minBeds }),
        ...(minIcu && { minIcu }),
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
      console.error('Error fetching nearby hospitals in PatientDashboard:', err);
      if (retryCount < 1) {
        setTimeout(() => fetchNearbyHospitals(retryCount + 1), 1500);
      } else {
        toast.error(err.response?.data?.message || 'Unable to fetch live hospitals. Please refresh or try again.');
      }
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
        return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
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
                onClick={() => setShowLocationModal(true)}
                className="px-3.5 py-2 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm group"
                title="Click to search city/town or change location"
              >
                <MapPin className={`w-3.5 h-3.5 text-sky-600 group-hover:scale-110 transition-transform ${locating ? 'animate-bounce' : ''}`} />
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{locating ? 'Locating...' : locationName}</span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-md bg-sky-200 text-sky-800 ml-1">Change</span>
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

          {/* Expandable Filter Bar */}
          {showFilters && (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs animate-fadeIn">
              {/* Radius Selector */}
              <div>
                <label className="font-bold text-slate-500 block mb-1">Max Distance Radius</label>
                <select
                  value={selectedRadius}
                  onChange={(e) => setSelectedRadius(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value={10}>Within 10 km (Local Area)</option>
                  <option value={15}>Within 15 km (District)</option>
                  <option value={35}>Within 35 km (Extended)</option>
                  <option value={60}>Within 60 km (Regional)</option>
                </select>
              </div>

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

        {/* 1. TOP: SATELLITE RADAR MAP (MapTiler Powered) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                🛰️ Live Satellite Radar Map (Google Maps Platform)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Click any hospital pin for real-time capacity and navigation
            </span>
          </div>

          <div className="w-full h-[460px] sm:h-[520px] rounded-3xl overflow-hidden shadow-xl border border-slate-800/30">
            <GoogleHospitalMap
              hospitals={displayedHospitals}
              userLocation={userLocation}
              selectedHospital={selectedHospital}
              onSelectHospital={(h) => setSelectedHospital(h)}
              onLocateMe={() => detectLocation(true)}
              onMapClick={(lat, lng) => setManualLocation(lat, lng, '📍 Selected Location')}
              height="100%"
            />
          </div>
        </div>

        {/* 2. BOTTOM: AVAILABLE HOSPITALS SECTION (Directly Below Map) */}
        <div className="space-y-4 pt-2">
          {/* Header & Quick Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                🏥 Available Hospitals Near You
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  {displayedHospitals.length} Found
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time bed counters, emergency capabilities, and one-click directions
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchNearbyHospitals}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
                <span>Refresh Counters</span>
              </button>
            </div>
          </div>

          {/* Hospital Cards Grid */}
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-2">
              <div className="w-8 h-8 rounded-full border-4 border-sky-600 border-t-transparent animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-slate-500">Scanning hospital grid &amp; bed counters...</p>
            </div>
          ) : displayedHospitals.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-2">
              <Compass className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">No Hospitals Found</h4>
              <p className="text-xs text-slate-500">
                Try adjusting your radius, specialty filter, or search keywords.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedHospitals.map((hosp) => (
                <HospitalCard
                  key={hosp._id}
                  hospital={hosp}
                  isSelected={selectedHospital?._id === hosp._id}
                  onSelect={(h) => setSelectedHospital(h)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Emergency Assistance Modal */}
      <EmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        userLocation={userLocation}
        nearestHospitals={hospitals}
      />

      {/* Location Selector Modal */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelectLocation={setManualLocation}
        onResolvePlace={resolveAndSetPlace}
        onUseGps={() => detectLocation(true)}
        searchPlaces={searchPlaces}
        currentLocationName={locationName}
      />
    </DashboardLayout>
  );
};

export default PatientDashboard;
