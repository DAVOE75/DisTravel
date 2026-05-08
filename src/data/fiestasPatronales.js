export const FIESTAS_PATRONALES = {
  "alicante": { fiesta: "Hogueras de San Juan", fecha: "20-24 de Junio" },
  "madrid": { fiesta: "San Isidro Labrador", fecha: "15 de Mayo" },
  "barcelona": { fiesta: "La Mercè", fecha: "24 de Septiembre" },
  "valencia": { fiesta: "Las Fallas", fecha: "15-19 de Marzo" },
  "sevilla": { fiesta: "Feria de Abril", fecha: "Abril" },
  "malaga": { fiesta: "Feria de Agosto", fecha: "Agosto" },
  "bilbao": { fiesta: "Aste Nagusia", fecha: "Agosto" },
  "zaragoza": { fiesta: "Fiestas del Pilar", fecha: "12 de Octubre" }
};

export const getFiestaPatronal = (cityName) => {
  if (!cityName) return { fiesta: "Fiestas Locales", fecha: "Consultar" };
  const norm = cityName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return FIESTAS_PATRONALES[norm] || { fiesta: "Fiestas Locales", fecha: "Consultar" };
};
