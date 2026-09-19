import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { searchGooglePlaces, getPlaceCoordinates } from '../services/googleMaps';

const STORAGE_KEY = 'caresync_user_location_v1';

/**
 * useGeolocation — Comprehensive Location Management
 * 
 * 1. Saved location in localStorage (e.g. Khalilabad, Sant Kabir Nagar)
 * 2. Browser GPS (navigator.geolocation)
 * 3. Free IP-based geolocation (ipapi.co)
 * 4. Manual location selection / Map click / City search (Nominatim)
 * 5. Default fallback (New Delhi)
 */
const useGeolocation = () => {
  const [location, setLocation] = useState(null); // { lat, lng }
  const [locationName, setLocationName] = useState('Detecting location...');
  const [locationSource, setLocationSource] = useState(''); // 'saved' | 'gps' | 'ip' | 'manual' | 'default'
  const [locating, setLocating] = useState(false);

  // Set location manually (via search or map click) and persist
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

    toast.success(`📍 Location set to: ${label}`);
  }, []);

  // Hard default (New Delhi)
  const useDelhi = useCallback((silent = false) => {
    setLocation({ lat: 28.6139, lng: 77.209 });
    setLocationName('🏙️ New Delhi (Default)');
    setLocationSource('default');
    setLocating(false);
    if (!silent) {
      toast('📍 Using default location — search or click map to change.', { icon: 'ℹ️' });
    }
  }, []);

  // IP-based via ipapi.co (free, no key)
  const fetchIpLocation = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

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

        const city = data.city || data.region || 'Your Area';
        const label = `📡 ${city} (IP)`;
        setLocation({ lat, lng });
        setLocationName(label);
        setLocationSource('ip');
        setLocating(false);
        toast.success(`📡 Approximate location: ${city}. You can adjust anytime!`);
        return true;
      }
      throw new Error('Missing lat/lng');
    } catch (err) {
      console.warn('IP geolocation failed:', err.message, '— using Delhi fallback');
      useDelhi();
      return false;
    }
  }, [useDelhi]);

  // Browser GPS (with fallback to IP)
  const detectLocation = useCallback((forceGps = false) => {
    setLocating(true);
    setLocationName('Detecting GPS location...');

    // If user already saved a manual location and not forcing GPS, use saved
    if (!forceGps) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.lat && parsed.lng) {
            setLocation({ lat: parsed.lat, lng: parsed.lng });
            setLocationName(parsed.name || '📍 Saved Location');
            setLocationSource(parsed.source || 'saved');
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

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (isNaN(lat) || isNaN(lng)) {
          fetchIpLocation();
          return;
        }

        setLocation({ lat, lng });
        setLocationName('📍 Live GPS Location');
        setLocationSource('gps');
        setLocating(false);

        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ lat, lng, name: '📍 Live GPS Location', source: 'gps' })
          );
        } catch {
          // ignore
        }

        toast.success('📍 Live GPS location acquired!');
      },
      async (err) => {
        console.warn(`GPS failed (${err.code}): ${err.message} — trying IP fallback...`);
        await fetchIpLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000,
      }
    );
  }, [fetchIpLocation]);

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
    setManualLocation,
    searchPlaces,
    resolveAndSetPlace,
  };
};

export default useGeolocation;
