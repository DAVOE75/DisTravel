import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

const STORAGE_KEY = '@distravel_user_data';

const INITIAL_USER_DATA = {
  name: '',
  email: '',
  phone: '',
  address: '',
  disabilityDegree: '',
  issuingBody: '',
  expiryDate: '',
  idCardImage: null,
  profileImage: null,
  isLoggedIn: true,
  voiceGuidance: false,
  highContrast: false,
  isAdmin: true,
  id: 'admin_1',
  contributions: [],
  customCityData: {}, // Guardará { 'alcoy': { image: '...', history: '...' } }
};

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(INITIAL_USER_DATA);

  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos al iniciar
  useEffect(() => {
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
          const parsed = JSON.parse(jsonValue);
          // Mezclamos con INITIAL_USER_DATA para asegurar campos nuevos
          setUserData({ ...INITIAL_USER_DATA, ...parsed, isLoggedIn: true });
        } else {
          // Si no hay datos, forzamos login directo para pruebas
          setUserData({ ...INITIAL_USER_DATA, isLoggedIn: true });
        }
      } catch (e) {
        console.error('Error cargando los datos del usuario:', e);
        setUserData({ ...INITIAL_USER_DATA, isLoggedIn: true });
      } finally {
        // Un pequeño retraso para asegurar que el motor de renderizado esté listo
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    loadData();
  }, []);

  // Función para actualizar y guardar automáticamente
  const updateUserData = async (newData) => {
    try {
      const updatedData = { ...userData, ...newData };
      setUserData(updatedData);
      const jsonValue = JSON.stringify(updatedData);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Error guardando los datos del usuario:', e);
    }
  };

  const logout = async () => {
    try {
      setUserData(INITIAL_USER_DATA);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }
  };

  return (
    <UserContext.Provider value={{ userData, updateUserData, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe usarse dentro de un UserProvider');
  }
  return context;
};
