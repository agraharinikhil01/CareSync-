import React, { useState, useEffect } from 'react';
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

  // Geolocation state
  const [userLocation, setUserLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [locationName, setLocationName] = useState('New Delhi, India');
  const [locating, setLocating] = useState(false);

  const [mobileTab, setMobileTab] = useState('list');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  useEffect(() => {
    detectLocation();
  }, []);

  useEffect(() => {
    fetchNearby();
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
        },
        () => setLocating(false),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const fetchNearby = async () => {
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
        setHospitals(res.data.data);
        if (res.data.data.length > 0 && !selectedHospital) {
          setSelectedHospital(res.data.data[0]);
        }
      }
    } catch {
      toast.error('Unable to fetch live hospitals');
    } finally {
      setLoading(false);
    }
  };

  const displayedHospitals = hospitals
    .filter((h) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        h.name?.toLowerCase().includes(q) ||
        h.city?.toLowerCase().includes(q) ||
        h.departments?.some((d) => d.toLowerCase().includes(q))
      );
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
              Hospital<span className="text-sky-600">Radar</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmergencyModal(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all"
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
      <div className="max-w-[1600px] mx-auto w-full p-4 sm:p-6 space-y-4 flex-1 flex flex-col">
        {/* Search & Location Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search hospitals, specialties, ICU beds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={detectLocation}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>{locating ? 'Locating...' : locationName}</span>
            </button>

            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
            >
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Split Grid */}
        <div className="grid lg:grid-cols-12 gap-5 items-start flex-1">
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {displayedHospitals.length} Facilities in Radius
            </p>
            {loading ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
                <div className="w-8 h-8 rounded-full border-4 border-sky-600 border-t-transparent animate-spin mx-auto"></div>
                <p className="text-xs font-bold text-slate-500 mt-2">Loading live hospital grid...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
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

          <div className="lg:col-span-7 h-[calc(100vh-230px)] min-h-[500px] sticky top-20">
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
