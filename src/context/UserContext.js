import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

const STORAGE_KEY = '@distravel_user_data';

const SEED_DATA = [
  {
    id: 'castillo-belmonte',
    name: 'Castillo de Belmonte',
    city: 'Belmonte',
    province: 'Cuenca',
    address: 'Calle Eugenia de Montijo, s/n, 16640 Belmonte, Cuenca',
    phone: '+34 967 17 07 08',
    category: 'Castillo',
    description: 'Impresionante fortaleza del siglo XV, de estilo gótico-mudéjar. Es famoso por su planta en forma de estrella y su excelente estado de conservación.',
    importantNotices: [
      'Visitas teatralizadas disponibles los fines de semana bajo reserva previa.',
      'Accesibilidad parcial: El patio de armas y la planta baja son accesibles, pero el acceso a las torres tiene escaleras.'
    ],
    seasons: [
      {
        name: 'Horario General',
        period: 'Todo el año',
        weekday: '10:00 a 14:00 y 16:30 a 20:00',
        weekend: '10:00 a 14:00 y 16:30 a 20:00'
      }
    ],
    accessibility: {
      physical: true,
      visual: true,
      auditory: true,
      cognitive: true
    },
    tariffs: [
      { id: 1, label: 'Entrada General', price: '10 €' },
      { id: 2, label: 'Reducida (PCD)', price: '6 €' },
      { id: 3, label: 'Niños (<12 años)', price: '5 €' }
    ],
    location: {
      latitude: 39.5594,
      longitude: -2.7042,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005
    },
    image: 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'castillo-la-mota',
    name: 'Castillo de la Mota',
    city: 'Medina del Campo',
    province: 'Valladolid',
    address: 'Av. del Castillo, s/n, 47400 Medina del Campo, Valladolid',
    phone: '+34 983 81 00 61',
    category: 'Castillo',
    description: 'Icono de la arquitectura militar de los Reyes Católicos. Esta imponente fortaleza de ladrillo destaca por su foso y su Torre del Homenaje, una de las más altas de Castilla.',
    importantNotices: [
      'Las visitas guiadas se realizan desde el Centro de Visitantes.',
      'Visita libre (exteriores y patio): acceso gratuito.',
      'Imprescindible reserva previa para Visitas Guiadas y Torre del Homenaje.'
    ],
    freeInfo: 'Acceso gratuito para menores de 3 años y personas con discapacidad muy grave (a partir del 70%).',
    touristTip: 'La visita conjunta (Castillo + Torre) es la opción más completa para entender la magnitud de la fortaleza.',
    seasons: [
      {
        name: 'Invierno (1 Oct - 31 Mar)',
        period: 'Lunes a Sábado: 11:00 a 14:00 y 16:00 a 18:00',
        weekday: '11:00 a 14:00 y 16:00 a 18:00',
        weekend: 'Domingos y Festivos: 11:00 a 14:00'
      },
      {
        name: 'Verano (1 Abr - 30 Sep)',
        period: 'Lunes a Sábado: 11:00 a 14:00 y 16:00 a 19:00',
        weekday: '11:00 a 14:00 y 16:00 a 19:00',
        weekend: 'Domingos y Festivos: 11:00 a 14:00'
      }
    ],
    accessibility: {
      physical: true,
      visual: false,
      auditory: true,
      cognitive: true
    },
    tariffs: [
      { id: 1, label: 'Visita Guiada Castillo (Gral)', price: '5,00 €' },
      { id: 2, label: 'Visita Guiada Torre (Gral)', price: '5,00 €' },
      { id: 3, label: 'Conjunta Castillo + Torre (Gral)', price: '9,00 €' },
      { id: 4, label: 'Visita con Audioguía (Gral)', price: '4,50 €' },
      { id: 5, label: 'Teatralizada Torre (Gral)', price: '8,00 €' },
      { id: 6, label: 'Conjunta Teatralizada (Gral)', price: '11,00 €' },
      { id: 7, label: 'Tarifa Especial (PCD 25-69%)', price: 'Desde 4,00 €' },
      { id: 8, label: 'Tarifa Reducida (<18 años)', price: 'Desde 3,00 €' }
    ],
    location: {
      latitude: 41.3117,
      longitude: -4.9103,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005
    },
    image: 'https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'castillo-santa-barbara',
    name: 'Castillo de Santa Bárbara',
    city: 'Alicante',
    province: 'Alicante',
    address: 'Monte Benacantil, s/n, 03002 Alicante',
    phone: '+34 673 84 98 90',
    category: 'Monumento',
    description: 'Ubicado sobre el Monte Benacantil a 166 metros de altitud, es una de las más grandes fortalezas medievales de España con vistas espectaculares a la bahía de Alicante.',
    importantNotices: [
      'Acceso gratuito al recinto.',
      'Ascensor frente a Playa del Postiguet (2.70€, gratuito para mayores de 65 años).',
      'Último acceso al ascensor 40 min antes del cierre.'
    ],
    seasons: [
      { name: 'Invierno (15 Nov - 27 Feb)', period: 'Diario: 10:00 a 18:00', weekday: '10:00 a 18:00', weekend: '10:00 a 18:00' },
      { name: 'Primavera (28 Feb - 16 Jun)', period: 'Diario: 10:00 a 20:00', weekday: '10:00 a 20:00', weekend: '10:00 a 20:00' },
      { name: 'Verano (17 Jun - 4 Sep)', period: 'Diario: 10:00 a 23:00', weekday: '10:00 a 23:00', weekend: '10:00 a 23:00' }
    ],
    accessibility: { physical: true, visual: true, auditory: true, cognitive: true },
    technicalSpecs: {
      doorWidth: '120cm',
      adaptedToilet: true,
      elevatorDimensions: '110x140cm',
      ramps: 'Pendiente < 8%',
      audioGuides: true
    },
    tariffs: [
      { id: 1, label: 'Entrada Recinto', price: 'Gratis', value: 0 },
      { id: 2, label: 'Ascensor (Gral)', price: '2,70 €', value: 2.70 },
      { id: 3, label: 'Ascensor (PMR / >65)', price: 'Gratis', value: 0 }
    ],
    location: { latitude: 38.3491, longitude: -0.4777, latitudeDelta: 0.005, longitudeDelta: 0.005 },
    website: 'castillodesantabarbara.com',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Castello_de_Santa_B%C3%A0rbara_Alicante.jpg/1200px-Castello_de_Santa_B%C3%A0rbara_Alicante.jpg'
  },
  {
    id: 'marq-alicante',
    name: 'MARQ - Museo Arqueológico',
    city: 'Alicante',
    province: 'Alicante',
    address: 'Plaza Dr. Gómez Ulla, s/n, 03013 Alicante',
    phone: '+34 965 14 90 00',
    website: 'marqalicante.com',
    category: 'Museo',
    description: 'Museo Europeo del Año en 2004, ofrece un viaje por la historia de Alicante desde la Prehistoria hasta la Edad Moderna con técnicas expositivas vanguardistas.',
    importantNotices: [
      'Cerrado los lunes.',
      'Aparcamiento PMR disponible en las inmediaciones.',
      'Se recomienda compra anticipada para exposiciones temporales.'
    ],
    seasons: [
      { name: 'Invierno', period: 'Mar-Sáb: 10:00-19:00 | Dom: 10:00-14:00', weekday: '10:00 a 19:00', weekend: '10:00 a 14:00' },
      { name: 'Verano (Jul-Ago)', period: 'Mar-Sáb: 10:00-21:00 | Dom: 10:00-14:00', weekday: '10:00 a 21:00', weekend: '10:00 a 14:00' }
    ],
    accessibility: { physical: true, visual: true, auditory: true, cognitive: true },
    technicalSpecs: {
      doorWidth: '100cm',
      adaptedToilet: true,
      turningRadius: '150cm',
      brailleLabels: true,
      magneticLoop: true
    },
    tariffs: [
      { id: 1, label: 'Entrada General', price: '3,00 €', value: 3.00 },
      { id: 2, label: 'Reducida (Est./Jub.)', price: '1,50 €', value: 1.50 },
      { id: 3, label: 'PCD + Acompañante', price: 'Gratis', value: 0 }
    ],
    location: { latitude: 38.3534, longitude: -0.4754, latitudeDelta: 0.005, longitudeDelta: 0.005 },
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/MARQ_Alacant.JPG/1200px-MARQ_Alacant.JPG'
  },
  {
    id: 'maca-alicante',
    name: 'MACA - Museo de Arte Contemporáneo',
    city: 'Alicante',
    province: 'Alicante',
    address: 'Plaza de Santa María, 3, 03002 Alicante',
    phone: '+34 965 21 31 56',
    website: 'maca-alicante.es',
    category: 'Museo',
    description: 'Ubicado en el edificio civil más antiguo de la ciudad, alberga una excepcional colección de arte del siglo XX donada por Eusebio Sempere.',
    importantNotices: [
      'Entrada Libre para todos los públicos.',
      'Cerrado los lunes.',
      'Totalmente accesible para sillas de ruedas.'
    ],
    seasons: [{ name: 'Horario Habitual', period: 'Mar-Sáb: 10:00-20:00 | Dom: 10:00-14:00', weekday: '10:00 a 20:00', weekend: '10:00 a 14:00' }],
    accessibility: { physical: true, visual: true, auditory: true, cognitive: true },
    tariffs: [{ id: 1, label: 'Entrada General', price: 'Gratis' }],
    location: { latitude: 38.3460, longitude: -0.4795, latitudeDelta: 0.005, longitudeDelta: 0.005 },
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Alicante_-_Museo_de_Arte_Contempor%C3%A1neo_de_Alicante_%28MACA%29_3.jpg/1200px-Alicante_-_Museo_de_Arte_Contempor%C3%A1neo_de_Alicante_%28MACA%29_3.jpg'
  },
  {
    id: 'mercado-central-alicante',
    name: 'Mercado Central de Alicante',
    city: 'Alicante',
    province: 'Alicante',
    address: 'Avenida Alfonso X El Sabio, 10, 03004 Alicante',
    phone: '+34 965 14 07 63',
    website: 'mercadosalicante.com',
    category: 'Lugar Emblemático',
    description: 'Edificio de inspiración modernista del siglo XX. Es el corazón gastronómico de la ciudad, famoso por su arquitectura y la frescura de sus productos locales.',
    importantNotices: [
      'Acceso gratuito.',
      'Plaza 25 de Mayo (trasera) con gran valor histórico.',
      'Sábados ambiente muy animado ("tardeo").'
    ],
    seasons: [{ name: 'Horario Comercial', period: 'Lun-Vie: 07:00-14:30 | Sáb: 07:00-15:00', weekday: '07:00 a 14:30', weekend: '07:00 a 15:00' }],
    accessibility: { physical: true, visual: true, auditory: false, cognitive: true },
    tariffs: [{ id: 1, label: 'Acceso', price: 'Gratis' }],
    location: { latitude: 38.3486, longitude: -0.4851, latitudeDelta: 0.005, longitudeDelta: 0.005 },
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Mercado_Central_de_Alicante.JPG/1200px-Mercado_Central_de_Alicante.JPG'
  },
  {
    id: 'concatedral-san-nicolas',
    name: 'Concatedral de San Nicolás',
    city: 'Alicante',
    province: 'Alicante',
    address: 'Plaza del Abad Penalva, 1, 03002 Alicante',
    phone: '+34 965 21 26 62',
    website: 'concatedralalicante.com',
    category: 'Iglesia',
    description: 'Construida sobre una antigua mezquita, es un sobrio ejemplo de estilo herreriano con una espectacular cúpula azul de 45 metros.',
    importantNotices: [
      'Entrada gratuita al templo.',
      'Se ruega silencio y respeto durante los actos litúrgicos.',
      'Rampas móviles de acceso bajo solicitud.'
    ],
    seasons: [{ name: 'Visitas', period: 'Lun-Sáb: 08:30-13:00 y 18:00-20:30', weekday: '08:30 a 13:00', weekend: '18:00 a 20:30' }],
    accessibility: { physical: true, visual: false, auditory: true, cognitive: true },
    tariffs: [{ id: 1, label: 'Entrada', price: 'Gratis' }],
    location: { latitude: 38.3458, longitude: -0.4829, latitudeDelta: 0.005, longitudeDelta: 0.005 },
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Concatedral_San_Nicol%C3%A1s_fachada.jpg/1200px-Concatedral_San_Nicol%C3%A1s_fachada.jpg'
  },
  {
    id: 'teatro-principal-alicante',
    name: 'Teatro Principal de Alicante',
    city: 'Alicante',
    province: 'Alicante',
    address: 'Plaza del Teatro, s/n, 03001 Alicante',
    phone: '+34 965 20 23 80',
    website: 'teatroprincipaldealicante.com',
    category: 'Teatro',
    description: 'Inaugurado en 1847, es el espacio escénico más importante de la ciudad. Su fachada neoclásica es uno de los iconos culturales de Alicante.',
    importantNotices: [
      'Consultar programación en su web oficial.',
      'Espacios reservados para sillas de ruedas (avisar con antelación).',
      'Taquilla abierta de martes a sábado.'
    ],
    seasons: [{ name: 'Taquilla', period: 'Mar-Sáb: 12:00-14:00 y 17:00-21:00', weekday: '12:00 a 14:00', weekend: '17:00 a 21:00' }],
    accessibility: { physical: true, visual: true, auditory: true, cognitive: true },
    tariffs: [{ id: 1, label: 'Según Función', price: 'Variable' }],
    location: { latitude: 38.3451, longitude: -0.4851, latitudeDelta: 0.005, longitudeDelta: 0.005 },
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Teatro_Principal%2C_Alicante_04.jpg/1200px-Teatro_Principal%2C_Alicante_04.jpg'
  },
  {
    id: 'basilica-santa-maria',
    name: 'Basílica de Santa María',
    city: 'Alicante',
    province: 'Alicante',
    address: 'Plaza de Santa María, s/n, 03002 Alicante',
    phone: '+34 633 51 25 21',
    website: 'basilicaalicante.com',
    category: 'Iglesia',
    description: 'La iglesia más antigua de Alicante, del siglo XIV, con una espectacular fachada barroca y un interior gótico impresionante.',
    importantNotices: [
      'Visita cultural incluye audioguía.',
      'Último acceso 30 min antes del cierre.',
      'Entrada gratuita menores 12 años.'
    ],
    seasons: [
      { name: 'Lunes a Sábado', period: '10:00 a 19:00', weekday: '10:00 a 19:00', weekend: '10:00 a 19:00' },
      { name: 'Domingo', period: '14:00 a 19:00', weekday: '14:00 a 19:00', weekend: '14:00 a 19:00' }
    ],
    accessibility: { physical: true, visual: true, auditory: true, cognitive: true },
    tariffs: [
      { id: 1, label: 'General (con Audioguía)', price: '6,00 €' },
      { id: 2, label: 'Reducida (Jub./Est.)', price: '5,00 €' },
      { id: 3, label: 'Menores 12 años', price: 'Gratis' }
    ],
    location: { latitude: 38.3461, longitude: -0.4793, latitudeDelta: 0.005, longitudeDelta: 0.005 },
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Basilica_of_Santa_Maria_of_Alicante_-_Facciata.jpg/1200px-Basilica_of_Santa_Maria_of_Alicante_-_Facciata.jpg'
  },
  {
    id: 'museo-hogueras-alicante',
    name: 'Museo de Hogueras',
    city: 'Alicante',
    province: 'Alicante',
    address: 'Rambla de Méndez Núñez, 29, 03002 Alicante',
    phone: '+34 965 14 68 28',
    website: 'alicante.es',
    category: 'Museo',
    description: 'Descubre la fiesta oficial de Alicante (Hogueras de San Juan) a través de sus ninots indultados, maquetas y trajes típicos.',
    importantNotices: [
      'Entrada Gratuita.',
      'Totalmente accesible (edificio adaptado).',
      'Cerrado los lunes.'
    ],
    seasons: [{ name: 'Horario General', period: 'Mar-Vie: 10:00-13:30 y 17:00-19:30 | Sáb: 10:00-13:30', weekday: '10:00 a 13:30', weekend: '17:00 a 19:30' }],
    accessibility: { physical: true, visual: true, auditory: true, cognitive: true },
    tariffs: [{ id: 1, label: 'Entrada', price: 'Gratis' }],
    location: { latitude: 38.3454, longitude: -0.4839, latitudeDelta: 0.005, longitudeDelta: 0.005 },
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Hogueras_de_san_juan_de_alicante.jpg/1200px-Hogueras_de_san_juan_de_alicante.jpg'
  },
  {
    id: 'playa-postiguet',
    name: 'Playa del Postiguet',
    city: 'Alicante',
    province: 'Alicante',
    address: 'Calle de Juan Bautista Lafora, s/n, 03002 Alicante',
    phone: '+34 965 14 91 00',
    category: 'Playa',
    description: 'La playa urbana por excelencia de Alicante, a los pies del Castillo de Santa Bárbara. Famosa por sus palmeras y sus aguas tranquilas.',
    importantNotices: [
      'Playa con Bandera Azul.',
      'Punto de baño accesible (Acceso 13) en temporada estival.',
      'Sillas anfibias y personal de apoyo disponibles.'
    ],
    seasons: [{ name: 'Temporada Baño', period: 'Servicios de socorrismo: 10:00 a 18:00 (Jun-Sep)', weekday: '24 horas abierto', weekend: '24 horas abierto' }],
    accessibility: { physical: true, visual: true, auditory: true, cognitive: true },
    tariffs: [{ id: 1, label: 'Acceso Público', price: 'Gratis' }],
    location: { latitude: 38.3444, longitude: -0.4781, latitudeDelta: 0.01, longitudeDelta: 0.01 },
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Playa_del_Postiguet%2C_Alicante%2C_Espa%C3%B1a%2C_2014-07-04%2C_DD_48.JPG/1200px-Playa_del_Postiguet%2C_Alicante%2C_Espa%C3%B1a%2C_2014-07-04%2C_DD_48.JPG'
  },
  {
    id: 'explanada-espana',
    name: 'Explanada de España',
    city: 'Alicante',
    province: 'Alicante',
    address: 'Paseo de la Explanada, s/n, 03001 Alicante',
    category: 'Lugar Emblemático',
    description: 'Paseo marítimo compuesto por 6,6 millones de teselas de mármol que dibujan olas. Es el símbolo indiscutible de Alicante.',
    importantNotices: [
      'Espacio peatonal totalmente llano.',
      'Gran oferta de ocio y restauración.',
      'Artesanía local disponible en los puestos de venta.'
    ],
    seasons: [{ name: 'Abierto 24h', period: 'Todo el año', weekday: 'Siempre abierto', weekend: 'Siempre abierto' }],
    accessibility: { physical: true, visual: true, auditory: true, cognitive: true },
    tariffs: [{ id: 1, label: 'Acceso', price: 'Gratis' }],
    location: { latitude: 38.3432, longitude: -0.4821, latitudeDelta: 0.005, longitudeDelta: 0.005 },
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Explanada_de_Espa%C3%B1a_Alicante_1.jpg/1200px-Explanada_de_Espa%C3%B1a_Alicante_1.jpg'
  }
];

const INITIAL_USER_DATA = {
  name: '',
  lastName: '',
  birthDate: '',
  email: '',
  phone: '',
  address: '',
  disabilityDegree: '',
  issuingBody: '',
  expiryDate: '',
  idCardImage: null,
  profileImage: null,
  isLoggedIn: false,
  voiceGuidance: false,
  highContrast: false,
  isAdmin: true,
  id: 'guest',
  contributions: SEED_DATA, // Inicializar con semillas
  customCityData: {},
  disabilityType: 'MOTOR',
  visitedPlaces: [], // Para calcular ahorro real
  totalSavings: 0,   // Ahorro acumulado
  verifiedPlaces: [], // Lugares validados por el usuario
  experience: 0,      // Puntos de experiencia (XP)
  level: 1,           // Nivel actual
  badges: [],         // Insignias ganadas
  unlockedTitles: ['Viajero Novel'], // Títulos ganados
};

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(INITIAL_USER_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      console.log('Distravel v3.0: Iniciando carga de datos...');
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        let parsed = jsonValue != null ? JSON.parse(jsonValue) : { contributions: [] };
        console.log('Distravel v3.0: Datos recuperados de almacenamiento.');
        
        // Unificar contributions y asegurar que no hay duplicados por ID
        let currentContributions = parsed.contributions || [];
        
        // Añadir semillas si no existen o actualizar si han cambiado campos clave
        SEED_DATA.forEach(seed => {
          const idx = currentContributions.findIndex(p => p.id === seed.id);
          if (idx === -1) {
            currentContributions.push(seed);
          } else {
            const existing = currentContributions[idx];
            // IMPORTANTE: Solo actualizar campos si el usuario NO los ha modificado
            // Si la imagen actual es diferente a la de la semilla y no es la por defecto de Unsplash,
            // asumimos que el usuario la ha personalizado y la respetamos.
            const userHasCustomImage = existing.image && existing.image !== seed.image && !existing.image.includes('unsplash.com');
            
            currentContributions[idx] = { 
              ...seed, 
              ...existing, // Lo que ya tiene el usuario (sus fotos) prevalece sobre la semilla
              id: seed.id 
            };
            
            // Si la semilla tiene una imagen mejor (Wikipedia) y el usuario no ha puesto una propia, actualizamos
            if (!userHasCustomImage && seed.image && seed.image.includes('wikipedia')) {
              currentContributions[idx].image = seed.image;
            }
          }
        });

        // Limpieza de duplicados
        const uniqueContributions = [];
        const seen = new Set();
        currentContributions.forEach(p => {
          const key = `${p.id || p.name}-${p.city}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueContributions.push(p);
          }
        });

        parsed.contributions = uniqueContributions;
        setUserData({ ...INITIAL_USER_DATA, ...parsed, isAdmin: true });
        console.log('Distravel v3.0: Estado de usuario inicializado.');
      } catch (e) {
        console.error('Distravel v3.0 Error:', e);
        setUserData(INITIAL_USER_DATA);
      } finally {
        setIsLoading(false);
        console.log('Distravel v3.0: Carga finalizada.');
      }
    };
    loadData();
  }, []);

  const saveData = async (data) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const updateUserData = (arg1, arg2) => {
    setUserData(prev => {
      let updated;
      if (typeof arg1 === 'string' && typeof arg2 === 'function') {
        // Soporte para updateUserData('key', (prevVal) => newVal)
        updated = { ...prev, [arg1]: arg2(prev[arg1]) };
      } else if (typeof arg1 === 'object' && arg1 !== null) {
        // Soporte para updateUserData({ key: value })
        updated = { ...prev, ...arg1 };
      } else {
        return prev;
      }
      saveData(updated);
      return updated;
    });
  };

  const awardExperience = (amount, reason) => {
    setUserData(prev => {
      const newXP = prev.experience + amount;
      const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
      const levelledUp = newLevel > prev.level;
      
      let newBadges = [...(prev.badges || [])];
      let newTitles = [...(prev.unlockedTitles || [])];

      // Lógica de Insignias Automáticas
      if (prev.verifiedPlaces?.length >= 5 && !newBadges.includes('accessibility-hero')) {
        newBadges.push('accessibility-hero');
        newTitles.push('Héroe de la Accesibilidad');
      }
      
      const alicanteVisits = prev.visitedPlaces?.filter(id => id.includes('alicante'))?.length || 0;
      if (alicanteVisits >= 3 && !newBadges.includes('alicante-ambassador')) {
        newBadges.push('alicante-ambassador');
        newTitles.push('Embajador de Alicante');
      }

      if (prev.totalSavings >= 50 && !newBadges.includes('master-saver')) {
        newBadges.push('master-saver');
        newTitles.push('Maestro del Ahorro');
      }

      const updated = { 
        ...prev, 
        experience: newXP, 
        level: newLevel,
        badges: newBadges,
        unlockedTitles: newTitles
      };
      
      if (levelledUp) {
        Alert.alert('¡NIVEL UP!', `¡Has alcanzado el Nivel ${newLevel}! Sigue explorando para desbloquear más ventajas.`);
      }

      saveData(updated);
      return updated;
    });
  };

  const logout = async () => {
    try {
      const loggedOutData = { ...userData, isLoggedIn: false };
      setUserData(loggedOutData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loggedOutData));
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }
  };

  return (
    <UserContext.Provider value={{ 
      userData, 
      updateUserData, 
      awardExperience,
      logout, 
      isLoading 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser debe usarse dentro de un UserProvider');
  return context;
};
