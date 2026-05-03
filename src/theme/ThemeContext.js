import React, { createContext, useState, useContext, useEffect } from 'react';
import { lightTheme, darkTheme } from './colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();
const THEME_STORAGE_KEY = '@distravel_theme_mode';

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (e) {
        console.error('Error cargando el tema:', e);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');
    } catch (e) {
      console.error('Error guardando el tema:', e);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;
  const logo = isDarkMode 
    ? require('../../assets/logo_dark.png') 
    : require('../../assets/logo_official.png');
  const logoOfficial = require('../../assets/logo_official.png');

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme, logo, logoOfficial }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
