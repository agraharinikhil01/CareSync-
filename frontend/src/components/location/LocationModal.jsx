import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, X, Check, Loader2, Compass } from 'lucide-react';

const QUICK_PRESETS = [
  { name: 'Khalilabad, Sant Kabir Nagar', lat: 26.7751, lng: 83.0542, tag: 'User Area' },
  { name: 'Katai Bazar, Sant Kabir Nagar', lat: 26.7725, lng: 83.0640, tag: 'User Area' },
  { name: 'Gorakhpur', lat: 26.7606, lng: 83.3732 },
  { name: 'Basti', lat: 26.7950, lng: 82.7820 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Varanasi', lat: 25.3176, lng: 82.9739 },
  { name: 'Kanpur', lat: 26.4499, lng: 80.3319 },
  { name: 'Prayagraj', lat: 25.4358, lng: 81.8463 },
  { name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
];

const LocationModal = ({
  isOpen,
  onClose,
  onSelectLocation,
  onResolvePlace,
  onUseGps,
  searchPlaces,
  currentLocationName,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const items = await searchPlaces(query);
      setResults(items);
      setSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-indigo-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Set Your Location</h3>
              <p className="text-xs text-slate-500">Discover hospitals, trauma centers & ICU beds near you</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Location Badge & GPS Button */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Compass className="w-4 h-4 text-sky-600 shrink-0 animate-spin-slow" />
            <span className="text-xs text-slate-600 truncate">
              Current: <strong className="text-slate-900">{currentLocationName}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onUseGps();
              onClose();
            }}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-sky-600/20 transition-all cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" /> Re-check GPS
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Type your area: Khalilabad, Katai Bazar, Gorakhpur, etc."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
            />
            {searching && (
              <Loader2 className="w-4 h-4 text-sky-600 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
            )}
          </div>
        </div>

        {/* Search Results or Preset Chips */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {results.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Search Results</p>
              {results.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={async () => {
                    if (onResolvePlace) {
                      await onResolvePlace(item);
                    } else if (item.lat && item.lng) {
                      onSelectLocation(item.lat, item.lng, item.city ? `📍 ${item.city}, ${item.state}` : item.name);
                    }
                    onClose();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-sky-50 text-xs border border-transparent hover:border-sky-200 transition-colors flex items-start gap-2.5 cursor-pointer group"
                >
                  <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-bold text-slate-800">{item.city || item.name.split(',')[0]}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.name}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Quick Select Location
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onSelectLocation(p.lat, p.lng, `📍 ${p.name}`);
                      onClose();
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      p.tag
                        ? 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100 font-bold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <MapPin className={`w-3 h-3 ${p.tag ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>

              <div className="mt-5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  💡 Tip for Desktop/PC users:
                </p>
                <p className="text-amber-800 leading-relaxed">
                  Laptops/PCs often report ISP gateway location (like Kanpur or Lucknow). Select <strong>Khalilabad / Sant Kabir Nagar</strong> above or click anywhere on the satellite map to pinpoint your exact spot!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500 px-4">
          <span>Click anywhere on the satellite map to set pin</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
