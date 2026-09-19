import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, ExternalLink, Bed, HeartPulse, ShieldCheck, Clock, Layers, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || 'RbtagRyEluq70WIwgao8';

const MAP_STYLES = {
  satellite: {
    id: 'satellite',
    label: '🛰️ Satellite',
    url: `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`,
    attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    maxZoom: 20,
    tileSize: 512,
    zoomOffset: -1,
  },
  pureSatellite: {
    id: 'pureSatellite',
    label: '🌍 Pure Earth',
    url: `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`,
    attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    maxZoom: 20,
    tileSize: 512,
    zoomOffset: -1,
  },
  streets: {
    id: 'streets',
    label: '🗺️ Streets',
    url: `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
    attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    maxZoom: 20,
    tileSize: 512,
    zoomOffset: -1,
  },
};

// Map Click Listener to let users pinpoint exact custom location
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick && e?.latlng) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

// Smooth Camera Controller with flyTo on selection & location update
const MapCameraController = ({ center, zoom, selectedHospital }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedHospital?.location?.coordinates && selectedHospital.location.coordinates.length >= 2) {
      const [lng, lat] = selectedHospital.location.coordinates;
      map.flyTo([lat, lng], Math.max(map.getZoom(), 14), {
        animate: true,
        duration: 1.2,
      });
    } else if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 13, {
        animate: true,
        duration: 1.0,
      });
    }
  }, [selectedHospital, center, zoom, map]);

  return null;
};

// User Location SVG Radar Marker
const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-user-radar-pin',
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background-color: rgba(14, 165, 233, 0.45); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 18px; height: 18px; border-radius: 9999px; background-color: #0284c7; border: 3px solid #ffffff; box-shadow: 0 0 16px rgba(14, 165, 233, 0.8), 0 4px 6px -1px rgba(0,0,0,0.4);"></div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

// Hospital Radar Pin with High Contrast Satellite Glow
const createHospitalIcon = (hospital, isSelected) => {
  const generalAvail = hospital.capacitySummary?.general?.available || 0;
  const icuAvail = hospital.capacitySummary?.icu?.available || 0;
  const emergency = hospital.emergencyAvailable;
  const freshnessState = hospital.freshness?.state;

  let bgColor = '#10b981'; // Green: Good
  let glowColor = 'rgba(16, 185, 129, 0.7)';

  if (!emergency && generalAvail === 0 && icuAvail === 0) {
    bgColor = '#e11d48'; // Red: Full
    glowColor = 'rgba(225, 29, 72, 0.7)';
  } else if (generalAvail <= 5 && icuAvail <= 1) {
    bgColor = '#f59e0b'; // Yellow: Limited
    glowColor = 'rgba(245, 158, 11, 0.7)';
  }

  if (freshnessState === 'outdated') {
    bgColor = '#64748b'; // Grey: Outdated
    glowColor = 'rgba(100, 116, 139, 0.5)';
  }

  const border = isSelected ? '3px solid #ffffff' : '2px solid #0f172a';
  const scale = isSelected ? 'scale(1.22)' : 'scale(1)';
  const pulseClass = isSelected ? 'animate-pulse' : '';

  return L.divIcon({
    className: 'custom-hospital-satellite-pin',
    html: `
      <div style="transform: ${scale}; transition: all 0.25s ease; cursor: pointer; display: flex; flex-direction: column; align-items: center;" class="${pulseClass}">
        <div style="
          background: ${bgColor};
          color: #ffffff;
          padding: 5px 9px;
          border-radius: 9999px;
          border: ${border};
          box-shadow: 0 0 14px ${glowColor}, 0 10px 20px -3px rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: -0.01em;
          white-space: nowrap;
        ">
          <svg style="width: 13px; height: 13px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>${generalAvail} Beds</span>
        </div>
        <div style="
          width: 0; 
          height: 0; 
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 7px solid ${bgColor};
          margin-top: -1px;
          filter: drop-shadow(0 3px 2px rgba(0,0,0,0.5));
        "></div>
      </div>
    `,
    iconSize: [86, 38],
    iconAnchor: [43, 36],
  });
};

const HospitalMap = ({
  hospitals = [],
  userLocation = null,
  selectedHospital = null,
  onSelectHospital,
  center = [28.6139, 77.2090], // Delhi default
  zoom = 12,
  onLocateMe,
  onMapClick,
  className = '',
  height = '500px',
}) => {
  const mapRef = useRef(null);
  const [currentStyleKey, setCurrentStyleKey] = useState('satellite'); // Default: Satellite Hybrid!
  const currentStyle = MAP_STYLES[currentStyleKey] || MAP_STYLES.satellite;

  const activeCenter = selectedHospital?.location?.coordinates
    ? [selectedHospital.location.coordinates[1], selectedHospital.location.coordinates[0]]
    : userLocation
    ? [userLocation.lat, userLocation.lng]
    : center;

  const totalAvailableBeds = hospitals.reduce(
    (acc, h) => acc + (h.capacitySummary?.general?.available || 0) + (h.capacitySummary?.icu?.available || 0),
    0
  );

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800/40 bg-slate-950 font-sans select-none ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={activeCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        ref={mapRef}
        style={{ width: '100%', height: '100%', minHeight: '380px' }}
      >
        <MapCameraController
          center={activeCenter}
          zoom={zoom}
          selectedHospital={selectedHospital}
        />

        {/* Map Click Listener to let user pinpoint exact location anywhere */}
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

        {/* MapTiler Satellite / Street Tiles */}
        <TileLayer
          key={currentStyleKey}
          attribution={currentStyle.attribution}
          url={currentStyle.url}
          maxZoom={currentStyle.maxZoom}
          tileSize={currentStyle.tileSize || 256}
          zoomOffset={currentStyle.zoomOffset || 0}
        />

        {/* User Location Radar Marker (Draggable) */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserIcon()}
            draggable={Boolean(onMapClick)}
            eventHandlers={{
              dragend: (e) => {
                const pos = e.target.getLatLng();
                if (onMapClick) onMapClick(pos.lat, pos.lng);
              },
            }}
          >
            <Popup>
              <div className="p-2.5 text-center font-sans">
                <p className="font-extrabold text-xs text-sky-600 flex items-center justify-center gap-1">
                  <Navigation className="w-3.5 h-3.5" /> Your Current Location
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Drag this pin or click anywhere on the map to change!
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Hospital Markers */}
        {hospitals.map((hosp) => {
          if (!hosp.location?.coordinates || hosp.location.coordinates.length < 2) return null;
          const [lng, lat] = hosp.location.coordinates;
          const isSelected = selectedHospital?._id === hosp._id;

          return (
            <Marker
              key={hosp._id}
              position={[lat, lng]}
              icon={createHospitalIcon(hosp, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectHospital) onSelectHospital(hosp);
                },
              }}
            >
              <Popup className="hospital-radar-satellite-popup">
                <div className="p-3 max-w-[280px] space-y-2.5 font-sans">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">{hosp.name}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{hosp.address}, {hosp.city}</p>
                    </div>
                    {hosp.verificationStatus === 'VERIFIED' && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold shrink-0 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>

                  {/* Capacity Metrics */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-sky-600" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">General Beds</p>
                        <p className="text-xs font-bold text-slate-800">
                          {hosp.capacitySummary?.general?.available || 0} / {hosp.capacitySummary?.general?.total || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">ICU Beds</p>
                        <p className="text-xs font-bold text-slate-800">
                          {hosp.capacitySummary?.icu?.available || 0} Available
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Freshness & Emergency badge */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`font-semibold ${hosp.emergencyAvailable ? 'text-rose-600' : 'text-slate-500'}`}>
                      {hosp.emergencyAvailable ? '🚨 24/7 Emergency Active' : 'Routine Care Only'}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                      <Clock className="w-3 h-3" /> {hosp.freshness?.label || 'Live'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition-colors"
                    >
                      <Navigation className="w-3 h-3" /> Directions
                    </a>
                    <Link
                      to={`/hospitals/${hosp._id}`}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-colors"
                    >
                      Details <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* TOP FLOATING CONTROLS: Map Style Selector & Locate Me */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-[1000] flex items-center justify-between pointer-events-none">
        {/* Map Style Pills */}
        <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-2xl border border-white/15 shadow-xl pointer-events-auto">
          {Object.values(MAP_STYLES).map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setCurrentStyleKey(style.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentStyleKey === style.id
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>

        {/* Locate Me Button */}
        {onLocateMe && (
          <button
            type="button"
            onClick={onLocateMe}
            className="pointer-events-auto bg-slate-950/85 backdrop-blur-md hover:bg-slate-900 text-white hover:text-sky-300 px-3.5 py-1.5 rounded-2xl shadow-xl border border-white/15 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Locate my position on Satellite Map"
          >
            <Navigation className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Locate Me</span>
          </button>
        )}
      </div>

      {/* BOTTOM FLOATING BAR: Capacity Legend & Real-Time Stats */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 z-[1000] flex items-center justify-between pointer-events-none flex-wrap gap-2">
        {/* Map Legend */}
        <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-white/15 text-[11px] font-semibold text-slate-200 flex items-center gap-3.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold hidden sm:inline">
            Status:
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span>Available (&gt;5)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            <span>Limited (1-5)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.8)]"></span>
            <span>Full (0)</span>
          </span>
        </div>

        {/* Live Active Satellite Badge */}
        <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-white/15 text-[11px] font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{hospitals.length} Hospitals</span>
          <span className="text-slate-400">•</span>
          <span className="text-sky-400">{totalAvailableBeds} Beds Free</span>
        </div>
      </div>
    </div>
  );
};

export default HospitalMap;
