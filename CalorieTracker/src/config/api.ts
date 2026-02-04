import Config from 'react-native-config';

const API_BASE_URL = Config.REACT_APP_API_BASE_URL || 'http://10.0.2.2:5000/api';

export const API_ENDPOINTS = {
  ENTRIES: `${API_BASE_URL}/entries`,
  ANALYZE_USER_TEXT: `${API_BASE_URL}/analyze-user-text`,
  ANALYZE_MEAL_IMAGE: `${API_BASE_URL}/analyze-meal-image`,
};

export default API_BASE_URL;