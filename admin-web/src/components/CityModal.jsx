import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Users, 
  Calendar, 
  Sparkles,
  History,
  Cloud,
  Mountain,
  Utensils,
  PartyPopper,
  Info,
  Globe
} from 'lucide-react';
import axios from 'axios';

const CityModal = ({ isOpen, onClose, city, onSave }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    population: '',
    patronal_fiesta: '',
    patronal_date: '',
    image_url: '',
    description: '',
    history: '',
    geography: '',
    climate: '',
    landscape: '',
    gastronomy: '',
    festivities: ''
  });

  useEffect(() => {
    if (city) {
      setFormData({
        name: city.name || '',
        population: city.population || '',
        patronal_fiesta: city.fiesta || city.patronal_fiesta || '',
        patronal_date: city.fiesta_date || city.patronal_date || '',
        image_url: city.image_url || '',
        description: city.description || '',
        history: city.history || '',
        geography: city.geography || '',
        climate: city.climate || '',
        landscape: city.landscape || '',
        gastronomy: city.gastronomy || '',
        festivities: city.festivities || ''
      });
    }
  }, [city, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.patch(`/api/municipalities/${city.id}`, formData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving city:', error);
      alert('Error al guardar los cambios');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const res = await axios.post('/api/upload', formDataUpload);
      setFormData({ ...formData, image_url: res.data.url });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error al subir la imagen');
    }
  };

  const handleGenerateAI = async () => {
    if (!city?.name) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/ai/generate-municipality-data', { name: city.name });
      const aiData = res.data;
      
      setFormData(prev => ({
        ...prev,
        description: aiData.description || prev.description,
        history: aiData.history || prev.history,
        geography: aiData.geography || prev.geography,
        gastronomy: aiData.gastronomy || prev.gastronomy,
        festivities: aiData.festivities || prev.festivities,
        population: aiData.population?.toString() || prev.population,
        patronal_fiesta: aiData.patronal_fiesta || prev.patronal_fiesta,
        patronal_date: aiData.patronal_date || prev.patronal_date
      }));
      
      setActiveTab('general'); // Ir a la primera pestaña para ver resultados
    } catch (error) {
      console.error('AI Generation error:', error);
      alert('Error al generar datos con IA. Asegúrate de que el servidor de Node está activo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: Info },
    { id: 'culture', label: 'Cultura', icon: History },
    { id: 'nature', label: 'Entorno', icon: Mountain },
    { id: 'lifestyle', label: 'Vida', icon: PartyPopper },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-black dark:text-white">Editar Municipio</h2>
              <p className="text-slate-400 text-sm font-medium">{formData.name}</p>
            </div>
            <button 
              type="button"
              onClick={handleGenerateAI}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all disabled:opacity-50"
            >
              <Sparkles size={14} className={loading ? 'animate-pulse' : ''} />
              {loading ? 'Generando...' : 'Completar con IA'}
            </button>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-8 py-2 bg-slate-50/50 dark:bg-slate-800/30">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <form id="city-form" onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Población</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        value={formData.population}
                        onChange={(e) => setFormData({...formData, population: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        placeholder="Ej: 330.000 hab."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Fiesta Patronal</label>
                    <div className="relative">
                      <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        value={formData.patronal_fiesta}
                        onChange={(e) => setFormData({...formData, patronal_fiesta: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        placeholder="Ej: Hogueras de San Juan"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Fecha Fiesta</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        value={formData.patronal_date}
                        onChange={(e) => setFormData({...formData, patronal_date: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        placeholder="Ej: 24 de Junio"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Imagen de Portada</label>
                  <div className="relative aspect-video rounded-3xl bg-slate-50 dark:bg-slate-800 overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 group">
                    {formData.image_url ? (
                      <>
                        <img src={formData.image_url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-sm">
                             Cambiar Imagen
                             <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                           </label>
                        </div>
                      </>
                    ) : (
                      <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-400">
                        <Upload size={32} />
                        <span className="font-bold text-sm">Subir Foto</span>
                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                      </label>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Resumen / Descripción</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none"
                    placeholder="Breve intro..."
                  ></textarea>
                </div>
              </div>
            )}

            {activeTab === 'culture' && (
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    <History size={14} /> Historia
                  </label>
                  <textarea 
                    value={formData.history}
                    onChange={(e) => setFormData({...formData, history: e.target.value})}
                    rows="6"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none"
                    placeholder="Escribe sobre la historia del municipio..."
                  ></textarea>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    <PartyPopper size={14} /> Festividades y Tradiciones
                  </label>
                  <textarea 
                    value={formData.festivities}
                    onChange={(e) => setFormData({...formData, festivities: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none"
                    placeholder="Describe las fiestas principales..."
                  ></textarea>
                </div>
              </div>
            )}

            {activeTab === 'nature' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      <Cloud size={14} /> Clima
                    </label>
                    <textarea 
                      value={formData.climate}
                      onChange={(e) => setFormData({...formData, climate: e.target.value})}
                      rows="4"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none"
                      placeholder="Información sobre el clima..."
                    ></textarea>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      <Globe size={14} /> Geografía
                    </label>
                    <textarea 
                      value={formData.geography}
                      onChange={(e) => setFormData({...formData, geography: e.target.value})}
                      rows="4"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none"
                      placeholder="Orografía, ubicación..."
                    ></textarea>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    <Mountain size={14} /> Paisaje y Naturaleza
                  </label>
                  <textarea 
                    value={formData.landscape}
                    onChange={(e) => setFormData({...formData, landscape: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none"
                    placeholder="Entorno natural, parques..."
                  ></textarea>
                </div>
              </div>
            )}

            {activeTab === 'lifestyle' && (
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    <Utensils size={14} /> Gastronomía
                  </label>
                  <textarea 
                    value={formData.gastronomy}
                    onChange={(e) => setFormData({...formData, gastronomy: e.target.value})}
                    rows="6"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none"
                    placeholder="Platos típicos, productos locales..."
                  ></textarea>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-end gap-4 bg-white dark:bg-slate-900 sticky bottom-0 z-10">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button 
            form="city-form"
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CityModal;
