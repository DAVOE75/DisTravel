import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  MapPin, 
  CheckCircle2, 
  Info,
  Accessibility,
  Globe,
  Clock,
  Euro,
  Navigation,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import axios from 'axios';
const INE_PROVINCES = {
  "01": "Álava",
  "02": "Albacete",
  "03": "Alicante",
  "04": "Almería",
  "05": "Ávila",
  "06": "Badajoz",
  "07": "Baleares",
  "08": "Barcelona",
  "09": "Burgos",
  "10": "Cáceres",
  "11": "Cádiz",
  "12": "Castellón",
  "13": "Ciudad Real",
  "14": "Córdoba",
  "15": "A Coruña",
  "16": "Cuenca",
  "17": "Girona",
  "18": "Granada",
  "19": "Guadalajara",
  "20": "Guipúzcoa",
  "21": "Huelva",
  "22": "Huesca",
  "23": "Jaén",
  "24": "León",
  "25": "Lleida",
  "26": "La Rioja",
  "27": "Lugo",
  "28": "Madrid",
  "29": "Málaga",
  "30": "Murcia",
  "31": "Navarra",
  "32": "Ourense",
  "33": "Asturias",
  "34": "Palencia",
  "35": "Las Palmas",
  "36": "Pontevedra",
  "37": "Salamanca",
  "38": "Santa Cruz de Tenerife",
  "39": "Cantabria",
  "40": "Segovia",
  "41": "Sevilla",
  "42": "Soria",
  "43": "Tarragona",
  "44": "Teruel",
  "45": "Toledo",
  "46": "Valencia",
  "47": "Valladolid",
  "48": "Vizcaya",
  "49": "Zamora",
  "50": "Zaragoza",
  "51": "Ceuta",
  "52": "Melilla"
};

const PlaceModal = ({ isOpen, onClose, place, onSave }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [municipalities, setMunicipalities] = useState([]);

  // Cargar municipios al abrir, ordenados de la A a la Z
  useEffect(() => {
    if (isOpen) {
      axios.get('/api/municipalities?limit=9000')
        .then(res => {
          const sorted = (res.data || []).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
          setMunicipalities(sorted);
        })
        .catch(() => setMunicipalities([]));
    }
  }, [isOpen]);
  const [formData, setFormData] = useState({
    name: '',
    province: '',
    category: 'Cultura',
    description: '',
    address: '',
    image: '',
    verified: false,
    location: { latitude: 38.3452, longitude: -0.4815 },
    accessibility: {
      physical: true,
      visual: false,
      auditory: false,
      cognitive: false
    },
    technicalSpecs: {
      doorWidth: '',
      elevatorMeasures: '',
      adaptedToilet: false,
      magneticLoop: false,
      braille: false,
      accessibleParking: false,
      wheelchairRental: false
    },
    additionalServices: {
      audioguide: { enabled: false, price: '0', freeForDisabled: false },
      guidedVisits: { enabled: false, price: '0', freeForDisabled: false }
    },
    touristTip: '',
    tags: '',
    isLinkedEntrance: false,
    linkedEntranceName: '',
    extra_data: {
      website: '',
      phone: '',
      schedule: '',
      price: '',
      structuredSchedules: [],
      tariffs: [],
      criticalNotices: [],
      specialClosures: '',
      additionalInfo: ''
    }
  });

  // Rellenar provincia automáticamente cuando cambia la ciudad o cargan los municipios
  useEffect(() => {
    if (formData.city && municipalities.length > 0) {
      const match = municipalities.find(m => m.name.toLowerCase() === formData.city.toLowerCase());
      if (match) {
        const resolvedProvince = match.province || INE_PROVINCES[match.parent_code] || '';
        if (resolvedProvince && formData.province !== resolvedProvince) {
          setFormData(prev => ({
            ...prev,
            province: resolvedProvince
          }));
        }
      }
    }
  }, [formData.city, municipalities]);

  const DAYS = [
    { id: 1, label: 'Lunes', short: 'L' },
    { id: 2, label: 'Martes', short: 'M' },
    { id: 3, label: 'Miércoles', short: 'X' },
    { id: 4, label: 'Jueves', short: 'J' },
    { id: 5, label: 'Viernes', short: 'V' },
    { id: 6, label: 'Sábado', short: 'S' },
    { id: 0, label: 'Domingo', short: 'D' }
  ];

  const TARIFF_PRESETS = [
    'Entrada General', 'Entrada Reducida', 'Entrada Gratuita', 'Entrada Conjunta General', 'Entrada Conjunta Reducida', 'Abono General', 'Abono Anual', 'Abono Mensual', 'Abono Temporada', 'Abono Familiar', 'Visita en Grupo', 'Otros / Personalizado'
  ];

  useEffect(() => {
    if (place) {
      const ext = place.extra_data || {};
      setFormData({
        id: place.id,
        name: place.name || '',
        city: place.city || '',
        province: place.province || ext.province || '',
        category: place.category || 'Cultura',
        description: place.description || '',
        address: place.address || ext.address || '',
        image: place.image || '',
        verified: place.verified === 1 || place.verified === true,
        location: place.location ? {
          latitude: place.location.latitude || place.location.lat || 38.3452,
          longitude: place.location.longitude || place.location.lng || -0.4815
        } : { latitude: 38.3452, longitude: -0.4815 },
        accessibility: place.accessibility || ext.accessibility || {
          physical: true,
          visual: false,
          auditory: false,
          cognitive: false
        },
        technicalSpecs: place.technicalSpecs || ext.technicalSpecs || {
          doorWidth: ext.technicalSpecs?.doorWidth || '',
          elevatorMeasures: ext.technicalSpecs?.elevatorMeasures || '',
          adaptedToilet: ext.technicalSpecs?.adaptedToilet || false,
          magneticLoop: ext.technicalSpecs?.magneticLoop || false,
          braille: ext.technicalSpecs?.braille || false,
          accessibleParking: ext.technicalSpecs?.accessibleParking || false,
          wheelchairRental: ext.technicalSpecs?.wheelchairRental || false
        },
        additionalServices: place.additionalServices || ext.additionalServices || {
          audioguide: ext.additionalServices?.audioguide || { enabled: false, price: '0', freeForDisabled: false },
          guidedVisits: ext.additionalServices?.guidedVisits || { enabled: false, price: '0', freeForDisabled: false }
        },
        touristTip: place.touristTip || ext.touristTip || '',
        tags: place.tags || ext.tags || '',
        isLinkedEntrance: place.isLinkedEntrance !== undefined ? place.isLinkedEntrance : (ext.isLinkedEntrance || false),
        linkedEntranceName: place.linkedEntranceName || ext.linkedEntranceName || '',
        extra_data: ext.extra_data || {
          website: ext.website || '',
          phone: ext.phone || '',
          schedule: ext.schedule || '',
          price: ext.price || '',
          structuredSchedules: ext.structuredSchedules || [],
          tariffs: ext.tariffs || [],
          criticalNotices: ext.criticalNotices || [],
          specialClosures: ext.specialClosures || '',
          additionalInfo: ext.additionalInfo || ''
        }
      });
    } else {
      setFormData({
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        city: '',
        province: '',
        category: 'Cultura',
        description: '',
        image: '',
        verified: false,
        location: { latitude: 38.3452, longitude: -0.4815 },
        address: '',
        accessibility: {
          physical: true,
          visual: false,
          auditory: false,
          cognitive: false
        },
        technicalSpecs: {
          doorWidth: '',
          elevatorMeasures: '',
          adaptedToilet: false,
          magneticLoop: false,
          braille: false,
          accessibleParking: false,
          wheelchairRental: false
        },
        additionalServices: {
          audioguide: { enabled: false, price: '0', freeForDisabled: false },
          guidedVisits: { enabled: false, price: '0', freeForDisabled: false }
        },
        touristTip: '',
        tags: '',
        isLinkedEntrance: false,
        linkedEntranceName: '',
        extra_data: {
          website: '',
          phone: '',
          schedule: '',
          price: '',
          structuredSchedules: [],
          tariffs: [],
          criticalNotices: [],
          specialClosures: '',
          additionalInfo: ''
        }
      });
    }
  }, [place, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (place) {
        await axios.patch(`/api/places/${place.id}`, formData);
      } else {
        await axios.post('/api/places', formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving place:', error);
      alert('Error al guardar el monumento');
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
      setFormData({ ...formData, image: res.data.url });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error al subir la imagen');
    }
  };

  const handleAIGenerate = async () => {
    if (!formData.name || !formData.city) {
      alert('Por favor, introduce el nombre y la ciudad primero.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/ai/generate-place-data', {
        name: formData.name,
        city: formData.city
      }, { timeout: 60000 });
      const aiData = res.data;
      setFormData({
        ...formData,
        description: aiData.description || formData.description,
        accessibility: { ...formData.accessibility, ...aiData.accessibility },
        extra_data: { ...formData.extra_data, ...aiData.extra_data },
        location: aiData.location ? {
          latitude: aiData.location.latitude || aiData.location.lat || formData.location.latitude,
          longitude: aiData.location.longitude || aiData.location.lng || formData.location.longitude
        } : formData.location,
        address: aiData.address || formData.address
      });
      alert('¡Datos generados con éxito por la IA!');
    } catch (error) {
      console.error('AI error:', error);
      alert('Error al generar datos con IA');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: Info },
    { id: 'accessibility', label: 'Accesibilidad', icon: Accessibility },
    { id: 'details', label: 'Detalles', icon: Globe },
    { id: 'location', label: 'Mapa', icon: Navigation },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[3rem] shadow-2xl border border-slate-200/50 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] relative">
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Editor de Contenido</span>
            </div>
            <h2 className="text-3xl font-black dark:text-white tracking-tight">
              {place ? 'Modificar Registro' : 'Nuevo Registro'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleAIGenerate}
              disabled={loading}
              className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-100 transition-all disabled:opacity-50"
            >
              <Sparkles size={16} />
              Autocompletar con IA
            </button>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex gap-4 px-10 py-4 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-50 dark:border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all relative ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon size={14} strokeWidth={isActive ? 3 : 2} />
                {tab.label}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <form id="place-form" onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Nombre del Monumento</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      placeholder="Ej: Castillo de Santa Bárbara"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Dirección Exacta</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                      <input 
                        type="text" 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all"
                        placeholder="Ej: Calle Castillo, s/n, 03002 Alicante"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Ciudad / Municipio</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      <select
                        required
                        value={formData.city}
                        onChange={(e) => {
                          const selected = municipalities.find(m => m.name === e.target.value);
                          const resolvedProv = selected?.province || (selected?.parent_code ? INE_PROVINCES[selected.parent_code] : '') || formData.province;
                          setFormData({
                            ...formData,
                            city: e.target.value,
                            province: resolvedProv
                          });
                        }}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white appearance-none cursor-pointer"
                      >
                        <option value="">— Seleccionar municipio —</option>
                        {municipalities.map(m => (
                          <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Provincia <span className="text-indigo-400 font-medium normal-case tracking-normal">(se rellena automáticamente)</span></label>
                    <input 
                      type="text" 
                      readOnly
                      value={formData.province}
                      onChange={(e) => setFormData({...formData, province: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl outline-none dark:text-white text-slate-500 cursor-default"
                      placeholder="Se autorrellena al elegir el municipio"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Categoría</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    >
                      <option>Cultura</option>
                      <option>Parque</option>
                      <option>Playa</option>
                      <option>Museo</option>
                      <option>Deporte</option>
                      <option>Otros</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Imagen de Portada</label>
                  <div className="relative aspect-video rounded-3xl bg-slate-50 dark:bg-slate-800 overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 group">
                    {formData.image ? (
                      <>
                        <img src={formData.image} className="w-full h-full object-cover" />
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
                  <div className="flex items-center gap-3 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl">
                    <CheckCircle2 className={formData.verified ? "text-emerald-500" : "text-slate-300"} size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-bold dark:text-white">Estado Verificado</p>
                      <p className="text-[10px] text-slate-500">¿Esta información ha sido revisada por un oficial?</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, verified: !formData.verified})}
                      className={`w-12 h-6 rounded-full relative transition-colors ${formData.verified ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.verified ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Descripción</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none"
                    placeholder="Describe el monumento y su importancia histórica..."
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Tip Turístico (IA)</label>
                  <div className="relative">
                    <Sparkles className="absolute left-4 top-3 text-indigo-500" size={16} />
                    <textarea 
                      value={formData.touristTip}
                      onChange={(e) => setFormData({...formData, touristTip: e.target.value})}
                      rows="2"
                      className="w-full pl-12 pr-4 py-3 bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-500/20 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none text-xs italic"
                      placeholder="Ej: La mejor luz para fotos es al atardecer..."
                    ></textarea>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Etiquetas (Separadas por comas)</label>
                  <input 
                    type="text" 
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    placeholder="Ej: Castillo, Vistas, Gratis, Familiar"
                  />
                </div>
              </div>
            )}

            {activeTab === 'accessibility' && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.keys(formData.accessibility).map((key) => (
                    <button 
                      key={key}
                      type="button"
                      onClick={() => setFormData({...formData, accessibility: {...formData.accessibility, [key]: !formData.accessibility[key]}})}
                      className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${formData.accessibility[key] ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}
                    >
                      <Accessibility size={24} />
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {key === 'physical' && 'Motriz'}
                        {key === 'visual' && 'Visual'}
                        {key === 'auditory' && 'Auditiva'}
                        {key === 'cognitive' && 'Cognitiva'}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Technical Specs & Advanced Accessibility */}
                <div className="md:col-span-2 mt-6">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-500" />
                    Especificaciones Técnicas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="text-xs font-bold dark:text-slate-300">Aseo Adaptado</span>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, technicalSpecs: {...formData.technicalSpecs, adaptedToilet: !formData.technicalSpecs.adaptedToilet}})}
                        className={`w-10 h-5 rounded-full relative transition-colors ${formData.technicalSpecs.adaptedToilet ? 'bg-indigo-500' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.technicalSpecs.adaptedToilet ? 'left-5.5' : 'left-0.5'}`}></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="text-xs font-bold dark:text-slate-300">Bucle Magnético</span>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, technicalSpecs: {...formData.technicalSpecs, magneticLoop: !formData.technicalSpecs.magneticLoop}})}
                          className={`w-10 h-5 rounded-full relative transition-colors ${formData.technicalSpecs.magneticLoop ? 'bg-indigo-500' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.technicalSpecs.magneticLoop ? 'left-5.5' : 'left-0.5'}`}></div>
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <span className="text-xs font-bold dark:text-slate-300">Parking Accesible</span>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, technicalSpecs: {...formData.technicalSpecs, accessibleParking: !formData.technicalSpecs.accessibleParking}})}
                          className={`w-10 h-5 rounded-full relative transition-colors ${formData.technicalSpecs.accessibleParking ? 'bg-indigo-500' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.technicalSpecs.accessibleParking ? 'left-5.5' : 'left-0.5'}`}></div>
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <span className="text-xs font-bold dark:text-slate-300">Préstamo Sillas de Ruedas</span>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, technicalSpecs: {...formData.technicalSpecs, wheelchairRental: !formData.technicalSpecs.wheelchairRental}})}
                          className={`w-10 h-5 rounded-full relative transition-colors ${formData.technicalSpecs.wheelchairRental ? 'bg-indigo-500' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.technicalSpecs.wheelchairRental ? 'left-5.5' : 'left-0.5'}`}></div>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <span className="text-xs font-bold dark:text-slate-300">Señalización Braille</span>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, technicalSpecs: {...formData.technicalSpecs, braille: !formData.technicalSpecs.braille}})}
                          className={`w-10 h-5 rounded-full relative transition-colors ${formData.technicalSpecs.braille ? 'bg-indigo-500' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.technicalSpecs.braille ? 'left-5.5' : 'left-0.5'}`}></div>
                        </button>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ancho de Puertas</label>
                        <input 
                          type="text"
                          value={formData.technicalSpecs.doorWidth}
                          onChange={(e) => setFormData({...formData, technicalSpecs: {...formData.technicalSpecs, doorWidth: e.target.value}})}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs outline-none dark:text-white"
                          placeholder="Ej: 90cm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Medidas Ascensor</label>
                        <input 
                          type="text"
                          value={formData.technicalSpecs.elevatorMeasures}
                          onChange={(e) => setFormData({...formData, technicalSpecs: {...formData.technicalSpecs, elevatorMeasures: e.target.value}})}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs outline-none dark:text-white"
                          placeholder="Ej: 120x140cm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      <Globe size={14} /> Sitio Web
                    </label>
                    <input 
                      type="url" 
                      value={formData.extra_data.website}
                      onChange={(e) => setFormData({...formData, extra_data: {...formData.extra_data, website: e.target.value}})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      placeholder="https://ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Teléfono
                    </label>
                    <input 
                      type="tel" 
                      value={formData.extra_data.phone}
                      onChange={(e) => setFormData({...formData, extra_data: {...formData.extra_data, phone: e.target.value}})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>

                {/* Structured Schedules */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      <Clock size={14} /> Horarios Estructurados
                    </label>
                    <button 
                      type="button"
                      onClick={() => {
                        const newSeason = {
                          id: Date.now().toString(),
                          name: formData.extra_data.structuredSchedules.length === 0 ? 'Horario General' : 'Nueva Temporada',
                          startDate: '',
                          endDate: '',
                          period: 'Todo el año',
                          days: DAYS.reduce((acc, day) => {
                            acc[day.id] = { isOpen: true, mOpen: '10:00', mClose: '14:00', aOpen: '16:00', aClose: '20:00' };
                            return acc;
                          }, {})
                        };
                        setFormData({
                          ...formData,
                          extra_data: {
                            ...formData.extra_data,
                            structuredSchedules: [...(formData.extra_data.structuredSchedules || []), newSeason]
                          }
                        });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all"
                    >
                      <Plus size={14} /> Añadir Temporada
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(formData.extra_data.structuredSchedules || []).map((season, sIdx) => (
                      <div key={season.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700 relative group">
                        <button 
                          type="button"
                          onClick={() => {
                            const newSchedules = [...formData.extra_data.structuredSchedules];
                            newSchedules.splice(sIdx, 1);
                            setFormData({...formData, extra_data: {...formData.extra_data, structuredSchedules: newSchedules}});
                          }}
                          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nombre de Temporada</label>
                            <input 
                              type="text"
                              value={season.name}
                              onChange={(e) => {
                                const newSchedules = [...formData.extra_data.structuredSchedules];
                                newSchedules[sIdx].name = e.target.value;
                                setFormData({...formData, extra_data: {...formData.extra_data, structuredSchedules: newSchedules}});
                              }}
                              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Desde (Fecha Inicio)</label>
                            <input 
                              type="date"
                              value={season.startDate || ''}
                              onChange={(e) => {
                                const newSchedules = [...formData.extra_data.structuredSchedules];
                                const updatedSeason = newSchedules[sIdx];
                                updatedSeason.startDate = e.target.value;
                                
                                // Auto-format human-friendly period
                                const startDM = updatedSeason.startDate ? updatedSeason.startDate.split('-').reverse().slice(0,2).join('/') : '';
                                const endDM = updatedSeason.endDate ? updatedSeason.endDate.split('-').reverse().slice(0,2).join('/') : '';
                                updatedSeason.period = startDM && endDM ? `${startDM} al ${endDM}` : 'Todo el año';
                                
                                setFormData({...formData, extra_data: {...formData.extra_data, structuredSchedules: newSchedules}});
                              }}
                              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Hasta (Fecha Fin)</label>
                            <input 
                              type="date"
                              value={season.endDate || ''}
                              onChange={(e) => {
                                const newSchedules = [...formData.extra_data.structuredSchedules];
                                const updatedSeason = newSchedules[sIdx];
                                updatedSeason.endDate = e.target.value;
                                
                                // Auto-format human-friendly period
                                const startDM = updatedSeason.startDate ? updatedSeason.startDate.split('-').reverse().slice(0,2).join('/') : '';
                                const endDM = updatedSeason.endDate ? updatedSeason.endDate.split('-').reverse().slice(0,2).join('/') : '';
                                updatedSeason.period = startDM && endDM ? `${startDM} al ${endDM}` : 'Todo el año';
                                
                                setFormData({...formData, extra_data: {...formData.extra_data, structuredSchedules: newSchedules}});
                              }}
                              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          {DAYS.map((day) => {
                            const dayData = season.days[day.id] || { isOpen: false, mOpen: '10:00', mClose: '14:00', aOpen: '', aClose: '' };
                            return (
                              <div key={day.id} className="flex items-center gap-4 py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                                <span className="w-8 text-xs font-black text-slate-400">{day.short}</span>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const newSchedules = [...formData.extra_data.structuredSchedules];
                                    newSchedules[sIdx].days[day.id].isOpen = !dayData.isOpen;
                                    setFormData({...formData, extra_data: {...formData.extra_data, structuredSchedules: newSchedules}});
                                  }}
                                  className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${dayData.isOpen ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
                                >
                                  {dayData.isOpen ? 'ABIERTO' : 'CERRADO'}
                                </button>
                                
                                {dayData.isOpen && (
                                  <div className="flex-1 flex items-center gap-2">
                                    <input 
                                      type="text" 
                                      value={dayData.mOpen}
                                      onChange={(e) => {
                                        const newSchedules = [...formData.extra_data.structuredSchedules];
                                        newSchedules[sIdx].days[day.id].mOpen = e.target.value;
                                        setFormData({...formData, extra_data: {...formData.extra_data, structuredSchedules: newSchedules}});
                                      }}
                                      className="w-16 px-2 py-1 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg text-[10px] dark:text-white"
                                    />
                                    <span className="text-slate-300">-</span>
                                    <input 
                                      type="text" 
                                      value={dayData.mClose}
                                      onChange={(e) => {
                                        const newSchedules = [...formData.extra_data.structuredSchedules];
                                        newSchedules[sIdx].days[day.id].mClose = e.target.value;
                                        setFormData({...formData, extra_data: {...formData.extra_data, structuredSchedules: newSchedules}});
                                      }}
                                      className="w-16 px-2 py-1 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg text-[10px] dark:text-white"
                                    />
                                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-2" />
                                    <input 
                                      type="text" 
                                      value={dayData.aOpen}
                                      placeholder="P.M."
                                      onChange={(e) => {
                                        const newSchedules = [...formData.extra_data.structuredSchedules];
                                        newSchedules[sIdx].days[day.id].aOpen = e.target.value;
                                        setFormData({...formData, extra_data: {...formData.extra_data, structuredSchedules: newSchedules}});
                                      }}
                                      className="w-16 px-2 py-1 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg text-[10px] dark:text-white"
                                    />
                                    <span className="text-slate-300">-</span>
                                    <input 
                                      type="text" 
                                      value={dayData.aClose}
                                      placeholder="P.M."
                                      onChange={(e) => {
                                        const newSchedules = [...formData.extra_data.structuredSchedules];
                                        newSchedules[sIdx].days[day.id].aClose = e.target.value;
                                        setFormData({...formData, extra_data: {...formData.extra_data, structuredSchedules: newSchedules}});
                                      }}
                                      className="w-16 px-2 py-1 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg text-[10px] dark:text-white"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Structured Tariffs */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      <Euro size={14} /> Tarifas y Entradas
                    </label>
                    <button 
                      type="button"
                      onClick={() => {
                        const newTariff = {
                          id: Date.now().toString(),
                          label: 'Entrada General',
                          price: '15 €',
                          subtypes: [{ id: `sub-${Date.now()}`, type: 'none', value: '', from: '', to: '' }]
                        };
                        setFormData({
                          ...formData,
                          extra_data: {
                            ...formData.extra_data,
                            tariffs: [...(formData.extra_data.tariffs || []), newTariff]
                          }
                        });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all"
                    >
                      <Plus size={14} /> Añadir Tarifa
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(formData.extra_data.tariffs || []).map((tariff, tIdx) => (
                      <div key={tariff.id} className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] shadow-sm relative group">
                        <button 
                          type="button"
                          onClick={() => {
                            const newTariffs = [...formData.extra_data.tariffs];
                            newTariffs.splice(tIdx, 1);
                            setFormData({...formData, extra_data: {...formData.extra_data, tariffs: newTariffs}});
                          }}
                          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>

                        <div className="flex items-center gap-4 mb-4">
                          <select 
                            value={tariff.label}
                            onChange={(e) => {
                              const newTariffs = [...formData.extra_data.tariffs];
                              newTariffs[tIdx].label = e.target.value;
                              setFormData({...formData, extra_data: {...formData.extra_data, tariffs: newTariffs}});
                            }}
                            className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                          >
                            {TARIFF_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                          <input 
                            type="text"
                            value={tariff.price}
                            placeholder="0 €"
                            onChange={(e) => {
                              const newTariffs = [...formData.extra_data.tariffs];
                              newTariffs[tIdx].price = e.target.value;
                              setFormData({...formData, extra_data: {...formData.extra_data, tariffs: newTariffs}});
                            }}
                            className="w-24 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border-none rounded-xl text-sm font-black text-indigo-600 dark:text-indigo-400 text-center outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        {/* Subtypes / Conditions */}
                        <div className="space-y-3 mt-4 ml-4 border-l-2 border-indigo-50 dark:border-indigo-900/30 pl-4">
                          {(tariff.subtypes || []).map((subtype, sIdx) => (
                            <div key={subtype.id || sIdx} className="flex items-center gap-3">
                              <select 
                                value={subtype.type}
                                onChange={(e) => {
                                  const newTariffs = [...formData.extra_data.tariffs];
                                  newTariffs[tIdx].subtypes[sIdx].type = e.target.value;
                                  setFormData({...formData, extra_data: {...formData.extra_data, tariffs: newTariffs}});
                                }}
                                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                              >
                                <option value="none">Sin condiciones</option>
                                <option value="disability">Discapacidad (%)</option>
                                <option value="age_range">Rango de Edad</option>
                                <option value="senior">Mayores de (X)</option>
                                <option value="child">Menores de (X)</option>
                                <option value="student">Estudiantes</option>
                                <option value="unemployed">Desempleados</option>
                              </select>
                              
                              {(subtype.type === 'disability' || subtype.type === 'senior' || subtype.type === 'child') && (
                                <input 
                                  type="text"
                                  value={subtype.value}
                                  placeholder="Val."
                                  onChange={(e) => {
                                    const newTariffs = [...formData.extra_data.tariffs];
                                    newTariffs[tIdx].subtypes[sIdx].value = e.target.value;
                                    setFormData({...formData, extra_data: {...formData.extra_data, tariffs: newTariffs}});
                                  }}
                                  className="w-16 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg text-xs dark:text-white"
                                />
                              )}

                              {(subtype.type === 'age_range') && (
                                <div className="flex items-center gap-1">
                                  <input 
                                    type="text"
                                    value={subtype.from}
                                    placeholder="De"
                                    onChange={(e) => {
                                      const newTariffs = [...formData.extra_data.tariffs];
                                      newTariffs[tIdx].subtypes[sIdx].from = e.target.value;
                                      setFormData({...formData, extra_data: {...formData.extra_data, tariffs: newTariffs}});
                                    }}
                                    className="w-12 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg text-xs dark:text-white"
                                  />
                                  <span className="text-slate-400">-</span>
                                  <input 
                                    type="text"
                                    value={subtype.to}
                                    placeholder="A"
                                    onChange={(e) => {
                                      const newTariffs = [...formData.extra_data.tariffs];
                                      newTariffs[tIdx].subtypes[sIdx].to = e.target.value;
                                      setFormData({...formData, extra_data: {...formData.extra_data, tariffs: newTariffs}});
                                    }}
                                    className="w-12 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg text-xs dark:text-white"
                                  />
                                </div>
                              )}

                              <button 
                                type="button"
                                onClick={() => {
                                  const newTariffs = [...formData.extra_data.tariffs];
                                  newTariffs[tIdx].subtypes.splice(sIdx, 1);
                                  setFormData({...formData, extra_data: {...formData.extra_data, tariffs: newTariffs}});
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                              >
                                <MinusCircle size={14} />
                              </button>
                            </div>
                          ))}
                          
                          <button 
                            type="button"
                            onClick={() => {
                              const newTariffs = [...formData.extra_data.tariffs];
                              newTariffs[tIdx].subtypes = [...(newTariffs[tIdx].subtypes || []), { id: Date.now().toString(), type: 'none', value: '', from: '', to: '' }];
                              setFormData({...formData, extra_data: {...formData.extra_data, tariffs: newTariffs}});
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
                          >
                            <PlusCircle size={12} /> Añadir Condición
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Critical Notices */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Avisos Críticos (Obras, Cierres temporales)</label>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, extra_data: {...formData.extra_data, criticalNotices: [...(formData.extra_data.criticalNotices || []), { id: Date.now().toString(), text: '', type: 'warning' }]}})}
                      className="text-[10px] font-bold text-indigo-600 hover:underline"
                    >
                      + Añadir Aviso
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(formData.extra_data.criticalNotices || []).map((notice, nIdx) => (
                      <div key={notice.id} className="flex gap-2 items-center">
                        <div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm" />
                        <input 
                          type="text"
                          value={notice.text}
                          onChange={(e) => {
                            const newNotices = [...formData.extra_data.criticalNotices];
                            newNotices[nIdx].text = e.target.value;
                            setFormData({...formData, extra_data: {...formData.extra_data, criticalNotices: newNotices}});
                          }}
                          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs outline-none dark:text-white"
                          placeholder="Ej: Ascensor fuera de servicio hasta el 20/05..."
                        />
                        <button 
                          onClick={() => {
                            const newNotices = formData.extra_data.criticalNotices.filter((_, i) => i !== nIdx);
                            setFormData({...formData, extra_data: {...formData.extra_data, criticalNotices: newNotices}});
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Services */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Servicios Adicionales</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Audioguide */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold dark:text-white">Audioguía</span>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, additionalServices: {...formData.additionalServices, audioguide: {...formData.additionalServices.audioguide, enabled: !formData.additionalServices.audioguide.enabled}}})}
                          className={`w-10 h-5 rounded-full relative transition-colors ${formData.additionalServices.audioguide.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.additionalServices.audioguide.enabled ? 'left-5.5' : 'left-0.5'}`}></div>
                        </button>
                      </div>
                      {formData.additionalServices.audioguide.enabled && (
                        <div className="space-y-2">
                           <input 
                             type="text" 
                             value={formData.additionalServices.audioguide.price}
                             onChange={(e) => setFormData({...formData, additionalServices: {...formData.additionalServices, audioguide: {...formData.additionalServices.audioguide, price: e.target.value}}})}
                             className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border-none rounded-lg text-[10px] outline-none"
                             placeholder="Precio (Ej: 3€)"
                           />
                           <label className="flex items-center gap-2 cursor-pointer">
                             <input 
                               type="checkbox"
                               checked={formData.additionalServices.audioguide.freeForDisabled}
                               onChange={(e) => setFormData({...formData, additionalServices: {...formData.additionalServices, audioguide: {...formData.additionalServices.audioguide, freeForDisabled: e.target.checked}}})}
                             />
                             <span className="text-[10px] font-bold text-slate-500">Gratis PCD</span>
                           </label>
                        </div>
                      )}
                    </div>
                    {/* Guided Visits */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold dark:text-white">Visitas Guiadas</span>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, additionalServices: {...formData.additionalServices, guidedVisits: {...formData.additionalServices.guidedVisits, enabled: !formData.additionalServices.guidedVisits.enabled}}})}
                          className={`w-10 h-5 rounded-full relative transition-colors ${formData.additionalServices.guidedVisits.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.additionalServices.guidedVisits.enabled ? 'left-5.5' : 'left-0.5'}`}></div>
                        </button>
                      </div>
                      {formData.additionalServices.guidedVisits.enabled && (
                        <div className="space-y-2">
                           <input 
                             type="text" 
                             value={formData.additionalServices.guidedVisits.price}
                             onChange={(e) => setFormData({...formData, additionalServices: {...formData.additionalServices, guidedVisits: {...formData.additionalServices.guidedVisits, price: e.target.value}}})}
                             className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border-none rounded-lg text-[10px] outline-none"
                             placeholder="Precio (Ej: 5€)"
                           />
                           <label className="flex items-center gap-2 cursor-pointer">
                             <input 
                               type="checkbox"
                               checked={formData.additionalServices.guidedVisits.freeForDisabled}
                               onChange={(e) => setFormData({...formData, additionalServices: {...formData.additionalServices, guidedVisits: {...formData.additionalServices.guidedVisits, freeForDisabled: e.target.checked}}})}
                             />
                             <span className="text-[10px] font-bold text-slate-500">Gratis PCD</span>
                           </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Información Adicional (Curiosidades, Notas)</label>
                  <textarea 
                    value={formData.extra_data.additionalInfo || formData.extra_data.schedule}
                    onChange={(e) => setFormData({...formData, extra_data: {...formData.extra_data, additionalInfo: e.target.value}})}
                    rows="2"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none text-sm"
                    placeholder="Ej: El castillo tiene un túnel secreto..."
                  ></textarea>
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Latitud</label>
                    <input 
                      type="number" 
                      step="any"
                      value={formData.location.latitude}
                      onChange={(e) => setFormData({...formData, location: {...formData.location, latitude: parseFloat(e.target.value)}})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Longitud</label>
                    <input 
                      type="number" 
                      step="any"
                      value={formData.location.longitude}
                      onChange={(e) => setFormData({...formData, location: {...formData.location, longitude: parseFloat(e.target.value)}})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    />
                  </div>
                </div>
                <div className="aspect-video rounded-[2rem] bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight="0" 
                    marginWidth="0" 
                    src={`https://maps.google.com/maps?q=${formData.location.latitude},${formData.location.longitude}&z=16&output=embed&t=m`}
                    className="grayscale-[0.5] contrast-[1.2] invert-0 dark:invert-[0.9] dark:hue-rotate-180"
                  ></iframe>
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
            form="place-form"
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (place ? 'Guardar Cambios' : 'Crear Monumento')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceModal;
