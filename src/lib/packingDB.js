import { getVisaInfo } from '@/lib/visaMatrix';
import { getCountryMeta, getCountryIso, normalizeCountry } from '@/lib/countryConfig';

/**
 * packingDB.js — Base de datos global de requisitos de viaje
 * Cobertura: 205 países — Visa, Enchufe, Vacunas, Moneda
 * Pasaportes: ES/UE, US, UK, AU, CA, JP, KR, IN, CN, RU + 19 LATAM individuales
 */


// Mapa nombre español → ISO para fallback de visaDB
const DEST_NAME_TO_ISO = {
  'España':'ES','Francia':'FR','Alemania':'DE','Italia':'IT','Portugal':'PT',
  'Reino Unido':'GB','Estados Unidos':'US','Canadá':'CA','México':'MX',
  'Argentina':'AR','Brasil':'BR','Chile':'CL','Colombia':'CO','Perú':'PE',
  'Venezuela':'VE','Ecuador':'EC','Bolivia':'BO','Paraguay':'PY','Uruguay':'UY',
  'Cuba':'CU','Rep. Dominicana':'DO','República Dominicana':'DO','Costa Rica':'CR',
  'Panamá':'PA','Guatemala':'GT','Honduras':'HN','El Salvador':'SV','Nicaragua':'NI',
  'Japón':'JP','China':'CN','Corea del Sur':'KR','India':'IN','Australia':'AU',
  'Nueva Zelanda':'NZ','Singapur':'SG','Tailandia':'TH','Vietnam':'VN',
  'Indonesia':'ID','Filipinas':'PH','Malasia':'MY','Camboya':'KH',
  'Marruecos':'MA','Egipto':'EG','Sudáfrica':'ZA','Kenia':'KE',
  'Turquía':'TR','Rusia':'RU','Ucrania':'UA','Polonia':'PL',
  'Países Bajos':'NL','Bélgica':'BE','Suecia':'SE','Noruega':'NO',
  'Dinamarca':'DK','Finlandia':'FI','Austria':'AT','Suiza':'CH',
  'Grecia':'GR','República Checa':'CZ','Hungría':'HU','Rumanía':'RO',
  'Croacia':'HR','Tailandia':'TH','Sri Lanka':'LK','Nepal':'NP',
  'Pakistán':'PK','Bangladesh':'BD','Irán':'IR','Irak':'IQ',
  'Israel':'IL','Jordania':'JO','Emiratos Árabes':'AE','Arabia Saudita':'SA',
  'Catar':'QA','Kuwait':'KW','Líbano':'LB','Islandia':'IS',
  'Irlanda':'IE','Luxemburgo':'LU','Malta':'MT','Chipre':'CY',
  'Eslovaquia':'SK','Eslovenia':'SI','Estonia':'EE','Letonia':'LV',
  'Lituania':'LT','Bulgaria':'BG','Serbia':'RS','Albania':'AL',
  'Montenegro':'ME','Macedonia del Norte':'MK','Bosnia':'BA',
  'Kosovo':'XK','Moldova':'MD','Bielorrusia':'BY','Georgia':'GE',
  'Armenia':'AM','Azerbaiyán':'AZ','Kazajistán':'KZ','Uzbekistán':'UZ',
  'Mongolia':'MN','Taiwán':'TW','Hong Kong':'HK',
  'Argelia':'DZ','Túnez':'TN','Libia':'LY','Sudán':'SD',
  'Etiopía':'ET','Ghana':'GH','Senegal':'SN','Tanzania':'TZ',
  'Uganda':'UG','Zimbabue':'ZW','Mozambique':'MZ','Angola':'AO',
  'Camerún':'CM','Costa de Marfil':'CI','Madagascar':'MG','Mali':'ML',
  'Nigeria':'NG','Congo':'CG','Zambia':'ZM','Kenia':'KE',
};

export const SKIP_VACCINES = [
  'COVID-19', 'COVID-19 (mRNA)',
  'MMR', 'Measles', 'Mumps', 'Rubella',
  'Varicella', 'Chickenpox',
  'Polio', 'IPV', 'OPV',
  'Tetanus', 'Td', 'Td/Tdap', 'Tdap', 'DTP', 'DTaP',
  'Influenza', 'Flu',
  'Pneumococcal', 'Meningococcal ACWY',
];

export const COUNTRY_REQUIREMENTS = {

  'España': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro (EUR).' },
    tips: ['El 112 funciona en toda España.'],
    emergency: '112'
  },

  'Francia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo E', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro. Tarjeta aceptada en casi todo.' },
    tips: ['Museos gratuitos primer domingo de mes.'],
    emergency: '112 · 17 · 15'
  },

  'Italia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F · Tipo L', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro. Lleva efectivo en zonas rurales.' },
    tips: ['Reserva el Vaticano con antelación.', 'Valida siempre el billete de tren.'],
    emergency: '112 · 118 · 113'
  },

  'Portugal': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro.' },
    tips: ['Cuidado carteristas en tranvías de Lisboa.'],
    emergency: '112'
  },

  'Alemania': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro. Efectivo muy usado.' },
    tips: ['Muchos locales solo efectivo.'],
    emergency: '112 · 110'
  },

  'Países Bajos': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro.' },
    tips: ['Cuidado con carriles bici en Amsterdam.'],
    emergency: '112'
  },

  'Bélgica': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo E', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro.' },
    tips: ['Sede de la UE — controles frecuentes.'],
    emergency: '112 · 101 · 100'
  },

  'Austria': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro.' },
    tips: ['Vienna City Card para museos y transporte.'],
    emergency: '112 · 133 · 144'
  },

  'Grecia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Euro. Islas pequeñas: lleva efectivo.' },
    tips: ['Reserva ferrys entre islas con antelación.'],
    emergency: '112 · 100 · 166'
  },

  'Suecia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Corona sueca (SEK). País cashless.' },
    tips: ['Stockholm Card para museos.'],
    emergency: '112'
  },

  'Noruega': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Corona noruega (NOK). País muy caro.' },
    tips: ['Ferrys fiordos: reserva semanas antes.'],
    emergency: '112 · 02800 · 113'
  },

  'Dinamarca': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F · Tipo K', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Corona danesa (DKK). No usan euro.' },
    tips: ['Copenhague: alquila una bici.'],
    emergency: '112'
  },

  'Finlandia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro.' },
    tips: ['Saunas: experiencia cultural fundamental.'],
    emergency: '112'
  },

  'Polonia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo E', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Esloti (PLN). No usan euro.' },
    tips: ['Cracovia y Varsovia muy asequibles.'],
    emergency: '112 · 997 · 999'
  },

  'República Checa': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo E', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Corona checa (CZK). No usan euro.' },
    tips: ['Paga en coronas, no en euros.'],
    emergency: '112 · 158 · 155'
  },

  'Hungría': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Forinto (HUF). No usan euro.' },
    tips: ['Baños termales: Széchenyi y Gellért.'],
    emergency: '112 · 107 · 104'
  },

  'Rumanía': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Lei (RON). No usan euro aún.' },
    tips: ['Transilvania: Brasov y Sinaia.'],
    emergency: '112'
  },

  'Bulgaria': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Lev (BGN). No usan euro.' },
    tips: ['Costa Mar Negro: muy asequible en verano.'],
    emergency: '112'
  },

  'Croacia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Euro (desde enero 2023).' },
    tips: ['Reserva ferrys en verano con antelación.'],
    emergency: '112 · 192 · 194'
  },

  'Eslovenia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro.' },
    tips: ['Lago Bled: impresionante pero concurrido.'],
    emergency: '112 · 113'
  },

  'Eslovaquia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo E', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro.' },
    tips: ['Tatras: senderismo espectacular.'],
    emergency: '112'
  },

  'Estonia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro.' },
    tips: ['Tallin: casco medieval muy conservado.'],
    emergency: '112'
  },

  'Letonia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro.' },
    tips: ['Riga: arquitectura Art Nouveau.'],
    emergency: '112'
  },

  'Lituania': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro.' },
    tips: ['Vilnius: barrio barroco bien conservado.'],
    emergency: '112'
  },

  'Luxemburgo': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro.' },
    tips: ['Transporte público gratuito en todo el país.'],
    emergency: '112'
  },

  'Malta': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro.' },
    tips: ['Enchufe tipo G — adaptador necesario.'],
    emergency: '112'
  },

  'Chipre': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro.' },
    tips: ['Isla dividida — norte requiere cruzar frontera.'],
    emergency: '112'
  },

  'Islandia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Corona islandesa (ISK). País muy caro.' },
    tips: ['Anillo de Ruta 1 imprescindible.', 'Auroras sep-mar.'],
    emergency: '112'
  },

  'Suiza': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo J', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Franco suizo (CHF). Todo muy caro.' },
    tips: ['Swiss Travel Pass si usas mucho el tren.'],
    emergency: '112 · 117 · 144'
  },

  'Liechtenstein': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo J', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Franco suizo (CHF).' },
    tips: ['Accede por tren desde Suiza o Austria.'],
    emergency: '112'
  },

  'Andorra': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro (sin ser UE).' },
    tips: ['Compras libres de impuestos.'],
    emergency: '112'
  },

  'Mónaco': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro.' },
    tips: ['Visita de un día desde Niza.'],
    emergency: '112 · 17'
  },

  'San Marino': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro.' },
    tips: ['Acceso desde Rimini, Italia.'],
    emergency: '113'
  },

  'Ciudad del Vaticano': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa · Acceso libre via Italia'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro.' },
    tips: ['Reservar Museos Vaticanos online.'],
    emergency: '112'
  },

  'Reino Unido': {
    visa: {
      ES: 'eta', US: 'eta', UK: false, AU: 'eta', CA: 'eta', JP: 'eta', KR: 'eta',
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: null, info: 'ES/UE: ETA electrónica · ETA desde 2024 para VWP. LATAM: Standard Visitor Visa.'
    },
    adapter: { needed: true, type: 'Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Libra (GBP). Tarjeta ampliamente aceptada.' },
    tips: ['ETA en gov.uk.', 'Circulación por la izquierda.', 'Oyster Card para Londres.'],
    emergency: '999 · 112'
  },

  'Irlanda': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: false, info: 'ES/UE: sin visa · No es Schengen. LATAM necesita visa aunque vaya a la UE.'
    },
    adapter: { needed: true, type: 'Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro.' },
    tips: ['No Schengen — control de pasaporte.', 'Clima cambiante — impermeable siempre.'],
    emergency: '112 · 999'
  },

  'Turquía': {
    visa: {
      ES: 'evisa', US: 'evisa', UK: 'evisa', AU: 'evisa', CA: 'evisa', JP: false, KR: false,
      IN: 'evisa', CN: true, RU: false,
      LATAM: {free:['AR','BR','CL','CO','MX','PA','PE','PY','UY'],evisa:['EC'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: e-Visa · e-Visa ~$50 en evisa.gov.tr. JP/KR y varios LATAM sin visa.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Lira turca (TRY).' },
    tips: ['e-Visa antes de viajar.', 'Gran Bazar cierra domingos.', 'JP/KR sin visa.'],
    emergency: '112 · 155'
  },

  'Serbia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: false,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Dinar serbio (RSD). Efectivo.' },
    tips: ['Belgrado: vida nocturna increíble.'],
    emergency: '112 · 192 · 194'
  },

  'Albania': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: false,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Lek albanés (ALL). Efectivo.' },
    tips: ['Riviera albanesa: playas sin masificar.'],
    emergency: '112'
  },

  'Bosnia y Herzegovina': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: false,
      LATAM: {free:['AR','BR','CL','MX','UY'],required:['CO','EC','PA','PE','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Marco bosnio (BAM).' },
    tips: ['Mostar: puente otomano impresionante.'],
    emergency: '112'
  },

  'Montenegro': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: false,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro (aunque no es UE).' },
    tips: ['Kotor: bahía impresionante.'],
    emergency: '112'
  },

  'Macedonia del Norte': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: false,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Denar macedonio (MKD).' },
    tips: ['Ohrid: lago Patrimonio UNESCO.'],
    emergency: '112'
  },

  'Kosovo': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','MX'],required:['CO','EC','PA','PE','PY','UY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Euro.' },
    tips: ['País reconocido por ~100 países.'],
    emergency: '112'
  },

  'Georgia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],voa:['VE'],required:['BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa · 1 año sin visa para muchos. India y China también libres.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 220V/50Hz' },
    vaccines: [],
    currency: { info: 'Lari (GEL). Asequible.' },
    tips: ['Tbilisi: mezcla oriental y occidental.', 'Vinos georgianos: los más antiguos del mundo.'],
    emergency: '112'
  },

  'Armenia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: 'voa', CN: 'voa', RU: false,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],voa:['VE'],required:['BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Dram (AMD). Asequible.' },
    tips: ['Lago Sevan: impresionante a 2000m.'],
    emergency: '112'
  },

  'Azerbaiyán': {
    visa: {
      ES: 'evisa', US: 'evisa', UK: 'evisa', AU: 'evisa', CA: 'evisa', JP: 'evisa', KR: 'evisa',
      IN: 'evisa', CN: 'evisa', RU: false,
      LATAM: {evisa:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: e-Visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Manat (AZN).' },
    tips: ['e-Visa en evisa.gov.az.', 'Bakú: arquitectura moderna y UNESCO.'],
    emergency: '112'
  },

  'Moldavia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: false,
      LATAM: {free:['AR','BR','CL','MX','UY'],required:['CO','EC','PA','PE','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Leu moldavo (MDL).' },
    tips: ['Chisinau: ciudad auténtica y poco visitada.', 'Vinos excelentes.'],
    emergency: '112'
  },

  'Ucrania': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','MX','UY'],required:['CO','EC','PA','PE','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa · ZONA DE GUERRA ACTIVA — no viajar.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Grivna (UAH).' },
    tips: ['ZONA DE GUERRA — no viajar bajo ninguna circunstancia.'],
    emergency: '112'
  },

  'Bielorrusia': {
    visa: {
      ES: 'evisa', US: true, UK: true, AU: true, CA: true, JP: 'evisa', KR: 'evisa',
      IN: true, CN: true, RU: false,
      LATAM: {required:'all'},
      needed: null, info: 'ES/UE: e-Visa · US: visado requerido'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Rublo bielorruso (BYN).' },
    tips: ['Régimen autoritario — no recomendado viajar.'],
    emergency: '112'
  },

  'Rusia': {
    visa: {
      ES: 'evisa', US: true, UK: true, AU: true, CA: true, JP: 'evisa', KR: 'evisa',
      IN: true, CN: false, RU: false,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY','CU'],required:['VE','BO','HN','NI','SV','GT','HT','DO']},
      needed: null, info: 'ES/UE: e-Visa · US: visado requerido · Sanciones vigentes — tarjetas occidentales no aceptadas. China y Cuba sin visa.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Rublo (RUB). Tarjetas occidentales bloqueadas.' },
    tips: ['Verificar restricciones de tu país antes de viajar.'],
    emergency: '112'
  },

  'Groenlandia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F · Tipo K', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Corona danesa (DKK).' },
    tips: ['Territorio danés — reglas Schengen.', 'Vuelos muy caros.'],
    emergency: '112'
  },

  'Islas Feroe': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F · Tipo K', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Corona feroesa (DKK).' },
    tips: ['Naturaleza espectacular.', 'Solo vuelos desde Copenhague y pocas ciudades.'],
    emergency: '112'
  },

  'Gibraltar': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','MX'],required:['CO','EC','PA','PE','PY','UY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Libra gibraltareña (GIP).' },
    tips: ['Territorio británico. Monos de Berbería icónicos.'],
    emergency: '112 · 199'
  },

  'Estados Unidos': {
    visa: {
      ES: 'esta', US: false, UK: 'esta', AU: 'esta', CA: false, JP: 'esta', KR: 'esta',
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: null, info: 'ES/UE: ESTA · US: sin visa · ESTA en esta.cbp.dhs.gov para VWP. Todos los LATAM necesitan visa B1/B2.'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 120V/60Hz' },
    vaccines: [],
    currency: { info: 'Dólar (USD). Tarjeta universal.' },
    tips: ['Seguro médico imprescindible.', 'Propina 18-20% por costumbre.'],
    emergency: '911'
  },

  'Canadá': {
    visa: {
      ES: 'eta', US: false, UK: 'eta', AU: 'eta', CA: false, JP: 'eta', KR: 'eta',
      IN: true, CN: true, RU: true,
      LATAM: {eta:['MX'],required:['AR','BR','CL','CO','EC','PA','PE','PY','UY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: ETA electrónica · US: sin visa · eTA para VWP. MX tiene eTA desde 2016. Resto LATAM visa requerida.'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 120V/60Hz' },
    vaccines: [],
    currency: { info: 'Dólar canadiense (CAD).' },
    tips: ['Clima extremo en invierno — prepárate.'],
    emergency: '911'
  },

  'México': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa · Puertas abiertas — todos sin visa hasta 180 días.'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 127V/60Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Peso mexicano (MXN).' },
    tips: ['Agua: solo embotellada.', 'Adaptador si vienes de Europa.'],
    emergency: '911 · 080'
  },

  'Argentina': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo I', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Peso argentino (ARS). Usa apps para tipo de cambio.' },
    tips: ['Adaptador tipo I (como Australia).', 'Carne y vinos excepcionales.'],
    emergency: '911 · 101 · 107'
  },

  'Brasil': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo N', info: 'Voltaje: 127V/220V' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'recomendada si visitas la Amazonia' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'recomendada si visitas la Amazonia' }],
    currency: { info: 'Real (BRL).' },
    tips: ['Enchufe tipo N — adaptador universal.', 'No saques móvil en la calle.'],
    emergency: '190 · 192 · 193'
  },

  'Chile': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo L', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Peso chileno (CLP).' },
    tips: ['Patagonia: reserva excursiones con meses de antelación.'],
    emergency: '133 · 131 · 132'
  },

  'Colombia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 110V/60Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria si vienes de zona endémica o visitas selva' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Peso colombiano (COP).' },
    tips: ['Enchufes como EEUU — adaptador si vienes de Europa.'],
    emergency: '112 · 123'
  },

  'Perú': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B · Tipo C', info: 'Voltaje: 220V/60Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'recomendada si visitas la Amazonia' }, { name: 'Malaria (quimioprofilaxis)', priority: 'recomendada si visitas la Amazonia' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Sol peruano (PEN). Efectivo en zonas rurales.' },
    tips: ['Machu Picchu: reserva con meses de antelación.', 'Cusco 3400m — aclimatarse 2 días.'],
    emergency: '105 · 117'
  },

  'Uruguay': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo F · Tipo I', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Peso uruguayo (UYU). País caro para LATAM.' },
    tips: ['País más seguro y moderno de LATAM.'],
    emergency: '911'
  },

  'Paraguay': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo I', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Guaraní (PYG).' },
    tips: ['Ciudad del Este: compras libres de impuestos.'],
    emergency: '911'
  },

  'Bolivia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B · Tipo C', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — zonas bajas tropicales' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }],
    currency: { info: 'Boliviano (BOB). Efectivo necesario.' },
    tips: ['Salar de Uyuni imprescindible.', 'La Paz 3600m — mal de altura.'],
    emergency: '110 · 118'
  },

  'Ecuador': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa · Puertas abiertas — sin visa para casi todos.'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 120V/60Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'recomendada si visitas la Amazonia' }, { name: 'Malaria (quimioprofilaxis)', priority: 'recomendada si visitas la Amazonia' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Dólar (USD).' },
    tips: ['Galápagos: tarifa ~$200 — reserva con antelación.'],
    emergency: '911'
  },

  'Venezuela': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 120V/60Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — zonas fronterizas' }],
    currency: { info: 'Bolívar (VES). USD ampliamente aceptado.' },
    tips: ['Lleva dólares en efectivo.'],
    emergency: '911'
  },

  'Costa Rica': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 120V/60Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — zonas costeras' }],
    currency: { info: 'Colón (CRC). USD aceptado.' },
    tips: ['Biodiversidad increíble — 5% de la fauna mundial.'],
    emergency: '911'
  },

  'Panamá': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 120V/60Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — zonas indígenas remotas' }],
    currency: { info: 'Dólar (USD) y Balboa (PAB).' },
    tips: ['Canal de Panamá: visita Miraflores.'],
    emergency: '911'
  },

  'Guatemala': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 120V/60Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }],
    currency: { info: 'Quetzal (GTQ).' },
    tips: ['Antigua: ciudad colonial UNESCO.', 'Tikal: ruinas mayas en la jungla.'],
    emergency: '110 · 123'
  },

  'Honduras': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 110V/60Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — zonas costeras' }],
    currency: { info: 'Lempira (HNL).' },
    tips: ['Islas de la Bahía: arrecife impresionante.'],
    emergency: '199 · 195'
  },

  'El Salvador': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 115V/60Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Dólar (USD) y Bitcoin.' },
    tips: ['Bitcoin de curso legal.', 'Surf en El Tunco muy popular.'],
    emergency: '911'
  },

  'Nicaragua': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 120V/60Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — zonas rurales' }],
    currency: { info: 'Córdoba (NIO).' },
    tips: ['Verificar avisos oficiales antes de viajar.'],
    emergency: '118 · 128'
  },

  'Belice': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo B · Tipo G', info: 'Voltaje: 110V/60Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — zonas rurales' }],
    currency: { info: 'Dólar de Belice (BZD).' },
    tips: ['Barrera de coral: segunda más grande del mundo.'],
    emergency: '911'
  },

  'Cuba': {
    visa: {
      ES: false, US: true, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa · US: visado requerido · US: restricciones legales para turismo. ES/EU: tarjeta turista ~$25.'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B · Tipo C', info: 'Voltaje: 110V/60Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Peso cubano (CUP). Dólares convertibles en CADECA.' },
    tips: ['Wi-Fi muy limitado — tarjetas ETECSA.', 'Seguro médico obligatorio para entrada.'],
    emergency: '106 · 104'
  },

  'República Dominicana': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa · Tarjeta turista incluida en el vuelo para la mayoría.'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 110V/60Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Peso dominicano (DOP). USD aceptado.' },
    tips: ['Santo Domingo: ciudad colonial UNESCO.'],
    emergency: '911'
  },

  'Haití': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 110V/60Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — riesgo moderado' }],
    currency: { info: 'Gourde (HTG).' },
    tips: ['Zona de riesgo — verificar avisos antes de viajar.'],
    emergency: '114'
  },

  'Jamaica': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 110V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Dólar jamaicano (JMD). USD aceptado.' },
    tips: ['Negril: mejores playas.'],
    emergency: '119'
  },

  'Trinidad y Tobago': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B · Tipo G', info: 'Voltaje: 115V/60Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Dólar TT (TTD).' },
    tips: ['Trinidad: carnaval famoso.', 'Tobago: playas más tranquilas.'],
    emergency: '999'
  },

  'Bahamas': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 120V/60Hz' },
    vaccines: [],
    currency: { info: 'Dólar bahameño (BSD) = USD.' },
    tips: ['Exuma: cerdos nadadores únicos.'],
    emergency: '911'
  },

  'Barbados': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B · Tipo G', info: 'Voltaje: 115V/50Hz' },
    vaccines: [],
    currency: { info: 'Dólar de Barbados (BBD) = 0.5 USD.' },
    tips: ['Isla caribeña tranquila y segura.'],
    emergency: '211'
  },

  'Granada': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Dólar del Caribe Oriental (XCD).' },
    tips: ['La isla de la especia — nuez moscada.'],
    emergency: '911'
  },

  'Dominica': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo D · Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Dólar del Caribe Oriental (XCD).' },
    tips: ['La Nature Island del Caribe.'],
    emergency: '999'
  },

  'Santa Lucía': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Dólar del Caribe Oriental (XCD).' },
    tips: ['Pitons: volcanes gemelos UNESCO.'],
    emergency: '999'
  },

  'San Vicente y las Granadinas': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B · Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Dólar del Caribe Oriental (XCD).' },
    tips: ['Ideal para vela y navegación.'],
    emergency: '999'
  },

  'Saint Kitts y Nevis': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B · Tipo D', info: 'Voltaje: 230V/60Hz' },
    vaccines: [],
    currency: { info: 'Dólar del Caribe Oriental (XCD).' },
    tips: ['Ciudadanía por inversión disponible.'],
    emergency: '911'
  },

  'Antigua y Barbuda': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 230V/60Hz' },
    vaccines: [],
    currency: { info: 'Dólar del Caribe Oriental (XCD).' },
    tips: ['365 playas — una para cada día del año.'],
    emergency: '999'
  },

  'Guyana': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY','VE'],required:['EC','PA','PY','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B · Tipo D · Tipo G', info: 'Voltaje: 240V/60Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — zonas selváticas' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Dólar de Guyana (GYD).' },
    tips: ['Cataratas Kaieteur: 5x más altas que Niágara.'],
    emergency: '911'
  },

  'Surinam': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo F', info: 'Voltaje: 127V/60Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — zonas interiores' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Dólar surinamés (SRD).' },
    tips: ['Paramaribo: capital UNESCO.'],
    emergency: '115 · 113'
  },

  'Aruba': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B · Tipo F', info: 'Voltaje: 127V/60Hz' },
    vaccines: [],
    currency: { info: 'Florin arubeño (AWG). USD ampliamente aceptado.' },
    tips: ['Fuera de la zona de huracanes del Caribe.'],
    emergency: '911'
  },

  'Curazao': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B · Tipo F', info: 'Voltaje: 127V/60Hz' },
    vaccines: [],
    currency: { info: 'Florín antillano (ANG).' },
    tips: ['Willemstad: arquitectura neerlandesa UNESCO.'],
    emergency: '912'
  },

  'Japón': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PA','PE','UY'],required:['EC','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 100V/50-60Hz' },
    vaccines: [],
    currency: { info: 'Yen (JPY). País mayoritariamente efectivo — lleva suficiente.' },
    tips: ['Suica/Pasmo card para transporte.', 'JR Pass si viajas entre ciudades.', 'Quitar zapatos al entrar en casas y algunos restaurantes.'],
    emergency: '110 · 119'
  },

  'Corea del Sur': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','UY'],required:['PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 220V/60Hz' },
    vaccines: [],
    currency: { info: 'Won (KRW). Tarjeta ampliamente aceptada.' },
    tips: ['T-money card para transporte.', 'DMZ: visita histórica a la frontera.'],
    emergency: '112 · 119'
  },

  'China': {
    visa: {
      ES: false, US: true, UK: true, AU: true, CA: true, JP: true, KR: false,
      IN: true, CN: false, RU: false,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa · US: visado requerido · ES: 15 días sin visa desde 2024. US/UK/AU/CA/JP necesitan visa. KR sin visa.'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo C · Tipo I', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Yuan Renminbi (CNY). WeChat Pay/Alipay en ciudades.' },
    tips: ['VPN imprescindible — Google/WhatsApp bloqueados.', 'WeChat indispensable para pagar y comunicarse.'],
    emergency: '110 · 120 · 119'
  },

  'Taiwán': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','MX','PY','UY'],required:['CO','EC','PA','PE','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 110V/60Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Nuevo Dólar de Taiwán (TWD).' },
    tips: ['EasyCard para transporte.', 'Street food en mercados nocturnos imprescindible.'],
    emergency: '110 · 119'
  },

  'Hong Kong': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','UY'],required:['PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa · India sin visa. China necesita Permiso de Viaje especial.'
    },
    adapter: { needed: true, type: 'Tipo G', info: 'Voltaje: 220V/50Hz' },
    vaccines: [],
    currency: { info: 'Dólar de Hong Kong (HKD).' },
    tips: ['Octopus Card para transporte.', 'MTR: uno de los mejores metros del mundo.'],
    emergency: '999'
  },

  'Macao': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: true, RU: false,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','UY'],required:['PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo B · Tipo D · Tipo G', info: 'Voltaje: 220V/50Hz' },
    vaccines: [],
    currency: { info: 'Pataca (MOP). HKD también válido.' },
    tips: ['Ferri desde Hong Kong (1h).', 'Casinos: solo mayores de 21.'],
    emergency: '999'
  },

  'Tailandia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa · ES 60 días. India/China/Rusia también sin visa.'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B · Tipo C', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — zonas fronterizas del norte' }, { name: 'Rabia', priority: 'recomendada si prevés contacto con animales' }, { name: 'Encefalitis japonesa', priority: 'recomendada para estancias largas en zonas rurales' }],
    currency: { info: 'Baht (THB). Efectivo muy usado.' },
    tips: ['Templos: ropa que cubra hombros y rodillas.', 'Evitar ofender a la monarquía — delito grave.'],
    emergency: '191 · 1669'
  },

  'Vietnam': {
    visa: {
      ES: 'evisa', US: 'evisa', UK: 'evisa', AU: 'evisa', CA: 'evisa', JP: 'evisa', KR: 'evisa',
      IN: 'evisa', CN: false, RU: false,
      LATAM: {evisa:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: e-Visa · e-Visa ~$25. CN/RU sin visa.'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo C · Tipo F', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Rabia', priority: 'recomendada si prevés contacto con animales' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — zonas rurales fronterizas' }],
    currency: { info: 'Dong (VND). Efectivo principalmente.' },
    tips: ['e-Visa en evisa.xuatnhapcanh.gov.vn.', 'Motocicletas: caos de tráfico — precaución al cruzar.'],
    emergency: '113 · 115'
  },

  'Indonesia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: 'voa', CN: 'voa', RU: false,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa · Sin visa 30d para 169 países. India/China VOA.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — fuera de Bali y Lombok' }, { name: 'Rabia', priority: 'recomendada — riesgo por monos y perros en Bali' }],
    currency: { info: 'Rupia (IDR). Efectivo en zonas menores.' },
    tips: ['Bali: templos, arroz y naturaleza.', 'Agua: solo embotellada.'],
    emergency: '110 · 118'
  },

  'Malasia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa · India, China, Rusia sin visa.'
    },
    adapter: { needed: true, type: 'Tipo G', info: 'Voltaje: 240V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — Borneo interior' }],
    currency: { info: 'Ringgit (MYR).' },
    tips: ['Kuala Lumpur: mezcla multicultural.', 'Borneo: orangutanes y naturaleza salvaje.'],
    emergency: '999'
  },

  'Singapur': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: 'evisa', RU: false,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa · China necesita eVisa.'
    },
    adapter: { needed: true, type: 'Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Dólar de Singapur (SGD). Todo con tarjeta.' },
    tips: ['Multarse por mascar chicle o tirar basura.', 'Gardens by the Bay: espectáculo de luces gratuito.'],
    emergency: '999'
  },

  'Filipinas': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: false,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa · Rusia sin visa.'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B · Tipo C', info: 'Voltaje: 220V/60Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — fuera de Manila' }, { name: 'Rabia', priority: 'recomendada si prevés contacto con animales' }],
    currency: { info: 'Peso filipino (PHP). Efectivo en islas.' },
    tips: ['7641 islas — El Nido y Palawan imprescindibles.', 'Temporada ciclones: jun-dic.'],
    emergency: '117 · 911'
  },

  'India': {
    visa: {
      ES: 'evisa', US: 'evisa', UK: 'evisa', AU: 'evisa', CA: 'evisa', JP: 'evisa', KR: 'evisa',
      IN: false, CN: true, RU: true,
      LATAM: {evisa:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY','VE','BO','HN','NI','SV','GT','DO'],required:['CU','HT']},
      needed: null, info: 'ES/UE: e-Visa'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo M', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Hepatitis B', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — zonas rurales y norte' }, { name: 'Rabia', priority: 'recomendada si prevés contacto con animales' }, { name: 'Encefalitis japonesa', priority: 'recomendada para estancias largas en zonas rurales' }],
    currency: { info: 'Rupia (INR). Efectivo en zonas rurales.' },
    tips: ['e-Visa en indianvisaonline.gov.in — mínimo 4 días antes.', 'Agua: SOLO embotellada.', 'Tren: reservar con semanas de antelación.'],
    emergency: '100 · 102'
  },

  'Nepal': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: false, CN: false, RU: 'voa',
      LATAM: {voa:'all'},
      needed: null, info: 'ES/UE: visa en llegada · VOA para casi todos. India y China sin visa.'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo M', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Rabia', priority: 'recomendada para senderistas' }],
    currency: { info: 'Rupia nepalesa (NPR). Efectivo.' },
    tips: ['VOA en Tribhuvan Airport.', 'EBC: aclimatarse mínimo 14 días.', 'Agua: SOLO embotellada.'],
    emergency: '100 · 102'
  },

  'Sri Lanka': {
    visa: {
      ES: 'eta', US: 'eta', UK: 'eta', AU: 'eta', CA: 'eta', JP: 'eta', KR: 'eta',
      IN: false, CN: 'eta', RU: 'eta',
      LATAM: {eta:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY','DO'],required:['VE','BO','HN','NI','SV','GT','CU','HT']},
      needed: null, info: 'ES/UE: ETA electrónica · ETA ~$20 en eta.gov.lk. India sin visa.'
    },
    adapter: { needed: true, type: 'Tipo D · Tipo G · Tipo M', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }],
    currency: { info: 'Rupia de Sri Lanka (LKR).' },
    tips: ['Sigiriya Rock: fortaleza impresionante.', 'Tren Colombo-Kandy: viaje escénico.'],
    emergency: '118 · 110'
  },

  'Bangladés': {
    visa: {
      ES: 'voa', US: 'evisa', UK: 'evisa', AU: 'evisa', CA: 'evisa', JP: 'evisa', KR: 'evisa',
      IN: false, CN: 'voa', RU: 'evisa',
      LATAM: {evisa:['BR','CL','CO','MX','PE','UY'],voa:['AR'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: visa en llegada · US: e-Visa · India sin visa.'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo G', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — Chittagong Hill Tracts' }],
    currency: { info: 'Taka (BDT). Efectivo.' },
    tips: ['Destino auténtico poco visitado.', 'Dhaka: una de las ciudades más densas del mundo.'],
    emergency: '999'
  },

  'Pakistán': {
    visa: {
      ES: 'evisa', US: 'evisa', UK: 'evisa', AU: 'evisa', CA: 'evisa', JP: 'evisa', KR: 'evisa',
      IN: true, CN: false, RU: 'evisa',
      LATAM: {evisa:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: e-Visa · China sin visa.'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo G · Tipo M', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Polio', priority: 'obligatoria para entrada' }],
    currency: { info: 'Rupia paquistaní (PKR). Efectivo.' },
    tips: ['e-Visa en visa.nadra.gov.pk.', 'K2 y Karakoram: paisajes espectaculares.', 'Vacuna polio obligatoria — llevar certificado.'],
    emergency: '15 · 115'
  },

  'Maldivas': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: 'voa', CN: 'voa', RU: 'voa',
      LATAM: {voa:'all'},
      needed: null, info: 'ES/UE: visa en llegada · Todos sin visa — VOA gratuita 30 días.'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo D · Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Rufiyaa (MVR). USD en resorts.' },
    tips: ['Alcohol solo en resorts.', 'Reservar resorts de agua con mucha antelación.'],
    emergency: '119'
  },

  'Bután': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: false, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido · Visa especial + tasa $100/día. India sin visa.'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Ngultrum (BTN) = Rupia india.' },
    tips: ['Solo con tour organizado.', "Tiger's Nest: la visita más icónica."],
    emergency: '113 · 112'
  },

  'Mongolia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: false, RU: false,
      LATAM: {free:['MX'],evisa:['AR','BR','CL','CO','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa · CN y RU sin visa.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo E', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Rabia', priority: 'quimioprofilaxis recomendada — zonas rurales' }],
    currency: { info: 'Tögrög (MNT). Efectivo.' },
    tips: ['Gobi: desierto impresionante.', 'Experiencia en ger con nómadas.'],
    emergency: '102 · 103'
  },

  'Myanmar': {
    visa: {
      ES: 'evisa', US: 'evisa', UK: 'evisa', AU: 'evisa', CA: 'evisa', JP: 'evisa', KR: 'evisa',
      IN: true, CN: false, RU: false,
      LATAM: {evisa:['AR','BR','CL','CO','EC','MX','PE','UY'],required:['PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: e-Visa · Situación inestable tras golpe 2021. CN/RU sin visa.'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo F · Tipo G · Tipo I', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — zonas fronterizas' }, { name: 'Tifoidea', priority: 'recomendada' }],
    currency: { info: 'Kyat (MMK). Efectivo USD imprescindible.' },
    tips: ['Verificar avisos de seguridad.', 'Bagan: templos budistas impresionantes.'],
    emergency: '199 · 192'
  },

  'Camboya': {
    visa: {
      ES: 'evisa', US: 'evisa', UK: 'evisa', AU: 'evisa', CA: 'evisa', JP: 'evisa', KR: 'evisa',
      IN: 'evisa', CN: false, RU: false,
      LATAM: {evisa:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY','VE','BO','HN','NI','SV','GT','DO'],required:['CU','HT']},
      needed: null, info: 'ES/UE: e-Visa · CN/RU sin visa. e-Visa $36 en evisa.gov.kh.'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo C · Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — zonas rurales' }, { name: 'Rabia', priority: 'recomendada si prevés contacto con animales' }],
    currency: { info: 'Riel (KHR). USD ampliamente aceptado.' },
    tips: ['Angkor Wat: llegar a las 6am.', 'Minas antipersona: solo senderos marcados.'],
    emergency: '117 · 119'
  },

  'Laos': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: false, KR: false,
      IN: 'voa', CN: false, RU: false,
      LATAM: {voa:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: visa en llegada · JP/KR/CN/RU sin visa. VOA para la mayoría.'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B · Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — zonas rurales' }, { name: 'Encefalitis japonesa', priority: 'quimioprofilaxis recomendada — zonas rurales' }],
    currency: { info: 'Kip (LAK). Efectivo o USD.' },
    tips: ['Luang Prabang: ciudad UNESCO.', 'Ruta en barco por el Mekong.'],
    emergency: '191 · 195'
  },

  'Brunéi': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','MX','UY'],required:['CO','EC','PA','PE','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo G', info: 'Voltaje: 240V/50Hz' },
    vaccines: [],
    currency: { info: 'Dólar de Brunéi (BND). SGD también aceptado.' },
    tips: ['Alcohol prohibido.', 'Kampong Ayer: ciudad sobre el agua.'],
    emergency: '993 · 991'
  },

  'Timor Oriental': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: true, CN: true, RU: true,
      LATAM: {voa:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: visa en llegada'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo E · Tipo F · Tipo I', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Dólar (USD).' },
    tips: ['Destino auténtico y poco visitado.'],
    emergency: '112'
  },

  'Kazajistán': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: 'evisa', CN: false, RU: false,
      LATAM: {free:['AR','MX'],evisa:['BR','CL','CO','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa · AR/MX/CN/RU sin visa.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Tenge (KZT). Tarjeta en ciudades.' },
    tips: ['Nur-Sultan (Astana): arquitectura futurista.', 'Almaty: antigua capital cosmopolita.'],
    emergency: '112'
  },

  'Uzbekistán': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: 'evisa', CN: false, RU: false,
      LATAM: {free:['AR','MX'],evisa:['BR','CL','CO','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa · AR/MX/CN/RU sin visa.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }],
    currency: { info: 'Som (UZS). Efectivo.' },
    tips: ['Samarcanda y Bujará: Ruta de la Seda espectacular.'],
    emergency: '102 · 103'
  },

  'Kirguistán': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: 'evisa', CN: false, RU: false,
      LATAM: {free:['AR','MX'],evisa:['BR','CL','CO','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Som (KGS). Efectivo.' },
    tips: ['Lago Issyk-Kul: mar interior de montaña.'],
    emergency: '102 · 103'
  },

  'Tayikistán': {
    visa: {
      ES: 'evisa', US: 'evisa', UK: 'evisa', AU: 'evisa', CA: 'evisa', JP: 'evisa', KR: 'evisa',
      IN: 'evisa', CN: 'evisa', RU: false,
      LATAM: {evisa:['AR','CL','CO','MX','PE','UY'],required:['BR','EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: e-Visa · RU sin visa. e-Visa en evisa.tj.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }],
    currency: { info: 'Somoni (TJS). Efectivo.' },
    tips: ['Pamir Highway: una de las carreteras más espectaculares del mundo.'],
    emergency: '112'
  },

  'Turkmenistán': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido · Solo con tour organizado y carta de invitación.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Manat (TMT). Solo efectivo.' },
    tips: ['País muy cerrado.', 'Darvaza: cráter de gas en llamas.'],
    emergency: '02 · 03'
  },

  'Afganistán': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido · ZONA DE CONFLICTO EXTREMO — no viajar.'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo F', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Polio', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — zonas bajas' }],
    currency: { info: 'Afgani (AFN). Solo efectivo.' },
    tips: ['NO VIAJAR — control talibán desde 2021.'],
    emergency: '100 · 102'
  },

  'Israel': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo H', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Séquel (ILS). Tarjeta ampliamente aceptada.' },
    tips: ['Puede negar entrada con sellos de países árabes no reconocidos.', 'Seguridad estricta en aeropuertos.'],
    emergency: '100 · 101'
  },

  'Jordania': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: 'voa', CN: true, RU: 'voa',
      LATAM: {voa:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: visa en llegada'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Dinar jordano (JOD). País caro.' },
    tips: ['Jordan Pass incluye visa + Petra.', 'Petra: llegar a las 6am.'],
    emergency: '911'
  },

  'Arabia Saudí': {
    visa: {
      ES: 'evisa', US: 'evisa', UK: 'evisa', AU: 'evisa', CA: 'evisa', JP: 'evisa', KR: 'evisa',
      IN: 'evisa', CN: 'evisa', RU: 'evisa',
      LATAM: {evisa:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: e-Visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B · Tipo D · Tipo G', info: 'Voltaje: 127V/220V' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Riyal saudí (SAR). Tarjeta aceptada.' },
    tips: ['e-Visa en visa.mofa.gov.sa.', 'Alcohol prohibido.', 'Ropa modesta requerida.', 'La Meca y Medina: solo para musulmanes.'],
    emergency: '911 · 999'
  },

  'Emiratos Árabes Unidos': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa · 90d sin visa para la mayoría. India/China/Rusia también libres.'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Dírham (AED). Todo con tarjeta.' },
    tips: ['Alcohol solo en hoteles licenciados.', 'Ramadán: no comer/beber en público durante el día.'],
    emergency: '999'
  },

  'Qatar': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa · Sin visa para 80+ países. India/China/Rusia también libres.'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo G', info: 'Voltaje: 240V/50Hz' },
    vaccines: [],
    currency: { info: 'Riyal qatarí (QAR). Tarjeta aceptada.' },
    tips: ['Alcohol solo en hoteles licenciados.', 'Ropa modesta en espacios públicos.'],
    emergency: '999'
  },

  'Kuwait': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {evisa:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo G', info: 'Voltaje: 240V/50Hz' },
    vaccines: [],
    currency: { info: 'Dinar kuwaití (KWD). Moneda más valorada del mundo.' },
    tips: ['Alcohol totalmente prohibido.'],
    emergency: '112'
  },

  'Bahréin': {
    visa: {
      ES: 'evisa', US: 'evisa', UK: 'evisa', AU: 'evisa', CA: 'evisa', JP: 'evisa', KR: 'evisa',
      IN: 'evisa', CN: 'evisa', RU: 'evisa',
      LATAM: {evisa:['AR','BR','CL','CO','EC','MX','PE','UY'],required:['PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: e-Visa'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Dinar bareiní (BHD). Tarjeta aceptada.' },
    tips: ['e-Visa en evisa.gov.bh.', 'Conectado con Arabia Saudí por el puente King Fahd.'],
    emergency: '999'
  },

  'Omán': {
    visa: {
      ES: 'evisa', US: 'evisa', UK: 'evisa', AU: 'evisa', CA: 'evisa', JP: 'evisa', KR: 'evisa',
      IN: 'evisa', CN: 'evisa', RU: 'evisa',
      LATAM: {evisa:['AR','BR','CL','CO','EC','MX','PE','UY'],required:['PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: e-Visa'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo G', info: 'Voltaje: 240V/50Hz' },
    vaccines: [],
    currency: { info: 'Rial omaní (OMR). Tarjeta aceptada.' },
    tips: ['e-Visa en evisa.rop.gov.om.', 'Muscat: uno de los destinos más seguros de Oriente Medio.'],
    emergency: '9999'
  },

  'Irán': {
    visa: {
      ES: 'voa', US: true, UK: true, AU: true, CA: true, JP: 'voa', KR: 'voa',
      IN: 'voa', CN: false, RU: false,
      LATAM: {free:['CU'],voa:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','HT','DO']},
      needed: null, info: 'ES/UE: visa en llegada · US: visado requerido · US/UK/AU/CA: visa muy difícil. CN/RU sin visa. Cuba sin visa.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }],
    currency: { info: 'Rial iraní (IRR). Solo efectivo — sanciones.' },
    tips: ['Alcohol totalmente prohibido.', 'Velo obligatorio para mujeres.', 'Persépolis: ciudad persa impresionante.'],
    emergency: '110 · 115'
  },

  'Iraq': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: null, info: 'ES/UE: visa en llegada · Zona de riesgo — no recomendado turismo.'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }],
    currency: { info: 'Dinar iraquí (IQD). Solo efectivo.' },
    tips: ['Zona de riesgo — verificar avisos oficiales.'],
    emergency: '104 · 122'
  },

  'Siria': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido · ZONA DE GUERRA — NO VIAJAR.'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo E · Tipo L', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Libra siria (SYP).' },
    tips: ['ZONA DE GUERRA — no viajar bajo ninguna circunstancia.'],
    emergency: '110'
  },

  'Líbano': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: true, RU: false,
      LATAM: {free:['AR','BR','CL','MX','UY'],voa:['CO','EC','PE'],required:['PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa · India libre. China necesita visa. Situación inestable.'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Libra libanesa (LBP). USD muy usado.' },
    tips: ['Verificar avisos de seguridad.', 'Beirut: mezcla fascinante de culturas.'],
    emergency: '112 · 140'
  },

  'Palestina': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa · Acceso via Israel — controles estrictos.'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo H', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Séquel (ILS) y Dinar jordano (JOD).' },
    tips: ['Situación variable — consultar antes de viajar.'],
    emergency: '101'
  },

  'Corea del Norte': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido · Solo tours organizados. US y KR tienen prohibición. No fotografiar sin permiso.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Won norcoreano (KPW). Solo euros/CNY para turistas.' },
    tips: ['Solo agencias autorizadas.', 'No fotografiar sin permiso del guía.'],
    emergency: '119'
  },

  'Marruecos': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY','VE','BO','CU'],required:['HN','NI','SV','GT','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo E', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }],
    currency: { info: 'Dírham (MAD). Efectivo muy usado.' },
    tips: ['Regatear en souks es obligatorio.', 'Ropa modesta en zonas rurales.'],
    emergency: '19 · 15'
  },

  'Túnez': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','UY'],required:['PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo E', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Dinar tunecino (TND).' },
    tips: ['Medina de Túnez: laberinto fascinante.'],
    emergency: '197 · 190'
  },

  'Argelia': {
    visa: {
      ES: 'evisa', US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {free:['CU'],required:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY','VE','BO','HN','NI','SV','GT','HT','DO']},
      needed: null, info: 'ES/UE: e-Visa · US: visado requerido'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Dinar argelino (DZD). Solo efectivo.' },
    tips: ['Visado muy restrictivo para la mayoría.'],
    emergency: '17 · 21'
  },

  'Libia': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido · ZONA DE CONFLICTO — no viajar.'
    },
    adapter: { needed: true, type: 'Tipo D · Tipo L · Tipo M', info: 'Voltaje: 127V/220V' },
    vaccines: [{ name: 'COVID-19', priority: 'recomendada (check age and history)' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Influenza', priority: 'recomendada (seasonal and risk based)' }, { name: 'MMR', priority: 'recomendada (check age and history)' }, { name: 'Polio', priority: 'recomendada (check age and history)' }, { name: 'Td/Tdap', priority: 'recomendada (check age and history)' }, { name: 'Tetanus', priority: 'recomendada' }, { name: 'Varicella', priority: 'recomendada (check age and history)' }],
    currency: { info: 'Dinar libio (LYD).' },
    tips: ['NO VIAJAR — zona de conflicto.'],
    emergency: '193'
  },

  'Egipto': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: 'voa', CN: 'voa', RU: 'voa',
      LATAM: {voa:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: visa en llegada · VOA $25 en aeropuerto para la mayoría.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }],
    currency: { info: 'Libra egipcia (EGP). Efectivo muy usado.' },
    tips: ['VOA $25 en aeropuerto.', 'Agua: SOLO embotellada.'],
    emergency: '122 · 123'
  },

  'Sudán': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido · ZONA DE CONFLICTO — no viajar.'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'recomendada' }],
    currency: { info: 'Libra sudanesa (SDG).' },
    tips: ['NO VIAJAR — zona de conflicto.'],
    emergency: '999'
  },

  'Etiopía': {
    visa: {
      ES: 'evisa', US: 'evisa', UK: 'evisa', AU: 'evisa', CA: 'evisa', JP: 'evisa', KR: 'evisa',
      IN: 'evisa', CN: 'evisa', RU: 'evisa',
      LATAM: {evisa:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: e-Visa · e-Visa en evisa.gov.et.'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo E · Tipo F · Tipo L', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }],
    currency: { info: 'Birr etíope (ETB). Efectivo.' },
    tips: ['Lalibela: iglesias talladas en roca.', 'Addis Abeba a 2300m — aclimatarse.'],
    emergency: '991 · 907'
  },

  'Eritrea': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido · País muy cerrado — visa difícil.'
    },
    adapter: { needed: false, type: 'Tipo C', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Nakfa (ERN). Solo efectivo.' },
    tips: ['Asmara: arquitectura colonial italiana única.'],
    emergency: '114'
  },

  'Yibuti': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: 'voa', CN: 'voa', RU: 'voa',
      LATAM: {voa:'all'},
      needed: null, info: 'ES/UE: visa en llegada · VOA o evisa en evisa.gouv.dj.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo E', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Franco de Yibuti (DJF). USD aceptado.' },
    tips: ['Lago Assal: punto más bajo de África.'],
    emergency: '17 · 21'
  },

  'Somalia': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido · ZONA DE ALTO RIESGO — no viajar.'
    },
    adapter: { needed: false, type: 'Tipo C', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Chelín somalí (SOS). USD más usado.' },
    tips: ['NO VIAJAR.'],
    emergency: '888'
  },

  'Kenia': {
    visa: {
      ES: 'evisa', US: 'evisa', UK: 'evisa', AU: 'evisa', CA: 'evisa', JP: 'evisa', KR: 'evisa',
      IN: 'evisa', CN: 'evisa', RU: 'evisa',
      LATAM: {evisa:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: e-Visa · e-Visa en etims.go.ke — mínimo 3 días antes.'
    },
    adapter: { needed: true, type: 'Tipo G', info: 'Voltaje: 240V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }],
    currency: { info: 'Chelín keniata (KES). Tarjeta en ciudades.' },
    tips: ['Masai Mara: Gran Migración jul-oct.', 'Nairobi: no sacar móvil en la calle.'],
    emergency: '999'
  },

  'Uganda': {
    visa: {
      ES: 'evisa', US: 'evisa', UK: 'evisa', AU: 'evisa', CA: 'evisa', JP: 'evisa', KR: 'evisa',
      IN: 'evisa', CN: 'evisa', RU: 'evisa',
      LATAM: {evisa:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: e-Visa'
    },
    adapter: { needed: true, type: 'Tipo G', info: 'Voltaje: 240V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Chelín ugandés (UGX). Efectivo.' },
    tips: ['Permisos gorilas ($800) — reservar con mucha antelación.'],
    emergency: '999'
  },

  'Tanzania': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: 'voa', CN: 'voa', RU: 'voa',
      LATAM: {voa:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: visa en llegada · VOA $50 en aeropuerto.'
    },
    adapter: { needed: true, type: 'Tipo D · Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }],
    currency: { info: 'Chelín tanzano (TZS). Efectivo USD también.' },
    tips: ['Serengeti: Gran Migración jun-ago.', 'Kilimanjaro: reservar agencia con antelación.'],
    emergency: '112'
  },

  'Ruanda': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: 'voa', CN: 'voa', RU: 'voa',
      LATAM: {voa:'all'},
      needed: null, info: 'ES/UE: visa en llegada · VOA gratuita para todos.'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo J', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }],
    currency: { info: 'Franco ruandés (RWF). Tarjeta en Kigali.' },
    tips: ['Gorilas: permisos $1500 — reservar muy adelantado.', 'Kigali: ciudad más limpia de África.'],
    emergency: '112'
  },

  'Burundi': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: true, CN: 'voa', RU: 'voa',
      LATAM: {required:'all'},
      needed: null, info: 'ES/UE: visa en llegada'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo E', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Franco de Burundi (BIF). Efectivo.' },
    tips: ['Situación inestable — verificar avisos.'],
    emergency: '112'
  },

  'Mozambique': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: true, CN: true, RU: true,
      LATAM: {voa:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: visa en llegada'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo F · Tipo M', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Metical (MZN). Efectivo.' },
    tips: ['Ilha de Moçambique: UNESCO.', 'Bazaruto: archipiélago espectacular.'],
    emergency: '119'
  },

  'Zambia': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: 'voa', CN: true, RU: true,
      LATAM: {voa:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: visa en llegada'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Kwacha (ZMW). USD en zonas turísticas.' },
    tips: ['Cataratas Victoria: compartidas con Zimbabue.', 'KAZA UniVisa con Zimbabue.'],
    emergency: '991 · 993'
  },

  'Zimbabue': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: true, CN: true, RU: true,
      LATAM: {voa:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: visa en llegada'
    },
    adapter: { needed: true, type: 'Tipo D · Tipo G', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Dólar de Zimbabwe (ZWL). USD aceptado.' },
    tips: ['Cataratas Victoria: ver desde ambos lados.'],
    emergency: '999'
  },

  'Namibia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PE','UY'],required:['PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo D · Tipo M', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — norte y este' }],
    currency: { info: 'Dólar namibio (NAD) = Rand sudafricano.' },
    tips: ['Sossusvlei: dunas rojas impresionantes.', 'Etosha: safari de alto nivel.'],
    emergency: '10111 · 10177'
  },

  'Botsuana': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo D · Tipo G · Tipo M', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — norte (Okavango)' }],
    currency: { info: 'Pula (BWP). Tarjeta en ciudades.' },
    tips: ['Okavango Delta: UNESCO de alta gama.', 'Chobe: mayor concentración de elefantes de África.'],
    emergency: '999'
  },

  'Sudáfrica': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','UY'],required:['PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo M · Tipo N', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — Kruger y norte Limpopo' }],
    currency: { info: 'Rand (ZAR). Tarjeta ampliamente aceptada.' },
    tips: ['Conducción por la izquierda.', 'Kruger: safari de self-drive accesible.', 'Ciudad del Cabo: una de las más bellas del mundo.'],
    emergency: '10111 · 10177'
  },

  'Lesoto': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo M', info: 'Voltaje: 220V/50Hz' },
    vaccines: [],
    currency: { info: 'Loti (LSL) = Rand sudafricano.' },
    tips: ['País rodeado totalmente por Sudáfrica.'],
    emergency: '124 · 121'
  },

  'Esuatini': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo M', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Lilangeni (SZL) = Rand.' },
    tips: ['Último reino absoluto de África.'],
    emergency: '999'
  },

  'Madagascar': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: true, CN: true, RU: true,
      LATAM: {voa:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: visa en llegada'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo E', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Ariary (MGA). Efectivo.' },
    tips: ['90% de fauna única en el mundo.', 'Lémures: solo aquí.'],
    emergency: '117 · 124'
  },

  'Mauricio': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: true, RU: false,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa · India y Rusia sin visa. China necesita visa.'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Rupia mauriciana (MUR). Tarjeta aceptada.' },
    tips: ['Le Morne: laguna turquesa impresionante.'],
    emergency: '999'
  },

  'Seychelles': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: false, RU: false,
      LATAM: {free:'all'},
      needed: false, info: 'ES/UE: sin visa · Todos sin visa — permiso de visitante gratuito.'
    },
    adapter: { needed: true, type: 'Tipo G', info: 'Voltaje: 240V/50Hz' },
    vaccines: [],
    currency: { info: 'Rupia de Seychelles (SCR). Euro/USD aceptados.' },
    tips: ['115 islas — Praslin y La Digue las más impresionantes.'],
    emergency: '999'
  },

  'Comoras': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: 'voa', CN: 'voa', RU: 'voa',
      LATAM: {voa:'all'},
      needed: null, info: 'ES/UE: visa en llegada · VOA gratuita para todos.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo E', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Franco comorense (KMF).' },
    tips: ['Volcán Karthala: activo e imponente.'],
    emergency: '17'
  },

  'Angola': {
    visa: {
      ES: 'evisa', US: 'evisa', UK: 'evisa', AU: 'evisa', CA: 'evisa', JP: 'evisa', KR: 'evisa',
      IN: 'evisa', CN: false, RU: 'evisa',
      LATAM: {evisa:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: e-Visa · China sin visa.'
    },
    adapter: { needed: false, type: 'Tipo C', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Kwanza (AOA). USD/EUR usados.' },
    tips: ['Luanda: una de las ciudades más caras de África.'],
    emergency: '113 · 112'
  },

  'Ghana': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido · Visado requerido para casi todos.'
    },
    adapter: { needed: true, type: 'Tipo D · Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Meningitis meningocócica', priority: 'recomendada' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Cedi ghanés (GHS). Efectivo.' },
    tips: ['Accra: ciudad vibrante.', 'Castillos ruta de esclavos: historia impactante.'],
    emergency: '191 · 193'
  },

  'Nigeria': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido · Visado requerido — tramitar con antelación.'
    },
    adapter: { needed: true, type: 'Tipo D · Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Meningitis meningocócica', priority: 'recomendada' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Naira (NGN). Efectivo principalmente.' },
    tips: ['Lagos: megaciudad vibrante.', 'Norte: alto riesgo de inseguridad.'],
    emergency: '199 · 123'
  },

  'Senegal': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','UY'],required:['PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo E', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Meningitis meningocócica', priority: 'recomendada' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Franco CFA (XOF). Efectivo.' },
    tips: ['Dakar: ciudad costera vibrante.', 'Isla de Gorée: UNESCO — historia de esclavitud.'],
    emergency: '17 · 15'
  },

  'Costa de Marfil': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo E', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Franco CFA (XOF).' },
    tips: ['Abidján: capital económica de África occidental.'],
    emergency: '170 · 185'
  },

  'Gabón': {
    visa: {
      ES: 'evisa', US: 'evisa', UK: 'evisa', AU: 'evisa', CA: 'evisa', JP: 'evisa', KR: 'evisa',
      IN: 'evisa', CN: 'evisa', RU: 'evisa',
      LATAM: {evisa:'all'},
      needed: null, info: 'ES/UE: e-Visa · e-Visa obligatoria en evisa.dgdi.ga.'
    },
    adapter: { needed: false, type: 'Tipo C', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Franco CFA (XAF).' },
    tips: ['80% cubierto por selva tropical.'],
    emergency: '1730 · 1300'
  },

  'Congo': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo E', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Franco CFA (XAF).' },
    tips: ['No confundir con RD Congo.'],
    emergency: '117'
  },

  'República Democrática del Congo': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo E', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Cólera', priority: 'recomendada' }],
    currency: { info: 'Franco congoleño (CDF). Solo efectivo.' },
    tips: ['Alto riesgo en el este.', 'Gorilas en Virunga.'],
    emergency: '112'
  },

  'República Centroafricana': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido · Alto riesgo — no viajar sin seguridad.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo E', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Franco CFA (XAF). Solo efectivo.' },
    tips: ['Situación humanitaria muy compleja.'],
    emergency: '117'
  },

  'Chad': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido · ZONA DE ALTO RIESGO — no viajar.'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo E · Tipo F', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Meningitis meningocócica', priority: 'recomendada' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Franco CFA (XAF). Solo efectivo.' },
    tips: ['No viajar.'],
    emergency: '17'
  },

  'Mauritania': {
    visa: {
      ES: 'voa', US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: null, info: 'ES/UE: visa en llegada · US: visado requerido · VOA para ES. Resto necesita visa.'
    },
    adapter: { needed: false, type: 'Tipo C', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — sur del país' }, { name: 'Meningitis meningocócica', priority: 'recomendada' }],
    currency: { info: 'Uguiya (MRU). Efectivo.' },
    tips: ['Chinguetti: ciudad caravanera UNESCO.'],
    emergency: '17'
  },

  'Malí': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido · ZONA DE ALTO RIESGO — no viajar.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo E', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Meningitis meningocócica', priority: 'recomendada' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Franco CFA (XOF). Solo efectivo.' },
    tips: ['Timbuktu: acceso muy peligroso actualmente.'],
    emergency: '17 · 15'
  },

  'Níger': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido · Golpe 2023 — zona de alto riesgo.'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo E', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Meningitis meningocócica', priority: 'recomendada' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Franco CFA (XOF). Efectivo.' },
    tips: ['No viajar.'],
    emergency: '17'
  },

  'Burkina Faso': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido · ZONA DE ALTO RIESGO — no viajar.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo E', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Meningitis meningocócica', priority: 'recomendada' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Franco CFA (XOF). Efectivo.' },
    tips: ['Yihadismo activo.'],
    emergency: '17'
  },

  'Guinea': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo F · Tipo K', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Meningitis meningocócica', priority: 'recomendada' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Franco guineano (GNF). Efectivo.' },
    tips: ['Fouta Djallon: meseta y cataratas.'],
    emergency: '117'
  },

  'Guinea-Bisáu': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: 'voa', CN: 'voa', RU: 'voa',
      LATAM: {voa:'all'},
      needed: null, info: 'ES/UE: visa en llegada · VOA para todos.'
    },
    adapter: { needed: false, type: 'Tipo C', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Franco CFA (XOF). Efectivo.' },
    tips: ['Archipiélago Bijagós: paraíso ecológico.'],
    emergency: '117'
  },

  'Guinea Ecuatorial': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo E', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Franco CFA (XAF). Efectivo.' },
    tips: ['Malabo: capital en isla de Bioko.'],
    emergency: '114'
  },

  'Gambia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Dalasi (GMD). Efectivo.' },
    tips: ['País más pequeño del continente africano.'],
    emergency: '117'
  },

  'Sierra Leona': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo D · Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Leone (SLL). Efectivo.' },
    tips: ['Freetown: ciudad bulliciosa post-guerra civil.'],
    emergency: '999'
  },

  'Liberia': {
    visa: {
      ES: true, US: false, UK: false, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido · US: sin visa · US sin visa. ES necesita visa.'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 120V/60Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Dólar liberiano (LRD). USD muy usado.' },
    tips: ['Fundada por esclavos liberados de EEUU.'],
    emergency: '911'
  },

  'Togo': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: 'voa', CN: 'voa', RU: 'voa',
      LATAM: {voa:'all'},
      needed: null, info: 'ES/UE: visa en llegada · VOA en aeropuerto de Lomé para todos.'
    },
    adapter: { needed: false, type: 'Tipo C', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Franco CFA (XOF).' },
    tips: ['Lomé: capital con mercado voodoo.'],
    emergency: '117'
  },

  'Benín': {
    visa: {
      ES: 'evisa', US: 'evisa', UK: 'evisa', AU: 'evisa', CA: 'evisa', JP: 'evisa', KR: 'evisa',
      IN: 'evisa', CN: 'evisa', RU: 'evisa',
      LATAM: {evisa:'all'},
      needed: null, info: 'ES/UE: e-Visa · e-Visa para todos en evisa.gouv.bj.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo E', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Franco CFA (XOF). Efectivo.' },
    tips: ['Cuna del voodoo.', 'Ouidah: Festival Internacional del Voodoo.'],
    emergency: '117'
  },

  'Cabo Verde': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','EC','MX','PA','PE','UY'],required:['PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 220V/50Hz' },
    vaccines: [],
    currency: { info: 'Escudo caboverdiano (CVE). Euro aceptado.' },
    tips: ['Sal y Boavista: playa.', 'Santo Antão: naturaleza y montañas.'],
    emergency: '132 · 131'
  },

  'Santo Tomé y Príncipe': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: true, CN: true, RU: true,
      LATAM: {voa:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: null, info: 'ES/UE: visa en llegada'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Dobra (STN). Euro aceptado.' },
    tips: ['Cacao de altísima calidad.'],
    emergency: '112'
  },

  'Malaui': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: false, CN: true, RU: true,
      LATAM: {voa:['AR','BR','CL','CO','EC','MX','PA','PE','PY','UY'],required:['VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa · India sin visa.'
    },
    adapter: { needed: true, type: 'Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Kwacha de Malawi (MWK). Efectivo.' },
    tips: ['Lago Malawi: 3º más grande de África.'],
    emergency: '997 · 998'
  },

  'Sudán del Sur': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: null, info: 'ES/UE: visa en llegada · Alto riesgo — verificar avisos.'
    },
    adapter: { needed: true, type: 'Tipo C · Tipo D · Tipo G', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }],
    currency: { info: 'Libra sursudanesa (SSP).' },
    tips: ['Conflictos internos frecuentes.'],
    emergency: '911'
  },

  'Australia': {
    visa: {
      ES: 'eta', US: 'eta', UK: 'eta', AU: false, CA: 'eta', JP: 'eta', KR: 'eta',
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: null, info: 'ES/UE: ETA electrónica · ETA para VWP. LATAM necesita Visitor Visa (subclass 600).'
    },
    adapter: { needed: true, type: 'Tipo I', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Dólar australiano (AUD). Todo con tarjeta.' },
    tips: ['Conducción por la izquierda.', 'Fauna peligrosa — respetar advertencias locales.', 'Factor sol muy alto — protección solar.'],
    emergency: '000'
  },

  'Nueva Zelanda': {
    visa: {
      ES: 'nzeta', US: 'nzeta', UK: 'nzeta', AU: false, CA: 'nzeta', JP: 'nzeta', KR: 'nzeta',
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: null, info: 'ES/UE: NZeTA · NZeTA en nzeta.immigration.govt.nz. LATAM necesita visa de visitante.'
    },
    adapter: { needed: true, type: 'Tipo I', info: 'Voltaje: 230V/50Hz' },
    vaccines: [],
    currency: { info: 'Dólar neozelandés (NZD). Todo con tarjeta.' },
    tips: ['Conducción por la izquierda.', 'Fiordland y Milford Sound: imprescindibles.'],
    emergency: '111'
  },

  'Fiyi': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo I', info: 'Voltaje: 240V/50Hz' },
    vaccines: [],
    currency: { info: 'Dólar de Fiyi (FJD). USD/AUD en resorts.' },
    tips: ['333 islas.', 'Kava: bebida ceremonial tradicional.'],
    emergency: '917'
  },

  'Papúa Nueva Guinea': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: null, info: 'ES/UE: visa en llegada'
    },
    adapter: { needed: true, type: 'Tipo I', info: 'Voltaje: 240V/50Hz' },
    vaccines: [{ name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Encefalitis japonesa', priority: 'quimioprofilaxis recomendada — zonas rurales' }],
    currency: { info: 'Kina (PGK). Efectivo.' },
    tips: ['Zona de riesgo elevado — precauciones.', 'Aves del paraíso: habitat único.'],
    emergency: '000'
  },

  'Vanuatu': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','MX','UY'],required:['CO','EC','PA','PE','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo I', info: 'Voltaje: 230V/50Hz' },
    vaccines: [{ name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }],
    currency: { info: 'Vatu (VUV). Efectivo.' },
    tips: ['Archipiélago volcánico.', 'Buceo de primer nivel.'],
    emergency: '112'
  },

  'Samoa': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','MX','UY'],required:['CO','EC','PA','PE','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo I', info: 'Voltaje: 240V/50Hz' },
    vaccines: [],
    currency: { info: 'Tālā (WST). NZD también aceptado.' },
    tips: ['Cultura polinesea muy arraigada.'],
    emergency: '994 · 996'
  },

  'Tonga': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','MX','UY'],required:['CO','EC','PA','PE','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo I', info: 'Voltaje: 240V/50Hz' },
    vaccines: [],
    currency: { info: 'Paʻanga (TOP). AUD/NZD aceptados.' },
    tips: ['Nadar con ballenas jorobadas ago-oct.'],
    emergency: '922'
  },

  'Kiribati': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: null, info: 'ES/UE: visa en llegada'
    },
    adapter: { needed: true, type: 'Tipo I', info: 'Voltaje: 240V/50Hz' },
    vaccines: [],
    currency: { info: 'Dólar de Kiribati = AUD.' },
    tips: ['Amenazada por el cambio climático.'],
    emergency: '999'
  },

  'Tuvalu': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: null, info: 'ES/UE: visa en llegada'
    },
    adapter: { needed: true, type: 'Tipo I', info: 'Voltaje: 220V/50Hz' },
    vaccines: [],
    currency: { info: 'Dólar de Tuvalu = AUD.' },
    tips: ['País amenazado por subida del nivel del mar.'],
    emergency: '911'
  },

  'Nauru': {
    visa: {
      ES: true, US: true, UK: true, AU: true, CA: true, JP: true, KR: true,
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: true, info: 'ES/UE: visado requerido · Visado requerido — país muy poco visitado.'
    },
    adapter: { needed: true, type: 'Tipo I', info: 'Voltaje: 240V/50Hz' },
    vaccines: [],
    currency: { info: 'Dólar australiano (AUD).' },
    tips: ['País más pequeño del mundo insular.'],
    emergency: '110'
  },

  'Palaos': {
    visa: {
      ES: 'voa', US: false, UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: true, CN: true, RU: true,
      LATAM: {voa:'all'},
      needed: null, info: 'ES/UE: visa en llegada · US: sin visa · US sin visa. Resto VOA gratuita.'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 120V/60Hz' },
    vaccines: [],
    currency: { info: 'Dólar (USD).' },
    tips: ['Buceo de clase mundial — Jellyfish Lake único.'],
    emergency: '911'
  },

  'Micronesia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','MX','UY'],required:['CO','EC','PA','PE','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 120V/60Hz' },
    vaccines: [],
    currency: { info: 'Dólar (USD).' },
    tips: ['Truk Lagoon: buceo histórico WWII.'],
    emergency: '911'
  },

  'Islas Marshall': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','MX'],required:['CO','EC','PA','PE','PY','UY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo A · Tipo B', info: 'Voltaje: 120V/60Hz' },
    vaccines: [],
    currency: { info: 'Dólar (USD).' },
    tips: ['Bikini Atoll: UNESCO — sitio pruebas nucleares.'],
    emergency: '625-8666'
  },

  'Islas Salomón': {
    visa: {
      ES: 'voa', US: 'voa', UK: 'voa', AU: 'voa', CA: 'voa', JP: 'voa', KR: 'voa',
      IN: true, CN: true, RU: true,
      LATAM: {required:'all'},
      needed: null, info: 'ES/UE: visa en llegada'
    },
    adapter: { needed: true, type: 'Tipo G · Tipo I', info: 'Voltaje: 220V/50Hz' },
    vaccines: [{ name: 'Malaria (quimioprofilaxis)', priority: 'quimioprofilaxis recomendada — todo el país' }],
    currency: { info: 'Dólar de las Islas Salomón (SBD). Efectivo.' },
    tips: ['WWII: restos históricos en el mar.'],
    emergency: '999'
  },

  'Islas Cook': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','MX','UY'],required:['CO','EC','PA','PE','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa'
    },
    adapter: { needed: true, type: 'Tipo I', info: 'Voltaje: 240V/50Hz' },
    vaccines: [],
    currency: { info: 'Dólar de las Islas Cook = NZD.' },
    tips: ['Aitutaki: laguna de ensueño.'],
    emergency: '999'
  },

  'Polinesia Francesa': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa · Territorio francés.'
    },
    adapter: { needed: false, type: 'Tipo C · Tipo F', info: 'Voltaje: 220V/60Hz' },
    vaccines: [],
    currency: { info: 'Franco CFP (XPF). Tarjeta en hoteles.' },
    tips: ['Bora Bora: destino de lujo excepcional.'],
    emergency: '17 · 15'
  },

  'Nueva Caledonia': {
    visa: {
      ES: false, US: false, UK: false, AU: false, CA: false, JP: false, KR: false,
      IN: true, CN: true, RU: true,
      LATAM: {free:['AR','BR','CL','CO','MX','PE','UY'],required:['EC','PA','PY','VE','BO','HN','NI','SV','GT','CU','HT','DO']},
      needed: false, info: 'ES/UE: sin visa · Territorio francés.'
    },
    adapter: { needed: false, type: 'Tipo F', info: 'Voltaje: 220V/50Hz' },
    vaccines: [],
    currency: { info: 'Franco CFP (XPF).' },
    tips: ['Laguna más grande del mundo — UNESCO.'],
    emergency: '15 · 17'
  },

};


// Resuelve el valor de visado de un objeto `visa` de COUNTRY_REQUIREMENTS para
// un código de pasaporte concreto (exacto, o vía el bloque LATAM).
function resolveVisaVal(v, code) {
  let visaVal = v[code];
  if (visaVal === undefined) {
    const latam = v.LATAM || {};
    const inList = list => list === 'all' || (Array.isArray(list) && list.includes(code));
    if (inList(latam.free)) visaVal = false;
    else if (inList(latam.evisa)) visaVal = 'evisa';
    else if (inList(latam.voa)) visaVal = 'voa';
    else if (inList(latam.eta)) visaVal = 'eta';
    else if (inList(latam.required)) visaVal = true;
    // Antes caía a `v.ES` (estatus de pasaporte español) para cualquier
    // nacionalidad sin dato explícito — la mayoría de las ~190 del selector,
    // solo hay códigos explícitos para ES/US/UK/AU/CA/JP/KR/IN/CN/RU + LATAM
    // opcional. Mostraba con total confianza "Sin visado" (el valor de
    // España) a alguien que sí lo necesitaba. Se deja sin resolver para que
    // el caller lo trate como needed:null → "Verificar con consulado", en
    // vez de una respuesta concreta pero potencialmente falsa.
  }
  return visaVal;
}

// Qué tan bueno es un visaVal: sin visado > evisa/voa/eta > requerido > desconocido.
function rankVisaVal(visaVal) {
  if (visaVal === false) return 0;
  if (typeof visaVal === 'string') return 1;
  if (visaVal === true) return 2;
  return 3;
}

export function getCountryRequirements(destination, homeCountry = 'España', secondNationality = null) {
  // Antes esto era una lista de ~29 `if` por nombre de país que caía a 'ES' por
  // defecto para cualquier nacionalidad no cubierta (la mayoría de África, Asia
  // y Oriente Medio, pese a que el selector de nacionalidad ofrece ~190 países).
  // getCountryIso() cubre el catálogo completo — mismo helper que usa emergencyDB.js.
  const code = getCountryIso(normalizeCountry(homeCountry)) || null;
  const secondCode = secondNationality ? (getCountryIso(normalizeCountry(secondNationality)) || null) : null;

  const req = COUNTRY_REQUIREMENTS[destination] || null;
  if (!req) {
    // Fallback: intentar visaDB con ISOs (ya tiene en cuenta la segunda nacionalidad)
    const destISO = DEST_NAME_TO_ISO[destination] || getCountryMeta(destination)?.iso || null;
    if (destISO && code) {
      try {
        const visaInfo = getVisaInfo(destISO, code, secondCode);
        if (visaInfo && visaInfo.needed !== null) {
          const type = visaInfo.eVisa ? 'evisa' : visaInfo.needed === false ? null : 'required';
          const labelMap = { evisa: 'e-Visa requerida', voa: 'Visa en llegada', eta: 'ETA requerida' };
          return {
            visa: {
              needed: visaInfo.needed,
              type,
              label: visaInfo.needed === false ? 'Sin visado' : (labelMap[type] || 'Visado requerido'),
              info: visaInfo.info || '',
              passportCode: code,
            },
            adapter: { needed: null, type: null, info: null },
            vaccines: [],
            currency: { info: null },
            tips: [],
            emergency: null,
          };
        }
      } catch(e) {}
    }
    if (!code) {
      return {
        visa: { needed: null, type: null, label: 'Sin datos — verifica con el consulado', info: '', passportCode: null },
        adapter: { needed: null, type: null, info: null },
        vaccines: [], currency: { info: null }, tips: [], emergency: null,
      };
    }
    return null;
  }

  const v = req.visa || {};
  let visaVal = resolveVisaVal(v, code);
  let usedCode = code;

  // Si hay segunda nacionalidad, quedarnos con la que dé mejor resultado.
  if (secondCode) {
    const secondVal = resolveVisaVal(v, secondCode);
    if (rankVisaVal(secondVal) < rankVisaVal(visaVal)) {
      visaVal = secondVal;
      usedCode = secondCode;
    }
  }

  const needed = visaVal === false ? false : visaVal === true ? true : null;
  const type = typeof visaVal === 'string' ? visaVal : null;
  const labelMap = { evisa: 'e-Visa requerida', voa: 'Visa en llegada', eta: 'ETA / Autorización electrónica', esta: 'ESTA requerida', nzeta: 'NZeTA requerida' };
  const label = code === null
    ? 'Sin datos — verifica con el consulado'
    : needed === false ? 'Sin visado' : needed === true ? 'Visado requerido' : (labelMap[type] || 'Verificar con consulado');

  return { ...req, visa: { ...req.visa, needed, type, label, passportCode: usedCode } };
}


// Función de compatibilidad — PACKING_TEMPLATES eliminadas, devuelve solo requirements
export function getSmartPackingList(country) {
  const req = COUNTRY_REQUIREMENTS[country] || null;
  return { items: [], requirements: req };
}
