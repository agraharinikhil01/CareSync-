import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

// Robust fallback: Uses VITE_GOOGLE_MAPS_API_KEY from env, or bundled fallback key for production Vercel
const GOOGLE_MAPS_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao';

let mapsLoaded = false;
let loadPromise = null;

/**
 * Checks whether Google Maps API Key is provided
 */
export const isGoogleMapsConfigured = () => {
  return Boolean(GOOGLE_MAPS_KEY && GOOGLE_MAPS_KEY.trim().length > 5);
};

/**
 * Returns active Google Maps API Key
 */
export const getGoogleMapsApiKey = () => GOOGLE_MAPS_KEY;

/**
 * Singleton Google Maps Platform loader using new v2.x functional API
 * Uses setOptions() + importLibrary() instead of deprecated Loader class
 */
export const loadGoogleMaps = () => {
  if (!isGoogleMapsConfigured()) {
    return Promise.reject(new Error('GOOGLE_MAPS_KEY_MISSING'));
  }

  // Already loaded — return immediately
  if (typeof window !== 'undefined' && window.google && window.google.maps && mapsLoaded) {
    return Promise.resolve(window.google);
  }

  // Return existing load promise if in progress
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      // Configure the loader with API key and libraries
      setOptions({
        apiKey: GOOGLE_MAPS_KEY,
        version: 'weekly',
        libraries: ['places', 'geometry'],
      });

      // Import the core Maps library (this loads the Google Maps script)
      await importLibrary('maps');
      // Import Places library
      await importLibrary('places');

      mapsLoaded = true;
      return window.google;
    } catch (err) {
      loadPromise = null; // allow retry
      throw err;
    }
  })();

  return loadPromise;
};

/**
 * Google Places Autocomplete search across India
 */
export const searchGooglePlaces = async (query) => {
  if (!query || query.trim().length < 2) return [];

  try {
    await loadGoogleMaps();
    if (!window.google?.maps?.places) return [];

    return new Promise((resolve) => {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions(
        {
          input: query.trim(),
          componentRestrictions: { country: 'in' },
        },
        (predictions, status) => {
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
            return resolve([]);
          }

          resolve(
            predictions.map((p) => ({
              placeId: p.place_id,
              description: p.description,
              mainText: p.structured_formatting?.main_text || p.description,
              secondaryText: p.structured_formatting?.secondary_text || '',
            }))
          );
        }
      );
    });
  } catch (err) {
    console.warn('Google Places search error:', err.message);
    return [];
  }
};

/**
 * Geocode placeId to exact { lat, lng, formattedAddress }
 */
export const getPlaceCoordinates = async (placeId) => {
  await loadGoogleMaps();
  const geocoder = new window.google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ placeId }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const loc = results[0].geometry.location;
        resolve({
          lat: loc.lat(),
          lng: loc.lng(),
          formattedAddress: results[0].formatted_address,
        });
      } else {
        reject(new Error(`Geocoding failed with status: ${status}`));
      }
    });
  });
};

export const reverseGeocode = async (lat, lng) => {
  // 1. Try Google Maps Geocoder first
  try {
    await loadGoogleMaps();
    if (window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      const googleResult = await new Promise((resolve) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            const comp = results[0].address_components || [];
            const locality = comp.find(
              (c) => c.types.includes('locality') || c.types.includes('sublocality_level_1')
            )?.long_name;
            const district = comp.find((c) =>
              c.types.includes('administrative_area_level_2')
            )?.long_name;

            const label = locality
              ? `${locality}${district && district !== locality ? ', ' + district : ''}`
              : results[0].formatted_address.split(',').slice(0, 2).join(',');

            resolve(label);
          } else {
            resolve(null);
          }
        });
      });
      if (googleResult) return googleResult;
    }
  } catch (err) {
    console.warn('Google reverseGeocode error, falling back to OSM:', err.message);
  }

  // 2. OpenStreetMap Nominatim fallback for reliable human-readable location
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en,hi' },
      }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const locality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.city ||
        addr.town ||
        addr.village ||
        addr.county;
      const districtOrState = addr.state_district || addr.state;
      if (locality && districtOrState && locality !== districtOrState) {
        return `${locality}, ${districtOrState}`;
      }
      return locality || data.display_name?.split(',').slice(0, 2).join(',') || null;
    }
  } catch (osmErr) {
    console.warn('OSM reverse geocode error:', osmErr.message);
  }

  return null;
};

/**
 * Calculate driving directions and ETA
 */
export const calculateDirections = async (origin, destination) => {
  await loadGoogleMaps();
  const directionsService = new window.google.maps.DirectionsService();

  return new Promise((resolve, reject) => {
    directionsService.route(
      {
        origin: new window.google.maps.LatLng(origin.lat, origin.lng),
        destination: new window.google.maps.LatLng(destination.lat, destination.lng),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          const leg = result.routes[0]?.legs[0];
          resolve({
            result,
            distanceText: leg?.distance?.text,
            durationText: leg?.duration?.text,
            distanceMeters: leg?.distance?.value,
            durationSeconds: leg?.duration?.value,
          });
        } else {
          reject(new Error(`Directions failed: ${status}`));
        }
      }
    );
  });
};


