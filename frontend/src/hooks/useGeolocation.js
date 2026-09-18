import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * useGeolocation — 3-step location resolution hook
 *
 * Step 1: Browser GPS  (navigator.geolocation) — most accurate
 * Step 2: IP Location  (ipapi.co — free, no API key, 30k req/mo)
 * Step 3: Delhi default — always works as last resort
 */
const useGeolocation = () => {
  const [location, setLocation] = useState(null); // null = not yet resolved
  const [locationName, setLocationName] = useState('Detecting location...');
  const [locationSource, setLocationSource] = useState(''); // 'gps' | 'ip' | 'default'
  const [locating, setLocating] = useState(false);

  // ── Step 3: Hard default (New Delhi center) ──────────────────────────────
  const useDelhi = useCallback((silent = false) => {
    setLocation({ lat: 28.6139, lng: 77.209 });
    setLocationName('🏙️ New Delhi (Default)');
    setLocationSource('default');
    setLocating(false);
    if (!silent) {
      toast('📍 Location unavailable — showing New Delhi hospitals.', { icon: 'ℹ️' });
    }
  }, []);

  // ── Step 2: IP-based via ipapi.co (free, no key) ─────────────────────────
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

        if (isNaN(lat) || isNaN(lng)) throw new Error('ipapi returned invalid coords');

        setLocation({ lat, lng });
        const city = data.city || data.region || data.country_name || 'Your Area';
        setLocationName(`📡 ${city}`);
        setLocationSource('ip');
        setLocating(false);
        toast.success(`📡 Location detected: ${city}`);
        return true;
      }

      throw new Error('ipapi response missing lat/lng');
    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn('ipapi.co request timed out — using Delhi fallback');
      } else {
        console.warn('IP geolocation failed:', err.message, '— using Delhi fallback');
      }
      useDelhi();
      return false;
    }
  }, [useDelhi]);

  // ── Step 1: Browser GPS ──────────────────────────────────────────────────
  const detectLocation = useCallback(() => {
    setLocating(true);
    setLocationName('Detecting location...');

    if (!('geolocation' in navigator)) {
      // Browser doesn't support Geolocation API at all
      fetchIpLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Sanity check: must be valid India-ish coordinates
        if (isNaN(lat) || isNaN(lng)) {
          fetchIpLocation();
          return;
        }

        setLocation({ lat, lng });
        setLocationName('📍 Your Live GPS Location');
        setLocationSource('gps');
        setLocating(false);
        toast.success('📍 Live GPS location acquired!');
      },
      async (err) => {
        // err.code: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
        console.warn(`GPS failed (code ${err.code}): ${err.message} — trying ipapi.co...`);
        await fetchIpLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000, // accept cached position up to 1 min old
      }
    );
  }, [fetchIpLocation]);

  return {
    location,       // { lat, lng } | null
    locationName,   // human-readable label
    locationSource, // 'gps' | 'ip' | 'default'
    locating,       // boolean — detecting in progress
    detectLocation, // call to trigger/re-trigger detection
  };
};

export default useGeolocation;
