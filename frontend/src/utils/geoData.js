// Approximate coordinates for Indian States & Key Mandi Districts
export const REGION_COORDINATES = {
  // States
  'Punjab': { lat: 31.1471, lon: 75.3412 },
  'Haryana': { lat: 29.0588, lon: 76.0856 },
  'Uttar Pradesh': { lat: 26.8467, lon: 80.9462 },
  'Madhya Pradesh': { lat: 22.9734, lon: 78.6569 },
  'Rajasthan': { lat: 27.0238, lon: 74.2179 },
  'Maharashtra': { lat: 19.7515, lon: 75.7139 },
  'Gujarat': { lat: 22.2587, lon: 71.1924 },
  'Karnataka': { lat: 15.3173, lon: 75.7139 },
  'Andhra Pradesh': { lat: 15.9129, lon: 79.7400 },
  'Tamil Nadu': { lat: 11.1271, lon: 78.6569 },
  'West Bengal': { lat: 22.9868, lon: 87.8550 },
  'Bihar': { lat: 25.0961, lon: 85.3131 },
  'Odisha': { lat: 20.9517, lon: 85.0985 },
  'Telangana': { lat: 18.1124, lon: 79.0193 },
  'Kerala': { lat: 10.8505, lon: 76.2711 },
  'Himachal Pradesh': { lat: 31.1048, lon: 77.1734 },
  'Uttarakhand': { lat: 30.0668, lon: 79.0193 },
  'Delhi': { lat: 28.7041, lon: 77.1025 },
  'Jammu and Kashmir': { lat: 33.7782, lon: 76.5762 },
  'Chhattisgarh': { lat: 21.2787, lon: 81.8661 },
  'Jharkhand': { lat: 23.6102, lon: 85.2799 },
  'Assam': { lat: 26.2006, lon: 92.9376 },

  // Key Mandi Districts & APMC Hubs
  'Azadpur': { lat: 28.7145, lon: 77.1742 },
  'Ludhiana': { lat: 30.9010, lon: 75.8573 },
  'Khanna': { lat: 30.7020, lon: 76.2163 },
  'Karnal': { lat: 29.6857, lon: 76.9905 },
  'Indore': { lat: 22.7196, lon: 75.8577 },
  'Neemuch': { lat: 24.4690, lon: 74.8722 },
  'Ujjain': { lat: 23.1765, lon: 75.7885 },
  'Kota': { lat: 25.2138, lon: 75.8648 },
  'Nashik': { lat: 19.9975, lon: 73.7898 },
  'Lasalgaon': { lat: 20.1444, lon: 74.2289 },
  'Pune': { lat: 18.5204, lon: 73.8567 },
  'Nagpur': { lat: 21.1458, lon: 79.0882 },
  'Ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'Rajkot': { lat: 22.3039, lon: 70.8022 },
  'Gondal': { lat: 21.9619, lon: 70.7997 },
  'Surat': { lat: 21.1702, lon: 72.8311 },
  'Unjha': { lat: 23.8037, lon: 72.3957 },
  'Bathinda': { lat: 30.2110, lon: 74.9455 },
  'Agra': { lat: 27.1767, lon: 78.0081 },
  'Kanpur': { lat: 26.4499, lon: 80.3319 },
  'Varanasi': { lat: 25.3176, lon: 82.9739 },
  'Guntur': { lat: 16.3067, lon: 80.4365 },
  'Khammam': { lat: 17.2473, lon: 80.1514 },
  'Shimla': { lat: 31.1048, lon: 77.1734 },
  'Amritsar': { lat: 31.6340, lon: 74.8723 }
};

/**
 * Calculates distance between two coordinates using the Haversine formula (in kilometers)
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Attempts to resolve coordinates for a mandi given its name, district, or state
 */
export function getMandiCoordinates(mandi) {
  if (!mandi) return null;
  // Try exact mandi name match
  if (mandi.name && REGION_COORDINATES[mandi.name]) {
    return REGION_COORDINATES[mandi.name];
  }
  // Try district match
  if (mandi.district && REGION_COORDINATES[mandi.district]) {
    return REGION_COORDINATES[mandi.district];
  }
  // Fallback to state match
  if (mandi.state && REGION_COORDINATES[mandi.state]) {
    return REGION_COORDINATES[mandi.state];
  }
  return null;
}
