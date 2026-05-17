// Configuración de la API para Distravel Admin
// Se ajusta automáticamente si estamos bajo el dominio de Hesiox o en local
const isHesiox = window.location.pathname.includes('/distravel/');
export const API_BASE = isHesiox ? '/distravel' : '';
export const ROUTER_BASE = isHesiox ? '/distravel/admin' : '/';

export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (isHesiox && url.startsWith('/uploads/')) {
    return `/distravel${url}`;
  }
  return url;
};



