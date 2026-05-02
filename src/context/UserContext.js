import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    name: 'Juan Pérez',
    email: 'juan.perez@ejemplo.com',
    phone: '+34 600 000 000',
    address: 'Calle Mayor 1, Alicante, España',
    disabilityDegree: 65,
    issuingBody: 'Generalitat Valenciana - Conselleria de Igualdad',
    expiryDate: '12 / 03 / 2029',
    idCardImage: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=800'
  });

  const updateUserData = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  return (
    <UserContext.Provider value={{ userData, updateUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
