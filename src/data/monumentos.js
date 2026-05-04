export const MONUMENTOS = {
  'Madrid': [
    {
      id: 'm1',
      name: 'Museo Nacional del Prado',
      category: 'Museos',
      image: 'https://cdn.pixabay.com/photo/2015/12/08/00/40/madrid-1081914_1280.jpg',
      description: 'Una de las pinacotecas más importantes del mundo, con obras de Velázquez, Goya y El Greco.',
      schedule: 'Lunes a sábado: 10:00 - 20:00. Domingos y festivos: 10:00 - 19:00.',
      price: 'General: 15€. Reducida: 7.50€.',
      disabilityBenefit: 'GRATIS para personas con discapacidad y un acompañante acreditado.',
      technicalSpecs: {
        doorWidth: '120cm',
        turningSpace: 'Sí (>150cm)',
        magneticLoop: 'Disponible en mostradores',
        brailleSignage: 'En ascensores y puntos clave',
        adaptedAudio: 'Audioguías con audiodescripción',
        adaptedToilet: 'Sí, 4 puntos en Planta 0 y 1'
      },
      audioguide: {
        available: true,
        price: '5,00 €',
        accessible: true,
        languages: ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Chino', 'Japonés', 'Portugués', 'LSE', 'Audiodescripción'],
        note: 'Audioguía con audiodescripción y bucle magnético disponible.'
      },
      suitability: ['MOTOR', 'VISUAL', 'AUDITORY', 'COGNITIVE'],
      verifiedByCommunity: {
        status: 'Verificado',
        lastCheck: 'Hoy',
        userCount: 154
      },
      location: { latitude: 40.4137, longitude: -3.6921 }
    },
    {
      id: 'm2',
      name: 'Palacio Real de Madrid',
      category: 'Monumentos',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Palacio_Real_de_Madrid_%2801%29.jpg/1200px-Palacio_Real_de_Madrid_%2801%29.jpg',
      description: 'Residencia oficial del Rey de España, aunque solo se usa para actos de Estado.',
      schedule: 'Invierno: 10:00 - 18:00. Verano: 10:00 - 19:00.',
      price: 'General: 12€. Reducida: 6€.',
      disabilityBenefit: 'GRATIS para personas con discapacidad acreditada y su acompañante.',
      technicalSpecs: {
        doorWidth: '150cm',
        turningSpace: 'Sí',
        magneticLoop: 'No disponible',
        brailleSignage: 'Limitado',
        adaptedAudio: 'Disponible',
        adaptedToilet: 'Sí, en el Patio de Armas'
      },
      audioguide: {
        available: true,
        price: '4,00 €',
        accessible: true,
        languages: ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano'],
        note: 'Dispositivos con contenidos adaptados disponibles en taquilla.'
      },
      suitability: ['MOTOR', 'AUDITORY'],
      verifiedByCommunity: {
        status: 'Verificado',
        lastCheck: 'Hace 1 semana',
        userCount: 28
      },
      location: { latitude: 40.4179, longitude: -3.7143 }
    },
    {
      id: 'm3',
      name: 'Estadio Santiago Bernabéu',
      category: 'Deportes',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Estadio_Santiago_Bernab%C3%A9u_-_Panorama.jpg/1200px-Estadio_Santiago_Bern%C3%A9u_-_Panorama.jpg',
      description: 'El legendario estadio del Real Madrid. Ofrece un tour por el museo, vestuarios y el terreno de juego.',
      schedule: 'Lunes a sábado: 09:30 - 19:00. Domingos y festivos: 10:00 - 18:30. (Sujeto a días de partido)',
      price: 'ENTRADA DE PAGO: General desde 25€. Reducida desde 19€.',
      disabilityBenefit: 'TARIFA REDUCIDA (No gratuito): Las personas con discapacidad deben adquirir entrada de tarifa reducida. El acompañante también dispone de descuento.',
      technicalSpecs: {
        doorWidth: '150cm (Accesos Premium)',
        turningSpace: 'Sí, en Museo y Tienda',
        magneticLoop: 'No disponible',
        brailleSignage: 'Limitado',
        adaptedAudio: 'No disponible',
        adaptedToilet: 'Sí, en el área del Museo y Palcos'
      },
      audioguide: {
        available: true,
        price: 'Incluida en App',
        accessible: false,
        languages: ['Español', 'Inglés'],
        note: 'Se recomienda usar la App oficial del Tour para guiado.'
      },
      suitability: ['MOTOR', 'COGNITIVE'],
      verifiedByCommunity: {
        status: 'En Obras (Accesibilidad Variable)',
        lastCheck: 'Hoy',
        userCount: 56
      },
      location: { latitude: 40.4530, longitude: -3.6883 }
    }
  ],
  'Granada': [
    {
      id: 'g1',
      name: 'La Alhambra y el Generalife',
      category: 'Monumentos',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/View_of_Alhambra_from_Mirador_de_San_Nicol%C3%A1s.jpg/1200px-View_of_Alhambra_from_Mirador_de_San_Nicol%C3%A1s.jpg',
      description: 'Palacio y fortaleza andalusí, joya de la arquitectura nazarí.',
      schedule: '8:30 - 20:00 (Verano) / 8:30 - 18:00 (Invierno).',
      price: 'General: 19€.',
      disabilityBenefit: 'Tarifa Reducida especial y gratuidad según grado. Consultar taquilla para acompañantes.',
      technicalSpecs: {
        doorWidth: 'Variable (Rutas especiales)',
        turningSpace: 'Zonas limitadas',
        magneticLoop: 'No',
        brailleSignage: 'Maquetas tiflológicas disponibles',
        adaptedAudio: 'Sí, audioguía especial',
        adaptedToilet: 'Sí, en zonas de descanso'
      },
      audioguide: {
        available: true,
        price: '6,00 €',
        accessible: true,
        languages: ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Árabe'],
        note: 'Audioguías con guiones adaptados y rutas accesibles señalizadas.'
      },
      suitability: ['VISUAL', 'AUDITORY', 'COGNITIVE'],
      verifiedByCommunity: {
        status: 'Requiere Atención (Rutas empedradas)',
        lastCheck: 'Hace 3 días',
        userCount: 15
      },
      location: { latitude: 37.1760, longitude: -3.5881 }
    }
  ],
  'Barcelona': [
    {
      id: 'b1',
      name: 'Sagrada Família',
      category: 'Monumentos',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Sagrada_Familia_01.jpg/1200px-Sagrada_Familia_01.jpg',
      description: 'La obra maestra de Gaudí, templo expiatorio en construcción desde 1882.',
      schedule: '9:00 - 18:00 (Invierno) / 9:00 - 20:00 (Verano).',
      price: 'General: 26€.',
      disabilityBenefit: 'GRATIS para personas con discapacidad (>33%) y un acompañante acreditado.',
      technicalSpecs: {
        doorWidth: '110cm',
        turningSpace: 'Sí',
        magneticLoop: 'Disponible',
        brailleSignage: 'Sí, en paneles táctiles',
        adaptedAudio: 'App oficial accesible',
        adaptedToilet: 'Sí, accesible'
      },
      audioguide: {
        available: true,
        price: 'Incluida',
        accessible: true,
        languages: ['Español', 'Catalán', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Chino', 'LSE', 'Audiodescripción'],
        note: 'Audioguía incluida en la App oficial con opciones de accesibilidad sensorial.'
      },
      suitability: ['MOTOR', 'VISUAL', 'AUDITORY', 'COGNITIVE'],
      verifiedByCommunity: {
        status: 'Alta Confianza (Ascensor adaptado)',
        lastCheck: 'Hace 1 día',
        userCount: 56
      },
      location: { latitude: 41.4036, longitude: 2.1744 }
    },
    {
      id: 'b2',
      name: 'Park Güell',
      category: 'Monumentos',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Park_Guell_BCN.jpg/1200px-Park_Guell_BCN.jpg',
      description: 'Parque público con jardines y elementos arquitectónicos singulares.',
      schedule: '9:30 - 19:30.',
      price: 'General: 10€.',
      disabilityBenefit: 'GRATIS para personas con discapacidad + acompañante. Requiere reserva previa.',
      technicalSpecs: {
        doorWidth: 'Abierto',
        turningSpace: 'Zonas con pendientes elevadas',
        magneticLoop: 'No',
        brailleSignage: 'No',
        adaptedAudio: 'No',
        adaptedToilet: 'Sí, en entrada principal'
      },
      audioguide: {
        available: true,
        price: 'Gratis (App)',
        accessible: true,
        languages: ['Español', 'Catalán', 'Inglés', 'Francés'],
        note: 'Guía disponible mediante descarga de aplicación oficial.'
      },
      verifiedByCommunity: {
        status: 'Difícil (Ruta recomendada para sillas)',
        lastCheck: 'Hace 4 días',
        userCount: 31
      },
      location: { latitude: 41.4145, longitude: 2.1527 }
    },
    {
      id: 'b3',
      name: 'Spotify Camp Nou (Barça Immersive Tour)',
      category: 'Deportes',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Camp_Nou_interior.jpg/1200px-Camp_Nou_interior.jpg',
      description: 'El museo del FC Barcelona y la nueva experiencia inmersiva mientras se completa la remodelación del estadio.',
      importantNotices: [
        'La visita incluye una sala inmersiva que no es recomendable para personas con epilepsia y/o fotosensibles.'
      ],
      schedule: 'Variable por temporada (ver tabla)',
      price: 'Desde 28,00 € (General) / 21,00 € (Reducida)',
      disabilityBenefit: '50% DE DESCUENTO: Las personas con discapacidad <33% y su acompañante disponen de un 50% de descuento. Venta exclusiva en taquillas con acreditación.',
      tariffs: [
        { id: 1, label: 'General (11 a 64 años)', price: 'Desde 28,00 €' },
        { id: 2, label: 'Mayores de 65 años', price: 'Desde 21,00 €' },
        { id: 3, label: 'Infantil (4 a 10 años)', price: 'Desde 21,00 €' },
        { id: 4, label: 'Residentes Cataluña', price: 'Desde 16,00 €' },
        { id: 5, label: 'Discapacidad <33% (incl. acomp.)', price: '50% Dto.' },
        { id: 6, label: 'Menores de 4 años (0-3 años)', price: 'GRATIS' }
      ],
      seasons: [
        { name: 'Invierno', period: '2 ene al 25 feb', weekday: '10:00 - 18:00', weekend: '10:00 - 18:00', festive: '10:00 - 18:00' },
        { name: 'Primavera', period: '26 feb al 27 mar', weekday: '10:00 - 19:00', weekend: '10:00 - 19:00', festive: '10:00 - 19:00' },
        { name: 'Verano/Otoño', period: '28 mar al 18 oct', weekday: '09:30 - 19:00', weekend: '09:30 - 19:00', festive: '09:30 - 19:00' },
        { name: 'Invierno T2', period: '19 oct al 31 dic', weekday: '10:00 - 19:00', weekend: '10:00 - 19:00', festive: '10:00 - 19:00' },
        { name: 'Cierres Especiales', period: '25 dic y 1 ene', weekday: 'CERRADO', weekend: 'CERRADO', festive: 'CERRADO' }
      ],
      technicalSpecs: {
        doorWidth: 'Totalmente adaptado',
        turningSpace: 'Sí, totalmente accesible para sillas de ruedas',
        magneticLoop: 'Disponible (Bucle Magnético)',
        brailleSignage: 'Limitado',
        adaptedAudio: 'Audioguía accesible disponible',
        adaptedToilet: 'Sí, baños adaptados',
        dogAccess: 'Se permite el acceso de perros de asistencia o perros guía',
        babyChange: 'Disponible (Cambiador para bebés)'
      },
      audioguide: {
        available: true,
        price: 'Incluida',
        accessible: true,
        languages: ['Español', 'Catalán', 'Inglés', 'Francés', 'Alemán'],
        note: 'Audioguía accesible incluida con la entrada.'
      },
      suitability: ['MOTOR', 'VISUAL', 'AUDITORY', 'COGNITIVE'],
      verifiedByCommunity: {
        status: 'Totalmente Adaptado',
        lastCheck: 'Hoy',
        userCount: 45
      },
      location: { latitude: 41.3809, longitude: 2.1228 }
    }
  ],
  'Sevilla': [
    {
      id: 's1',
      name: 'Catedral de Sevilla y Giralda',
      category: 'Monumentos',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Sevilla_Cathedral_Exterior.jpg/1200px-Sevilla_Cathedral_Exterior.jpg',
      description: 'La catedral gótica más grande del mundo y su famosa torre campanario.',
      schedule: '10:45 - 17:00.',
      price: 'General: 11€.',
      disabilityBenefit: 'GRATIS para residentes, menores de 13 y personas con discapacidad >65% + acompañante.',
      technicalSpecs: {
        doorWidth: '120cm',
        turningSpace: 'Sí',
        magneticLoop: 'No',
        brailleSignage: 'No',
        adaptedAudio: 'Disponible',
        adaptedToilet: 'Sí'
      },
      audioguide: {
        available: true,
        price: '5,00 €',
        accessible: true,
        languages: ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano'],
        note: 'Contenidos disponibles en formato audioguía tradicional.'
      },
      verifiedByCommunity: {
        status: 'Verificado (Giralda no accesible)',
        lastCheck: 'Hace 1 semana',
        userCount: 22
      },
      location: { latitude: 37.3858, longitude: -5.9931 }
    }
  ],
  'Bilbao': [
    {
      id: 'bi1',
      name: 'Museo Guggenheim Bilbao',
      category: 'Museos',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Guggenheim_Museum_Bilbao_June_2015.jpg/1200px-Guggenheim_Museum_Bilbao_June_2015.jpg',
      description: 'Icono de la arquitectura contemporánea diseñado por Frank Gehry.',
      schedule: '10:00 - 19:00 (Cerrado lunes en invierno).',
      price: 'General: 16€.',
      disabilityBenefit: 'Tarifa Reducida: 7.50€. Acompañante GRATIS si se requiere asistencia.',
      technicalSpecs: {
        doorWidth: 'Automática amplia',
        turningSpace: 'Excelente',
        magneticLoop: 'Sí, en mostrador y audioguías',
        brailleSignage: 'Sí',
        adaptedAudio: 'Sí, videoguías en lengua de signos',
        adaptedToilet: 'Sí, en todas las plantas'
      },
      audioguide: {
        available: true,
        price: 'Incluida',
        accessible: true,
        languages: ['Español', 'Euskera', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'LSE'],
        note: 'Videoguías en LSE y audiodescripción disponibles sin coste adicional.'
      },
      verifiedByCommunity: {
        status: 'Máxima Excelencia (5 estrellas)',
        lastCheck: 'Hace 2 días',
        userCount: 38
      },
      location: { latitude: 43.2687, longitude: -2.9340 }
    }
  ],
  'Valencia': [
    {
      id: 'v1',
      name: 'Ciudad de las Artes y las Ciencias',
      category: 'Monumentos',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/City_of_Arts_and_Sciences_Valencia_Spain.jpg/1200px-City_of_Arts_and_Sciences_Valencia_Spain.jpg',
      description: 'Complejo arquitectónico, cultural y de entretenimiento.',
      schedule: '10:00 - 18:00 (Varía según edificio).',
      price: 'Completa: 38.60€.',
      disabilityBenefit: 'Tarifa Reducida especial (aprox 40% dto) para personas con discapacidad.',
      technicalSpecs: {
        doorWidth: '150cm',
        turningSpace: 'Sí',
        magneticLoop: 'En el Hemisfèric',
        brailleSignage: 'Sí, en maquetas',
        adaptedAudio: 'Disponible',
        adaptedToilet: 'Sí, múltiples puntos'
      },
      audioguide: {
        available: true,
        price: '3,50 €',
        accessible: true,
        languages: ['Español', 'Valenciano', 'Inglés', 'Francés', 'Alemán', 'Italiano'],
        note: 'Audioguías disponibles para los diferentes edificios del complejo.'
      },
      verifiedByCommunity: {
        status: 'Muy Alta Accesibilidad',
        lastCheck: 'Hace 5 días',
        userCount: 45
      },
      location: { latitude: 39.4582, longitude: -0.3503 }
    }
  ],
  'Alicante': [
    {
      id: 'ali1',
      name: 'Castillo de Santa Bárbara',
      category: 'Monumentos',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Castillo_de_Santa_B%C3%A1rbara_desde_el_Postiguet.jpg/1200px-Castillo_de_Santa_B%C3%A1rbara_desde_el_Postiguet.jpg',
      description: 'Fortaleza medieval sobre el monte Benacantil con vistas al Mediterráneo.',
      schedule: '10:00 - 20:00.',
      price: 'Acceso GRATIS (Ascensor: 2.70€).',
      disabilityBenefit: 'Ascensor GRATIS para personas con discapacidad acreditada.',
      technicalSpecs: {
        doorWidth: 'Acceso adaptado',
        turningSpace: 'Sí',
        magneticLoop: 'No',
        brailleSignage: 'Sí',
        adaptedAudio: 'App móvil',
        adaptedToilet: 'Sí, en el patio'
      },
      audioguide: {
        available: true,
        price: 'Gratis (QR)',
        accessible: true,
        languages: ['Español', 'Inglés', 'Francés', 'Alemán'],
        note: 'Visita guiada por audio mediante códigos QR distribuidos por el recinto.'
      },
      verifiedByCommunity: {
        status: 'Excelente (Uso de Ascensor)',
        lastCheck: 'Hace 1 día',
        userCount: 52
      },
      workingHours: {
        weekday: { open: '10:00', close: '20:00' },
        weekend: { open: '10:00', close: '20:00' },
        is24h: false
      },
      location: { latitude: 38.3489, longitude: -0.4777 }
    },
    {
      id: 'ali2',
      name: 'Mercado Central de Alicante',
      category: 'Mercados',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Mercat_Central_d%27Alacant_01.jpg/1200px-Mercat_Central_d%27Alacant_01.jpg',
      description: 'Edificio de estilo modernista, corazón de la gastronomía alicantina.',
      schedule: '7:30 - 14:30.',
      price: 'Entrada Libre.',
      disabilityBenefit: 'Accesibilidad total en ambas plantas mediante ascensores.',
      technicalSpecs: {
        doorWidth: 'Automática',
        turningSpace: 'Sí',
        magneticLoop: 'No',
        brailleSignage: 'Limitado',
        adaptedAudio: 'No',
        adaptedToilet: 'Sí'
      },
      audioguide: {
        available: false,
        price: 'N/A',
        accessible: false,
        languages: [],
        note: 'No dispone de servicio de audioguía.'
      },
      verifiedByCommunity: {
        status: 'Muy Accesible',
        lastCheck: 'Hace 3 días',
        userCount: 24
      },
      location: { latitude: 38.3475, longitude: -0.4852 }
    },
    {
      id: 'ali3',
      name: 'MUBAG - Museo de Bellas Artes Gravina',
      category: 'Museos',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/MUBAG_Alicante.jpg/1200px-MUBAG_Alicante.jpg',
      description: 'Palacio del s.XVIII con lo mejor del arte alicantino.',
      schedule: '10:00 - 20:00.',
      price: 'Entrada GRATIS.',
      disabilityBenefit: 'Accesibilidad total con ascensores y rampas.',
      audioguide: {
        available: true,
        price: 'Gratis',
        accessible: true,
        languages: ['Español', 'Valenciano', 'Inglés'],
        note: 'Audioguía disponible a través de la web oficial y códigos QR.'
      },
      location: { latitude: 38.3444, longitude: -0.4795 }
    },
    {
      id: 'ali4',
      name: 'Museo The Ocean Race',
      category: 'Museos',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Museo_Volvo_Ocean_Race.jpg/1200px-Museo_Volvo_Ocean_Race.jpg',
      description: 'El único museo en el mundo dedicado a la regata Volvo Ocean Race.',
      schedule: '11:00 - 20:00.',
      price: 'Entrada GRATIS.',
      disabilityBenefit: 'Edificio moderno 100% accesible.',
      audioguide: {
        available: true,
        price: 'Gratis (Interactivo)',
        accessible: true,
        languages: ['Español', 'Inglés'],
        note: 'Contenidos interactivos con soporte de audio en salas.'
      },
      location: { latitude: 38.3401, longitude: -0.4815 }
    },
    {
      id: 'ali5',
      name: 'Museo de Fogueres',
      category: 'Museos',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Museo_de_Hogueras_Alicante.jpg/1200px-Museo_de_Hogueras_Alicante.jpg',
      description: 'Dedicado a la fiesta oficial de la ciudad: las Hogueras de San Juan.',
      schedule: '10:00 - 20:00.',
      price: 'Entrada GRATIS.',
      disabilityBenefit: 'Totalmente accesible con ascensor.',
      audioguide: {
        available: true,
        price: 'Gratis',
        accessible: true,
        languages: ['Español', 'Inglés', 'Valenciano'],
        note: 'Folleto digital y soporte de audio mediante App.'
      },
      workingHours: {
        weekday: { open: '10:00', close: '20:00' },
        weekend: { open: '10:00', close: '14:00' },
        is24h: false
      },
      location: { latitude: 38.3452, longitude: -0.4828 }
    },
    {
      id: 'ali6',
      name: 'Refugios Antiaéreos de Alicante',
      category: 'Museos',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Refugio_Plaza_Castellon_Alicante.jpg/1200px-Refugio_Plaza_Castellon_Alicante.jpg',
      description: 'Visita guiada a los refugios de la Guerra Civil.',
      schedule: 'Bajo reserva.',
      price: '5€ (Reducida PCD: 3€).',
      disabilityBenefit: 'Acceso limitado (Consultar reserva).',
      audioguide: {
        available: true,
        price: 'Incluida en guía',
        accessible: false,
        languages: ['Español', 'Inglés'],
        note: 'La visita es guiada por personal experto.'
      },
      location: { latitude: 38.3456, longitude: -0.4851 }
    }
  ]
};
