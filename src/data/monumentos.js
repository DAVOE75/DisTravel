export const MONUMENTOS = {
  'Madrid': [
    {
      id: 'm1',
      name: 'Museo Nacional del Prado',
      category: 'Museos',
      image: 'https://images.unsplash.com/photo-1543783230-22e030303030?auto=format&fit=crop&w=800&q=80',
      description: 'Una de las pinacotecas más importantes del mundo, con obras de Velázquez, Goya y El Greco.',
      schedule: 'Lunes a sábado: 10:00 - 20:00. Domingos y festivos: 10:00 - 19:00.',
      price: 'General: 15€. Reducida: 7.50€.',
      disabilityBenefit: 'GRATIS para personas con discapacidad (>33%) y un acompañante (si la discapacidad es >65% o requiere ayuda).',
      // DATOS TÉCNICOS (El Océano Azul)
      technicalSpecs: {
        doorWidth: '120cm',
        turningSpace: 'Sí (>150cm)',
        magneticLoop: 'Disponible en mostradores',
        brailleSignage: 'En ascensores y puntos clave',
        adaptedAudio: 'Audioguías con audiodescripción',
        adaptedToilet: 'Sí, 4 puntos en Planta 0 y 1'
      },
      suitability: ['MOTOR', 'VISUAL', 'AUDITORY', 'COGNITIVE'],
      verifiedByCommunity: {
        status: 'Alta Confianza',
        lastCheck: 'Hace 2 días',
        userCount: 42
      },
      location: { latitude: 40.4137, longitude: -3.6921 }
    },
    {
      id: 'm2',
      name: 'Palacio Real de Madrid',
      category: 'Monumentos',
      image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',
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
      suitability: ['MOTOR', 'AUDITORY'],
      verifiedByCommunity: {
        status: 'Verificado',
        lastCheck: 'Hace 1 semana',
        userCount: 28
      },
      location: { latitude: 40.4179, longitude: -3.7143 }
    }
  ],
  'Granada': [
    {
      id: 'g1',
      name: 'La Alhambra y el Generalife',
      category: 'Monumentos',
      image: 'https://images.unsplash.com/photo-1544013919-455b81a176ee?auto=format&fit=crop&w=800&q=80',
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
      image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80',
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
      image: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=800&q=80',
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
      verifiedByCommunity: {
        status: 'Difícil (Ruta recomendada para sillas)',
        lastCheck: 'Hace 4 días',
        userCount: 31
      },
      location: { latitude: 41.4145, longitude: 2.1527 }
    }
  ],
  'Sevilla': [
    {
      id: 's1',
      name: 'Catedral de Sevilla y Giralda',
      category: 'Monumentos',
      image: 'https://images.unsplash.com/photo-1559564484-e48b3e040ff4?auto=format&fit=crop&w=800&q=80',
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
      image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80',
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
      image: 'https://images.unsplash.com/photo-1558913650-847ba8491823?auto=format&fit=crop&w=800&q=80',
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
      verifiedByCommunity: {
        status: 'Muy Alta Accesibilidad',
        lastCheck: 'Hace 5 días',
        userCount: 45
      },
      location: { latitude: 39.4582, longitude: -0.3503 }
    }
  ]
};
