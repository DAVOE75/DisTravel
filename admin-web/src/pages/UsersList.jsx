import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Users, 
  Award, 
  TrendingUp,
  ShieldCheck,
  Ban,
  Mail,
  History
} from 'lucide-react';
import { motion } from 'framer-motion';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Nota: Necesitaríamos un endpoint real para listar usuarios
      // Por ahora simulamos o usamos el de sync si existiera uno de listado
      // En server.js solo hay /api/users/:id
      // Añadiremos un endpoint de listado en el servidor luego.
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback con datos de ejemplo si falla
      setUsers([
        { id: '1', name: 'Juan Perez', email: 'juan@example.com', level: 5, xp: 1250, medals: 12 },
        { id: '2', name: 'Maria Garcia', email: 'maria@example.com', level: 8, xp: 2400, medals: 24 },
        { id: '3', name: 'Carlos Ruiz', email: 'carlos@distravel.app', level: 3, xp: 450, medals: 5 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs">
            {users.length} Usuarios Totales
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
           [1, 2, 3, 4].map(i => (
             <div key={i} className="h-40 bg-white dark:bg-slate-900 rounded-3xl animate-pulse border border-slate-100 dark:border-slate-800"></div>
           ))
        ) : filteredUsers.map((user) => (
          <motion.div 
            layout
            key={user.id}
            className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-start gap-6"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {user.name?.substring(0, 2).toUpperCase() || '??'}
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white leading-none">{user.name}</h3>
                  <div className="flex items-center gap-2 mt-2 text-slate-400">
                    <Mail size={14} />
                    <span className="text-xs font-medium">{user.email}</span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Activo
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nivel</span>
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-amber-500" />
                    <span className="text-sm font-bold dark:text-slate-200">{user.level}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">XP Total</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-indigo-500" />
                    <span className="text-sm font-bold dark:text-slate-200">{user.xp}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Medallas</span>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-violet-500" />
                    <span className="text-sm font-bold dark:text-slate-200">{user.medals?.length || user.medals || 0}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <button className="flex-1 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                  <History size={14} />
                  Actividad
                </button>
                <button className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors">
                  <Ban size={20} />
                </button>
                <button className="p-2.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors">
                  <ShieldCheck size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UsersList;
