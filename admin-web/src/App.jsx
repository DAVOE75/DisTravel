import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE, ROUTER_BASE } from './config';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PlacesList from './pages/PlacesList';
import CitiesList from './pages/CitiesList';
import UsersList from './pages/UsersList';

// Configurar Axios globalmente
axios.defaults.baseURL = API_BASE;

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Router basename={ROUTER_BASE}>
      <Routes>
        <Route path="/" element={<Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}>
          <Route index element={<Dashboard />} />
          <Route path="places" element={<PlacesList />} />
          <Route path="cities" element={<CitiesList />} />
          <Route path="users" element={<UsersList />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

