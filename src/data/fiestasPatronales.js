/**
 * Base de datos de Fiestas Patronales de municipios españoles.
 * Se centra en los municipios más poblados y destinos turísticos clave.
 */

export const FIESTAS_PATRONALES = {
  // ALICANTE (Provincia de origen)
  'alicante': { fiesta: 'Hogueras de San Juan', fecha: '20-24 de Junio' },
  'elche': { fiesta: 'Misteri d\'Elx / Virgen de la Asunción', fecha: '11-15 de Agosto' },
  'torrevieja': { fiesta: 'Inmaculada Concepción', fecha: '8 de Diciembre' },
  'orihuela': { fiesta: 'Virgen de Monserrate', fecha: '8 de Septiembre' },
  'benidorm': { fiesta: 'Virgen del Sufragio y San Jaime', fecha: '2º fin de semana de Noviembre' },
  'alcoy': { fiesta: 'Moros y Cristianos (San Jorge)', fecha: '22-24 de Abril' },
  'elda': { fiesta: 'Virgen de la Salud y Cristo del Buen Suceso', fecha: '8-9 de Septiembre' },
  'san vicente del raspeig': { fiesta: 'Virgen del Carmen', fecha: 'Abril (Moros y Cristianos)' },
  'denia': { fiesta: 'Santíssima Sang', fecha: '2ª semana de Julio' },
  'villajoyosa': { fiesta: 'Moros y Cristianos (Santa Marta)', fecha: '24-31 de Julio' },
  'santa pola': { fiesta: 'Virgen de Loreto', fecha: '1-8 de Septiembre' },
  'crevillente': { fiesta: 'Moros y Cristianos (San Francisco)', fecha: 'Octubre' },
  'campello': { fiesta: 'Virgen del Remedio', fecha: '11-15 de Octubre' },
  'novelda': { fiesta: 'Santa María Magdalena', fecha: '19-25 de Julio' },
  'mutxamel': { fiesta: 'Virgen de Loreto', fecha: '7-12 de Septiembre' },
  'san juan de alicante': { fiesta: 'Santísimo Cristo de la Paz', fecha: '12-16 de Septiembre' },
  'ibi': { fiesta: 'Moros y Cristianos', fecha: 'Septiembre' },
  'villena': { fiesta: 'Ntra. Sra. de las Virtudes', fecha: '4-9 de Septiembre' },
  'calp': { fiesta: 'Virgen de las Nieves', fecha: 'Agosto' },
  'altea': { fiesta: 'Cristo del Sagrario', fecha: 'Septiembre' },
  'pilar de la horadada': { fiesta: 'Virgen del Pilar', fecha: '12 de Octubre' },

  // MADRID
  'madrid': { fiesta: 'San Isidro Labrador', fecha: '15 de Mayo' },
  'mostoles': { fiesta: 'Ntra. Sra. de los Santos', fecha: '12 de Septiembre' },
  'alcala de henares': { fiesta: 'Santos Niños Justo y Pastor', fecha: '6 de Agosto' },
  'fuenlabrada': { fiesta: 'Cristo de la Misericordia', fecha: '14 de Septiembre' },
  'leganes': { fiesta: 'Ntra. Sra. de Butarque', fecha: '14-16 de Agosto' },
  'getafe': { fiesta: 'Ntra. Sra. de los Ángeles', fecha: 'Mayo (Pentecostés)' },
  'alcorcon': { fiesta: 'Virgen de los Remedios', fecha: '8 de Septiembre' },
  'parla': { fiesta: 'Ntra. Sra. de la Soledad', fecha: '2º domingo de Septiembre' },
  'torrejon de ardoz': { fiesta: 'Virgen del Rosario', fecha: 'Octubre' },
  'alcobendas': { fiesta: 'Virgen de la Paz', fecha: '24 de Enero' },
  'las rozas de madrid': { fiesta: 'San Miguel Arcángel', fecha: '29 de Septiembre' },
  'san sebastian de los reyes': { fiesta: 'Santísimo Cristo de los Remedios', fecha: '28 de Agosto' },
  'pozuelo de alarcon': { fiesta: 'Virgen de la Consolación', fecha: 'Septiembre' },
  'coslada': { fiesta: 'Virgen del Amor Hermoso', fecha: 'Junio' },
  'valdemoro': { fiesta: 'Virgen del Rosario', fecha: 'Septiembre' },
  'majadahonda': { fiesta: 'Santísimo Cristo de los Remedios', fecha: 'Septiembre' },
  'rivas-vaciamadrid': { fiesta: 'San Isidro', fecha: '15 de Mayo' },

  // BARCELONA
  'barcelona': { fiesta: 'La Mercè', fecha: '24 de Septiembre' },
  'l\'hospitalet de llobregat': { fiesta: 'Festes de Primavera', fecha: 'Abril' },
  'badalona': { fiesta: 'Sant Anastasi (Festes de Maig)', fecha: '11 de Mayo' },
  'terrassa': { fiesta: 'Festa Major de Terrassa', fecha: '1er domingo de Julio' },
  'sabadell': { fiesta: 'Festa Major de Sabadell', fecha: '1er lunes de Septiembre' },
  'mataro': { fiesta: 'Les Santes', fecha: '27 de Julio' },
  'santa coloma de gramenet': { fiesta: 'Festa Major d\'Estiu', fecha: 'Septiembre' },
  'cornella de llobregat': { fiesta: 'Corpus Christi', fecha: 'Junio' },
  'sant boi de llobregat': { fiesta: 'Sant Baldiri', fecha: '20 de Mayo' },
  'sant cugat del valles': { fiesta: 'Sant Pere', fecha: '29 de Junio' },
  'manresa': { fiesta: 'La Llum', fecha: '21 de Febrero' },
  'granollers': { fiesta: 'Festa Major de Blancs i Blaus', fecha: 'Agosto' },

  // VALENCIA
  'valencia': { fiesta: 'San Vicente Mártir / Fallas', fecha: '22 de Ene / 19 de Mar' },
  'torrent': { fiesta: 'Santos Abdón y Senén', fecha: '30 de Julio' },
  'gandia': { fiesta: 'San Francisco de Borja', fecha: '3 de Octubre' },
  'sagunto': { fiesta: 'Santos Abdón y Senén', fecha: '30 de Julio' },
  'paterna': { fiesta: 'Cristo de la Fe', fecha: 'Agosto' },
  'alzira': { fiesta: 'San Bernardo, María y Gracia', fecha: '23 de Julio' },
  'mislata': { fiesta: 'Virgen del Carmen', fecha: 'Agosto' },
  'burjassot': { fiesta: 'San Roque', fecha: '16 de Agosto' },
  'ontinyent': { fiesta: 'Moros y Cristianos', fecha: 'Agosto' },
  'xirivella': { fiesta: 'Virgen de la Salud', fecha: 'Septiembre' },

  // SEVILLA
  'sevilla': { fiesta: 'San Fernando / Feria de Abril', fecha: '30 de May / Abril' },
  'dos hermanas': { fiesta: 'Santa Ana', fecha: '26 de Julio' },
  'alcala de guadaira': { fiesta: 'Virgen del Águila', fecha: '15 de Agosto' },
  'utrera': { fiesta: 'Virgen de Consolación', fecha: '8 de Septiembre' },
  'mairena del aljarafe': { fiesta: 'San Ildefonso', fecha: 'Enero' },
  'ecija': { fiesta: 'Virgen del Valle', fecha: '8 de Septiembre' },
  'la rinconada': { fiesta: 'Virgen de los Dolores', fecha: 'Septiembre' },
  'los palacios y villafranca': { fiesta: 'Virgen de las Nieves', fecha: '5 de Agosto' },

  // MÁLAGA
  'malaga': { fiesta: 'Feria de Agosto / Virgen de la Victoria', fecha: 'Agosto / 8 de Sep' },
  'marbella': { fiesta: 'San Bernabé', fecha: '11 de Junio' },
  'velez-malaga': { fiesta: 'Real Feria de San Miguel', fecha: 'Septiembre' },
  'mijas': { fiesta: 'Virgen de la Peña', fecha: '8 de Septiembre' },
  'fuengirola': { fiesta: 'Virgen del Rosario', fecha: '7 de Octubre' },
  'estepona': { fiesta: 'San Isidro Labrador', fecha: '15 de Mayo' },
  'benalmadena': { fiesta: 'Virgen de la Cruz', fecha: 'Agosto' },
  'torremolinos': { fiesta: 'San Miguel Arcángel', fecha: '29 de Septiembre' },

  // ZARAGOZA
  'zaragoza': { fiesta: 'Virgen del Pilar', fecha: '12 de Octubre' },
  'calatayud': { fiesta: 'San Roque', fecha: '15-16 de Agosto' },
  'utebo': { fiesta: 'San Lamberto', fecha: 'Junio' },

  // MURCIA
  'murcia': { fiesta: 'Virgen de la Fuensanta', fecha: 'Septiembre' },
  'cartagena': { fiesta: 'Virgen de la Caridad', fecha: 'Viernes de Dolores' },
  'lorca': { fiesta: 'Virgen de las Huertas', fecha: '8 de Septiembre' },
  'molina de segura': { fiesta: 'Virgen de la Consolación', fecha: 'Septiembre' },
  'alcantarilla': { fiesta: 'Virgen de la Salud', fecha: 'Mayo' },

  // ISLAS BALEARES
  'palma': { fiesta: 'San Sebastián', fecha: '20 de Enero' },
  'eivissa': { fiesta: 'Ntra. Sra. de las Nieves', fecha: '5 de Agosto' },
  'maon-mahon': { fiesta: 'Mare de Déu de Gràcia', fecha: '7-9 de Septiembre' },

  // CANARIAS
  'las palmas de gran canaria': { fiesta: 'Virgen de la Luz', fecha: 'Octubre' },
  'santa cruz de tenerife': { fiesta: 'Fiestas de Mayo', fecha: '3 de Mayo' },
  'san cristobal de la laguna': { fiesta: 'Cristo de La Laguna', fecha: '14 de Septiembre' },
  'telde': { fiesta: 'San Juan Bautista', fecha: '24 de Junio' },
  'arona': { fiesta: 'Cristo de la Salud', fecha: 'Octubre' },

  // OTRAS CAPITALES
  'bilbao': { fiesta: 'Aste Nagusia (Semana Grande)', fecha: 'Agosto' },
  'vitoria-gasteiz': { fiesta: 'Virgen Blanca', fecha: '4-9 de Agosto' },
  'donostia-san sebastian': { fiesta: 'Semana Grande', fecha: 'Agosto' },
  'granada': { fiesta: 'Corpus Christi / Virgen de las Angustias', fecha: 'Junio / Septiembre' },
  'cordoba': { fiesta: 'Feria de Ntra. Sra. de la Salud', fecha: 'Mayo' },
  'valladolid': { fiesta: 'Virgen de San Lorenzo', fecha: '8 de Septiembre' },
  'vigo': { fiesta: 'Cristo de la Victoria', fecha: '1er domingo de Agosto' },
  'a coruña': { fiesta: 'Batalla de María Pita', fecha: 'Agosto' },
  'oviedo': { fiesta: 'San Mateo', fecha: '21 de Septiembre' },
  'gijon': { fiesta: 'Ntra. Sra. de Begoña', fecha: '15 de Agosto' },
  'pamplona/iruña': { fiesta: 'San Fermín', fecha: '7-14 de Julio' },
  'santander': { fiesta: 'Santiago Apóstol / Virgen del Mar', fecha: 'Julio / Mayo' },
  'logroño': { fiesta: 'San Mateo', fecha: '21 de Septiembre' },
  'badajoz': { fiesta: 'San Juan Bautista', fecha: '24 de Junio' },
  'salamanca': { fiesta: 'Virgen de la Vega', fecha: '8 de Septiembre' },
  'huelva': { fiesta: 'Virgen de la Cinta', fecha: '8 de Septiembre' },
  'cadiz': { fiesta: 'Virgen del Rosario', fecha: '7 de Octubre' },
  'almeria': { fiesta: 'Virgen del Mar', fecha: 'Agosto' },
  'castello de la plana': { fiesta: 'Magdalena', fecha: 'Marzo' },
  'burgos': { fiesta: 'San Pedro y San Pablo', fecha: '29 de Junio' },
  'albacete': { fiesta: 'Feria de Albacete', fecha: '7-17 de Septiembre' },
  'caceres': { fiesta: 'San Jorge', fecha: '23 de Abril' },
  'toledo': { fiesta: 'Virgen del Sagrario / Corpus', fecha: '15 de Ago / Junio' },
  'guadalajara': { fiesta: 'Virgen de la Antigua', fecha: '8 de Septiembre' },
  'cuenca': { fiesta: 'San Julián', fecha: 'Agosto' },
  'ciudad real': { fiesta: 'Virgen de Alarcos', fecha: 'Junio' },
  'leon': { fiesta: 'San Juan y San Pedro', fecha: '24-29 de Junio' },
  'zamora': { fiesta: 'San Pedro', fecha: '29 de Junio' },
  'soria': { fiesta: 'San Juan o de la Madre de Dios', fecha: 'Junio' },
  'segovia': { fiesta: 'San Juan y San Pedro', fecha: '24-29 de Junio' },
  'avila': { fiesta: 'Santa Teresa de Jesús', fecha: '15 de Octubre' },
  'palencia': { fiesta: 'San Antolín', fecha: '2 de Septiembre' },
  'pontevedra': { fiesta: 'Virgen de la Peregrina', fecha: 'Agosto' },
  'ourense': { fiesta: 'San Lázaro', fecha: 'Marzo' },
  'lugo': { fiesta: 'San Froilán', fecha: '4-12 de Octubre' },
  'santiago de compostela': { fiesta: 'Santiago Apóstol', fecha: '25 de Julio' },
  'teruel': { fiesta: 'La Vaquilla del Ángel', fecha: 'Julio' },
  'huesca': { fiesta: 'San Lorenzo', fecha: '10 de Agosto' },
  'jaen': { fiesta: 'Virgen de la Capilla / San Lucas', fecha: 'Junio / Octubre' },
  'ceuta': { fiesta: 'Virgen de África', fecha: '5 de Agosto' },
  'melilla': { fiesta: 'Virgen de la Victoria', fecha: '8 de Septiembre' },

  // PUEBLOS ESPECÍFICOS Y CORRECCIONES
  'villatuelda': { fiesta: 'San Mamés', fecha: '7 de Agosto' },
  'morella': { fiesta: 'Sexenni (Cada 6 años) / Mare de Déu de Vallivana', fecha: 'Agosto' },
  'peniscola': { fiesta: 'Virgen de la Ermitana', fecha: '7-9 de Septiembre' },
  'guadalest': { fiesta: 'Virgen de la Asunción', fecha: '14-17 de Agosto' },
  'altea': { fiesta: 'Cristo del Sagrario', fecha: 'Septiembre' },
  'chulilla': { fiesta: 'Virgen de los Ángeles', fecha: 'Septiembre' },
  'buñol': { fiesta: 'La Tomatina (San Luis Beltrán)', fecha: 'Último miércoles de Agosto' },
  'javea/xabia': { fiesta: 'Virgen de Loreto', fecha: 'Septiembre' },
  'calpe/calp': { fiesta: 'Virgen de las Nieves', fecha: 'Agosto' },
  'denia': { fiesta: 'Bous a la Mar', fecha: 'Julio' },
  'tabarca': { fiesta: 'Virgen del Carmen', fecha: '16 de Julio' },
};

/**
 * Normaliza un texto para búsqueda (minúsculas, sin tildes, sin caracteres especiales)
 */
const normalize = (text) => {
  if (!text) return '';
  return text.toString().trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/y/g, 'i');
};

/**
 * Obtiene la fiesta patronal de un municipio por su nombre
 */
export const getFiestaPatronal = (cityName) => {
  const normalized = normalize(cityName);
  
  // Buscar coincidencia exacta
  if (FIESTAS_PATRONALES[normalized]) {
    return FIESTAS_PATRONALES[normalized];
  }

  // Si no hay coincidencia, intentar buscar si el nombre está contenido (ej. "Las Rozas de Madrid" -> "las rozas")
  const key = Object.keys(FIESTAS_PATRONALES).find(k => normalized.includes(k) || k.includes(normalized));
  if (key) {
    return FIESTAS_PATRONALES[key];
  }

  // Fallback inteligente: Muchos pueblos pequeños tienen fiestas en Agosto (Asunción) o Septiembre
  return { 
    fiesta: 'Fiestas Mayores / Patronales', 
    fecha: 'Consultar Calendario Municipal' 
  };
};
