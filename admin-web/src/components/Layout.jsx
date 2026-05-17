import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Building2, 
  Users, 
  Settings, 
  Sun, 
  Moon,
  LogOut,
  Bell
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
      active 
        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none' 
        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
    }`}
  >
    <Icon size={18} className={`${active ? 'text-white' : 'group-hover:text-indigo-600 transition-colors'}`} />
    <span className="font-bold text-sm tracking-tight">{label}</span>
  </Link>
);

const Layout = ({ isDarkMode, setIsDarkMode }) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#020617] transition-colors duration-500">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-8 fixed h-full z-20">
        <div className="flex items-center gap-3 px-2">
          <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 dark:shadow-none">
            <MapPin className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight dark:text-white">DisTravel</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase">Control Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          <SidebarLink to="/places" icon={Building2} label="Monumentos" active={location.pathname === '/places'} />
          <SidebarLink to="/cities" icon={MapPin} label="Municipios" active={location.pathname === '/cities'} />
          <SidebarLink to="/users" icon={Users} label="Comunidad" active={location.pathname === '/users'} />
        </nav>

        <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-6">
          <SidebarLink to="/settings" icon={Settings} label="Configuración" active={location.pathname === '/settings'} />
          <button className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all duration-300 mt-2 group">
            <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="font-bold text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        {/* Topbar */}
        <header className="h-20 glass border-b border-slate-200/50 dark:border-slate-800/50 px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
             <h2 className="text-lg font-black dark:text-white tracking-tight">
              {location.pathname === '/' ? 'Vista General' : 
               location.pathname === '/places' ? 'Gestión de Monumentos' : 
               location.pathname === '/cities' ? 'Base de Municipios' : 'Administración'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Sábado, 16 de Mayo • v2.4.0
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-slate-800">
               <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:shadow-lg relative transition-all group">
                <Bell size={18} className="group-hover:rotate-12" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-slate-800"></span>
              </button>
            </div>
            
            <div className="flex items-center gap-4 pl-2 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black dark:text-white group-hover:text-indigo-600 transition-colors">Admin Distravel</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Administrador</p>
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-800 dark:text-white font-black overflow-hidden group-hover:shadow-indigo-100 dark:group-hover:shadow-none transition-all">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
