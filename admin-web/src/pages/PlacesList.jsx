import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Eye,
  CheckCircle2,
  Clock,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import PlaceModal from '../components/PlaceModal';
import { getImageUrl } from '../config';

const PlacesList = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/places');
      setPlaces(response.data);
    } catch (error) {
      console.error('Error fetching places:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const filteredPlaces = places.filter(place => 
    place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este monumento?')) return;
    try {
      await axios.delete(`/api/places/${id}`);
      setPlaces(places.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting place:', error);
      alert('Error al eliminar el monumento');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-2xl group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Filtrar monumentos por nombre, ciudad o ID..."
            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white font-medium text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm">
            <Filter size={20} />
          </button>
          <button 
            onClick={() => { setSelectedPlace(null); setIsModalOpen(true); }}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-3 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            Añadir Monumento
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Monumento / Información</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Categoría</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ubicación</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-10 py-12">
                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
                        <div className="space-y-2">
                           <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-48"></div>
                           <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded w-24"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredPlaces.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <Building2 size={48} className="mb-4" />
                      <p className="text-sm font-black uppercase tracking-widest">Sin resultados</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPlaces.map((place) => (
                <tr key={place.id} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-all duration-300 group">
                  <td className="px-10 py-5">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden ring-4 ring-slate-50 dark:ring-slate-900 group-hover:ring-indigo-100 dark:group-hover:ring-indigo-900/30 transition-all shadow-sm">
                        {place.image ? (
                          <img src={getImageUrl(place.image)} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon size={22} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 dark:text-white leading-tight tracking-tight text-[15px]">{place.name}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">#{String(place.id).substring(0, 8)}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock size={10} />
                            Actualizado hoy
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-5">
                    <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider border border-indigo-100/50 dark:border-indigo-500/20">
                      {place.category || 'Sin Categoría'}
                    </span>
                  </td>
                  <td className="px-10 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <MapPin size={14} className="text-indigo-500" />
                        <span className="text-sm font-bold tracking-tight">
                          {place.city}
                          {(place.province || place.extra_data?.province) ? ` (${place.province || place.extra_data?.province})` : ''}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium ml-5 italic truncate max-w-[150px]">
                        {place.address || place.extra_data?.address || 'Sin dirección'}
                      </p>
                    </div>
                  </td>
                  <td className="px-10 py-5">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${place.verified ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/30'}`}>
                      <CheckCircle2 size={14} strokeWidth={3} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{place.verified ? 'Verificado' : 'Pendiente'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => { setSelectedPlace(place); setIsModalOpen(true); }}
                        className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-indigo-500 hover:bg-indigo-600 hover:text-white shadow-sm transition-all active:scale-90"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(place.id)}
                        className="p-3 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl text-slate-400 hover:text-rose-500 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-10 py-6 border-t border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            Mostrando <span className="text-slate-800 dark:text-white">{filteredPlaces.length}</span> de <span className="text-slate-800 dark:text-white">{places.length}</span> resultados
          </p>
          <div className="flex items-center gap-2">
            <button className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-not-allowed">Anterior</button>
            <button className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Siguiente</button>
          </div>
        </div>
      </div>

      <PlaceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        place={selectedPlace} 
        onSave={fetchPlaces}
      />
    </div>
  );
};

export default PlacesList;
