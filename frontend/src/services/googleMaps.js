import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

let loaderInstance = null;
let googlePromise = null;

/**
 * Checks whether Google Maps API Key is provided
 */
export const isGoogleMapsConfigured = () => {
  return Boolean(GOOGLE_MAPS_KEY && GOOGLE_MAPS_KEY.trim().length > 5);
};

/**
 * Singleton Google Maps Platform loader
 * Loads Maps JavaScript API, Places library, and Geometry
 */
export const loadGoogleMaps = () => {
  if (!isGoogleMapsConfigured()) {
    return Promise.reject(new Error('GOOGLE_MAPS_KEY_MISSING'));
  }

  if (typeof window !== 'undefined' && window.google && window.google.maps) {
    return Promise.resolve(window.google);
  }

  if (!googlePromise) {
    loaderInstance = new Loader({
      apiKey: GOOGLE_MAPS_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });

    googlePromise = loaderInstance
      .load()
      .then(() => {
        return window.google;
      })
      .catch((err) => {
        googlePromise = null; // allow retry
        throw err;
      });
  }

  return googlePromise;
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
