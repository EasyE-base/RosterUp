export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export async function geocodeAddress(
  address: string,
  city: string,
  state?: string,
  country: string = 'USA'
): Promise<GeocodeResult | null> {
  try {
    const query = [address, city, state, country].filter(Boolean).join(', ');

    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?` +
        new URLSearchParams({
          q: query,
          format: 'json',
          limit: '1',
          addressdetails: '1',
        }),
      {
        headers: {
          'User-Agent': 'RosterUp Sports Management Platform',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name,
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        resolve(null);
      },
      {
        timeout: 10000,
        enableHighAccuracy: false,
      }
    );
  });
}
