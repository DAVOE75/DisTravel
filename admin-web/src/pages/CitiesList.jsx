import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  MapPin, 
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

import CityModal from '../components/CityModal';
import { getImageUrl } from '../config';

const CitiesList = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await axios.get('/api/municipalities?limit=500');
      setCities(response.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (city) => {
    setSelectedCity(city);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (cityId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingId(cityId);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const uploadRes = await axios.post('/api/upload', formData);
      const imageUrl = uploadRes.data.url;
      
      await axios.patch(`/api/municipalities/${cityId}`, { image_url: imageUrl });
      
      setCities(cities.map(c => c.id === cityId ? { ...c, image_url: imageUrl } : c));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploadingId(null);
    }
  };

  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="relative flex-1 max-w-2xl group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre de municipio..."
            className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white font-medium text-base shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-6 bg-white dark:bg-slate-900 px-8 py-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col items-center border-r border-slate-100 dark:border-slate-800 pr-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Total</span>
            <span className="text-xl font-black dark:text-white">{cities.length}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cobertura</span>
            <span className="text-xl font-black text-emerald-500">{Math.round((cities.filter(c => c.image_url).length / cities.length) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-[2.5rem] h-80 animate-pulse border border-slate-100 dark:border-slate-800"></div>
          ))
        ) : filteredCities.map((city) => (
          <motion.div 
            layout
            key={city.id}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group flex flex-col"
          >
            <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
              {city.image_url ? (
                <img src={getImageUrl(city.image_url)} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                  <ImageIcon size={40} strokeWidth={1.5} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Sin Documentación Visual</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-[4px] gap-4">
                <label className="cursor-pointer bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all">
                  {uploadingId === city.id ? (
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Upload size={14} strokeWidth={3} />
                  )}
                  Actualizar Media
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(city.id, e)}
                    disabled={uploadingId === city.id}
                  />
                </label>
                <button 
                   onClick={() => handleEdit(city)}
                   className="bg-indigo-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-indigo-400/30 hover:bg-indigo-400 transition-colors"
                >
                  Detalles Técnicos
                </button>
              </div>

              {city.image_url && (
                <div className="absolute top-4 right-4 p-2 bg-emerald-500 text-white rounded-xl shadow-xl border-2 border-white dark:border-slate-800">
                  <CheckCircle2 size={14} strokeWidth={3} />
                </div>
              )}
            </div>

            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-black text-slate-800 dark:text-white text-xl leading-tight tracking-tight group-hover:text-indigo-600 transition-colors">{city.name}</h3>
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">#{city.id}</span>
              </div>
              
              <div className="flex items-center gap-2 mt-3 text-slate-400">
                <MapPin size={14} className="text-indigo-500" />
                <span className="text-[11px] font-black uppercase tracking-widest">{city.province || 'Comunidad Valenciana'}</span>
              </div>
              
              <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Habitantes</span>
                  <span className="text-sm font-black dark:text-slate-200 mt-0.5 tracking-tight">{city.population ? city.population.toLocaleString() : '---'}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                  <AlertCircle size={20} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <CityModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        city={selectedCity}
        onSave={fetchCities}
      />
    </div>
  );
};

export default CitiesList;
