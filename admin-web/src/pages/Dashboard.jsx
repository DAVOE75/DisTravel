import React from 'react';
import { 
  Building2, 
  Users, 
  MapPin, 
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE } from '../config';

const StatCard = ({ icon: Icon, label, value, trend, color, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-slate-900 p-7 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group overflow-hidden relative"
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${color} opacity-[0.03] group-hover:scale-150 transition-transform duration-700`}></div>
    
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={`p-3.5 rounded-2xl ${color} bg-opacity-10 text-white`}>
        <Icon className={color.replace('bg-', 'text-')} size={22} />
      </div>
      <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black tracking-wider uppercase">
        <ArrowUpRight size={12} strokeWidth={3} />
        {trend}
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-[0.1em]">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <h3 className="text-3xl font-black tracking-tight dark:text-white">{value}</h3>
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = React.useState({
    totalPlaces: 0,
    totalMunicipalities: 0,
    totalUsers: 0,
    recentActivity: [],
    serverOnline: false
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await fetch(`${API_BASE}/api/stats`);
        const healthRes = await fetch(`${API_BASE}/api/health`).catch(() => ({ ok: false }));
        
        let statsData = { totalPlaces: 0, totalMunicipalities: 0, totalUsers: 0, recentActivity: [] };
        if (statsRes.ok) {
          const text = await statsRes.text();
          try {
            statsData = JSON.parse(text);
          } catch (e) {
            console.error('Stats response was not JSON:', text.substring(0, 100));
          }
        }

        let healthData = { status: 'offline' };
        if (healthRes.ok) {
          const text = await healthRes.text();
          try {
            healthData = JSON.parse(text);
          } catch (e) {
            console.error('Health response was not JSON:', text.substring(0, 100));
          }
        }
        
        setStats({
          ...statsData,
          serverOnline: healthData.status === 'online'
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-10">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black dark:text-white tracking-tight">Bienvenido al Centro de Control 👋</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Monitorizando el ecosistema DisTravel en tiempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            Descargar Logs
          </button>
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2">
            <Sparkles size={16} />
            Optimizar con IA
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Building2} 
          label="Total Monumentos" 
          value={loading ? "..." : stats.totalPlaces} 
          trend="+12.5%" 
          color="bg-indigo-500" 
          delay={0.1}
        />
        <StatCard 
          icon={Users} 
          label="Comunidad Activa" 
          value={loading ? "..." : stats.totalUsers} 
          trend="+4.8%" 
          color="bg-violet-500" 
          delay={0.2}
        />
        <StatCard 
          icon={MapPin} 
          label="Municipios Base" 
          value={loading ? "..." : stats.totalMunicipalities} 
          trend="+2 Nuevos" 
          color="bg-emerald-500" 
          delay={0.3}
        />
        <StatCard 
          icon={TrendingUp} 
          label="Tasa de Visitas" 
          value="84.2%" 
          trend="+18%" 
          color="bg-rose-500" 
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800 p-10 relative overflow-hidden">
          <div className="flex justify-between items-center mb-10 relative z-10">
            <div>
              <h3 className="text-xl font-black dark:text-white tracking-tight">Actividad de la Red</h3>
              <p className="text-xs text-slate-400 mt-1">Últimas actualizaciones de contenido</p>
            </div>
            <button className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">
              Auditar Todo
            </button>
          </div>
          
          <div className="flex flex-col gap-8 relative z-10">
            {stats.recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-40">
                <Clock size={48} className="mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">Esperando actividad...</p>
              </div>
            ) : stats.recentActivity.map((activity, idx) => (
              <div key={activity.id} className="flex items-start gap-5 group cursor-pointer">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <Clock size={22} />
                  </div>
                  {idx !== stats.recentActivity.length - 1 && (
                    <div className="absolute top-14 left-1/2 -translate-x-1/2 w-[2px] h-8 bg-slate-100 dark:bg-slate-800"></div>
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors tracking-tight text-base">{activity.title}</h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {new Date(activity.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">
                    {activity.subtitle} • {new Date(activity.timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {activity.verified && (
                      <span className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-100/50 dark:border-emerald-500/10">
                        Publicación Verificada
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest border border-slate-100/50 dark:border-slate-800">
                      ID: {String(activity.id).substring(0, 8)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Status */}
        <div className="flex flex-col gap-8">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
            <Sparkles className="mb-6 text-indigo-200 animate-pulse-soft" size={40} />
            <h3 className="text-2xl font-black mb-3 tracking-tight">Análisis Inteligente</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-8 font-medium">
              Tu base de datos ha crecido un <span className="text-white font-black">22%</span> este mes. Recomendamos revisar las descripciones de los nuevos monumentos.
            </p>
            <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl">
              Ver Recomendaciones
            </button>
          </div>

          {/* Expo Go QR */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black dark:text-white">Abrir en Dispositivo</h3>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Expo Go • Escanea con tu móvil</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=exp://tjd3pqi-hesiox-8081.exp.direct" 
                  alt="Expo Go QR" 
                  className="w-36 h-36"
                />
              </div>
              <div className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-2 overflow-hidden">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                <code className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">exp://tjd3pqi-hesiox-8081.exp.direct</code>
              </div>
            </div>
          </div>


          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[11px] font-black dark:text-white tracking-tight uppercase tracking-widest text-slate-400">Estado del Sistema</h3>
              <div className={`w-2.5 h-2.5 rounded-full ${stats.serverOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base de Datos</p>
                   <p className="text-sm font-black dark:text-white mt-0.5">PostgreSQL Local</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase rounded-lg">Estable</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Endpoint</p>
                   <p className="text-sm font-black dark:text-white mt-0.5">Distravel Core</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase rounded-lg">Online</span>
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  <span>Carga del Servidor</span>
                  <span>14%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-[14%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
