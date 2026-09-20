import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  searchGooglePlaces,
  getPlaceCoordinates,
  reverseGeocode,
} from '../services/googleMaps';

const STORAGE_KEY = 'caresync_user_location_v2';

// Default center: Khalilabad, Sant Kabir Nagar (Primary active region)
const DEFAULT_CENTER = {
  lat: 26.7751,
  lng: 83.0542,
  name: '📍 Khalilabad, Sant Kabir Nagar',
};

const getInitialState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.lat && parsed.lng) {
        return {
          location: { lat: parseFloat(parsed.lat), lng: parseFloat(parsed.lng) },
          name: parsed.name || '📍 Saved Location',
          source: parsed.source || 'saved',
        };
      }
    }
  } catch {
    // fallback
  }
  return {
    location: { lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng },
    name: DEFAULT_CENTER.name,
    source: 'default',
  };
};

/**
 * useGeolocation — Comprehensive Location Management
 * 
 * 1. Saved location in localStorage (e.g. Khalilabad, Sant Kabir Nagar)
 * 2. Browser GPS (navigator.geolocation with Google Reverse Geocoding)
 * 3. IP-based geolocation (ipwho.is / ipapi.co)
 * 4. Default fallback (Khalilabad, Sant Kabir Nagar)
 */
const useGeolocation = () => {
  const [initial] = useState(getInitialState);
  const [location, setLocation] = useState(initial.location);
  const [locationName, setLocationName] = useState(initial.name);
  const [locationSource, setLocationSource] = useState(initial.source);
  const [locating, setLocating] = useState(false);

  // Set location manually (via quick chips, search, or map click) and persist
  const setManualLocation = useCallback((lat, lng, name) => {
    const newLoc = { lat: parseFloat(lat), lng: parseFloat(lng) };
    const label = name || `📍 Location (${newLoc.lat.toFixed(3)}, ${newLoc.lng.toFixed(3)})`;
    setLocation(newLoc);
    setLocationName(label);
    setLocationSource('manual');
    setLocating(false);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ lat: newLoc.lat, lng: newLoc.lng, name: label, source: 'manual' })
      );
    } catch {
      // ignore storage error
    }

    toast.success(`📍 Location: ${label}`);
  }, []);

  // Primary Default (Khalilabad, Sant Kabir Nagar)
  const useDefaultRegion = useCallback((silent = false) => {
    setLocation({ lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng });
    setLocationName(DEFAULT_CENTER.name);
    setLocationSource('default');
    setLocating(false);
    if (!silent) {
      toast('📍 Centered on Khalilabad — tap "Live GPS" or search to change anytime.', { icon: 'ℹ️' });
    }
  }, []);

  // IP-based via ipwho.is with ipapi.co secondary fallback
  const fetchIpLocation = useCallback(async () => {
    // 1. Try ipwho.is (fast, reliable across India, no strict rate limit)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch('https://ipwho.is/', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.latitude && data.longitude) {
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);
          const resolvedName = await reverseGeocode(lat, lng);
          const city = resolvedName || data.city || data.region || 'Your Area';
          const label = `📡 ${city}`;

          setLocation({ lat, lng });
          setLocationName(label);
          setLocationSource('ip');
          setLocating(false);
          return true;
        }
      }
    } catch (e) {
      console.warn('ipwho.is failed, trying ipapi.co fallback:', e.message);
    }

    // 2. Secondary fallback: ipapi.co
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`ipapi HTTP ${response.status}`);

      const data = await response.json();
      if (data.error) throw new Error(`ipapi error: ${data.reason || data.error}`);

      if (data.latitude && data.longitude) {
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        if (isNaN(lat) || isNaN(lng)) throw new Error('Invalid coords');

        const resolvedName = await reverseGeocode(lat, lng);
        const city = resolvedName || data.city || data.region || 'Your Area';
        const label = `📡 ${city}`;

        setLocation({ lat, lng });
        setLocationName(label);
        setLocationSource('ip');
        setLocating(false);
        return true;
      }
      throw new Error('Missing lat/lng');
    } catch (err) {
      console.warn('IP geolocation failed:', err.message, '— using default region');
      useDefaultRegion(true);
      return false;
    }
  }, [useDefaultRegion]);

  // Browser GPS (with high-accuracy then standard-accuracy fallback for Windows desktop)
  const detectLocation = useCallback((forceGps = false) => {
    setLocating(true);
    setLocationName('Acquiring live GPS location...');

    // Only bypass GPS if user explicitly manually picked a location earlier AND forceGps is false
    if (!forceGps) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.source === 'manual' && parsed.lat && parsed.lng) {
            setLocation({ lat: parsed.lat, lng: parsed.lng });
            setLocationName(parsed.name || '📍 Selected Location');
            setLocationSource('manual');
            setLocating(false);
            return;
          }
        }
      } catch {
        // ignore
      }
    }

    if (!('geolocation' in navigator)) {
      fetchIpLocation();
      return;
    }

    const handleGpsSuccess = async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      if (isNaN(lat) || isNaN(lng)) {
        fetchIpLocation();
        return;
      }

      // Reverse Geocoding to get human-friendly locality / town / city
      let label = '📍 Live GPS Location';
      try {
        const name = await reverseGeocode(lat, lng);
        if (name) {
          label = `📍 ${name}`;
        }
      } catch {
        // fallback
      }

      setLocation({ lat, lng });
      setLocationName(label);
      setLocationSource('gps');
      setLocating(false);

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ lat, lng, name: label, source: 'gps', timestamp: Date.now() })
        );
      } catch {
        // ignore
      }

      toast.success(`Live Location: ${label}`);
    };

    // Attempt 1: High accuracy (satellite / mobile)
    navigator.geolocation.getCurrentPosition(
      handleGpsSuccess,
      (err) => {
        console.warn(`High accuracy GPS failed (${err.code}) — trying standard accuracy (WiFi / network)...`);
        // Attempt 2: Standard accuracy (desktop / laptop Windows WiFi positioning)
        navigator.geolocation.getCurrentPosition(
          handleGpsSuccess,
          async (err2) => {
            console.warn(`Standard GPS failed (${err2.code}) — falling back to IP location...`);
            const ipOk = await fetchIpLocation();
            if (!ipOk) {
              useDefaultRegion(false);
            }
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 30000,
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 5000,
      }
    );
  }, [fetchIpLocation, useDefaultRegion]);

  const refreshLiveGps = useCallback(() => {
    detectLocation(true);
  }, [detectLocation]);

  // Search places using Google Places Autocomplete (with OpenStreetMap fallback)
  const searchPlaces = async (query) => {
    if (!query || query.trim().length < 2) return [];

    // 1. Try Google Places Autocomplete first
    try {
      const googleResults = await searchGooglePlaces(query);
      if (googleResults && googleResults.length > 0) {
        return googleResults.map((p) => ({
          placeId: p.placeId,
          name: p.description,
          city: p.mainText,
          state: p.secondaryText,
          isGoogle: true,
        }));
      }
    } catch (gErr) {
      console.warn('Google places search skipped, falling back to OSM:', gErr.message);
    }

    // 2. Fallback to OpenStreetMap Nominatim
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query.trim()
      )}&countrycodes=in&limit=6&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en,hi',
        },
      });
      if (!res.ok) return [];
      const items = await res.json();
      return items.map((item) => ({
        name: item.display_name,
        city: item.address?.city || item.address?.town || item.address?.village || item.address?.county || item.name,
        state: item.address?.state || '',
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        isGoogle: false,
      }));
    } catch (err) {
      console.error('Nominatim search error:', err);
      return [];
    }
  };

  // Resolve place selection (geocodes Google Places or uses existing lat/lng)
  const resolveAndSetPlace = async (item) => {
    if (item.lat && item.lng) {
      setManualLocation(item.lat, item.lng, item.city ? `📍 ${item.city}` : item.name);
      return;
    }

    if (item.placeId) {
      try {
        const coords = await getPlaceCoordinates(item.placeId);
        setManualLocation(coords.lat, coords.lng, `📍 ${item.city || coords.formattedAddress}`);
      } catch (err) {
        console.error('Failed to geocode Google Place:', err);
        toast.error('Could not get coordinates for selected place');
      }
    }
  };

  return {
    location,
    locationName,
    locationSource,
    locating,
    detectLocation,
    refreshLiveGps,
    setManualLocation,
    searchPlaces,
    resolveAndSetPlace,
  };
};

export default useGeolocation;
