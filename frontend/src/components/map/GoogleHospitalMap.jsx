import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  loadGoogleMaps,
  isGoogleMapsConfigured,
  calculateDirections,
} from '../../services/googleMaps';
import {
  Navigation,
  ExternalLink,
  Bed,
  HeartPulse,
  Clock,
  Layers,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Locate,
  Route,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Custom SVG Icons generator for Google Maps
const getHospitalMarkerSvg = (hospital, isSelected) => {
  const generalAvail = hospital.capacitySummary?.general?.available || 0;
  const icuAvail = hospital.capacitySummary?.icu?.available || 0;
  const emergency = hospital.emergencyAvailable;

  let color = '#10b981'; // Green: Available
  if (!emergency && generalAvail === 0 && icuAvail === 0) {
    color = '#e11d48'; // Red: Full
  } else if (generalAvail <= 5 && icuAvail <= 1) {
    color = '#f59e0b'; // Amber: Limited
  }

  const scale = isSelected ? 1.3 : 1.0;
  const size = Math.round(36 * scale);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 36 44">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.5)"/>
        </filter>
      </defs>
      <path d="M18 0 C8.06 0 0 8.06 0 18 C0 31.5 18 44 18 44 C18 44 36 31.5 36 18 C36 8.06 27.94 0 18 0 Z" fill="${color}" filter="url(#shadow)" stroke="#ffffff" stroke-width="${isSelected ? '3' : '2'}"/>
      <circle cx="18" cy="17" r="11" fill="#ffffff"/>
      <path d="M16 11 h4 v4 h4 v4 h-4 v4 h-4 v-4 h-4 v-4 h4 z" fill="${color}"/>
    </svg>
  `;

  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
};

const getUserMarkerSvg = () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="16" fill="rgba(14, 165, 233, 0.35)"/>
      <circle cx="20" cy="20" r="9" fill="#0284c7" stroke="#ffffff" stroke-width="3"/>
      <circle cx="20" cy="20" r="3" fill="#ffffff"/>
    </svg>
  `;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
};

const GoogleHospitalMap = ({
  hospitals = [],
  userLocation = null,
  selectedHospital = null,
  onSelectHospital,
  center = { lat: 28.6139, lng: 77.2090 },
  zoom = 12,
  onLocateMe,
  onMapClick,
  className = '',
  height = '520px',
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const directionsRendererRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null); // 'KEY_MISSING' | 'LOAD_FAILED'
  const [mapType, setMapType] = useState('hybrid'); // 'hybrid' (satellite) | 'roadmap'
  const [activeRoute, setActiveRoute] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);

  // Initialize Google Maps instance
  useEffect(() => {
    let isMounted = true;

    if (!isGoogleMapsConfigured()) {
      setErrorState('KEY_MISSING');
      setLoading(false);
      return;
    }

    loadGoogleMaps()
      .then((google) => {
        if (!isMounted || !mapContainerRef.current) return;

        const initialCenter = userLocation
          ? { lat: userLocation.lat, lng: userLocation.lng }
          : center;

        const map = new google.maps.Map(mapContainerRef.current, {
          center: initialCenter,
          zoom: zoom,
          mapTypeId: google.maps.MapTypeId.HYBRID,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: true,
          fullscreenControl: true,
          gestureHandling: 'greedy',
          styles: [
            {
              featureType: 'poi.medical',
              elementType: 'geometry',
              stylers: [{ color: '#f87171' }],
            },
          ],
        });

        // Click listener for custom pinpointing
        map.addListener('click', (e) => {
          if (onMapClick && e.latLng) {
            onMapClick(e.latLng.lat(), e.latLng.lng());
          }
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new google.maps.InfoWindow();

        // Directions renderer
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#0284c7',
            strokeWeight: 5,
            strokeOpacity: 0.85,
          },
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error('Google Maps initialization failed:', err);
        if (isMounted) {
          setErrorState(err.message === 'GOOGLE_MAPS_KEY_MISSING' ? 'KEY_MISSING' : 'LOAD_FAILED');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update map type (Satellite / Street)
  const switchMapType = (type) => {
    setMapType(type);
    if (mapInstanceRef.current && window.google?.maps) {
      mapInstanceRef.current.setMapTypeId(
        type === 'hybrid' ? window.google.maps.MapTypeId.HYBRID : window.google.maps.MapTypeId.ROADMAP
      );
    }
  };

  // Render / Update User Marker
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps || !userLocation) return;

    const google = window.google;
    const pos = { lat: userLocation.lat, lng: userLocation.lng };

    if (!userMarkerRef.current) {
      const marker = new google.maps.Marker({
        position: pos,
        map: mapInstanceRef.current,
        icon: {
          url: getUserMarkerSvg(),
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20),
        },
        draggable: Boolean(onMapClick),
        title: 'Your Location (Drag to change)',
        zIndex: 999,
      });

      marker.addListener('dragend', (e) => {
        if (onMapClick && e.latLng) {
          onMapClick(e.latLng.lat(), e.latLng.lng());
        }
      });

      userMarkerRef.current = marker;
    } else {
      userMarkerRef.current.setPosition(pos);
    }
  }, [userLocation, onMapClick]);

  // Handle Infowindow open for a hospital
  const openHospitalInfoWindow = useCallback(
    (hospital, marker) => {
      if (!mapInstanceRef.current || !infoWindowRef.current) return;

      const genAvail = hospital.capacitySummary?.general?.available || 0;
      const genTotal = hospital.capacitySummary?.general?.total || 0;
      const icuAvail = hospital.capacitySummary?.icu?.available || 0;
      const lat = hospital.location?.coordinates?.[1];
      const lng = hospital.location?.coordinates?.[0];

      const content = `
        <div style="font-family: ui-sans-serif, system-ui, sans-serif; padding: 6px; max-width: 270px; color: #0f172a;">
          <div style="font-size: 13px; font-weight: 800; line-height: 1.3; color: #0f172a; margin-bottom: 2px;">
            ${hospital.name}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            ${hospital.address || hospital.city || ''}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: #f8fafc; padding: 6px 8px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #e2e8f0;">
            <div>
              <div style="font-size: 10px; color: #64748b; font-weight: 600;">General Beds</div>
              <div style="font-size: 13px; font-weight: 800; color: #0284c7;">${genAvail} / ${genTotal}</div>
            </div>
            <div>
              <div style="font-size: 10px; color: #64748b; font-weight: 600;">ICU Beds</div>
              <div style="font-size: 13px; font-weight: 800; color: #e11d48;">${icuAvail} Avail</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; margin-bottom: 8px;">
            <span style="font-weight: 700; color: ${hospital.emergencyAvailable ? '#e11d48' : '#64748b'};">
              ${hospital.emergencyAvailable ? '🚨 24/7 Emergency' : 'Routine Care'}
            </span>
            <span style="color: #64748b; font-size: 10px;">
              ${hospital.distanceKm ? `${hospital.distanceKm} km away` : ''}
            </span>
          </div>

          <div style="display: flex; gap: 6px; margin-top: 6px;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #0284c7; color: #ffffff; padding: 6px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none;">
              Directions
            </a>
            <a href="/hospitals/${hospital._id}" style="flex: 1; text-align: center; background: #0f172a; color: #ffffff; padding: 6px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none;">
              Details
            </a>
          </div>
        </div>
      `;

      infoWindowRef.current.setContent(content);
      infoWindowRef.current.open(mapInstanceRef.current, marker);
    },
    []
  );

  // Render Hospital Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return;

    const google = window.google;

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    hospitals.forEach((hosp) => {
      if (!hosp.location?.coordinates || hosp.location.coordinates.length < 2) return;
      const [lng, lat] = hosp.location.coordinates;
      const isSelected = selectedHospital?._id === hosp._id;

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        icon: {
          url: getHospitalMarkerSvg(hosp, isSelected),
          scaledSize: new google.maps.Size(isSelected ? 46 : 36, isSelected ? 56 : 44),
          anchor: new google.maps.Point(isSelected ? 23 : 18, isSelected ? 56 : 44),
        },
        title: hosp.name,
        zIndex: isSelected ? 100 : 10,
      });

      marker.addListener('click', () => {
        if (onSelectHospital) onSelectHospital(hosp);
        openHospitalInfoWindow(hosp, marker);
      });

      markersRef.current.push(marker);

      if (isSelected) {
        openHospitalInfoWindow(hosp, marker);
      }
    });
  }, [hospitals, selectedHospital, onSelectHospital, openHospitalInfoWindow]);

  // Smooth pan to selected hospital or user location
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (selectedHospital?.location?.coordinates) {
      const [lng, lat] = selectedHospital.location.coordinates;
      mapInstanceRef.current.panTo({ lat, lng });
      mapInstanceRef.current.setZoom(Math.max(mapInstanceRef.current.getZoom(), 14));
    } else if (userLocation) {
      mapInstanceRef.current.panTo({ lat: userLocation.lat, lng: userLocation.lng });
    }
  }, [selectedHospital, userLocation]);

  // Calculate and draw Route when requested
  const handleDrawRoute = async () => {
    if (!userLocation || !selectedHospital?.location?.coordinates) return;

    const [hLng, hLat] = selectedHospital.location.coordinates;
    setRoutingLoading(true);

    try {
      const dir = await calculateDirections(
        { lat: userLocation.lat, lng: userLocation.lng },
        { lat: hLat, lng: hLng }
      );

      if (directionsRendererRef.current && dir.result) {
        directionsRendererRef.current.setDirections(dir.result);
        setActiveRoute({
          distance: dir.distanceText,
          duration: dir.durationText,
        });
      }
    } catch (err) {
      console.warn('Routing failed:', err);
    } finally {
      setRoutingLoading(false);
    }
  };

  // Clear drawn route
  const handleClearRoute = () => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.set('directions', null);
      setActiveRoute(null);
    }
  };

  // Fallback State: API Key missing or load error
  if (errorState) {
    return (
      <div
        className={`w-full rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col items-center justify-center p-6 text-center space-y-3 ${className}`}
        style={{ height }}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="max-w-md space-y-1">
          <h3 className="font-extrabold text-base text-slate-100">
            {errorState === 'KEY_MISSING' ? 'Google Maps API Key Required' : 'Google Maps Could Not Load'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {errorState === 'KEY_MISSING'
              ? 'Please configure VITE_GOOGLE_MAPS_API_KEY in frontend/.env to enable high-resolution satellite imagery, live places discovery, and routing.'
              : 'Network or referrer restriction prevented Google Maps from loading. You can still explore all hospitals in the list directly below!'}
          </p>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800/40 bg-slate-950 font-sans select-none ${className}`}
      style={{ height }}
    >
      {/* Google Maps Canvas */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 text-white">
          <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-300">Initializing Google Maps Platform...</p>
        </div>
      )}

      {/* TOP FLOATING BAR: Map Style Switcher & Action Buttons */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between pointer-events-none gap-2">
        {/* Map Type Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-2xl border border-white/15 shadow-xl pointer-events-auto">
          <button
            type="button"
            onClick={() => switchMapType('hybrid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mapType === 'hybrid'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            🛰️ Satellite
          </button>
          <button
            type="button"
            onClick={() => switchMapType('roadmap')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mapType === 'roadmap'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            🗺️ Streets
          </button>
        </div>

        {/* Right Controls: Route button + Locate Me */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {selectedHospital && userLocation && !activeRoute && (
            <button
              type="button"
              onClick={handleDrawRoute}
              disabled={routingLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Route className="w-3.5 h-3.5" />
              <span>{routingLoading ? 'Calculating...' : 'Live Route'}</span>
            </button>
          )}

          {activeRoute && (
            <div className="bg-slate-950/90 text-white px-3 py-1.5 rounded-2xl border border-emerald-500/40 text-xs font-bold flex items-center gap-2 shadow-xl">
              <span className="text-emerald-400">🚗 {activeRoute.duration} ({activeRoute.distance})</span>
              <button
                type="button"
                onClick={handleClearRoute}
                className="text-slate-400 hover:text-white text-[11px] ml-1 cursor-pointer"
              >
                ✕ Clear
              </button>
            </div>
          )}

          {onLocateMe && (
            <button
              type="button"
              onClick={onLocateMe}
              className="bg-slate-950/85 backdrop-blur-md hover:bg-slate-900 text-white hover:text-sky-300 px-3.5 py-1.5 rounded-2xl shadow-xl border border-white/15 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Locate my position on Google Maps"
            >
              <Navigation className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Locate Me</span>
            </button>
          )}
        </div>
      </div>

      {/* BOTTOM FLOATING BAR: Legend & Drag/Click Tip */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between pointer-events-none flex-wrap gap-2">
        <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-white/15 text-[11px] font-semibold text-slate-200 flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span>Beds &gt;5</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            <span>Limited</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.8)]"></span>
            <span>Full (0)</span>
          </span>
        </div>

        <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/15 text-[10px] text-slate-300 hidden md:flex items-center gap-1.5">
          <span>💡 Click anywhere or drag blue pin to set custom location</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleHospitalMap;
