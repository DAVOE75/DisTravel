import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = '@distravel_profile';

export const saveProfile = async (profileData) => {
  try {
    const jsonValue = JSON.stringify(profileData);
    await AsyncStorage.setItem(PROFILE_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving profile', e);
  }
};

export const getProfile = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(PROFILE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error reading profile', e);
    return null;
  }
};
