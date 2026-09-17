import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Phone, ExternalLink, Bed, HeartPulse, ShieldCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

// Recenter helper component for dynamic map pans
const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 13, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

// Create custom SVG DivIcon for user location
const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-user-pin',
    html: `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background-color: rgba(14, 165, 233, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 16px; height: 16px; border-radius: 9999px; background-color: #0284c7; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Create custom color-coded Hospital Pin DivIcon
const createHospitalIcon = (hospital, isSelected) => {
  const generalAvail = hospital.capacitySummary?.general?.available || 0;
  const icuAvail = hospital.capacitySummary?.icu?.available || 0;
  const emergency = hospital.emergencyAvailable;
  const freshnessState = hospital.freshness?.state;

  let bgColor = '#10b981'; // Green: Good
  let label = 'Available';

  if (!emergency && generalAvail === 0 && icuAvail === 0) {
    bgColor = '#e11d48'; // Red: Full
    label = 'Full';
  } else if (generalAvail <= 5 && icuAvail <= 1) {
    bgColor = '#f59e0b'; // Yellow: Limited
    label = 'Limited';
  }

  if (freshnessState === 'outdated') {
    bgColor = '#64748b'; // Grey: Outdated
  }

  const border = isSelected ? '3px solid #0f172a' : '2px solid #ffffff';
  const scale = isSelected ? 'scale(1.2)' : 'scale(1)';

  return L.divIcon({
    className: 'custom-hospital-pin',
    html: `
      <div style="transform: ${scale}; transition: all 0.2s ease; cursor: pointer; display: flex; flex-direction: column; align-items: center;">
        <div style="
          background-color: ${bgColor};
          color: #ffffff;
          padding: 4px 8px;
          border-radius: 9999px;
          border: ${border};
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.25);
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: sans-serif;
          font-size: 11px;
          font-weight: 700;
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
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid ${bgColor};
          margin-top: -1px;
        "></div>
      </div>
    `,
    iconSize: [80, 36],
    iconAnchor: [40, 34],
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
}) => {
  const mapRef = useRef(null);

  const activeCenter = selectedHospital?.location?.coordinates
    ? [selectedHospital.location.coordinates[1], selectedHospital.location.coordinates[0]]
    : userLocation
    ? [userLocation.lat, userLocation.lng]
    : center;

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden shadow-inner border border-slate-200/90 bg-slate-100">
      <MapContainer
        center={activeCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        ref={mapRef}
        style={{ width: '100%', height: '100%', minHeight: '420px' }}
      >
        <MapRecenter center={activeCenter} zoom={zoom} />

        {/* High-Performance OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
            <Popup>
              <div className="p-2 text-center">
                <p className="font-bold text-xs text-sky-700">📍 You Are Here</p>
                <p className="text-[10px] text-slate-500">Searching nearby emergency & general care</p>
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
              <Popup className="hospital-radar-popup">
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

      {/* Locate Me Floating Action Button */}
      {onLocateMe && (
        <button
          type="button"
          onClick={onLocateMe}
          className="absolute top-4 right-4 z-[1000] bg-white text-slate-800 hover:bg-sky-50 hover:text-sky-700 px-3 py-2 rounded-xl shadow-lg border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Navigation className="w-4 h-4 text-sky-600" />
          <span>Locate Me</span>
        </button>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-md border border-slate-200 text-[11px] font-semibold text-slate-700 space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Capacity Status</p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available (&gt;5)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Limited (1-5)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Full (0)
          </span>
        </div>
      </div>
    </div>
  );
};

export default HospitalMap;
