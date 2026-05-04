export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://82.223.44.196:3000';
export const API_ENDPOINTS = {
  MUNICIPALITIES: `${API_BASE_URL}/api/municipalities`,
  PLACES: `${API_BASE_URL}/api/places`,
  UPLOAD: `${API_BASE_URL}/api/upload`,
};
