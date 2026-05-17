export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://distravel.hesiox.es';
export const API_ENDPOINTS = {
  MUNICIPALITIES: `${API_BASE_URL}/api/municipalities`,
  PLACES: `${API_BASE_URL}/api/places`,
  UPLOAD: `${API_BASE_URL}/api/upload`,
};
