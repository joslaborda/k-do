/**
 * emergencyDB.js — Números de emergencia y datos de embajadas hardcodeados
 * Estructura por país destino. La embajada varía según país origen del usuario.
 *
 * emergency_general: número único de emergencias
 * police / ambulance / fire: números específicos si difieren
 * embassy_ES: embajada española en ese país
 * embassy_MX / embassy_AR / embassy_CO: otras embajadas hispanohablantes frecuentes
 * useful_apps: apps recomendadas para ese país
 * safety_tips: consejos de seguridad básicos
 */

const EMERGENCY_DB = {

  // ── EUROPA ────────────────────────────────────────────────────────────────

  'España': {
    emergency_general: '112',
    police: '091',
    ambulance: '061',
    fire: '080',
    embassy_ES: null, // Estás en España
    useful_apps: [
      { name: 'AlertCops', icon: '🚨', description: 'App oficial de la Policía Nacional para alertas de seguridad.' },
      { name: 'Emergencias 112', icon: '🆘', description: 'App oficial del 112 con geolocalización automática.' },
    ],
    safety_tips: [
      'Cuidado con los carteristas en zonas turísticas como Las Ramblas (Barcelona) o el Metro de Madrid.',
      'El 112 atiende en múltiples idiomas.',
      'En caso de accidente, la cobertura sanitaria pública es universal.',
    ],
  },

  'Francia': {
    emergency_general: '112',
    police: '17',
    ambulance: '15',
    fire: '18',
    embassy_ES: {
      address: '22 Avenue Marceau, 75008 París',
      phone: '+33 1 44 43 18 00',
      hours: 'Lun-Vie 9:00-13:30',
      web: 'https://www.exteriores.gob.es/Embajadas/paris',
    },
    embassy_MX: { address: '9 Rue de Longchamp, 75116 París', phone: '+33 1 53 70 27 70', hours: 'Lun-Vie 9:00-14:00', web: 'https://embamex.sre.gob.mx/francia' },
    embassy_AR: { address: '6 Rue Cimarosa, 75116 París', phone: '+33 1 44 05 27 00', hours: 'Lun-Vie 9:00-13:00', web: 'https://efrance.cancilleria.gob.ar' },
    embassy_CO: { address: '22 Rue de l\'Élysée, 75008 París', phone: '+33 1 42 65 46 08', hours: 'Lun-Vie 9:00-13:00', web: 'https://francia.embajada.gov.co' },
    embassy_CL: { address: '2 Avenue de la Motte-Picquet, 75007 París', phone: '+33 1 44 18 59 60', hours: 'Lun-Vie 9:00-13:00', web: 'https://chile.embajada.cl/francia' },
    embassy_PE: { address: '50 Avenue Kléber, 75116 París', phone: '+33 1 53 70 42 00', hours: 'Lun-Vie 9:00-13:00', web: 'https://embajada.pe/francia' },
    embassy_VE: { address: '11 Rue Copernic, 75116 París', phone: '+33 1 45 53 29 98', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_EC: { address: '34 Avenue de Messine, 75008 París', phone: '+33 1 45 61 10 21', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BO: { address: '12 Avenue du Président Kennedy, 75016 París', phone: '+33 1 42 24 93 44', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_UY: { address: '15 Rue Le Sueur, 75116 París', phone: '+33 1 45 00 81 37', hours: 'Lun-Vie 9:30-13:00', web: null },
    embassy_PY: { address: '1 Rue Saint-Dominique, 75007 París', phone: '+33 1 42 22 85 05', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PT: { address: '3 Rue de Noisiel, 75116 París', phone: '+33 1 47 27 35 29', hours: 'Lun-Vie 9:00-13:00', web: 'https://paris.embaixadaportugal.mne.pt' },
    embassy_DE: { address: '13 Avenue Franklin D. Roosevelt, 75008 París', phone: '+33 1 53 83 45 00', hours: 'Lun-Vie 8:30-12:30', web: 'https://paris.diplo.de' },
    embassy_IT: { address: '51 Rue de Varenne, 75007 París', phone: '+33 1 49 54 03 00', hours: 'Lun-Vie 9:00-12:30', web: 'https://ambasciataparigi.esteri.it' },
    embassy_GB: { address: '35 Rue du Faubourg Saint-Honoré, 75008 París', phone: '+33 1 44 51 31 00', hours: 'Lun-Vie 9:30-12:30', web: 'https://www.gov.uk/world/france' },
    embassy_US: { address: '2 Avenue Gabriel, 75008 París', phone: '+33 1 43 12 22 22', hours: 'Lun-Vie 9:00-12:00', web: 'https://fr.usembassy.gov' },
    embassy_BR: { address: '34 Cours Albert 1er, 75008 París', phone: '+33 1 45 61 63 00', hours: 'Lun-Vie 9:00-12:30', web: 'https://paris.itamaraty.gov.br' },
    embassy_CN: { address: '20 Rue Washington, 75008 París', phone: '+33 1 47 23 34 45', hours: 'Lun-Vie 9:00-12:00', web: 'http://fr.china-embassy.gov.cn' },
    useful_apps: [
      { name: 'SNCF Connect', icon: '🚄', description: 'Billetes de tren TGV e Intercités.' },
      { name: 'Doctolib', icon: '🏥', description: 'Reserva cita médica online con médicos franceses.' },
      { name: 'Citymapper', icon: '🗺️', description: 'Transporte público en París y otras ciudades.' },
    ],
    safety_tips: [
      'Guarda el número de la embajada española (+33 1 44 43 18 00) en el móvil antes de salir.',
      'En el metro de París, cuidado con los grupos que distraen para robar.',
      'El SAMU (15) es la ambulancia; el SMUR atiende emergencias graves.',
      'La tarjeta sanitaria europea cubre atención en hospitales públicos.',
    ],
  },

  'Italia': {
    emergency_general: '112',
    police: '113',
    ambulance: '118',
    fire: '115',
    embassy_ES: {
      address: 'Palazzo Borghese, Largo della Fontanella di Borghese 19, Roma',
      phone: '+39 06 684 0401',
      hours: 'Lun-Vie 8:30-14:30',
      web: 'https://www.exteriores.gob.es/Embajadas/roma',
    },
    embassy_MX: { address: 'Via Lazzaro Spallanzani 16, 00161 Roma', phone: '+39 06 4416 5830', hours: 'Lun-Vie 9:00-14:00', web: 'https://embamex.sre.gob.mx/italia' },
    embassy_AR: { address: 'Via Crispi 1, 00187 Roma', phone: '+39 06 4201 1401', hours: 'Lun-Vie 9:00-13:00', web: 'https://eitalia.cancilleria.gob.ar' },
    embassy_CO: { address: 'Via Giuseppe Pisanelli 4, 00196 Roma', phone: '+39 06 3207 6001', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CL: { address: 'Via Po 23, 00198 Roma', phone: '+39 06 844 09 868', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PE: { address: 'Via Francesco Siacci 4, 00197 Roma', phone: '+39 06 8088 5591', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_VE: { address: 'Via Nicolò Tartaglia 11, 00197 Roma', phone: '+39 06 807 2997', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_EC: { address: 'Via Guido d\'Arezzo 14, 00198 Roma', phone: '+39 06 854 6265', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BO: { address: 'Via Brenta 2A, 00198 Roma', phone: '+39 06 884 1001', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_UY: { address: 'Via Vittorio Veneto 183, 00187 Roma', phone: '+39 06 482 7054', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BR: { address: 'Piazza Navona 14, 00186 Roma', phone: '+39 06 683 9871', hours: 'Lun-Vie 9:00-12:00', web: 'https://roma.itamaraty.gov.br' },
    embassy_PT: { address: 'Via Poli 44, 00187 Roma', phone: '+39 06 6994 2781', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_DE: { address: 'Via San Martino della Battaglia 4, 00185 Roma', phone: '+39 06 492 131', hours: 'Lun-Vie 8:00-12:30', web: 'https://rom.diplo.de' },
    embassy_GB: { address: 'Via XX Settembre 80a, 00187 Roma', phone: '+39 06 4220 0001', hours: 'Lun-Vie 9:00-13:30', web: 'https://www.gov.uk/world/italy' },
    embassy_US: { address: 'Via Vittorio Veneto 121, 00187 Roma', phone: '+39 06 46741', hours: 'Lun-Vie 8:30-12:30', web: 'https://it.usembassy.gov' },
    embassy_CN: { address: 'Via Bruxelles 56, 00198 Roma', phone: '+39 06 8547 3791', hours: 'Lun-Vie 9:00-12:00', web: null },
    useful_apps: [
      { name: 'Trenitalia', icon: '🚂', description: 'Billetes de tren oficiales por toda Italia.' },
      { name: 'Italo', icon: '🚄', description: 'Tren de alta velocidad alternativo, a veces más barato.' },
      { name: 'MySOS', icon: '🆘', description: 'App de emergencias con geolocalización para extranjeros.' },
    ],
    safety_tips: [
      'En Roma y Nápoles, cuidado con los carteristas en el transporte público.',
      'Si te roban, denuncia en la Questura (policía) para el seguro de viaje.',
      'Guarda el número del consulado más cercano (Roma, Milán, Barcelona depende de zona).',
    ],
  },

  'Portugal': {
    emergency_general: '112',
    police: '213 421 634',
    ambulance: '112',
    fire: '112',
    embassy_ES: {
      address: 'Rua do Salitre 1, 1269-052 Lisboa',
      phone: '+351 21 347 2381',
      hours: 'Lun-Vie 9:00-14:00',
      web: 'https://www.exteriores.gob.es/Embajadas/lisboa',
    },
    embassy_AR: { address: 'Rua Dr. Arsénio de Carvalho 1, 1250-011 Lisboa', phone: '+351 21 385 7900', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CO: { address: 'Rua do Sacramento à Lapa 26, 1249-090 Lisboa', phone: '+351 21 392 8170', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_MX: { address: 'Rua do Pau de Bandeira 4, 1249-089 Lisboa', phone: '+351 21 392 0040', hours: 'Lun-Vie 9:00-14:00', web: null },
    embassy_CL: { address: 'Rua do Borja 10, 1350-041 Lisboa', phone: '+351 21 363 5010', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PE: { address: 'Rua Castilho 50, 3º Esq, 1250-071 Lisboa', phone: '+351 21 381 6158', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_VE: { address: 'Rua Marquês de Sá da Bandeira 10, 1050-148 Lisboa', phone: '+351 21 795 1840', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_EC: { address: 'Rua António Maria Cardoso 19, 1200-025 Lisboa', phone: '+351 21 342 1350', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BR: { address: 'Estrada das Laranjeiras 144, 1649-021 Lisboa', phone: '+351 21 724 8500', hours: 'Lun-Vie 9:00-13:00', web: 'https://lisboa.itamaraty.gov.br' },
    embassy_BO: { address: 'Rua de São Bernardo 55, 1200-826 Lisboa', phone: '+351 21 396 1305', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_UY: { address: 'Rua de Buenos Aires 26, 1200-073 Lisboa', phone: '+351 21 346 2024', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PY: { address: 'Rua do Salitre 181, 1269-057 Lisboa', phone: '+351 21 319 2390', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_DE: { address: 'Campo dos Mártires da Pátria 38, 1169-043 Lisboa', phone: '+351 21 810 2500', hours: 'Lun-Vie 8:30-12:00', web: 'https://lissabon.diplo.de' },
    embassy_FR: { address: 'Rua Santos-o-Velho 5, 1249-079 Lisboa', phone: '+351 21 391 3938', hours: 'Lun-Vie 9:00-12:30', web: null },
    embassy_IT: { address: 'Largo Conde Pombeiro 6, 1150-100 Lisboa', phone: '+351 21 315 2924', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_GB: { address: 'Rua de São Bernardo 33, 1249-082 Lisboa', phone: '+351 21 392 4000', hours: 'Lun-Vie 9:00-12:30', web: 'https://www.gov.uk/world/portugal' },
    embassy_US: { address: 'Avenida das Forças Armadas, 1600-081 Lisboa', phone: '+351 21 727 3300', hours: 'Lun-Vie 8:00-12:00', web: 'https://pt.usembassy.gov' },
    embassy_CN: { address: 'Rua de São Caetano à Lapa 5, 1249-087 Lisboa', phone: '+351 21 392 4420', hours: 'Lun-Vie 9:00-12:00', web: null },
    useful_apps: [
      { name: 'CP (Comboios de Portugal)', icon: '🚂', description: 'Trenes por todo Portugal.' },
      { name: 'Bolt', icon: '🚗', description: 'Taxi y VTC en Lisboa y Porto, más barato que Uber.' },
    ],
    safety_tips: [
      'Lisboa y Porto son ciudades seguras pero cuidado con carteristas en tranvías turísticos (especialmente el 28).',
      'En verano, zona de Alfama tiene mucha actividad turística — vigila pertenencias.',
    ],
  },

  'Alemania': {
    emergency_general: '112',
    police: '110',
    ambulance: '112',
    fire: '112',
    embassy_ES: {
      address: 'Lichtensteinallee 1, 10787 Berlín',
      phone: '+49 30 254 007 0',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/berlin',
    },
    embassy_AR: { address: 'Kleiststraße 23-26, 10787 Berlín', phone: '+49 30 226 6890', hours: 'Lun-Vie 9:00-13:00', web: 'https://ealem.cancilleria.gob.ar' },
    embassy_CO: { address: 'Kurfürstendamm 177, 10707 Berlín', phone: '+49 30 263 0053', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_MX: { address: 'Klingelhöferstraße 3, 10785 Berlín', phone: '+49 30 269 3230', hours: 'Lun-Vie 9:00-13:00', web: 'https://embamex.sre.gob.mx/alemania' },
    embassy_CL: { address: 'Mohrenstraße 42, 10117 Berlín', phone: '+49 30 726 2095 0', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PE: { address: 'Mohrenstraße 42, 10117 Berlín', phone: '+49 30 206 4108 0', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_VE: { address: 'Schillstraße 9, 10785 Berlín', phone: '+49 30 832 2400', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_EC: { address: 'Joachim-Karnatz-Allee 45, 10557 Berlín', phone: '+49 30 235 4560', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BO: { address: 'Wichmannstraße 6, 10787 Berlín', phone: '+49 30 263 9550', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BR: { address: 'Wallstraße 57, 10179 Berlín', phone: '+49 30 726 2800', hours: 'Lun-Vie 9:00-12:00', web: 'https://berlim.itamaraty.gov.br' },
    embassy_UY: { address: 'Budapester Straße 14, 10787 Berlín', phone: '+49 30 263 4831', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PT: { address: 'Zimmerstraße 56, 10117 Berlín', phone: '+49 30 590 063 500', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_GB: { address: 'Wilhelmstraße 70, 10117 Berlín', phone: '+49 30 204 570', hours: 'Lun-Vie 9:00-13:00', web: 'https://www.gov.uk/world/germany' },
    embassy_US: { address: 'Pariser Platz 2, 10117 Berlín', phone: '+49 30 83050', hours: 'Lun-Vie 8:00-12:00', web: 'https://de.usembassy.gov' },
    embassy_CN: { address: 'Märkisches Ufer 54, 10179 Berlín', phone: '+49 30 275 880', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_FR: { address: 'Pariser Platz 5, 10117 Berlín', phone: '+49 30 590 039 000', hours: 'Lun-Vie 9:00-12:30', web: 'https://de.ambafrance.org' },
    embassy_IT: { address: 'Dessauer Straße 28-29, 10963 Berlín', phone: '+49 30 254 400', hours: 'Lun-Vie 9:00-12:00', web: 'https://ambberlino.esteri.it' },
    useful_apps: [
      { name: 'DB Navigator', icon: '🚂', description: 'Billetes y horarios de Deutsche Bahn, esencial en Alemania.' },
      { name: 'BVG / MVV', icon: '🚇', description: 'Transporte público en Berlín / Múnich respectivamente.' },
    ],
    safety_tips: [
      'Alemania es muy segura. En grandes estaciones (Hauptbahnhof) hay presencia de pickpockets en eventos masivos.',
      'La ambulancia (Rettungsdienst) es de pago — asegúrate de tener seguro médico de viaje.',
    ],
  },

  'Reino Unido': {
    emergency_general: '999',
    police: '101 (no urgencias) / 999',
    ambulance: '999',
    fire: '999',
    embassy_ES: {
      address: '39 Chesham Place, London SW1X 8SB',
      phone: '+44 20 7235 5555',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/londres',
    },
    embassy_AR: { address: '65 Brook Street, Londres W1K 4AH', phone: '+44 20 7318 1300', hours: 'Lun-Vie 9:30-13:00', web: 'https://egranbre.cancilleria.gob.ar' },
    embassy_CO: { address: 'Suite 16, 140 Park Lane, Londres W1K 7AA', phone: '+44 20 7495 4233', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_MX: { address: '16 St George Street, Londres W1S 1FD', phone: '+44 20 7499 8586', hours: 'Lun-Vie 9:00-14:00', web: 'https://embamex.sre.gob.mx/reinounido' },
    embassy_CL: { address: '37-41 Old Queen Street, Londres SW1H 9JA', phone: '+44 20 7222 2361', hours: 'Lun-Vie 9:00-13:30', web: null },
    embassy_PE: { address: '52 Sloane Street, Londres SW1X 9SP', phone: '+44 20 7235 1917', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_VE: { address: '1 Cromwell Road, Londres SW7 2HW', phone: '+44 20 7584 4206', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_EC: { address: 'Flat 3B, 3 Hans Crescent, Londres SW1X 0LS', phone: '+44 20 7584 1367', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BO: { address: '106 Eaton Square, Londres SW1W 9AD', phone: '+44 20 7235 4255', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BR: { address: '14-16 Cockspur Street, Londres SW1Y 5BL', phone: '+44 20 7747 4500', hours: 'Lun-Vie 9:00-13:00', web: 'https://londres.itamaraty.gov.br' },
    embassy_UY: { address: '125 Kensington High Street, Londres W8 5SF', phone: '+44 20 7937 6490', hours: 'Lun-Vie 9:30-13:00', web: null },
    embassy_PT: { address: '11 Belgrave Square, Londres SW1X 8PP', phone: '+44 20 7235 5331', hours: 'Lun-Vie 9:30-13:00', web: null },
    embassy_DE: { address: '23 Belgrave Square, Londres SW1X 8PZ', phone: '+44 20 7824 1300', hours: 'Lun-Vie 9:00-12:00', web: 'https://london.diplo.de' },
    embassy_FR: { address: '58 Knightsbridge, Londres SW1X 7JT', phone: '+44 20 7073 1000', hours: 'Lun-Vie 9:00-12:30', web: 'https://uk.ambafrance.org' },
    embassy_IT: { address: '14 Three Kings Yard, Londres W1K 4EH', phone: '+44 20 7312 2200', hours: 'Lun-Vie 9:00-13:00', web: 'https://amblondra.esteri.it' },
    embassy_US: { address: '33 Nine Elms Lane, Londres SW11 7US', phone: '+44 20 7499 9000', hours: 'Lun-Vie 8:30-12:30', web: 'https://uk.usembassy.gov' },
    embassy_CN: { address: '49-51 Portland Place, Londres W1B 1JL', phone: '+44 20 7299 4049', hours: 'Lun-Vie 9:00-12:00', web: null },
    useful_apps: [
      { name: 'Citymapper', icon: '🚇', description: 'El mejor para navegar el metro y buses de Londres.' },
      { name: 'NHS App', icon: '🏥', description: 'Servicios de salud del NHS, incluyendo urgencias y médicos.' },
    ],
    safety_tips: [
      'El número de emergencias en UK es 999, no 112 (aunque 112 también funciona).',
      'Con tarjeta sanitaria europea (EHIC) o el nuevo GHIC post-Brexit tienes cobertura básica.',
      'En zonas como Brixton o Hackney en Londres, precaución nocturna como en cualquier capital.',
    ],
  },

  'Países Bajos': {
    emergency_general: '112',
    police: '0900-8844',
    ambulance: '112',
    fire: '112',
    embassy_ES: {
      address: 'Lange Voorhout 50, 2514 EG La Haya',
      phone: '+31 70 302 4999',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/lahaya',
    },
    useful_apps: [
      { name: '9292', icon: '🚲', description: 'Transporte público en Países Bajos — trenes, bus, tranvía.' },
      { name: 'NS (Nederlandse Spoorwegen)', icon: '🚂', description: 'Trenes nacionales holandeses.' },
    ],
    safety_tips: [
      'Amsterdam tiene alta incidencia de robos de bicicletas y carteristas en el barrio rojo.',
      'Ten cuidado con los ciclistas — tienen prioridad sobre los peatones en los carriles bici.',
    ],
  },

  'Suiza': {
    emergency_general: '112',
    police: '117',
    ambulance: '144',
    fire: '118',
    embassy_ES: {
      address: 'Kalcheggweg 24, 3006 Berna',
      phone: '+41 31 352 0412',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/berna',
    },
    useful_apps: [
      { name: 'SBB Mobile', icon: '🚂', description: 'Ferrocarriles suizos — compra y validación de billetes.' },
      { name: 'MeteoSwiss', icon: '🏔️', description: 'Meteorología oficial suiza, esencial en montaña.' },
    ],
    safety_tips: [
      'Suiza es muy segura. La asistencia sanitaria es excelente pero cara — seguro de viaje imprescindible.',
      'En montaña, avisa siempre de tu ruta y lleva ropa adecuada. El rescate alpino (Rega) es muy eficiente.',
    ],
  },

  'Austria': {
    emergency_general: '112',
    police: '133',
    ambulance: '144',
    fire: '122',
    embassy_ES: {
      address: 'Argentinierstrasse 34, 1040 Viena',
      phone: '+43 1 505 57 88',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/viena',
    },
    useful_apps: [
      { name: 'WienMobil', icon: '🚇', description: 'Transporte público en Viena.' },
      { name: 'ÖBB Tickets', icon: '🚂', description: 'Trenes austriacos.' },
    ],
    safety_tips: ['Viena es muy segura, considerada una de las ciudades más seguras de Europa.'],
  },

  'Grecia': {
    emergency_general: '112',
    police: '100',
    ambulance: '166',
    fire: '199',
    embassy_ES: {
      address: 'Dionysiou Areopagitou 21, 117 42 Atenas',
      phone: '+30 210 921 3123',
      hours: 'Lun-Vie 9:00-13:30',
      web: 'https://www.exteriores.gob.es/Embajadas/atenas',
    },
    embassy_AR: { address: 'Vasilisis Sofias 59, 115 21 Atenas', phone: '+30 210 722 4753', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CO: { address: 'Efplias 3 & Akti Miaouli, 185 37 El Pireo', phone: '+30 210 428 5631', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_MX: { address: 'Filikis Eterias 14, Kolonaki, 106 73 Atenas', phone: '+30 210 729 4780', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CL: { address: 'Vasilisis Sofias 47, 106 76 Atenas', phone: '+30 210 725 0581', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PE: { address: 'Vasileos Konstantinou 2, 116 35 Atenas', phone: '+30 210 701 0096', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BR: { address: 'Filikis Eterias 14, Kolonaki, 106 73 Atenas', phone: '+30 210 721 3036', hours: 'Lun-Vie 9:00-13:00', web: 'https://atenas.itamaraty.gov.br' },
    embassy_DE: { address: 'Karaoli kai Dimitriou 3, 106 75 Atenas', phone: '+30 210 728 5111', hours: 'Lun-Vie 8:00-11:30', web: 'https://athen.diplo.de' },
    embassy_FR: { address: 'Vasilisis Sofias 7, 106 71 Atenas', phone: '+30 210 339 1000', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_IT: { address: 'Sekeri 2, 106 74 Atenas', phone: '+30 210 361 7260', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_GB: { address: 'Ploutarchou 1, 106 75 Atenas', phone: '+30 210 727 2600', hours: 'Lun-Vie 9:00-12:00', web: 'https://www.gov.uk/world/greece' },
    embassy_US: { address: 'Vasilisis Sofias 91, 115 21 Atenas', phone: '+30 210 721 2951', hours: 'Lun-Vie 8:30-11:00', web: 'https://gr.usembassy.gov' },
    embassy_CN: { address: 'Krinon 2A, Paleo Psychiko, 154 52 Atenas', phone: '+30 210 672 3282', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_PT: { address: 'Lykavittou 7, 106 72 Atenas', phone: '+30 210 362 7731', hours: 'Lun-Vie 9:00-13:00', web: null },
    useful_apps: [
      { name: 'OASA Telematics', icon: '🚌', description: 'Transporte público de Atenas en tiempo real.' },
      { name: 'Beat (FreeNow)', icon: '🚗', description: 'Taxi en Atenas — mejor que intentar parar uno en la calle.' },
    ],
    safety_tips: [
      'En Atenas, el barrio de Omonia puede ser inseguro de noche. Exarchia también requiere precaución.',
      'En las islas, cuidado con los alquileres de moto/quad sin seguro — los accidentes son frecuentes.',
      'El agua del grifo en las islas puede no ser potable — beber agua embotellada.',
    ],
  },

  'Turquía': {
    emergency_general: '112',
    police: '155',
    ambulance: '112',
    fire: '110',
    embassy_ES: {
      address: 'Çankaya, Abdullah Cevdet Sokak No:22, 06690 Ankara',
      phone: '+90 312 438 0392',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/ankara',
    },
    embassy_AR: { address: 'Uğur Mumcu Cad. 7/1, Gaziosmanpaşa, Ankara', phone: '+90 312 468 1061', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CO: { address: 'Koza Sokak 38, Gaziosmanpaşa, Ankara', phone: '+90 312 446 1602', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_MX: { address: 'Mahatma Gandhi Cad. 77, Gaziosmanpaşa, Ankara', phone: '+90 312 405 4800', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CL: { address: 'Kelebek Sokak 10, Gaziosmanpaşa, Ankara', phone: '+90 312 447 3052', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PE: { address: 'Turan Emeksiz Sokak 10, Gaziosmanpaşa, Ankara', phone: '+90 312 447 4803', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BR: { address: 'Filistin Sokak 9, Gaziosmanpaşa, Ankara', phone: '+90 312 468 1238', hours: 'Lun-Vie 9:00-13:00', web: 'https://ancara.itamaraty.gov.br' },
    embassy_VE: { address: 'Kıbrıs Şehitleri Cad. 11, Çankaya, Ankara', phone: '+90 312 441 2572', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_DE: { address: 'Atatürk Bulvarı 114, Kavaklıdere, Ankara', phone: '+90 312 455 5100', hours: 'Lun-Vie 8:00-11:30', web: 'https://ankara.diplo.de' },
    embassy_FR: { address: 'Paris Cad. 70, Kavaklıdere, Ankara', phone: '+90 312 455 4545', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_IT: { address: 'Atatürk Bulvarı 118, Kavaklıdere, Ankara', phone: '+90 312 426 5460', hours: 'Lun-Vie 9:00-12:30', web: null },
    embassy_GB: { address: 'Şehit Ersan Cad. 46A, Çankaya, Ankara', phone: '+90 312 455 3344', hours: 'Lun-Vie 8:00-12:30', web: 'https://www.gov.uk/world/turkey' },
    embassy_US: { address: 'Atatürk Bulvarı 110, Kavaklıdere, Ankara', phone: '+90 312 455 5555', hours: 'Lun-Vie 8:30-11:30', web: 'https://tr.usembassy.gov' },
    embassy_CN: { address: 'Gölgeli Sokak 34, Gaziosmanpaşa, Ankara', phone: '+90 312 436 0628', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_PT: { address: 'Turan Emeksiz Sokak 3, Gaziosmanpaşa, Ankara', phone: '+90 312 405 4900', hours: 'Lun-Vie 9:00-13:00', web: null },
    useful_apps: [
      { name: 'BiTaksi', icon: '🚕', description: 'App oficial de taxis en Turquía — más seguro que taxis en calle.' },
      { name: 'Trafi', icon: '🚇', description: 'Metro y transporte público en Estambul.' },
    ],
    safety_tips: [
      'Estambul es generalmente segura para turistas. Cuidado con las estafas en el Gran Bazar.',
      'Evita protestas o manifestaciones — pueden volverse impredecibles.',
      'Lleva siempre una copia del pasaporte — la ley turca exige identificación en todo momento.',
    ],
  },

  'República Checa': {
    emergency_general: '112',
    police: '158',
    ambulance: '155',
    fire: '150',
    embassy_ES: {
      address: 'Pevnostní 9, 162 01 Praga 6',
      phone: '+420 233 097 211',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/praga',
    },
    useful_apps: [
      { name: 'PID Lítačka', icon: '🚇', description: 'Transporte público de Praga — billete y validación.' },
      { name: 'Bolt', icon: '🚗', description: 'VTC en Praga, más barato que taxis convencionales.' },
    ],
    safety_tips: [
      'En el Barrio Viejo y Puente de Carlos hay carteristas frecuentes en temporada alta.',
      'Los taxis sin taxímetro en Praga son una estafa habitual para turistas — usa siempre apps.',
    ],
  },

  'Hungría': {
    emergency_general: '112',
    police: '107',
    ambulance: '104',
    fire: '105',
    embassy_ES: {
      address: 'Eötvös utca 11-B, 1067 Budapest',
      phone: '+36 1 202 4006',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/budapest',
    },
    useful_apps: [
      { name: 'BKK Futár', icon: '🚇', description: 'Transporte público de Budapest en tiempo real.' },
      { name: 'Bolt', icon: '🚗', description: 'VTC en Budapest.' },
    ],
    safety_tips: [
      'Hay bares en el centro de Budapest conocidos como "ruin bars" — cuidado con bebidas adulteradas en algunos locales.',
      'Las tarjetas de crédito se aceptan ampliamente pero el forint (HUF) es necesario en algunos sitios pequeños.',
    ],
  },

  'Polonia': {
    emergency_general: '112',
    police: '997',
    ambulance: '999',
    fire: '998',
    embassy_ES: {
      address: 'ulica Mysia 5, 00-496 Varsovia',
      phone: '+48 22 583 4000',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/varsovia',
    },
    useful_apps: [
      { name: 'Bolt', icon: '🚗', description: 'VTC en las principales ciudades polacas.' },
      { name: 'KOLEO', icon: '🚂', description: 'Billetes de tren en Polonia.' },
    ],
    safety_tips: ['Polonia es segura para los turistas. Cracovia y Varsovia son ciudades tranquilas.'],
  },

  // ── ASIA ──────────────────────────────────────────────────────────────────

  'Japón': {
    emergency_general: '110 (policía) / 119 (bomberos y ambulancia)',
    police: '110',
    ambulance: '119',
    fire: '119',
    embassy_ES: {
      address: '1-3-29 Roppongi, Minato-ku, Tokio 106-0032',
      phone: '+81 3 3583 8531',
      hours: 'Lun-Vie 9:00-13:00 y 14:00-17:30',
      web: 'https://www.exteriores.gob.es/Embajadas/tokio',
    },
    embassy_MX: { address: '2-15-1 Nagata-cho, Chiyoda-ku, Tokio', phone: '+81 3 3581 1131', hours: 'Lun-Vie 9:30-13:00', web: 'https://embamex.sre.gob.mx/japon' },
    embassy_FR: { address: '4-11-44 Minami-Azabu, Minato-ku, Tokio', phone: '+81 3 5798 6000', hours: 'Lun-Vie 9:30-12:30', web: 'https://jp.ambafrance.org' },
    embassy_DE: { address: '4-5-10 Minami-Azabu, Minato-ku, Tokio', phone: '+81 3 5791 7700', hours: 'Lun-Vie 9:00-12:00', web: 'https://japan.diplo.de' },
    embassy_IT: { address: '2-5-4 Mita, Minato-ku, Tokio', phone: '+81 3 3453 5291', hours: 'Lun-Vie 9:00-13:00', web: 'https://ambtokyo.esteri.it' },
    embassy_BR: { address: '2-11-12 Kita-Aoyama, Minato-ku, Tokio', phone: '+81 3 3404 5211', hours: 'Lun-Vie 9:00-13:00', web: 'https://tokio.itamaraty.gov.br' },
    embassy_AR: { address: '2-14-14 Moto-Azabu, Minato-ku, Tokio', phone: '+81 3 5420 7101', hours: 'Lun-Vie 9:30-13:00', web: 'https://ejapon.cancilleria.gob.ar' },
    embassy_CO: { address: '3-10-53 Kami-Osaki, Shinagawa-ku, Tokio', phone: '+81 3 3440 6451', hours: 'Lun-Vie 9:00-12:30', web: null },
    embassy_CL: { address: 'Nihonbashi Hakozakicho 36-1, Chuo-ku, Tokio', phone: '+81 3 3714 2611', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PE: { address: '4-4-27 Higashi, Shibuya-ku, Tokio', phone: '+81 3 3406 4243', hours: 'Lun-Vie 9:30-13:00', web: null },
    embassy_VE: { address: '38 Kowa Building, Room 703, 4-12-24 Nishi-Azabu, Minato-ku, Tokio', phone: '+81 3 3409 1501', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_EC: { address: '38 Kowa Building, Room 806, 4-12-24 Nishi-Azabu, Minato-ku, Tokio', phone: '+81 3 3499 2800', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BO: { address: '2-3-2 Kojimachi, Chiyoda-ku, Tokio', phone: '+81 3 3556 6124', hours: 'Lun-Vie 9:30-13:00', web: null },
    embassy_UY: { address: '38 Kowa Building, Room 908, 4-12-24 Nishi-Azabu, Minato-ku, Tokio', phone: '+81 3 3486 1888', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PY: { address: '38 Kowa Building, Room 903, 4-12-24 Nishi-Azabu, Minato-ku, Tokio', phone: '+81 3 3485 3101', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PT: { address: 'Olympia Annex Roppongi 4F, 6-8-19 Roppongi, Minato-ku, Tokio', phone: '+81 3 5772 5440', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_GB: { address: '1 Ichiban-cho, Chiyoda-ku, Tokio', phone: '+81 3 5211 1100', hours: 'Lun-Vie 9:00-12:00', web: 'https://www.gov.uk/world/japan' },
    embassy_US: { address: '1-10-5 Akasaka, Minato-ku, Tokio', phone: '+81 3 3224 5000', hours: 'Lun-Vie 8:30-12:00', web: 'https://jp.usembassy.gov' },
    embassy_CN: { address: '3-4-33 Moto-Azabu, Minato-ku, Tokio', phone: '+81 3 3403 3380', hours: 'Lun-Vie 9:00-12:00', web: null },
    useful_apps: [
      { name: 'Google Translate + cámara', icon: '📷', description: 'Traduce menús y señales con la cámara en tiempo real.' },
      { name: 'Suica / PASMO', icon: '💳', description: 'Tarjeta de transporte recargable para metro y trenes.' },
      { name: 'Hyperdia', icon: '🚄', description: 'Rutas en Shinkansen y transporte local con horarios exactos.' },
      { name: 'LINE', icon: '💬', description: 'La app de mensajería principal en Japón.' },
    ],
    safety_tips: [
      'Japón es uno de los países más seguros del mundo — tasa de criminalidad mínima.',
      'En caso de terremoto: protégete bajo una mesa sólida, aléjate de ventanas. No uses ascensores.',
      'El servicio de urgencias (119) puede tener operadores sin inglés — lleva escrito tu dirección en japonés.',
      'Los hospitales requieren pago por adelantado sin seguro — lleva seguro médico de viaje obligatoriamente.',
    ],
  },

  'Tailandia': {
    emergency_general: '191 (policía) / 1669 (ambulancia)',
    police: '191',
    ambulance: '1669',
    fire: '199',
    embassy_ES: {
      address: '23F, Lake Rajada Office Complex, 193/126-130 New Rajadapisek Rd., Bangkok',
      phone: '+66 2 661 8284',
      hours: 'Lun-Vie 9:00-12:30',
      web: 'https://www.exteriores.gob.es/Embajadas/bangkok',
    },
    embassy_MX: { address: '20/69-70 Twin Towers, Rama IX Rd, Bangkok', phone: '+66 2 300 0435', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_FR: { address: '35 Customs House Lane, Bangrak, Bangkok', phone: '+66 2 657 5100', hours: 'Lun-Vie 8:30-12:00', web: 'https://th.ambafrance.org' },
    embassy_DE: { address: '9 South Sathorn Road, Bangkok', phone: '+66 2 287 9000', hours: 'Lun-Vie 8:00-11:30', web: 'https://bangkok.diplo.de' },
    embassy_BR: { address: '34th Floor, Abdulrahim Place, 990 Rama IV Road, Bangkok', phone: '+66 2 266 6659', hours: 'Lun-Vie 9:00-12:00', web: 'https://bangkok.itamaraty.gov.br' },
    embassy_IT: { address: '399 Nang Linchi Road, Yan Nawa, Bangkok', phone: '+66 2 285 4090', hours: 'Lun-Vie 8:30-12:30', web: 'https://ambangkok.esteri.it' },
    embassy_AR: { address: '16th Floor, Wall Street Tower, 33/4 Surawong Road, Bangkok', phone: '+66 2 234 8478', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CO: { address: '17th Floor, Rajanakarn Building, 183 South Sathon Road, Bangkok', phone: '+66 2 676 7340', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CL: { address: '33rd Floor, Interchange 21, 399 Sukhumvit Road, Bangkok', phone: '+66 2 258 9714', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PE: { address: '898 Ploenchit Road, Bangkok 10330', phone: '+66 2 255 6080', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_VE: { address: 'Wave Place Building 21F, 55 Wireless Road, Bangkok', phone: '+66 2 256 9870', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_EC: { address: 'RSU Tower, 571 Sukhumvit Soi 31, Bangkok', phone: '+66 2 259 4851', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PT: { address: 'Consulate — contactar embajada en KL o Singapur', phone: null, hours: null, web: null },
    embassy_GB: { address: '14 Wireless Road, Bangkok 10330', phone: '+66 2 305 8333', hours: 'Lun-Vie 8:00-12:00', web: 'https://www.gov.uk/world/thailand' },
    embassy_US: { address: '95 Wireless Road, Bangkok 10330', phone: '+66 2 205 4000', hours: 'Lun-Vie 7:30-11:30', web: 'https://th.usembassy.gov' },
    embassy_CN: { address: '57 Ratchadaphisek Road, Din Daeng, Bangkok', phone: '+66 2 245 7032', hours: 'Lun-Vie 9:00-12:00', web: null },
    useful_apps: [
      { name: 'Grab', icon: '🛵', description: 'El Uber de Asia — taxis, motos y comida a domicilio en toda Tailandia.' },
      { name: 'LINE MAN', icon: '🍜', description: 'Delivery de comida tailandesa a domicilio.' },
      { name: 'Google Translate', icon: '🔤', description: 'El tailandés tiene alfabeto propio — imprescindible para menús y señales.' },
    ],
    safety_tips: [
      'Los "tuk-tuk estafa" son habituales en Bangkok: te llevan a tiendas de amigos antes del destino.',
      'Los escúter en islas: muchos turistas tienen accidentes sin casco. Seguro específico obligatorio.',
      'Las drogas tienen penas severísimas en Tailandia, incluyendo pena de muerte para tráfico.',
      'En zonas de manifestaciones políticas o alrededor del palacio real, mucho cuidado con comentarios sobre la monarquía.',
    ],
  },

  'Vietnam': {
    emergency_general: '113 (policía) / 115 (ambulancia)',
    police: '113',
    ambulance: '115',
    fire: '114',
    embassy_ES: {
      address: 'Edificio Horizon Towers, 40 Cat Linh Street, Hanói',
      phone: '+84 24 3771 5207',
      hours: 'Lun-Vie 8:30-12:00',
      web: 'https://www.exteriores.gob.es/Embajadas/hanoi',
    },
    embassy_AR: { address: '38A Chu Huy Man, Hanói', phone: '+84 24 3845 7670', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_CO: { address: '50 Ngo Quyen, Hoan Kiem, Hanói', phone: '+84 24 3824 1954', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_MX: { address: '2A Chu Van An, Ba Dinh, Hanói', phone: '+84 24 3746 1040', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_CL: { address: '67 Tran Hung Dao, Hanói', phone: '+84 24 3856 0967', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_PE: { address: 'Diplomacy Town, Van Phuc, Ba Dinh, Hanói', phone: '+84 24 3845 4795', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_BR: { address: '14 Thuy Khue, Ba Dinh, Hanói', phone: '+84 24 3843 3529', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_DE: { address: '29 Tran Phu, Ba Dinh, Hanói', phone: '+84 24 3845 3836', hours: 'Lun-Vie 8:00-11:00', web: 'https://hanoi.diplo.de' },
    embassy_FR: { address: '57 Tran Hung Dao, Hanói', phone: '+84 24 3944 5700', hours: 'Lun-Vie 8:30-12:00', web: null },
    embassy_IT: { address: '9 Le Phung Hieu, Hoan Kiem, Hanói', phone: '+84 24 3826 2896', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_GB: { address: '31 Hai Ba Trung, Hoan Kiem, Hanói', phone: '+84 24 3936 0500', hours: 'Lun-Vie 8:00-12:00', web: 'https://www.gov.uk/world/vietnam' },
    embassy_US: { address: '7 Lang Ha, Ba Dinh, Hanói', phone: '+84 24 3850 5000', hours: 'Lun-Vie 7:30-11:00', web: 'https://vn.usembassy.gov' },
    embassy_CN: { address: '46 Hoang Dieu, Ba Dinh, Hanói', phone: '+84 24 3845 3736', hours: 'Lun-Vie 8:30-11:30', web: null },
    useful_apps: [
      { name: 'Grab', icon: '🛵', description: 'Moto-taxi, taxi y comida en toda Vietnam — esencial.' },
      { name: 'Google Maps', icon: '🗺️', description: 'Funciona bien en Vietnam, mejor que Maps de Apple.' },
    ],
    safety_tips: [
      'Al cruzar la calle en Hanói/Ho Chi Minh: camina lento y constante, los vehículos esquivarán.',
      'Cuidado con los "xe ôm" (moto-taxi informales) — usa siempre Grab para precio fijo.',
      'Los cambios de dinero en la calle pueden darte billetes falsos — usa bancos o cajeros.',
    ],
  },

  'India': {
    emergency_general: '112',
    police: '100',
    ambulance: '102',
    fire: '101',
    embassy_ES: {
      address: '12 Prithviraj Road, Nueva Delhi 110011',
      phone: '+91 11 4129 3000',
      hours: 'Lun-Vie 9:00-13:30',
      web: 'https://www.exteriores.gob.es/Embajadas/nuevadelhi',
    },
    embassy_AR: { address: 'B-2/52 Vasant Vihar, Nueva Delhi 110057', phone: '+91 11 2614 5059', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CO: { address: '9 Sunder Nagar, Nueva Delhi 110003', phone: '+91 11 2435 0091', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_MX: { address: 'E-18 Vasant Marg, Vasant Vihar, Nueva Delhi 110057', phone: '+91 11 2614 0959', hours: 'Lun-Vie 9:00-13:30', web: 'https://embamex.sre.gob.mx/india' },
    embassy_CL: { address: 'E-4 Vasant Marg, Vasant Vihar, Nueva Delhi 110057', phone: '+91 11 2614 5857', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PE: { address: 'C-109 Anand Niketan, Nueva Delhi 110021', phone: '+91 11 2411 9000', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BR: { address: '8 Aurangzeb Road, Nueva Delhi 110011', phone: '+91 11 2301 7301', hours: 'Lun-Vie 9:00-13:00', web: 'https://novadeli.itamaraty.gov.br' },
    embassy_VE: { address: 'D-93 Anand Niketan, Nueva Delhi 110021', phone: '+91 11 2411 2060', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_DE: { address: '6-50G Shantipath, Chanakyapuri, Nueva Delhi 110021', phone: '+91 11 4419 9199', hours: 'Lun-Vie 8:00-11:30', web: 'https://new-delhi.diplo.de' },
    embassy_FR: { address: '2/50E Shantipath, Chanakyapuri, Nueva Delhi 110021', phone: '+91 11 4319 6100', hours: 'Lun-Vie 9:00-12:30', web: null },
    embassy_IT: { address: '50E Chandragupta Marg, Chanakyapuri, Nueva Delhi 110021', phone: '+91 11 2611 4355', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_GB: { address: 'Shantipath, Chanakyapuri, Nueva Delhi 110021', phone: '+91 11 2419 2100', hours: 'Lun-Vie 8:00-12:00', web: 'https://www.gov.uk/world/india' },
    embassy_US: { address: 'Shantipath, Chanakyapuri, Nueva Delhi 110021', phone: '+91 11 2419 8000', hours: 'Lun-Vie 8:00-11:00', web: 'https://in.usembassy.gov' },
    embassy_CN: { address: '50D Shantipath, Chanakyapuri, Nueva Delhi 110021', phone: '+91 11 2611 2345', hours: 'Lun-Vie 9:00-12:00', web: null },
    useful_apps: [
      { name: 'Ola / Uber', icon: '🚖', description: 'Las dos apps de taxi más usadas en India — siempre precio cerrado.' },
      { name: 'IRCTC Rail Connect', icon: '🚂', description: 'Reservas de tren oficial en India — necesita registro previo.' },
      { name: 'MakeMyTrip', icon: '✈️', description: 'Vuelos y hoteles internos — los internos en India son baratos.' },
    ],
    safety_tips: [
      'Bebe siempre agua embotellada, nunca del grifo. Cuidado con el hielo en bebidas de puestos callejeros.',
      'Las mujeres deben evitar viajar solas de noche en algunas zonas, especialmente en transporte.',
      'El "estómago del viajero" es frecuente — lleva loperamida y sales de rehidratación.',
      'El regateo es esperable y parte de la cultura en mercados y con rickshaws.',
    ],
  },

  'China': {
    emergency_general: '110 (policía) / 120 (ambulancia)',
    police: '110',
    ambulance: '120',
    fire: '119',
    embassy_ES: {
      address: 'Sanlitun Lu 9, Chaoyang District, Pekín 100600',
      phone: '+86 10 6532 3629',
      hours: 'Lun-Vie 9:00-12:00',
      web: 'https://www.exteriores.gob.es/Embajadas/pekin',
    },
    useful_apps: [
      { name: 'DiDi', icon: '🚖', description: 'El Uber chino — taxi con conductor profesional.' },
      { name: 'WeChat Pay / AliPay', icon: '💳', description: 'Pago móvil esencial en China — muchos sitios no aceptan efectivo.' },
      { name: 'VPN (configurar antes de llegar)', icon: '🔐', description: 'Google, WhatsApp e Instagram están bloqueados en China.' },
    ],
    safety_tips: [
      'Instala una VPN fiable ANTES de llegar a China — después es difícil descargarla.',
      'WhatsApp y Google Maps no funcionan sin VPN. Descarga WeChat y Baidu Maps como alternativa.',
      'Registra tu alojamiento en la policía local (hoteles lo hacen automáticamente, pisos turísticos no siempre).',
    ],
  },

  'Corea del Sur': {
    emergency_general: '112 (policía) / 119 (bomberos y ambulancia)',
    police: '112',
    ambulance: '119',
    fire: '119',
    embassy_ES: {
      address: 'Hannam-daero 16-gil 29, Yongsan-gu, Seúl',
      phone: '+82 2 794 3581',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/seul',
    },
    embassy_AR: { address: '2F, Diplomacia Bldg, 2558 Nambusunhwan-ro, Seocho-gu, Seúl', phone: '+82 2 3476 2580', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CO: { address: '370 Hangang-daero, Yongsan-gu, Seúl', phone: '+82 2 720 1369', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_MX: { address: '33-6 Hannam-daero 28-gil, Yongsan-gu, Seúl', phone: '+82 2 798 1694', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CL: { address: '2F Simplex Bldg, 226 Itaewon-ro, Yongsan-gu, Seúl', phone: '+82 2 740 5970', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PE: { address: '5th Floor, 26 Sowol-ro 2-gil, Yongsan-gu, Seúl', phone: '+82 2 757 1735', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BR: { address: '4th Floor, 125 Sejong-daero, Jung-gu, Seúl', phone: '+82 2 738 4970', hours: 'Lun-Vie 9:00-13:00', web: 'https://seul.itamaraty.gov.br' },
    embassy_VE: { address: '7th Floor, KDB Life Bldg, 59 Mapo-daero, Mapo-gu, Seúl', phone: '+82 2 716 2238', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_DE: { address: '8-11 Hannam-daero 20-gil, Yongsan-gu, Seúl', phone: '+82 2 748 4114', hours: 'Lun-Vie 8:00-11:00', web: 'https://seoul.diplo.de' },
    embassy_FR: { address: '30 Hap-dong, Seodaemun-gu, Seúl', phone: '+82 2 3149 4300', hours: 'Lun-Vie 9:00-12:30', web: null },
    embassy_IT: { address: '1-398 Hannam-dong, Yongsan-gu, Seúl', phone: '+82 2 796 0491', hours: 'Lun-Vie 9:00-12:30', web: null },
    embassy_GB: { address: '24 Sejong-daero 19-gil, Jung-gu, Seúl', phone: '+82 2 3210 5500', hours: 'Lun-Vie 9:00-12:00', web: 'https://www.gov.uk/world/south-korea' },
    embassy_US: { address: '188 Sejong-daero, Jongno-gu, Seúl', phone: '+82 2 397 4114', hours: 'Lun-Vie 8:30-12:00', web: 'https://kr.usembassy.gov' },
    embassy_CN: { address: '54 Hyoja-ro, Jongno-gu, Seúl', phone: '+82 2 738 1038', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_PT: { address: 'Seúl — contactar embajada en Tokio', phone: null, hours: null, web: null },
    useful_apps: [
      { name: 'Kakao T', icon: '🚕', description: 'La app de taxi oficial de Corea del Sur.' },
      { name: 'Naver Maps', icon: '🗺️', description: 'Mejor que Google Maps en Corea para transporte público.' },
      { name: 'T-money', icon: '💳', description: 'Tarjeta de transporte recargable para metro y bus.' },
    ],
    safety_tips: [
      'Corea del Sur es extremadamente segura — una de las más seguras de Asia.',
      'Los hospitales surcoreanos son de alta calidad y asequibles comparado con Europa.',
      'El metro de Seúl tiene pantallas en inglés — es fácil de usar para extranjeros.',
    ],
  },

  'Singapur': {
    emergency_general: '999 (policía) / 995 (ambulancia)',
    police: '999',
    ambulance: '995',
    fire: '995',
    embassy_ES: {
      address: '60 North Bridge Road, #08-02 Mapletree Business City, Singapur',
      phone: '+65 6732 9555',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/singapur',
    },
    embassy_AR: { address: 'Goldhill Plaza #03-35, Singapore 308899', phone: '+65 6235 6288', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CO: { address: '101 Thomson Road #25-03, Singapore 307591', phone: '+65 6737 4449', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_MX: { address: '152 Beach Road #33-04, Singapore 189721', phone: '+65 6735 0254', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CL: { address: '105 Cecil Street #16-01/02, Singapore 069534', phone: '+65 6222 8577', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PE: { address: '1 George Street #10-01, Singapore 049145', phone: '+65 6338 9949', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BR: { address: '101 Thomson Road #13-03, Singapore 307591', phone: '+65 6256 8922', hours: 'Lun-Vie 9:00-13:00', web: 'https://cingapura.itamaraty.gov.br' },
    embassy_DE: { address: '50 Raffles Place #29-00, Singapore 048623', phone: '+65 6533 6002', hours: 'Lun-Vie 8:30-12:00', web: 'https://singapur.diplo.de' },
    embassy_FR: { address: '101-103 Cluny Park Road, Singapore 259595', phone: '+65 6880 7800', hours: 'Lun-Vie 9:00-12:30', web: null },
    embassy_GB: { address: '100 Tanglin Road, Singapore 247919', phone: '+65 6424 4200', hours: 'Lun-Vie 9:00-12:00', web: 'https://www.gov.uk/world/singapore' },
    embassy_US: { address: '27 Napier Road, Singapore 258508', phone: '+65 6476 9100', hours: 'Lun-Vie 8:00-11:30', web: 'https://sg.usembassy.gov' },
    embassy_CN: { address: '150 Tanglin Road, Singapore 247969', phone: '+65 6418 0258', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_IT: { address: '101 Thomson Road #27-01, Singapore 307591', phone: '+65 6250 6022', hours: 'Lun-Vie 9:00-12:30', web: null },
    embassy_PT: { address: '541 Orchard Road #08-01, Singapore 238881', phone: '+65 6235 3724', hours: 'Lun-Vie 9:00-13:00', web: null },
    useful_apps: [
      { name: 'Grab', icon: '🚗', description: 'Taxis y VTC en Singapur.' },
      { name: 'MyTransport.SG', icon: '🚇', description: 'Transporte público oficial de Singapur.' },
    ],
    safety_tips: [
      'Singapur tiene leyes muy estrictas: mascar chicle, fumar en lugares no permitidos y arrojar basura tienen multas elevadas.',
      'La pena de muerte existe para tráfico de drogas — tolerancia cero absoluta.',
      'Es la ciudad más segura de Asia para turistas.',
    ],
  },

  'Indonesia': {
    emergency_general: '112',
    police: '110',
    ambulance: '118',
    fire: '113',
    embassy_ES: {
      address: 'Jl. H.R. Rasuna Said Kav. X Kav. 1-2, Kuningan, Yakarta',
      phone: '+62 21 2553 6000',
      hours: 'Lun-Vie 8:00-12:30',
      web: 'https://www.exteriores.gob.es/Embajadas/yakarta',
    },
    embassy_AR: { address: 'Menara Mulia Suite 1900, Jl. Jend. Gatot Subroto Kav. 9-11, Yakarta', phone: '+62 21 526 3576', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CO: { address: 'Wisma Bumi Putera Suite 1007, Jl. Jend. Sudirman Kav. 75, Yakarta', phone: '+62 21 520 4715', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_MX: { address: 'Menara Mulia Suite 2306, Jl. Jend. Gatot Subroto Kav. 9-11, Yakarta', phone: '+62 21 520 3980', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CL: { address: 'Gedung Artha Graha Lt. 19, SCBD, Yakarta', phone: '+62 21 251 4726', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PE: { address: 'Graha Paramita 5F, Jl. Denpasar Raya Kav. 8, Yakarta', phone: '+62 21 252 2776', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BR: { address: 'Menara Mulia Suite 1602, Jl. Jend. Gatot Subroto Kav. 9-11, Yakarta', phone: '+62 21 526 0580', hours: 'Lun-Vie 9:00-13:00', web: 'https://jacarta.itamaraty.gov.br' },
    embassy_DE: { address: 'Jl. Madiun No.1-3, Menteng, Yakarta', phone: '+62 21 3985 5000', hours: 'Lun-Vie 8:00-11:30', web: 'https://jakarta.diplo.de' },
    embassy_FR: { address: 'Jl. MH Thamrin No.20, Yakarta', phone: '+62 21 2355 7600', hours: 'Lun-Vie 8:30-12:00', web: null },
    embassy_GB: { address: 'Puri Imperium Building, Jl. Kuningan Madya, Yakarta', phone: '+62 21 2356 5200', hours: 'Lun-Vie 8:00-12:00', web: 'https://www.gov.uk/world/indonesia' },
    embassy_US: { address: 'Jl. Medan Merdeka Selatan 4-5, Yakarta', phone: '+62 21 5083 1000', hours: 'Lun-Vie 7:30-16:00', web: 'https://id.usembassy.gov' },
    embassy_CN: { address: 'Jl. Mega Kuningan No.2, Yakarta', phone: '+62 21 5761 001', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_PT: { address: 'Jl. Dr. Kusuma Atmaja No.52, Yakarta', phone: '+62 21 315 1638', hours: 'Lun-Vie 9:00-13:00', web: null },
    useful_apps: [
      { name: 'Gojek', icon: '🛵', description: 'El Grab indonesio — mototaxi, taxi y delivery en Indonesia.' },
      { name: 'Traveloka', icon: '✈️', description: 'Vuelos y hoteles para destinos internos en Indonesia.' },
    ],
    safety_tips: [
      'En Bali, los "money changers" en la calle pueden estafar con técnicas de desviar atención — usa bancos.',
      'Beber agua embotellada siempre. El agua del grifo no es potable.',
      'El volcán Agung en Bali está activo — consulta alertas volcánicas antes de visitar el área.',
    ],
  },

  // ── AMERICA ───────────────────────────────────────────────────────────────

  'México': {
    emergency_general: '911',
    police: '911',
    ambulance: '911',
    fire: '911',
    embassy_ES: {
      address: 'Galileo 114, Colonia Polanco, 11560 Ciudad de México',
      phone: '+52 55 5282 2977',
      hours: 'Lun-Vie 9:00-14:00',
      web: 'https://www.exteriores.gob.es/Embajadas/mexico',
    },
    useful_apps: [
      { name: 'Uber / DiDi', icon: '🚗', description: 'Siempre usa taxi con app en CDMX — nunca taxis de calle.' },
      { name: 'CDMX app', icon: '🌆', description: 'App oficial de Ciudad de México con emergencias, metro y servicios.' },
      { name: 'Google Maps', icon: '🗺️', description: 'Funciona muy bien en México para transporte público.' },
    ],
    safety_tips: [
      'En CDMX y ciudades grandes, usa siempre Uber o DiDi — los "taxis piratas" son peligrosos.',
      'El Metro de CDMX tiene bolsillos en hora punta — usa mochila en el pecho.',
      'Consulta el mapa de zonas de seguridad antes de aventurarte por barrios desconocidos.',
      'Nunca saques el móvil en la calle en colonias de bajo nivel turístico.',
    ],
  },

  'Argentina': {
    emergency_general: '911',
    police: '101',
    ambulance: '107',
    fire: '100',
    embassy_ES: {
      address: 'Mariscal Ramón Castilla 2720, 1425 Buenos Aires',
      phone: '+54 11 4802 0444',
      hours: 'Lun-Vie 9:00-13:30',
      web: 'https://www.exteriores.gob.es/Embajadas/buenosaires',
    },
    useful_apps: [
      { name: 'Cabify / Uber', icon: '🚗', description: 'VTC en Buenos Aires — los taxis regulares también son seguros pero usa apps.' },
      { name: 'Mercado Libre', icon: '💳', description: 'Para pagos con QR en muchos comercios.' },
    ],
    safety_tips: [
      'Buenos Aires tiene zonas turísticas muy seguras (Palermo, Recoleta) y otras que requieren más cautela (La Boca de noche).',
      'El "express kidnapping" (secuestro express) existe aunque es poco frecuente — no exhibas aparatos caros.',
      'Los cajeros automáticos: usa los de dentro de bancos, nunca los de la calle solos.',
    ],
  },

  'Colombia': {
    emergency_general: '123',
    police: '112',
    ambulance: '125',
    fire: '119',
    embassy_ES: {
      address: 'Calle 94 No. 11A-34, Bogotá',
      phone: '+57 1 700 0900',
      hours: 'Lun-Vie 9:00-13:30',
      web: 'https://www.exteriores.gob.es/Embajadas/bogota',
    },
    useful_apps: [
      { name: 'Uber / InDriver', icon: '🚗', description: 'VTC en Colombia — más seguro que taxis en la calle.' },
      { name: 'Rappi', icon: '🍔', description: 'Delivery de comida y supermercado en Colombia.' },
    ],
    safety_tips: [
      'Colombia ha mejorado mucho en seguridad — Medellín y Cartagena son muy turísticas y relativamente seguras.',
      'La "burundanga" (escopolamina) es un riesgo real — nunca aceptes bebidas de desconocidos.',
      'El "paseo millonario" (taxi secuestro) existe — usa siempre apps de transporte.',
      'No exhibas joyas, móviles caros ni cámara de forma llamativa en la calle.',
    ],
  },

  'Perú': {
    emergency_general: '105 (policía) / 116 (bomberos)',
    police: '105',
    ambulance: '117',
    fire: '116',
    embassy_ES: {
      address: 'Calle Los Pinos 490, Av. El Rosario, San Isidro, Lima',
      phone: '+51 1 212 1200',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/lima',
    },
    useful_apps: [
      { name: 'Uber / Cabify', icon: '🚗', description: 'VTC disponible en Lima y Cusco.' },
      { name: 'Machu Picchu Tickets', icon: '🏔️', description: 'Reserva de entradas a Machu Picchu con antelación — es obligatorio reservar.' },
    ],
    safety_tips: [
      'Machu Picchu requiere entrada con fecha y hora fijadas — resérvala con semanas o meses de antelación.',
      'El mal de altura (soroche) en Cusco (3400m) es real — descansa el primer día, bebe mucha agua y consume hoja de coca.',
      'En Lima, el Miraflores y Barranco son seguros para turistas; el Centro Histórico requiere más atención.',
    ],
  },

  'Chile': {
    emergency_general: '133 (policía) / 131 (ambulancia)',
    police: '133',
    ambulance: '131',
    fire: '132',
    embassy_ES: {
      address: 'Avda. Andrés Bello 1895, Providencia, Santiago',
      phone: '+56 2 2235 2755',
      hours: 'Lun-Vie 9:00-13:30',
      web: 'https://www.exteriores.gob.es/Embajadas/santiago',
    },
    useful_apps: [
      { name: 'Cabify / Uber', icon: '🚗', description: 'VTC en Santiago.' },
      { name: 'Bip! (Metro de Santiago)', icon: '🚇', description: 'App del metro de Santiago.' },
    ],
    safety_tips: [
      'Chile es el país más seguro de Sudamérica para turistas.',
      'En el norte (Atacama), el sol es extremadamente intenso incluso con frío — usa factor 50 y sombrero.',
      'La carretera Austral puede tener tramos sin cobertura — informa a alguien de tu ruta antes de ir.',
    ],
  },

  'Brasil': {
    emergency_general: '190 (policía) / 192 (ambulancia)',
    police: '190',
    ambulance: '192',
    fire: '193',
    embassy_ES: {
      address: 'SES Av. das Nações Qd. 811, Lote 44, Brasília',
      phone: '+55 61 3345 2300',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/brasilia',
    },
    useful_apps: [
      { name: '99 / Uber', icon: '🚗', description: '99 es el Uber brasileño — más usado en Rio y São Paulo.' },
      { name: 'iFood', icon: '🍔', description: 'Delivery de comida en Brasil.' },
    ],
    safety_tips: [
      'Brasil tiene zonas muy seguras (Ipanema, Leblon en Rio) y otras que requieren máxima precaución (favelas sin tour guiado).',
      'Nunca salgas con el móvil caro a la vista en calles con poca gente — el "arrastão" (robo en grupo) existe.',
      'En playas, deja lo mínimo en la toalla — hay robos frecuentes.',
      'El Carnaval es espectacular pero los robos se multiplican — lleva solo efectivo mínimo.',
    ],
  },

  // ── AFRICA Y ORIENTE MEDIO ────────────────────────────────────────────────

  'Marruecos': {
    emergency_general: '19 (policía urbana) / 15 (SAMU)',
    police: '19',
    ambulance: '15',
    fire: '15',
    embassy_ES: {
      address: 'Rue Ain Khalouiya, km 5,3 Route des Zaers, Rabat',
      phone: '+212 537 63 39 00',
      hours: 'Lun-Vie 8:30-13:30',
      web: 'https://www.exteriores.gob.es/Embajadas/rabat',
    },
    embassy_FR: { address: '3 Rue Sahnoun, Agdal, Rabat', phone: '+212 5 37 68 97 00', hours: 'Lun-Vie 9:00-12:30', web: 'https://ma.ambafrance.org' },
    embassy_DE: { address: '7 Zankat Madnine, Rabat', phone: '+212 5 37 21 00 22', hours: 'Lun-Vie 8:30-11:30', web: 'https://rabat.diplo.de' },
    embassy_IT: { address: '2 Rue Idriss Al Azhar, Rabat', phone: '+212 5 37 72 68 07', hours: 'Lun-Vie 9:00-12:00', web: 'https://ambrabat.esteri.it' },
    embassy_BR: { address: '3 Rue Thami Lamdawar, Souissi, Rabat', phone: '+212 5 37 65 04 56', hours: 'Lun-Vie 9:00-12:00', web: 'https://rabat.itamaraty.gov.br' },
    embassy_AR: { address: '12 Rue Meknes, Agdal, Rabat', phone: '+212 537 68 96 00', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CO: { address: '25 Rue de Belgique, Hassan, Rabat', phone: '+212 537 70 19 74', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_MX: { address: '6 Rue Cadi Mohamed Benatiya, Souissi, Rabat', phone: '+212 537 63 70 70', hours: 'Lun-Vie 9:00-13:30', web: null },
    embassy_CL: { address: '3 Impasse Ait Melloul, Souissi, Rabat', phone: '+212 537 75 30 14', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PE: { address: '16 Rue Thami Lamdaouar, Souissi, Rabat', phone: '+212 537 75 18 18', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_GB: { address: '28 Avenue SAR Sidi Mohammed, Souissi, Rabat', phone: '+212 537 63 33 33', hours: 'Lun-Vie 8:30-12:00', web: 'https://www.gov.uk/world/morocco' },
    embassy_US: { address: 'Km 5.7, Avenue Mohamed VI, Souissi, Rabat', phone: '+212 537 63 72 00', hours: 'Lun-Vie 8:00-17:00', web: 'https://ma.usembassy.gov' },
    embassy_PT: { address: 'Avenue de Marrakech, Quartier de la Gironde, Rabat', phone: '+212 537 73 01 00', hours: 'Lun-Vie 9:00-13:00', web: null },
    useful_apps: [
      { name: 'Careem / inDrive', icon: '🚗', description: 'VTC en Casablanca y Marrakech — mucho más seguro que taxis informales.' },
      { name: 'WhatsApp', icon: '💬', description: 'La comunicación principal en Marruecos — todo el mundo lo usa.' },
    ],
    safety_tips: [
      'Los "falsos guías" en Marrakech son muy persistentes — di firmemente "non merci" y camina con decisión.',
      'En la medina, es normal perderse — lleva descargado el mapa offline de la medina.',
      'El regateo es obligatorio en souks — el precio inicial puede ser 5-10x el precio real.',
      'Las mujeres solas deben ser cautelosas especialmente de noche en medinas pequeñas.',
    ],
  },

  'Egipto': {
    emergency_general: '123 (policía) / 123 (ambulancia)',
    police: '122',
    ambulance: '123',
    fire: '180',
    embassy_ES: {
      address: '41 Ismail Mohamed Street, Zamalek, El Cairo',
      phone: '+20 2 2735 6535',
      hours: 'Lun-Vie 9:00-12:00',
      web: 'https://www.exteriores.gob.es/Embajadas/elcairo',
    },
    embassy_FR: { address: '29 Avenue Charles de Gaulle, Giza, El Cairo', phone: '+20 2 3567 3200', hours: 'Lun-Vie 9:00-12:00', web: 'https://eg.ambafrance.org' },
    embassy_DE: { address: '2 El Shaikh Mohamed Mahran St, Giza, El Cairo', phone: '+20 2 3748 8440', hours: 'Lun-Vie 8:30-11:30', web: 'https://kairo.diplo.de' },
    embassy_IT: { address: '15 Abd El Rahman Fahmy St, Garden City, El Cairo', phone: '+20 2 2794 3194', hours: 'Lun-Vie 9:00-12:00', web: 'https://ambcairo.esteri.it' },
    embassy_BR: { address: '1 El Shaikh Mohamed Mahran St, Giza, El Cairo', phone: '+20 2 3748 7960', hours: 'Lun-Vie 9:00-12:00', web: 'https://cairo.itamaraty.gov.br' },
    embassy_PE: { address: 'El Cairo — Embajada del Perú: 34 Soliman Abaza, Mohandessin', phone: '+20 2 3748 8040', hours: 'Lun-Vie 9:00-13:00', web: 'https://www.embajadaperu.com.eg' },
    embassy_AR: { address: '8 Al-Saleh Ayoub Street, Zamalek, El Cairo', phone: '+20 2 2735 0494', hours: 'Lun-Jue 9:00-14:00', web: null },
    embassy_CO: { address: '6 El Saleh Ayoub, Zamalek, El Cairo', phone: '+20 2 2736 0007', hours: 'Lun-Jue 9:00-14:00', web: null },
    embassy_MX: { address: '5 Dr. Mostafa Naguib Street, New Cairo', phone: '+20 2 2519 1150', hours: 'Lun-Jue 9:00-14:00', web: null },
    embassy_CL: { address: '5 Shagaret el Dor, Zamalek, El Cairo', phone: '+20 2 2736 3825', hours: 'Lun-Jue 9:00-14:00', web: null },
    embassy_VE: { address: '15 El Maahad El Swissry, Zamalek, El Cairo', phone: '+20 2 2735 5019', hours: 'Lun-Jue 9:00-13:00', web: null },
    embassy_GB: { address: '7 Ahmed Ragheb Street, Garden City, El Cairo', phone: '+20 2 2791 6000', hours: 'Lun-Jue 8:00-12:30', web: 'https://www.gov.uk/world/egypt' },
    embassy_US: { address: '8 Kamal El Din Salah Street, Garden City, El Cairo', phone: '+20 2 2797 3300', hours: 'Lun-Jue 8:00-10:30', web: 'https://eg.usembassy.gov' },
    embassy_CN: { address: '14 Bahgat Ali Street, Zamalek, El Cairo', phone: '+20 2 2736 7501', hours: 'Lun-Jue 9:00-12:00', web: null },
    embassy_PT: { address: '22 El Mecca El Mokarama Street, Dokki, El Cairo', phone: '+20 2 3335 0230', hours: 'Lun-Jue 9:00-13:00', web: null },
    useful_apps: [
      { name: 'Uber / Careem', icon: '🚗', description: 'VTC en El Cairo — imprescindible para moverse con seguridad.' },
      { name: 'WhatsApp', icon: '💬', description: 'Principal comunicación en Egipto.' },
    ],
    safety_tips: [
      'El tráfico en El Cairo es caótico — usa siempre VTC, nunca cruces calles sin mirar en todas direcciones.',
      'Los vendedores en las pirámides son muy insistentes — di un "la shukran" (no gracias) firme.',
      'Bebe solo agua embotellada — evita el hielo en bebidas fuera de hoteles de calidad.',
      'En la zona de Luxor y Asuán, la policía turística es visible y el entorno es seguro.',
    ],
  },

  'Emiratos Árabes': {
    emergency_general: '999',
    police: '999',
    ambulance: '998',
    fire: '997',
    embassy_ES: {
      address: 'Embajada en Abu Dabi: Villa 1, al lado de la embajada de Bahrein, Abu Dabi',
      phone: '+971 2 6272 544',
      hours: 'Lun-Vie 8:30-13:30',
      web: 'https://www.exteriores.gob.es/Embajadas/abudabi',
    },
    embassy_FR: { address: 'Abu Dabi: Corniche Road West, Abu Dabi', phone: '+971 2 443 5100', hours: 'Lun-Vie 8:30-12:30', web: 'https://ae.ambafrance.org' },
    embassy_DE: { address: 'Abu Dabi: PO Box 2591, Abu Dabi', phone: '+971 2 644 0700', hours: 'Lun-Vie 7:30-12:00', web: 'https://abudhabi.diplo.de' },
    embassy_IT: { address: 'Abu Dabi: Villa 3-7, Zone A, Abu Dabi', phone: '+971 2 443 5622', hours: 'Lun-Vie 9:00-12:00', web: 'https://ambaboudhabi.esteri.it' },
    embassy_BR: { address: 'Abu Dabi: Khalidiyah, Abu Dabi', phone: '+971 2 674 4008', hours: 'Lun-Vie 9:00-12:00', web: 'https://abudhabi.itamaraty.gov.br' },
    useful_apps: [
      { name: 'Careem / Uber', icon: '🚗', description: 'VTC en Dubai y Abu Dabi — muy eficiente y económico.' },
      { name: 'Dubai Metro', icon: '🚇', description: 'Metro de Dubai muy moderno, con app oficial de la RTA.' },
    ],
    safety_tips: [
      'Los EAU tienen leyes muy estrictas: las relaciones homosexuales están prohibidas.',
      'Beber alcohol en la calle o conducir con alcohol está penado con cárcel.',
      'Durante el Ramadán, comer, beber o fumar en público durante el día puede conllevar arresto.',
      'Es uno de los países más seguros del mundo en términos de criminalidad ordinaria.',
    ],
  },

  // ── OCEANIA ───────────────────────────────────────────────────────────────

  'Australia': {
    emergency_general: '000',
    police: '000',
    ambulance: '000',
    fire: '000',
    embassy_ES: {
      address: '15 Arkana Street, Yarralumla, Canberra ACT 2600',
      phone: '+61 2 6273 3555',
      hours: 'Lun-Vie 9:00-13:00',
      web: 'https://www.exteriores.gob.es/Embajadas/canberra',
    },
    embassy_AR: { address: 'MLC Tower Level 14, 19-29 Martin Place, Sídney NSW 2000', phone: '+61 2 9262 2933', hours: 'Lun-Vie 9:30-13:00', web: null },
    embassy_CO: { address: 'Level 1, 17 Castlereagh Street, Sídney NSW 2000', phone: '+61 2 9231 0544', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_MX: { address: '14 Perth Ave, Yarralumla, Canberra ACT 2600', phone: '+61 2 6273 3963', hours: 'Lun-Vie 9:00-13:00', web: 'https://embamex.sre.gob.mx/australia' },
    embassy_CL: { address: '10 Culgoa Circuit, O\'Malley, Canberra ACT 2606', phone: '+61 2 6286 2430', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PE: { address: '40 Brisbane Ave, Barton, Canberra ACT 2600', phone: '+61 2 6273 7351', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BR: { address: 'SETL Quadra 801, Lote 62, Brasília DF (embajada en Canberra)', phone: '+61 2 6273 2372', hours: 'Lun-Vie 9:00-13:00', web: 'https://camberra.itamaraty.gov.br' },
    embassy_VE: { address: '7 Culgoa Circuit, O\'Malley, Canberra ACT 2606', phone: '+61 2 6290 2967', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_DE: { address: '119 Empire Circuit, Yarralumla, Canberra ACT 2600', phone: '+61 2 6270 1911', hours: 'Lun-Vie 8:30-11:30', web: 'https://canberra.diplo.de' },
    embassy_FR: { address: '6 Perth Ave, Yarralumla, Canberra ACT 2600', phone: '+61 2 6216 0100', hours: 'Lun-Vie 9:00-12:30', web: null },
    embassy_IT: { address: '12 Grey Street, Deakin, Canberra ACT 2600', phone: '+61 2 6273 3333', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_GB: { address: 'Commonwealth Ave, Yarralumla, Canberra ACT 2600', phone: '+61 2 6270 6666', hours: 'Lun-Vie 9:00-12:00', web: 'https://www.gov.uk/world/australia' },
    embassy_US: { address: 'Moonah Place, Yarralumla, Canberra ACT 2600', phone: '+61 2 6214 5600', hours: 'Lun-Vie 8:30-12:00', web: 'https://au.usembassy.gov' },
    embassy_CN: { address: '15 Coronation Drive, Yarralumla, Canberra ACT 2600', phone: '+61 2 6228 3999', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_PT: { address: '23 Culgoa Circuit, O\'Malley, Canberra ACT 2606', phone: '+61 2 6290 1733', hours: 'Lun-Vie 9:00-13:00', web: null },
    useful_apps: [
      { name: 'Emergency+ (112)', icon: '🆘', description: 'App oficial australiana de emergencias con GPS automático.' },
      { name: 'GovReady', icon: '🏛️', description: 'Alertas de desastres naturales y emergencias.' },
      { name: 'Uber / Ola', icon: '🚗', description: 'VTC en las ciudades australianas.' },
    ],
    safety_tips: [
      'La fauna australiana puede ser peligrosa: respeta distancias con cocodrilos (norte), medusas "box jellyfish" y serpientes.',
      'El sol es extremadamente intenso — factor 50, sombrero y evita exposición entre 11h-15h.',
      'Nada siempre entre las banderas en playas supervisadas — las corrientes pueden ser letales.',
      'El número de emergencias es 000, no 112 (aunque 112 funciona desde móvil).',
    ],
  },


  // ══ EUROPA ADICIONAL ══════════════════════════════════════════════════════
  'Bélgica': {
    emergency_general: '112', police: '101', ambulance: '100', fire: '100',
    embassy_ES: 'Embajada de España en Bruselas: +32 2 230 03 40',
    useful_apps: [{ name: 'BE-Alert', icon: '🚨', description: 'Alertas de emergencia oficiales de Bélgica.' }],
    safety_tips: ['Los barrios del centro de Bruselas son seguros de día. Cuidado con carteristas en el metro.'],
  },
  'Países Bajos': {
    emergency_general: '112', police: '0900-8844', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en La Haya: +31 70 302 49 99',
    useful_apps: [{ name: 'Burgernet', icon: '🚔', description: 'Red ciudadana de seguridad de la policía holandesa.' }],
    safety_tips: ['Cuidado con los carriles bici en Amsterdam y otras ciudades — tienen prioridad.', 'Los robos de bicicletas son muy frecuentes.'],
  },
  'Suecia': {
    emergency_general: '112', police: '114 14', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Estocolmo: +46 8 667 43 00',
    useful_apps: [{ name: '112 Sverige', icon: '🆘', description: 'App oficial de emergencias sueca con geolocalización.' }],
    safety_tips: ['País muy seguro. Cuidado con el frío extremo en invierno.'],
  },
  'Noruega': {
    emergency_general: '112', police: '02800', ambulance: '113', fire: '110',
    embassy_ES: 'Embajada de España en Oslo: +47 22 92 28 80',
    useful_apps: [{ name: 'Hjelp112', icon: '🆘', description: 'App oficial de emergencias noruega.' }],
    safety_tips: ['País muy seguro. En senderismo avisa siempre de tu ruta. Clima cambiante.'],
  },
  'Dinamarca': {
    emergency_general: '112', police: '114', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Copenhague: +45 35 42 47 00',
    useful_apps: [{ name: '112 app', icon: '🆘', description: 'App de emergencias danesa.' }],
    safety_tips: ['Muy seguro. Cuidado con los robos en zonas turísticas de Copenhague (Nyhavn).'],
  },
  'Finlandia': {
    emergency_general: '112', police: '0295 419 800', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Helsinki: +358 9 687 00 80',
    useful_apps: [{ name: '112 Suomi', icon: '🆘', description: 'App oficial de emergencias finlandesa con GPS.' }],
    safety_tips: ['País muy seguro. Peligro de hipotermia en invierno. Nunca camines solo en el hielo sin comprobarlo.'],
  },
  'Irlanda': {
    emergency_general: '112/999', police: '999', ambulance: '999', fire: '999',
    embassy_ES: 'Embajada de España en Dublín: +353 1 269 16 40',
    useful_apps: [],
    safety_tips: ['Muy seguro. Tráfico por la izquierda. Cuidado con los acantilados costeros sin barandilla.'],
  },
  'Polonia': {
    emergency_general: '112', police: '997', ambulance: '999', fire: '998',
    embassy_ES: 'Embajada de España en Varsovia: +48 22 583 40 00',
    useful_apps: [],
    safety_tips: ['Seguro. Cuidado con taxis no regulados en Varsovia. Usa Bolt o Uber.'],
  },
  'República Checa': {
    emergency_general: '112', police: '158', ambulance: '155', fire: '150',
    embassy_ES: 'Embajada de España en Praga: +420 233 097 211',
    useful_apps: [],
    safety_tips: ['Seguro. Praga: cuidado con cambio de moneda en la calle — timo frecuente. Usa cajeros de banco.'],
  },
  'Hungría': {
    emergency_general: '112', police: '107', ambulance: '104', fire: '105',
    embassy_ES: 'Embajada de España en Budapest: +36 1 202 40 06',
    useful_apps: [],
    safety_tips: ['Seguro. Cuidado con bares y clubes en Budapest que cobran precios abusivos a turistas.'],
  },
  'Croacia': {
    emergency_general: '112', police: '192', ambulance: '194', fire: '193',
    embassy_ES: 'Embajada de España en Zagreb: +385 1 4848 950',
    useful_apps: [],
    safety_tips: ['Seguro. Costa dálmata: cuidado con las embarcaciones en zonas de baño. Sol muy intenso en verano.'],
  },
  'Rumania': {
    emergency_general: '112', police: '112', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Bucarest: +40 21 318 10 20',
    useful_apps: [],
    safety_tips: ['Relativamente seguro. Cuidado con perros callejeros en zonas rurales. Carreteras en mal estado.'],
  },
  'Bulgaria': {
    emergency_general: '112', police: '166', ambulance: '150', fire: '160',
    embassy_ES: 'Embajada de España en Sofía: +359 2 943 30 32',
    useful_apps: [],
    safety_tips: ['Seguro. Cuidado con taxis sin taxímetro visible. Pregunta el precio antes.'],
  },
  'Serbia': {
    emergency_general: '112', police: '192', ambulance: '194', fire: '193',
    embassy_ES: 'Embajada de España en Belgrado: +381 11 2444 476',
    useful_apps: [],
    safety_tips: ['Seguro. Belgrado tiene vida nocturna activa — los barcos-discoteca (splavovi) en el Danubio son seguros.'],
  },
  'Eslovaquia': {
    emergency_general: '112', police: '158', ambulance: '155', fire: '150',
    embassy_ES: 'Embajada de España en Bratislava: +421 2 5441 6597',
    useful_apps: [],
    safety_tips: ['Seguro. Montañas Tatra: riesgo de tormentas repentinas en verano. Sigue siempre los senderos marcados.'],
  },
  'Eslovenia': {
    emergency_general: '112', police: '113', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Ljubljana: +386 1 425 40 34',
    useful_apps: [],
    safety_tips: ['Muy seguro. Lago Bled: corrientes en zonas de natación. Cueva de Postojna: sigue al guía.'],
  },
  'Islandia': {
    emergency_general: '112', police: '444 1000', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Reikiavik: +354 511 28 50',
    useful_apps: [{ name: 'Safetravel IS', icon: '🌋', description: 'App oficial de seguridad en viajes por Islandia. Imprescindible.' }],
    safety_tips: ['Naturaleza peligrosa: géiseres queman, olas rogue en la costa negra, erupciones volcánicas. Consulta safetravel.is SIEMPRE.', 'Nunca cruces ríos sin conocer su profundidad. Alquila 4x4 para el interior (Highlands).'],
  },
  'Malta': {
    emergency_general: '112', police: '2122 4001', ambulance: '112', fire: '199',
    embassy_ES: 'Embajada de España en La Valeta: +356 21 232 843',
    useful_apps: [],
    safety_tips: ['Muy seguro. Calor extremo en verano. Tráfico por la izquierda. Buceo: avisa siempre a alguien.'],
  },

  // ══ ASIA ADICIONAL ════════════════════════════════════════════════════════
  'China': {
    emergency_general: '120/110', police: '110', ambulance: '120', fire: '119',
    embassy_ES: 'Embajada de España en Pekín: +86 10 6532 3629',
    useful_apps: [
      { name: 'DiDi', icon: '🚗', description: 'Taxi por app (equivalente a Uber). Esencial.' },
      { name: 'WeChat / Alipay', icon: '💳', description: 'Para pagos — el efectivo apenas se usa en ciudades.' },
      { name: 'VPN', icon: '🔒', description: 'Google, WhatsApp, Instagram bloqueados. Instala VPN ANTES de llegar.' },
    ],
    safety_tips: ['Instala VPN antes de entrar — Google, WhatsApp, YouTube e Instagram están bloqueados.', 'WeChat o Alipay son imprescindibles para pagar (muchos sitios no aceptan efectivo ni tarjeta extranjera).', 'No fotografíes instalaciones militares, policía o protestas.'],
  },
  'Malasia': {
    emergency_general: '999', police: '999', ambulance: '999', fire: '994',
    embassy_ES: 'Embajada de España en Kuala Lumpur: +60 3 2148 4868',
    useful_apps: [
      { name: 'Grab', icon: '🚗', description: 'Transporte y comida por app. Muy usado.' },
      { name: 'MyEG', icon: '📋', description: 'Trámites oficiales en Malasia.' },
    ],
    safety_tips: ['Seguro en zonas turísticas. Borneo: zona fronteriza Sabah (Lahad Datu) — evitar o consultar situación actual.', 'Conducción temeraria en algunos estados — usa cinturón siempre.'],
  },
  'Filipinas': {
    emergency_general: '911', police: '117', ambulance: '911', fire: '160',
    embassy_ES: 'Embajada de España en Manila: +63 2 8523 9586',
    useful_apps: [
      { name: 'Angkas', icon: '🛵', description: 'Mototaxi por app en Manila. Legal y seguro.' },
      { name: 'Grab', icon: '🚗', description: 'Taxi y entrega de comida.' },
    ],
    safety_tips: ['Cuidado en zonas de Mindanao (Maguindanao, Marawi) — riesgo de seguridad activo. Consulta aviso de viaje.', 'Tifones de junio a noviembre. Sigue instrucciones de evacuación.', 'Nunca lleves mochila en la espalda en zonas concurridas de Manila — riesgo de arrebato.'],
  },
  'Nepal': {
    emergency_general: '100/102', police: '100', ambulance: '102', fire: '101',
    embassy_ES: 'Embajada de España en Nueva Delhi cubre Nepal. En Katmandú: Honorary Consul.',
    useful_apps: [
      { name: 'Trekking Nepal', icon: '🏔️', description: 'Rutas de trekking y altitudes. Útil para Everest Base Camp.' },
    ],
    safety_tips: ['Trekking: nunca solo sin guía registrado. Seguro de evacuación en helicóptero obligatorio para rutas de alta montaña.', 'Mal de altura (AMS) a partir de 3.000m — ascende despacio, hidratate, y baja si tienes síntomas.', 'Agua solo embotellada o purificada.'],
  },
  'Sri Lanka': {
    emergency_general: '119/110', police: '119', ambulance: '110', fire: '111',
    embassy_ES: 'Embajada de España en Colombo: +94 11 269 11 11 (Consulado Hon.)',
    useful_apps: [
      { name: 'PickMe', icon: '🚗', description: 'App de taxi local. Alternativa a Uber.' },
    ],
    safety_tips: ['Costa este: cuidado con corrientes (undertow) en playas. Muchas muertes de bañistas por corrientes.', 'Agua del grifo no potable en general.'],
  },
  'Maldivas': {
    emergency_general: '119', police: '119', ambulance: '102', fire: '118',
    embassy_ES: 'No hay embajada española en Maldivas. La más cercana está en Colombo (Sri Lanka).',
    useful_apps: [],
    safety_tips: ['País muy seguro para turistas en resorts. Malé (capital): más cuidado que en los resorts.', 'Buceo: nunca solo. Certifícate con instructores de PADI.', 'Alcohol: solo se sirve en resorts de islas turísticas, no en isla locales habitadas.'],
  },

  // ══ ORIENTE MEDIO ═════════════════════════════════════════════════════════
  'Emiratos Árabes Unidos': {
    emergency_general: '999', police: '999', ambulance: '998', fire: '997',
    embassy_ES: 'Embajada de España en Abu Dabi: +971 2 626 90 44',
    embassy_AR: { address: 'Villa 25, Al Mushrif Area, Abu Dabi', phone: '+971 2 691 2500', hours: 'Lun-Vie 8:00-14:00', web: null },
    embassy_CO: { address: 'Villa 60, Al Mushrif Area, Abu Dabi', phone: '+971 2 443 7660', hours: 'Lun-Vie 8:30-14:00', web: null },
    embassy_MX: { address: 'Al Bateen Area, Villa 54, Abu Dabi', phone: '+971 2 672 2222', hours: 'Lun-Vie 8:30-14:00', web: null },
    embassy_CL: { address: 'Al Karama, Dubai (consulado)', phone: '+971 4 335 4060', hours: 'Lun-Vie 9:00-14:00', web: null },
    embassy_PE: { address: 'Villa 58, Al Mushrif Area, Abu Dabi', phone: '+971 2 667 7900', hours: 'Lun-Vie 8:00-14:00', web: null },
    embassy_BR: { address: 'Sector W-59, Street 18, Plot 1, Abu Dabi', phone: '+971 2 672 6788', hours: 'Lun-Vie 8:30-14:00', web: null },
    embassy_VE: { address: 'Villa 22, Mohamed Bin Khalifa Street, Abu Dabi', phone: '+971 2 635 7222', hours: 'Lun-Vie 8:00-14:00', web: null },
    embassy_DE: { address: 'Sector W-59, Street 2, Plot 11, Abu Dabi', phone: '+971 2 418 8300', hours: 'Lun-Vie 8:00-11:00', web: 'https://abu-dhabi.diplo.de' },
    embassy_FR: { address: 'Abu Dhabi Corniche Road, Abu Dabi', phone: '+971 2 613 1100', hours: 'Lun-Vie 8:30-12:30', web: null },
    embassy_IT: { address: 'Villa 6, Street 17, Al Rowdah, Abu Dabi', phone: '+971 2 443 5622', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_GB: { address: 'Khalid bin Al Waleed Street, Abu Dabi', phone: '+971 2 610 1100', hours: 'Lun-Vie 8:00-15:00', web: 'https://www.gov.uk/world/united-arab-emirates' },
    embassy_US: { address: 'Embajada Al Dafra Street, Abu Dabi', phone: '+971 2 414 2200', hours: 'Lun-Vie 8:00-17:00', web: 'https://ae.usembassy.gov' },
    embassy_CN: { address: 'Sector W-59, Street 7, Plot 22, Abu Dabi', phone: '+971 2 443 4276', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_PT: { address: 'Villa 1, Sector E-11-8, Abu Dabi', phone: '+971 2 644 8892', hours: 'Lun-Vie 9:00-13:00', web: null },
    useful_apps: [
      { name: 'Careem', icon: '🚗', description: 'App de taxi local. Muy usada en UAE.' },
      { name: 'RTA Dubai', icon: '🚇', description: 'App de transporte público de Dubai.' },
    ],
    safety_tips: ['Respeta las leyes locales: alcohol solo en lugares licenciados.', 'Ramadán: no comer, beber o fumar en público durante el ayuno (multa o detención).', 'Muestras de afecto en público entre parejas no casadas pueden ser multadas.', 'Fotografiar edificios gubernamentales, militares o personas sin permiso: ilegal.'],
  },
  'Arabia Saudí': {
    emergency_general: '911', police: '999', ambulance: '911', fire: '998',
    embassy_ES: 'Embajada de España en Riad: +966 11 488 08 05',
    useful_apps: [
      { name: 'Uber', icon: '🚗', description: 'Disponible en Arabia Saudí desde 2019.' },
      { name: 'Careem', icon: '🚗', description: 'App de taxi local muy usada.' },
    ],
    safety_tips: ['Respeta siempre las costumbres locales: ropa cubriente en público, especialmente en Meca y Medina (no-musulmanes no pueden entrar).', 'No muestres afecto en público. Alcohol: completamente prohibido.', 'Horario de negocios cambia drásticamente durante Ramadán.'],
  },
  'Israel': {
    emergency_general: '100/101/102', police: '100', ambulance: '101', fire: '102',
    embassy_ES: 'Embajada de España en Tel Aviv: +972 3 754 62 00',
    useful_apps: [
      { name: 'Home Front Command (Pikud HaOref)', icon: '🚨', description: 'Alertas de cohetes y emergencias de seguridad. Imprescindible.' },
      { name: 'Moovit', icon: '🚌', description: 'Transporte público en Israel.' },
    ],
    safety_tips: ['Consulta el nivel de alerta de seguridad antes y durante el viaje (Ministerio de Exteriores de tu país).', 'En alerta de cohetes: busca el mampara más cercano (mirpeset) — hay menos de 90 segundos. El hotel te indicará el refugio.', 'Controles de seguridad muy estrictos en aeropuertos — llega con 3+ horas de antelación.'],
  },
  'Jordania': {
    emergency_general: '911', police: '911', ambulance: '911', fire: '911',
    embassy_ES: 'Embajada de España en Ammán: +962 6 465 52 52',
    useful_apps: [
      { name: 'Careem', icon: '🚗', description: 'Taxi por app en Ammán.' },
    ],
    safety_tips: ['País seguro para turistas. Cuidado en zonas fronterizas con Siria e Iraq.', 'Wadi Rum y Petra: lleva agua suficiente (mínimo 3L/persona/día en verano). Calor extremo.', 'Agua del grifo no potable.'],
  },
  'Irán': {
    emergency_general: '115/110', police: '110', ambulance: '115', fire: '125',
    embassy_ES: 'Embajada de España en Teherán: +98 21 267 3800',
    useful_apps: [
      { name: 'Snapp', icon: '🚗', description: 'App de taxi local (equivalente a Uber en Irán).' },
    ],
    safety_tips: ['Mujeres: hiyab obligatorio en todo momento en espacios públicos.', 'Fotografiar instalaciones militares, gubernamentales o personas sin permiso: ilegal.', 'VPN necesaria — internet muy censurado. Instala antes de entrar.', 'No hacer comentarios sobre política en público.'],
  },

  // ══ AFRICA ════════════════════════════════════════════════════════════════
  'Sudáfrica': {
    emergency_general: '10111/10177', police: '10111', ambulance: '10177', fire: '10111',
    embassy_ES: 'Embajada de España en Pretoria: +27 12 460 07 99',
    embassy_AR: { address: '200 Standard Plaza, 440 Hilda Street, Hatfield, Pretoria', phone: '+27 12 430 3524', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CO: { address: '777 The Hillside, Lynnwood, Pretoria', phone: '+27 12 362 0351', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_MX: { address: '339 Veale Street, New Muckleneuk, Pretoria', phone: '+27 12 362 2156', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CL: { address: '1004 Pretorius Street, Hatfield, Pretoria', phone: '+27 12 342 1440', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PE: { address: '820 Stanza Bopape Street, Arcadia, Pretoria', phone: '+27 12 342 2390', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BR: { address: '1012 Schoeman Street, Hatfield, Pretoria', phone: '+27 12 426 9400', hours: 'Lun-Vie 9:00-13:00', web: 'https://pretoria.itamaraty.gov.br' },
    embassy_VE: { address: '1091 Schoeman Street, Hatfield, Pretoria', phone: '+27 12 342 3461', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_DE: { address: '180 Blackwood Street, Arcadia, Pretoria', phone: '+27 12 427 8900', hours: 'Lun-Vie 8:00-11:30', web: 'https://pretoria.diplo.de' },
    embassy_FR: { address: '250 Melk Street, Nieuw Muckleneuk, Pretoria', phone: '+27 12 425 1600', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_IT: { address: '796 George Avenue, Arcadia, Pretoria', phone: '+27 12 423 0000', hours: 'Lun-Vie 9:00-12:30', web: null },
    embassy_GB: { address: '255 Hill Street, Arcadia, Pretoria', phone: '+27 12 421 7500', hours: 'Lun-Vie 8:00-12:00', web: 'https://www.gov.uk/world/south-africa' },
    embassy_US: { address: '877 Pretorius Street, Arcadia, Pretoria', phone: '+27 12 431 4000', hours: 'Lun-Vie 7:30-10:30', web: 'https://za.usembassy.gov' },
    embassy_CN: { address: '972 Pretorius Street, Arcadia, Pretoria', phone: '+27 12 431 6500', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_PT: { address: '599 Leyds Street, Muckleneuk, Pretoria', phone: '+27 12 341 2340', hours: 'Lun-Vie 9:00-13:00', web: null },
    useful_apps: [
      { name: 'Uber', icon: '🚗', description: 'IMPRESCINDIBLE en SA. Nunca tomes taxis de calle.' },
      { name: 'Panic Button SA', icon: '🚨', description: 'Botón de pánico para emergencias de seguridad.' },
    ],
    safety_tips: ['Nunca camines con el móvil visible en la calle en Johannesburgo o Cape Town.', 'Conduce con las puertas bloqueadas y ventanas subidas en ciudades.', 'Smash-and-grab en semáforos: no dejes nada visible en el coche.', 'Townships: solo con guía de confianza. Nunca solo/a.', 'Playas: corrientes fuertes. Algunas playas tienen tiburones (Cape Town — hay alertas).'],
  },
  'Kenia': {
    emergency_general: '999/112', police: '999', ambulance: '999', fire: '999',
    embassy_ES: 'Embajada de España en Nairobi: +254 20 228 64 60',
    embassy_AR: { address: 'Limuru Road, Muthaiga, Nairobi', phone: '+254 20 762 7800', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_CO: { address: 'Eden Square, Block 3, 5th Floor, Westlands, Nairobi', phone: '+254 20 375 1551', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_MX: { address: 'KEK Complex, Westlands Road, Nairobi', phone: '+254 20 374 1812', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BR: { address: 'Jomo Kenyatta Ave, Upper Hill, Nairobi', phone: '+254 20 272 5057', hours: 'Lun-Vie 9:00-13:00', web: 'https://nairobí.itamaraty.gov.br' },
    embassy_DE: { address: 'Ludwig Krapf House, 113 Riverside Drive, Nairobi', phone: '+254 20 426 2100', hours: 'Lun-Vie 8:30-12:00', web: 'https://nairobi.diplo.de' },
    embassy_FR: { address: '9th Floor, Barclays Plaza, Loita Street, Nairobi', phone: '+254 20 278 0700', hours: 'Lun-Vie 8:30-12:00', web: null },
    embassy_IT: { address: 'Saachi Plaza, Ali Hassan Mwinyi Road, Nairobi', phone: '+254 20 750 9700', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_GB: { address: 'Upper Hill Road, Nairobi', phone: '+254 20 287 3000', hours: 'Lun-Vie 8:00-12:00', web: 'https://www.gov.uk/world/kenya' },
    embassy_US: { address: 'United Nations Ave, Gigiri, Nairobi', phone: '+254 20 363 6000', hours: 'Lun-Vie 7:30-11:00', web: 'https://ke.usembassy.gov' },
    embassy_CN: { address: 'Woodlands Road, Kilimani, Nairobi', phone: '+254 20 272 2559', hours: 'Lun-Vie 8:30-12:00', web: null },
    embassy_PT: { address: 'Nairobi — contactar embajada en Johannesburgo', phone: null, hours: null, web: null },
    useful_apps: [
      { name: 'Uber', icon: '🚗', description: 'Seguro y fiable en Nairobi.' },
      { name: 'Little Cab', icon: '🚗', description: 'Alternativa local a Uber.' },
      { name: 'M-Pesa', icon: '💳', description: 'Sistema de pagos por móvil. Muy útil.' },
    ],
    safety_tips: ['Nairobi: nunca pasees de noche en zonas no turísticas. Westlands y Karen son las más seguras.', 'Safari: nunca salgas del vehículo salvo en zonas designadas.', 'Costa de Kenya: zona fronteriza con Somalia (Lamu) — evitar o consultar avisos actuales.', 'Malaria: profilaxis recomendada. Consulta médico viajes de tu país.'],
  },
  'Tanzania': {
    emergency_general: '112', police: '112', ambulance: '112', fire: '115',
    embassy_ES: 'Embajada de España en Nairobi cubre Tanzania. Consulado Honorario en Dar es Salaam.',
    useful_apps: [],
    safety_tips: ['Zanzíbar: muy segura en zonas turísticas. Evita playas solitarias de noche.', 'Safari Serengeti/Ngorongoro: respeta las normas del parque. Nunca fuera del vehículo.', 'Malaria: profilaxis recomendada. Mosquitera por la noche.', 'Kilimanjaro: seguro médico de evacuación obligatorio.'],
  },

  // ══ AMERICAS ══════════════════════════════════════════════════════════════
  'Cuba': {
    emergency_general: '106/105', police: '106', ambulance: '104', fire: '105',
    embassy_ES: 'Embajada de España en La Habana: +53 7 866 8025',
    useful_apps: [],
    safety_tips: ['Internet muy limitado — VPN recomendada.', 'Dinero en efectivo imprescindible — tarjetas de crédito/débito de bancos europeos raramente funcionan.', 'Jineteros (vendedores ambulantes) muy insistentes en zonas turísticas. Un "no" firme es suficiente.', 'Nunca compres cosas en mercado negro (ron, habanos "de regalo") — puede ser timo.'],
  },
  'Uruguay': {
    emergency_general: '911', police: '911', ambulance: '105', fire: '104',
    embassy_ES: 'Embajada de España en Montevideo: +598 2 708 6010',
    useful_apps: [],
    safety_tips: ['País muy seguro en Latinoamérica. Montevideo: cuidado con robos en Ciudad Vieja y zona del Puerto de noche.', 'Punta del Este en temporada alta: precios muy elevados. Reserva con meses de antelación.'],
  },

  // ══ OTROS ═════════════════════════════════════════════════════════════════
  'Nueva Zelanda': {
    emergency_general: '111', police: '111', ambulance: '111', fire: '111',
    embassy_ES: 'Embajada de España en Wellington: +64 4 802 5665',
    useful_apps: [
      { name: 'MetService NZ', icon: '🌦️', description: 'Tiempo oficial de Nueva Zelanda. Cambia muy rápido.' },
      { name: 'GeoNet NZ', icon: '🌋', description: 'Alertas de terremotos y volcanes en Nueva Zelanda.' },
    ],
    safety_tips: ['País muy seguro. Mayor riesgo: naturaleza. Clima cambia en minutos, especialmente en Fiordland.', 'Alertas sísmicas: NZ es zona sísmica activa. GeoNet app imprescindible.', 'Ríos: corrientes muy fuertes. No cruces ríos a pie sin evaluarlos con un guía.'],
  },
  'Georgia': {
    emergency_general: '112', police: '112', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Ankara cubre Georgia. Embajada de Polonia representa a España en Tiflis.',
    useful_apps: [
      { name: 'Bolt', icon: '🚗', description: 'Taxi por app. Muy usado en Georgia.' },
      { name: 'Yandex Go', icon: '🚗', description: 'Alternativa muy usada en Cáucaso.' },
    ],
    safety_tips: ['País muy seguro. Tiflis: cuidado de noche en Gldani y zonas periféricas.', 'Conducción caótica — usa siempre el cinturón.', 'Zona de Osetia del Sur y Abjasia: evitar completamente. Son territorios ocupados con acceso restringido.'],
  },
  'Canadá': {
    emergency_general: '911', police: '911', ambulance: '911', fire: '911',
    embassy_ES: 'Embajada de España en Ottawa: +1 613 747 2252',
    useful_apps: [
      { name: 'WeatherCAN', icon: '🌦️', description: 'App meteorológica oficial de Environment Canada.' },
      { name: 'Uber', icon: '🚗', description: 'Disponible en ciudades principales.' },
    ],
    safety_tips: ['País muy seguro. Cuidado con osos en zonas de senderismo (Parques Rocosas). Lleva spray antiosos.', 'Inviernos extremos: frostbite puede ocurrir en minutos con viento. Cúbrete siempre.', 'Conducción: calzado de invierno en ruedas obligatorio en ciertas provincias.'],
  },


  'Estados Unidos': {
    emergency_general: '911',
    police: '911',
    ambulance: '911',
    fire: '911',
    embassy_ES: { address: '2375 Pennsylvania Ave NW, Washington DC 20037', phone: '+1 202 452 0100', hours: 'Lun-Vie 8:30-14:00', web: 'https://www.exteriores.gob.es/Embajadas/washington' },
    embassy_AR: { address: '1600 New Hampshire Ave NW, Washington DC 20009', phone: '+1 202 238 6400', hours: 'Lun-Vie 9:30-13:30', web: 'https://eeeuu.cancilleria.gob.ar' },
    embassy_CO: { address: '1724 Massachusetts Ave NW, Washington DC 20036', phone: '+1 202 387 8338', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_MX: { address: '1911 Pennsylvania Ave NW, Washington DC 20006', phone: '+1 202 728 1600', hours: 'Lun-Vie 9:00-14:00', web: 'https://embamex.sre.gob.mx/eua' },
    embassy_CL: { address: '1732 Massachusetts Ave NW, Washington DC 20036', phone: '+1 202 785 1746', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PE: { address: '1700 Massachusetts Ave NW, Washington DC 20036', phone: '+1 202 833 9860', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_VE: { address: '1099 30th Street NW, Washington DC 20007', phone: '+1 202 342 2214', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_EC: { address: '2535 15th Street NW, Washington DC 20009', phone: '+1 202 234 7200', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BO: { address: '3014 Massachusetts Ave NW, Washington DC 20008', phone: '+1 202 483 4410', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_PY: { address: '2400 Massachusetts Ave NW, Washington DC 20008', phone: '+1 202 483 6960', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_UY: { address: '1913 I Street NW, Washington DC 20006', phone: '+1 202 331 1313', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_BR: { address: '3006 Massachusetts Ave NW, Washington DC 20008', phone: '+1 202 238 2700', hours: 'Lun-Vie 9:00-13:00', web: 'https://washington.itamaraty.gov.br' },
    embassy_PT: { address: '2012 Massachusetts Ave NW, Washington DC 20036', phone: '+1 202 350 5400', hours: 'Lun-Vie 9:00-13:00', web: null },
    embassy_DE: { address: '4645 Reservoir Rd NW, Washington DC 20007', phone: '+1 202 298 4000', hours: 'Lun-Vie 8:30-12:00', web: 'https://www.germany.info/us-en' },
    embassy_FR: { address: '4101 Reservoir Rd NW, Washington DC 20007', phone: '+1 202 944 6000', hours: 'Lun-Vie 8:45-12:30', web: null },
    embassy_IT: { address: '3000 Whitehaven St NW, Washington DC 20008', phone: '+1 202 612 4400', hours: 'Lun-Vie 9:00-12:00', web: null },
    embassy_GB: { address: '3100 Massachusetts Ave NW, Washington DC 20008', phone: '+1 202 588 6500', hours: 'Lun-Vie 9:00-12:00', web: 'https://www.gov.uk/world/usa' },
    embassy_CN: { address: '3505 International Place NW, Washington DC 20008', phone: '+1 202 495 2266', hours: 'Lun-Vie 9:00-12:00', web: null },
    useful_apps: [ { name: 'Uber', icon: '🚗', description: 'Transporte en ciudades.' }, { name: 'Google Maps', icon: '🗺️', description: 'Navegación y transporte público.' } ],
    safety_tips: [ 'Seguro médico imprescindible — la sanidad es extremadamente cara.', 'Propina del 18-20% obligatoria en restaurantes.', 'En emergencias: 911 siempre.' ],
  },
};

/**
 * Obtiene datos de emergencia hardcodeados para un país.
 * Compatible con la interfaz que espera Utilities.jsx.
 */
export function getHardcodedEmergencyInfo(countryLabel, homeCountry = 'España', secondNationality = null) {
  if (!countryLabel) return null;

  // Exact match
  let data = EMERGENCY_DB[countryLabel];

  // Case-insensitive fallback (strips accents)
  if (!data) {
    const norm = countryLabel.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const key = Object.keys(EMERGENCY_DB).find(
      k => k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === norm
    );
    if (key) data = EMERGENCY_DB[key];
  }
  
  // English → Spanish alias fallback (city.country may be in English from OSM)
  const EN_TO_ES = {
    'japan': 'Japón', 'france': 'Francia', 'germany': 'Alemania', 'italy': 'Italia',
    'portugal': 'Portugal', 'united kingdom': 'Reino Unido', 'uk': 'Reino Unido',
    'united states': 'Estados Unidos', 'usa': 'Estados Unidos',
    'mexico': 'México', 'colombia': 'Colombia', 'peru': 'Perú',
    'argentina': 'Argentina', 'brazil': 'Brasil', 'chile': 'Chile',
    'thailand': 'Tailandia', 'vietnam': 'Vietnam', 'indonesia': 'Indonesia',
    'india': 'India', 'china': 'China', 'south korea': 'Corea del Sur',
    'morocco': 'Marruecos', 'turkey': 'Turquía', 'greece': 'Grecia',
    'netherlands': 'Países Bajos', 'belgium': 'Bélgica', 'switzerland': 'Suiza',
    'austria': 'Austria', 'sweden': 'Suecia', 'norway': 'Noruega',
    'denmark': 'Dinamarca', 'poland': 'Polonia', 'czech republic': 'República Checa',
    'hungary': 'Hungría', 'romania': 'Rumanía', 'croatia': 'Croacia',
    'singapore': 'Singapur', 'malaysia': 'Malasia', 'philippines': 'Filipinas',
    'cambodia': 'Camboya', 'nepal': 'Nepal', 'egypt': 'Egipto',
    'kenya': 'Kenia', 'south africa': 'Sudáfrica', 'ethiopia': 'Etiopía',
    'australia': 'Australia', 'new zealand': 'Nueva Zelanda',
    'canada': 'Canadá', 'cuba': 'Cuba', 'peru': 'Perú',
  };
  if (!data) {
    const alias = EN_TO_ES[countryLabel.toLowerCase()];
    if (alias) data = EMERGENCY_DB[alias];
  }

  if (!data) return null;

  // Seleccionar embajada según país de origen — cubre todos los hispanohablantes
  let embassy = null;
  const homeNorm = (homeCountry || 'España').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Mapeo país origen → clave de embajada en orden de prioridad
  const embassyKey = (() => {
    if (homeNorm.includes('mexic'))    return ['embassy_MX'];
    if (homeNorm.includes('argentin')) return ['embassy_AR'];
    if (homeNorm.includes('colombi'))  return ['embassy_CO'];
    if (homeNorm.includes('peru'))     return ['embassy_PE'];
    if (homeNorm.includes('chile'))    return ['embassy_CL'];
    if (homeNorm.includes('venezuel')) return ['embassy_VE'];
    if (homeNorm.includes('ecuad'))    return ['embassy_EC'];
    if (homeNorm.includes('boliv'))    return ['embassy_BO'];
    if (homeNorm.includes('paragua')) return ['embassy_PY'];
    if (homeNorm.includes('urugua'))   return ['embassy_UY'];
    if (homeNorm.includes('costa ric')) return ['embassy_CR'];
    if (homeNorm.includes('guatemal')) return ['embassy_GT'];
    if (homeNorm.includes('hondur'))   return ['embassy_HN'];
    if (homeNorm.includes('el salv') || homeNorm.includes('salvador')) return ['embassy_SV'];
    if (homeNorm.includes('nicarag'))  return ['embassy_NI'];
    if (homeNorm.includes('panam'))    return ['embassy_PA'];
    if (homeNorm.includes('dominican') || homeNorm.includes('rep dom')) return ['embassy_DO'];
    if (homeNorm.includes('cuba'))     return ['embassy_CU'];
    if (homeNorm.includes('espana') || homeNorm.includes('spain')) return ['embassy_ES'];
    if (homeNorm.includes('portug'))   return ['embassy_PT'];
    if (homeNorm.includes('franc'))    return ['embassy_FR'];
    if (homeNorm.includes('aleman') || homeNorm.includes('german')) return ['embassy_DE'];
    if (homeNorm.includes('ital'))     return ['embassy_IT'];
    if (homeNorm.includes('reino unido') || homeNorm.includes('united kingdom')) return ['embassy_GB'];
    if (homeNorm.includes('estados unidos') || homeNorm.includes('united states')) return ['embassy_US'];
    if (homeNorm.includes('brasil') || homeNorm.includes('brazil')) return ['embassy_BR'];
    if (homeNorm.includes('chin'))     return ['embassy_CN'];
    if (homeNorm.includes('japon') || homeNorm.includes('japan')) return ['embassy_JP'];
    return ['embassy_ES']; // solo si el usuario es español
  })();

  for (const key of embassyKey) {
    if (data[key]) { embassy = data[key]; break; }
  }

  // Second nationality embassy — shown as alternative in Emergencies
  let secondEmbassy = null;
  if (secondNationality && secondNationality !== homeCountry) {
    const sNorm = (secondNationality).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const keys2 = (() => {
      if (sNorm.includes('espana') || sNorm.includes('spain')) return ['embassy_ES'];
      if (sNorm.includes('franc') || sNorm.includes('france')) return ['embassy_FR', 'embassy_ES'];
      if (sNorm.includes('aleman') || sNorm.includes('german') || sNorm.includes('deutsch')) return ['embassy_DE', 'embassy_ES'];
      if (sNorm.includes('ital'))   return ['embassy_IT', 'embassy_ES'];
      if (sNorm.includes('portug')) return ['embassy_PT', 'embassy_ES'];
      if (sNorm.includes('brasil') || sNorm.includes('brazil')) return ['embassy_BR', 'embassy_ES'];
      if (sNorm.includes('mexic'))   return ['embassy_MX', 'embassy_ES'];
      if (sNorm.includes('argentin')) return ['embassy_AR', 'embassy_ES'];
      if (sNorm.includes('colombi')) return ['embassy_CO', 'embassy_ES'];
      if (sNorm.includes('peru'))    return ['embassy_PE', 'embassy_ES'];
      if (sNorm.includes('chile'))   return ['embassy_CL', 'embassy_ES'];
      if (sNorm.includes('venezuel')) return ['embassy_VE', 'embassy_ES'];
      if (sNorm.includes('ecuad'))  return ['embassy_EC', 'embassy_ES'];
      if (sNorm.includes('reino unido') || sNorm.includes('united kingdom') || sNorm.includes('britain')) return ['embassy_GB', 'embassy_ES'];
      if (sNorm.includes('estados unidos') || sNorm.includes('united states')) return ['embassy_US', 'embassy_ES'];
      return ['embassy_ES'];
    })();
    for (const key of keys2) {
      if (data[key]) { secondEmbassy = data[key]; break; }
    }
  }

  return {
    emergency_general: data.emergency_general,
    police: data.police,
    ambulance: data.ambulance,
    fire: data.fire,
    embassy,
    secondEmbassy,
    useful_apps: data.useful_apps || [],
    safety_tips: data.safety_tips || [],
  };
}
// ── AMPLIACIÓN COMPLETA ────────────────────────────────────────────────────────
// Añadidos via Object.assign al final del archivo

Object.assign(EMERGENCY_DB, {

  // ══ EUROPA ════════════════════════════════════════════════════════════════════

  'Luxemburgo': {
    emergency_general: '112', police: '113', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Luxemburgo: +352 46 02 55',
    useful_apps: [],
    safety_tips: ['País muy seguro. Pequeño y fácil de recorrer. Ciudad de Luxemburgo: zona de la Cornisa muy segura.'],
  },
  'Estonia': {
    emergency_general: '112', police: '112', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Tallin: +372 627 7960',
    useful_apps: [{ name: '112 Eesti', icon: '🆘', description: 'App oficial de emergencias de Estonia.' }],
    safety_tips: ['País muy seguro. Verano nórdico: noches claras desorientan. Tallin vieja ciudad: cuidado con adoquines mojados.'],
  },
  'Letonia': {
    emergency_general: '112', police: '110', ambulance: '113', fire: '112',
    embassy_ES: 'Embajada de España en Riga: +371 6732 0252',
    useful_apps: [],
    safety_tips: ['Muy seguro. Riga: vida nocturna activa en el casco antiguo. Cuidado con bebidas no solicitadas en bares.'],
  },
  'Lituania': {
    emergency_general: '112', police: '112', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Vilna: +370 5 231 3490',
    useful_apps: [],
    safety_tips: ['Muy seguro. Vilna tiene uno de los cascos históricos más grandes y mejor conservados de Europa.'],
  },
  'Albania': {
    emergency_general: '112', police: '129', ambulance: '127', fire: '128',
    embassy_ES: 'Embajada de España en Tirana: +355 4 227 7150',
    useful_apps: [],
    safety_tips: ['Seguro para turistas. Conducción agresiva — usa cinturón siempre. Zonas montañosas: carreteras sin quitamiedos.', 'Zonas rurales del norte: código de honor tradicional — respeta costumbres locales.'],
  },
  'Bosnia y Herzegovina': {
    emergency_general: '112', police: '122', ambulance: '124', fire: '123',
    embassy_ES: 'Embajada de España en Sarajevo: +387 33 276 822',
    useful_apps: [],
    safety_tips: ['Seguro. Zonas fuera de caminos marcados en campo abierto: minas antipersona residuales de la guerra (1992-1995). Nunca salgas de los senderos señalizados.'],
  },
  'Kosovo': {
    emergency_general: '112', police: '192', ambulance: '194', fire: '193',
    embassy_ES: 'Embajada de España en Pristina: +383 38 243 500',
    useful_apps: [],
    safety_tips: ['Relativamente seguro. Norte de Kosovo (Mitrovica norte): tensión étnica ocasional — consulta situación actual.'],
  },
  'Montenegro': {
    emergency_general: '112', police: '122', ambulance: '124', fire: '123',
    embassy_ES: 'Embajada de España en Podgorica: +382 20 232 024',
    useful_apps: [],
    safety_tips: ['Seguro. Costa adriática en verano: muy concurrida. Carreteras de montaña (Durmitor): estrechas y sin quitamiedos — conduce despacio.'],
  },
  'Macedonia del Norte': {
    emergency_general: '112', police: '192', ambulance: '194', fire: '193',
    embassy_ES: 'Embajada de España en Skopje: +389 2 3084 222',
    useful_apps: [],
    safety_tips: ['Seguro para turistas. Skopje: cuidado con taxis sin taxímetro — negocia precio antes.'],
  },
  'Chipre': {
    emergency_general: '112/199', police: '199', ambulance: '199', fire: '199',
    embassy_ES: 'Embajada de España en Nicosia: +357 22 450 750',
    useful_apps: [],
    safety_tips: ['Muy seguro. Línea verde (zona desmilitarizada): cruces con documentación. Norte de Chipre (ocupado): consulta situación antes de visitar.'],
  },
  'Andorra': {
    emergency_general: '112', police: '110', ambulance: '116', fire: '118',
    embassy_ES: 'Consulado de España en Andorra la Vella: +376 800 030',
    useful_apps: [],
    safety_tips: ['País muy seguro. Compras libres de impuestos. Cuidado con el desnivel al volver a España (controles aduaneros).'],
  },
  'Mónaco': {
    emergency_general: '17/15/18', police: '17', ambulance: '15', fire: '18',
    embassy_ES: 'Embajada de España en París cubre Mónaco.',
    useful_apps: [],
    safety_tips: ['País más seguro del mundo. Vigilancia policial máxima. Cuidado con los precios — todo es muy caro.'],
  },
  'Liechtenstein': {
    emergency_general: '112', police: '117', ambulance: '144', fire: '118',
    embassy_ES: 'Embajada de España en Berna (Suiza) cubre Liechtenstein.',
    useful_apps: [],
    safety_tips: ['País muy seguro. Senderismo alpino: clima cambiante. Informa de tu ruta.'],
  },
  'San Marino': {
    emergency_general: '113/118', police: '113', ambulance: '118', fire: '115',
    embassy_ES: 'Embajada de España en Roma cubre San Marino.',
    useful_apps: [],
    safety_tips: ['País muy seguro. Carreteras en la colina: curvas cerradas — conduce despacio.'],
  },
  'Ucrania': {
    emergency_general: '112', police: '102', ambulance: '103', fire: '101',
    embassy_ES: 'Embajada de España en Kiev: +380 44 490 7780',
    useful_apps: [{ name: 'Air Raid Siren UA', icon: '🚨', description: 'Alertas de ataques aéreos. IMPRESCINDIBLE si viajas durante el conflicto.' }],
    safety_tips: ['CONFLICTO ACTIVO (2024-): evitar cualquier visita no esencial. Consulta aviso oficial de viaje de tu Ministerio de Exteriores.', 'Zonas de combate activo en este/sur. Solo periodistas y voluntarios acreditados.'],
  },
  'Bielorrusia': {
    emergency_general: '112', police: '102', ambulance: '103', fire: '101',
    embassy_ES: 'Embajada de España en Minsk: +375 17 284 0292',
    useful_apps: [],
    safety_tips: ['Régimen autoritario. No fotografíes instalaciones gubernamentales, policía o manifestaciones.', 'Periodismo y activismo: riesgo de detención. Evita cualquier expresión política.', 'Ciudadanos de muchos países UE tienen restricciones de entrada — verifica visado.'],
  },
  'Moldavia': {
    emergency_general: '112', police: '902', ambulance: '903', fire: '901',
    embassy_ES: 'Embajada de España en Bucarest cubre Moldavia.',
    useful_apps: [],
    safety_tips: ['Relativamente seguro. Transnistria: región separatista — consulta situación antes de visitar. Requiere permiso especial.'],
  },
  'Armenia': {
    emergency_general: '911', police: '102', ambulance: '103', fire: '101',
    embassy_ES: 'Embajada de España en Yereván: +374 10 54 43 40',
    useful_apps: [],
    safety_tips: ['Seguro para turistas. Zona de Nagorno-Karabaj: evitar completamente — conflicto reciente. Frontera con Azerbaiyán y Turquía: cerradas.'],
  },
  'Azerbaiyán': {
    emergency_general: '112', police: '102', ambulance: '103', fire: '101',
    embassy_ES: 'Embajada de España en Bakú: +994 12 497 5480',
    useful_apps: [],
    safety_tips: ['Seguro en Bakú. No entres a Azerbaiyán con sellos de Armenia en el pasaporte — denegación de entrada.', 'Frontera con Armenia: cerrada. Zona de Nagorno-Karabaj: evitar.'],
  },

  // ══ ASIA ═════════════════════════════════════════════════════════════════════

  'Camboya': {
    emergency_general: '117/119', police: '117', ambulance: '119', fire: '118',
    embassy_ES: 'Embajada de España en Bangkok cubre Camboya.',
    useful_apps: [{ name: 'PassApp', icon: '🚗', description: 'Taxi por app en Phnom Penh.' }],
    safety_tips: ['Minas antipersona: nunca abandones senderos marcados fuera de zonas urbanas. Especialmente en noreste.', 'Templos de Angkor: evita sol intenso de mediodía. Cubre hombros y rodillas.', 'Agua del grifo no potable.'],
  },
  'Myanmar': {
    emergency_general: '199', police: '199', ambulance: '192', fire: '191',
    embassy_ES: 'Embajada de España en Bangkok cubre Myanmar.',
    useful_apps: [],
    safety_tips: ['GOLPE DE ESTADO (2021): situación política inestable. Muchas zonas del país en conflicto activo.', 'Consulta aviso de viaje del Ministerio de Exteriores antes de cualquier visita.', 'Evita fotografiar fuerzas militares, policía o edificios gubernamentales.'],
  },
  'Laos': {
    emergency_general: '191/195', police: '191', ambulance: '195', fire: '190',
    embassy_ES: 'Embajada de España en Bangkok cubre Laos.',
    useful_apps: [],
    safety_tips: ['Seguro para turistas. Minas sin detonar (UXO): zonas rurales especialmente al este. No abandones senderos marcados.', 'Agua del grifo no potable. Solo agua embotellada.'],
  },
  'Bután': {
    emergency_general: '112', police: '113', ambulance: '112', fire: '110',
    embassy_ES: 'Embajada de España en Nueva Delhi cubre Bután.',
    useful_apps: [],
    safety_tips: ['País muy seguro. Solo se puede visitar con guía autorizado por el gobierno — obligatorio.', 'Altitud: Paro Dzong (2.200m), algunos treks superan 5.000m — aclimatación indispensable.', 'Fotografiar en dzongs (fortalezas): pide permiso siempre.'],
  },
  'Bangladesh': {
    emergency_general: '999', police: '999', ambulance: '199', fire: '199',
    embassy_ES: 'Embajada de España en Dacca: +880 2 882 3895',
    useful_apps: [],
    safety_tips: ['Densa población. Dhaka: tráfico caótico — usa rickshaws o CNG (tuk-tuk a gas) para trayectos cortos.', 'Monzón: inundaciones severas julio-septiembre. Consulta alertas meteorológicas.', 'Agua del grifo no potable.'],
  },
  'Pakistán': {
    emergency_general: '15/115/16', police: '15', ambulance: '115', fire: '16',
    embassy_ES: 'Embajada de España en Islamabad: +92 51 282 9430',
    useful_apps: [],
    safety_tips: ['Consulta aviso de viaje antes. Zonas tribales (FATA), Baluchistán, zonas fronterizas con Afganistán: evitar.', 'Karakorum Highway (Gilgit-Baltistán): espectacular pero requiere preparación y guía.', 'No fotografíes instalaciones militares ni personas sin permiso.'],
  },
  'Mongolia': {
    emergency_general: '102/103/101', police: '102', ambulance: '103', fire: '101',
    embassy_ES: 'Embajada de España en Pekín cubre Mongolia.',
    useful_apps: [],
    safety_tips: ['Ulaanbaatar: cuidado con carteristas en mercado Naran Tuul ("mercado de los ladrones").', 'Estepa: frío extremo en invierno (-40°C). Tormentas de nieve (dzud) mortales.', 'Yurtas (gers): cultura de hospitalidad — acepta siempre té y comida que te ofrezcan (costumbre de respeto).'],
  },
  'Uzbekistán': {
    emergency_general: '102/103/101', police: '102', ambulance: '103', fire: '101',
    embassy_ES: 'Embajada de España en Taskent: +998 71 120 0374',
    useful_apps: [],
    safety_tips: ['Seguro para turistas. Ruta de la Seda (Samarcanda, Bujará): muy turístico y seguro.', 'Registro de hoteles obligatorio — asegúrate de que el hotel te registre. En casas particulares: hazlo tú en comisaría.', 'Calor extremo en verano (julio/agosto +40°C).'],
  },
  'Kazajistán': {
    emergency_general: '112', police: '102', ambulance: '103', fire: '101',
    embassy_ES: 'Embajada de España en Astana: +7 7172 790 580',
    useful_apps: [],
    safety_tips: ['Relativamente seguro. Almaty: cuidado en zonas periféricas de noche.', 'Viajar al interior: distancias enormes entre ciudades. Lleva suficiente agua y gasolina.', 'Registro de hotel obligatorio en algunos casos — verifica con tu hotel.'],
  },
  'Tayikistán': {
    emergency_general: '112', police: '102', ambulance: '103', fire: '101',
    embassy_ES: 'Embajada de España en Taskent (Uzbekistán) cubre Tayikistán.',
    useful_apps: [],
    safety_tips: ['Pamir Highway: una de las carreteras más altas y remotas del mundo. Solo con vehículo 4x4 y guía.', 'Zonas fronterizas con Afganistán: evitar completamente.', 'Seguro médico con evacuación aérea imprescindible en el Pamir.'],
  },
  'Kirguistán': {
    emergency_general: '112', police: '102', ambulance: '103', fire: '101',
    embassy_ES: 'Embajada de España en Astana (Kazajistán) cubre Kirguistán.',
    useful_apps: [],
    safety_tips: ['Seguro para turistas. Senderismo en Tian Shan: clima alpino imprevisible. Guía local recomendado.', 'Sur del país (Osh, Jalal-Abad): historia de tensiones étnicas. Consulta situación actual.'],
  },
  'Turkmenistán': {
    emergency_general: '03', police: '02', ambulance: '03', fire: '01',
    embassy_ES: 'Embajada de España en Moscú cubre Turkmenistán.',
    useful_apps: [],
    safety_tips: ['País muy cerrado. Visado muy difícil de obtener. Guía oficial obligatorio.', 'No fotografíes instalaciones gubernamentales, militares o policía.', 'Cráter de Darvaza ("Puerta del Infierno"): espectacular pero zona remota — solo con guía.'],
  },
  'Afganistán': {
    emergency_general: '119', police: '119', ambulance: '112', fire: '116',
    embassy_ES: 'Embajada de España en Islamabad cubre Afganistán.',
    useful_apps: [],
    safety_tips: ['⚠️ NO VIAJAR. Riesgo extremo de secuestro, terrorismo y conflicto armado.', 'Todos los ministerios de exteriores del mundo desaconsejan absolutamente el viaje.', 'Solo personal humanitario acreditado con protocolos de seguridad estrictos.'],
  },
  'Irak': {
    emergency_general: '104/122', police: '104', ambulance: '122', fire: '115',
    embassy_ES: 'Embajada de España en Bagdad: +964 780 191 7070',
    useful_apps: [],
    safety_tips: ['⚠️ Viaje muy desaconsejado en la mayoría de zonas. Bagdad y sur: riesgo alto de atentados.', 'Kurdistán iraquí (Erbil, Sulaymaniyah): relativamente más estable, con precauciones.', 'Nunca viajes solo. Solo con organización profesional especializada en zonas de conflicto.'],
  },
  'Siria': {
    emergency_general: '110/113', police: '110', ambulance: '110', fire: '113',
    embassy_ES: 'Embajada de España en Damasco: suspendida. Contactar a través de Beirut.',
    useful_apps: [],
    safety_tips: ['⚠️ NO VIAJAR. Guerra civil activa. Riesgo extremo en prácticamente todo el territorio.', 'Zonas de conflicto activo. Solo personal humanitario acreditado.'],
  },
  'Líbano': {
    emergency_general: '140/125/175', police: '999', ambulance: '140', fire: '175',
    embassy_ES: 'Embajada de España en Beirut: +961 1 952 150',
    useful_apps: [],
    safety_tips: ['Situación inestable. Sur del país (frontera con Israel): evitar — riesgo activo de escalada.', 'Beirut: relativamente funcional pero con cortes frecuentes de luz, agua y servicios.', 'Campo de refugiados: no entrar sin autorización. Lleva siempre documentación.'],
  },
  'Qatar': {
    emergency_general: '999', police: '999', ambulance: '999', fire: '999',
    embassy_ES: 'Embajada de España en Doha: +974 4496 5555',
    useful_apps: [{ name: 'Karwa Taxi', icon: '🚗', description: 'Taxi oficial de Qatar. Muy fiable.' }],
    safety_tips: ['País muy seguro. Leyes islámicas: alcohol solo en hoteles licenciados.', 'Verano (may-sep): calor extremo (+45°C) — evita actividad exterior entre 11h-16h.', 'Relaciones homosexuales: ilegales. Mucho cuidado con muestras de afecto en público.'],
  },
  'Kuwait': {
    emergency_general: '112', police: '112', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Kuwait: +965 2256 0601',
    useful_apps: [],
    safety_tips: ['País seguro. Leyes islámicas estrictas. Alcohol: completamente prohibido.', 'Viernes es día de descanso — la mayoría de negocios cierran por la mañana.', 'Calor extremo en verano — casi todo el mundo se mueve en coche.'],
  },
  'Bahréin': {
    emergency_general: '999', police: '999', ambulance: '999', fire: '999',
    embassy_ES: 'Embajada de España en Riad (Arabia Saudí) cubre Bahréin.',
    useful_apps: [],
    safety_tips: ['Relativamente seguro. Alcohol permitido en hoteles y restaurantes licenciados.', 'Protestas esporádicas en Manama central (zona shií) — evita manifestaciones.'],
  },
  'Omán': {
    emergency_general: '9999', police: '9999', ambulance: '9999', fire: '9999',
    embassy_ES: 'Embajada de España en Riad cubre Omán. Consulado Honorario en Mascate.',
    useful_apps: [],
    safety_tips: ['País muy seguro. Mejor valorado de la región árabe para turistas.', 'Wadis (ríos secos): crecidas repentinas en temporada de lluvias — nunca acampar en un wadi.', 'Desierto (Wahiba): solo con guía local y vehículo 4x4.'],
  },
  'Yemen': {
    emergency_general: '199/191', police: '191', ambulance: '191', fire: '191',
    embassy_ES: 'Embajada suspendida. Contactar Ministerio de Exteriores España.',
    useful_apps: [],
    safety_tips: ['⚠️ NO VIAJAR. Guerra civil activa desde 2015. Riesgo extremo en todo el país.', 'Solo personal humanitario acreditado con protocolos de seguridad extremos.'],
  },
  'Taiwán': {
    emergency_general: '110/119', police: '110', ambulance: '119', fire: '119',
    embassy_ES: 'Oficina Económica y Cultural de España en Taipéi: +886 2 2351 9548',
    useful_apps: [
      { name: 'Taiwan Beats', icon: '📡', description: 'Alertas de terremotos y tifones. Imprescindible.' },
      { name: '1999 App', icon: '🏙️', description: 'Servicios ciudadanos Taipéi.' },
    ],
    safety_tips: ['País muy seguro. Tifones: temporada jun-oct. Sigue alertas oficiales — los hoteles tienen protocolos.', 'Terremotos frecuentes: sigue instrucciones del hotel. Protégete bajo mesas robustas.', 'Montañas altas (Yu Shan 3.952m): clima extremo. Solo con guía registrado.'],
  },
  'Hong Kong': {
    emergency_general: '999', police: '999', ambulance: '999', fire: '999',
    embassy_ES: 'Consulado de España en Hong Kong: +852 2585 1146',
    useful_apps: [
      { name: 'MTR Mobile', icon: '🚇', description: 'Metro de Hong Kong — el más eficiente del mundo.' },
    ],
    safety_tips: ['Ciudad muy segura. Cuidado con ciclones tropicales (Signal 3/8/10) — seguir instrucciones oficiales.', 'Ley de seguridad nacional (2020): expresión política puede tener consecuencias legales.'],
  },
  'Brunéi': {
    emergency_general: '991/993/995', police: '993', ambulance: '991', fire: '995',
    embassy_ES: 'Embajada de España en Kuala Lumpur cubre Brunéi.',
    useful_apps: [],
    safety_tips: ['País muy seguro. Leyes islámicas estrictas. Alcohol prohibido (turistas pueden importar cantidad limitada).', 'Código de vestimenta conservador, especialmente en mezquitas.'],
  },
  'Timor Oriental': {
    emergency_general: '112', police: '112', ambulance: '112', fire: '112',
    embassy_ES: 'Embajada de España en Yakarta cubre Timor Oriental.',
    useful_apps: [],
    safety_tips: ['País relativamente seguro pero con infraestructura limitada.', 'Carreteras en mal estado fuera de Dili. Solo 4x4 para el interior.', 'Agua del grifo no potable. Malaria: profilaxis recomendada.'],
  },

  // ══ LATINOAMÉRICA ════════════════════════════════════════════════════════════

  'Venezuela': {
    emergency_general: '171/112', police: '171', ambulance: '171', fire: '171',
    embassy_ES: 'Embajada de España en Caracas: +58 212 266 2855',
    useful_apps: [],
    safety_tips: ['⚠️ Viaje muy desaconsejado. Caracas es una de las ciudades más peligrosas del mundo.', 'Si viajas: nunca camines de noche. Solo movilidad en vehículos con ventanas cerradas.', 'Zonas fronterizas con Colombia: riesgo de grupos armados ilegales.', 'Efectivo escaso — llevar dólares y euros para cambio informal.'],
  },
  'Bolivia': {
    emergency_general: '110/118/119', police: '110', ambulance: '118', fire: '119',
    embassy_ES: 'Embajada de España en La Paz: +591 2 277 3518',
    useful_apps: [],
    safety_tips: ['Mal de altura: La Paz (3.600m), Potosí (4.090m), Uyuni (3.660m) — aclimatación obligatoria. Sube gradualmente.', 'Carreteras del país: condiciones deficientes. "Carretera de la Muerte" (Coroico): solo con operadora acreditada.', 'Agua del grifo no potable.'],
  },
  'Paraguay': {
    emergency_general: '911', police: '911', ambulance: '911', fire: '132',
    embassy_ES: 'Embajada de España en Asunción: +595 21 222 536',
    useful_apps: [],
    safety_tips: ['Asunción: cuidado en Ciudad del Este (Triple Frontera) — zona de comercio informal y criminalidad.', 'Calor extremo en verano (nov-mar). Hidratación fundamental.'],
  },
  'Ecuador': {
    emergency_general: '911', police: '101', ambulance: '131', fire: '102',
    embassy_ES: 'Embajada de España en Quito: +593 2 222 6099',
    useful_apps: [],
    safety_tips: ['Quito: cuidado en La Mariscal (zona de ocio nocturno) y centro histórico de noche.', 'Galápagos: zona muy regulada — sigue siempre al guía del parque. No toques animales.', 'Volcanes activos: consulta nivel de alerta antes de senderismo (Cotopaxi, Tungurahua).', 'Frontera con Colombia: zona sur de Esmeraldas y Sucumbíos — evitar.'],
  },
  'Guatemala': {
    emergency_general: '110/120/122', police: '110', ambulance: '120', fire: '122',
    embassy_ES: 'Embajada de España en Guatemala: +502 2379 3530',
    useful_apps: [],
    safety_tips: ['Guatemala Ciudad: zonas 1, 4, 9, 10, 13, 14 y 15 son las más seguras. Evita zonas periféricas.', 'Lago Atitlán y Antigua: relativamente seguros con precauciones básicas.', 'Nunca muestres cámara, joyería o móvil caro en la calle.'],
  },
  'Honduras': {
    emergency_general: '911', police: '911', ambulance: '195', fire: '198',
    embassy_ES: 'Embajada de España en Tegucigalpa: +504 2236 6589',
    useful_apps: [],
    safety_tips: ['⚠️ Uno de los países con mayor índice de violencia de la región.', 'Tegucigalpa y San Pedro Sula: evita zonas periféricas y circulación nocturna.', 'Roatán (isla caribeña): bastante más segura — resort turístico bien vigilado.', 'Nunca resistas un robo — da lo que te pidan.'],
  },
  'El Salvador': {
    emergency_general: '911', police: '911', ambulance: '132', fire: '913',
    embassy_ES: 'Embajada de España en San Salvador: +503 2257 5788',
    useful_apps: [],
    safety_tips: ['Situación de seguridad mejorada desde 2022 (estado de excepción anti-pandillas).', 'San Salvador: zonas turísticas (Escalón, Colonia San Benito) son relativamente seguras.', 'Sigue recomendaciones de tu embajada — situación puede cambiar.'],
  },
  'Nicaragua': {
    emergency_general: '118', police: '118', ambulance: '128', fire: '115',
    embassy_ES: 'Embajada de España en Managua: +505 2276 0966',
    useful_apps: [],
    safety_tips: ['Situación política inestable desde 2018. Manifestaciones: evitar completamente.', 'Relativametne seguro en zonas turísticas (Granada, San Juan del Sur).', 'No fotografíes instalaciones policiales o militares.'],
  },
  'Costa Rica': {
    emergency_general: '911', police: '911', ambulance: '911', fire: '911',
    embassy_ES: 'Embajada de España en San José: +506 2222 2328',
    useful_apps: [],
    safety_tips: ['Uno de los países más seguros de Centroamérica.', 'San José: cuidado con carteristas en Mercado Central y zonas de bus.', 'Naturaleza: peligros reales (serpientes, corrientes oceánicas, volcanes). Sigue siempre señalización.', 'Corrientes oceánicas en playas del Pacífico: causa principal de muertes de turistas.'],
  },
  'Panamá': {
    emergency_general: '911', police: '104', ambulance: '911', fire: '103',
    embassy_ES: 'Embajada de España en Panamá: +507 227 5122',
    useful_apps: [],
    safety_tips: ['Ciudad de Panamá: Casco Viejo y áreas turísticas son seguras. Cuidado en Chorillo y barrios periféricos.', 'Darién: zona fronteriza con Colombia — evitar completamente. Grupos armados activos.', 'San Blas (Guna Yala): espectacular. Solo se accede con permiso de las comunidades indígenas Guna.'],
  },
  'Rep. Dominicana': {
    emergency_general: '911', police: '911', ambulance: '911', fire: '911',
    embassy_ES: 'Embajada de España en Santo Domingo: +1 809 535 6500',
    useful_apps: [],
    safety_tips: ['Zonas turísticas (Punta Cana, Samaná): relativamente seguras dentro de los resorts.', 'Santo Domingo: cuidado en Ciudad Colonial de noche. Zonas de Villa Mella y periféricas — evitar.', 'Nunca lleves objetos de valor visibles. Taxis: negocia precio antes o usa app.'],
  },
  'Jamaica': {
    emergency_general: '119/110', police: '119', ambulance: '110', fire: '110',
    embassy_ES: 'Embajada de España en Kingston: +1 876 929 8180',
    useful_apps: [],
    safety_tips: ['Kingston: West Kingston y zonas de "garrisons" — evitar completamente.', 'Resorts (Montego Bay, Negril, Ocho Ríos): dentro del resort es seguro. Fuera: precauciones.', 'No aceptes marihuana de extraños — aunque sea legal localmente, los turistas son objetivo.'],
  },
  'Trinidad y Tobago': {
    emergency_general: '999/990', police: '999', ambulance: '990', fire: '990',
    embassy_ES: 'Embajada de España en Caracas cubre Trinidad y Tobago.',
    useful_apps: [],
    safety_tips: ['Puerto España: altos índices de criminalidad. Evita circular de noche.', 'Tobago: mucho más segura y turística que Trinidad.', 'Carnaval (feb/mar): fantástico pero cuidado con aglomeraciones y carteristas.'],
  },
  'Puerto Rico': {
    emergency_general: '911', police: '911', ambulance: '911', fire: '911',
    embassy_ES: 'Consulado de España en San Juan: +1 787 758 6090',
    useful_apps: [],
    safety_tips: ['Territorio de EE.UU. — nivel de seguridad similar. Zonas de San Juan (Old San Juan, Condado): seguras.', 'Perla, Santurce periférico, algunos barrios de Bayamón: evitar de noche.'],
  },
  'Haití': {
    emergency_general: '114/118', police: '114', ambulance: '118', fire: '115',
    embassy_ES: 'Embajada de España en Santo Domingo cubre Haití.',
    useful_apps: [],
    safety_tips: ['⚠️ NO VIAJAR. Control de bandas armadas en grandes partes del país. Puerto Príncipe muy peligroso.', 'Solo personal humanitario acreditado con protocolos de seguridad extremos.'],
  },
  'Barbados': {
    emergency_general: '211', police: '211', ambulance: '511', fire: '311',
    embassy_ES: 'Embajada de España en Puerto España (Trinidad) cubre Barbados.',
    useful_apps: [],
    safety_tips: ['País relativamente seguro para el Caribe. Bridgetown: cuidado de noche fuera de zonas turísticas.', 'Playas del este: corrientes peligrosas. Baña solo en playas con bandera verde.'],
  },

  // ══ AFRICA COMPLETO ══════════════════════════════════════════════════════════

  'Ghana': {
    emergency_general: '191/192/193', police: '191', ambulance: '193', fire: '192',
    embassy_ES: 'Embajada de España en Acra: +233 30 274 6954',
    useful_apps: [],
    safety_tips: ['Uno de los países más estables de África Occidental. Acra: cuidado en Kantamanto y zonas de mercado.', 'Malaria: profilaxis recomendada. Agua embotellada.'],
  },
  'Nigeria': {
    emergency_general: '199/112', police: '199', ambulance: '199', fire: '199',
    embassy_ES: 'Embajada de España en Abuja: +234 9 461 4366',
    useful_apps: [],
    safety_tips: ['Lagos: alto riesgo de robos con violencia. Nunca tomes taxis de calle — solo Uber o servicios de confianza del hotel.', 'Norte de Nigeria (estados de Borno, Yobe, Adamawa): riesgo terrorista extremo (Boko Haram). EVITAR.', 'Delta del Níger: riesgo de secuestros. Solo con escolta.', 'Escamas en Nigeria: timo del príncipe nigeriano es real y prevalente.'],
  },
  'Senegal': {
    emergency_general: '17/15/18', police: '17', ambulance: '15', fire: '18',
    embassy_ES: 'Embajada de España en Dakar: +221 33 821 8048',
    useful_apps: [],
    safety_tips: ['Uno de los más estables de África Occidental. Dakar: cuidado con vendedores insistentes en el puerto.', 'Casamance (sur): situación mejorada pero consulta avisos actuales.', 'Malaria: profilaxis recomendada.'],
  },
  'Mozambique': {
    emergency_general: '119/198', police: '119', ambulance: '198', fire: '198',
    embassy_ES: 'Embajada de España en Maputo: +258 21 492 025',
    useful_apps: [],
    safety_tips: ['Maputo: cuidado con robos a peatones. No lleves objetos de valor visibles.', 'Norte (Cabo Delgado): conflicto activo con grupos armados — evitar completamente.', 'Malaria: profilaxis imprescindible. Agua embotellada.'],
  },
  'Zimbabwe': {
    emergency_general: '999/994', police: '995', ambulance: '994', fire: '993',
    embassy_ES: 'Embajada de España en Harare: +263 4 336 681',
    useful_apps: [],
    safety_tips: ['Harare y Bulawayo: precauciones básicas. No muestres objetos de valor.', 'Parques nacionales (Hwange, Victoria Falls): seguros con guía. Nunca a pie sin guía armado.', 'Victoria Falls: zona muy turística y segura. Ambos lados (Zambia y Zimbabwe) son visitables.'],
  },
  'Ruanda': {
    emergency_general: '112', police: '113', ambulance: '912', fire: '111',
    embassy_ES: 'Embajada de España en Nairobi cubre Ruanda.',
    useful_apps: [],
    safety_tips: ['País muy seguro — uno de los más seguros de África. Higiene urbana impecable (bolsas de plástico prohibidas).', 'Gorila trekking en Parque Nacional Volcanes: solo con guía oficial. Mantén distancia de 7m.', 'Frontera con RDC y Burundi: consulta situación actual.'],
  },
  'Uganda': {
    emergency_general: '999/999', police: '999', ambulance: '999', fire: '999',
    embassy_ES: 'Embajada de España en Nairobi cubre Uganda.',
    useful_apps: [],
    safety_tips: ['Kampala: cuidado en Owino Market y zonas concurridas. Robos frecuentes.', 'Gorila trekking en Bwindi: espectacular. Solo con guía oficial certificado.', 'Norte (Karamoja) y oeste (frontera RDC): consulta situación antes de visitar.', 'Malaria: profilaxis imprescindible.'],
  },
  'Namibia': {
    emergency_general: '10111/061-10111', police: '10111', ambulance: '61-2032276', fire: '2032270',
    embassy_ES: 'Embajada de España en Pretoria cubre Namibia.',
    useful_apps: [],
    safety_tips: ['País muy seguro para Africa. Windhoek: cuidado en Katutura de noche.', 'Skeleton Coast y Kalahari: distancias enormes entre gasolineras. Lleva agua extra y gasolina de reserva.', 'Sol extremo (SPF50+ mínimo).'],
  },
  'Botswana': {
    emergency_general: '999/997', police: '999', ambulance: '997', fire: '998',
    embassy_ES: 'Embajada de España en Pretoria cubre Botswana.',
    useful_apps: [],
    safety_tips: ['País muy seguro y estable. Safaris en Chobe y Okavango: solo con guía certificado.', 'Nunca salgas del vehículo en parques sin autorización — animales peligrosos.', 'Agua potable en ciudades. En campo: solo agua embotellada.'],
  },
  'Etiopía': {
    emergency_general: '911', police: '991', ambulance: '907', fire: '939',
    embassy_ES: 'Embajada de España en Addis Abeba: +251 11 611 0025',
    useful_apps: [],
    safety_tips: ['Conflicto activo en Tigray (norte): evitar completamente. Consulta avisos actuales para Amhara y Oromía.', 'Addis Abeba: relativamente segura. Cuidado con estafas y "guías" no solicitados.', 'Zona Danakil: temperatura más alta del planeta (+50°C). Solo con tour organizado.', 'Malaria: profilaxis en zonas bajas.'],
  },
  'Angola': {
    emergency_general: '113/112', police: '113', ambulance: '112', fire: '115',
    embassy_ES: 'Embajada de España en Luanda: +244 222 331 666',
    useful_apps: [],
    safety_tips: ['Luanda: una de las ciudades más caras del mundo. Cuidado con robos en zonas de mercado.', 'Minas antipersona: fuera de caminos marcados en zonas rurales. Residuos de guerra civil.', 'Agua del grifo no potable. Malaria: profilaxis imprescindible.'],
  },
  'Camerún': {
    emergency_general: '117/18', police: '117', ambulance: '15', fire: '18',
    embassy_ES: 'Embajada de España en Yaundé: +237 222 221 543',
    useful_apps: [],
    safety_tips: ['Noroeste y Suroeste (anglófono): conflicto activo — evitar.', 'Lago Chad y Far North (frontera Nigeria): riesgo terrorista activo (Boko Haram).', 'Yaundé y Duala: relativamente seguras con precauciones. Cuidado con robos.'],
  },
  'Costa de Marfil': {
    emergency_general: '170/185', police: '170', ambulance: '185', fire: '180',
    embassy_ES: 'Embajada de España en Abiyán: +225 27 22 44 16 50',
    useful_apps: [],
    safety_tips: ['Abiyán (Cocody, Plateau): zonas relativamente seguras.', 'Interior del país: carreteras en mal estado. Conduce de día.', 'Malaria: profilaxis imprescindible. Vacuna fiebre amarilla obligatoria.'],
  },
  'Túnez': {
    emergency_general: '197/198/190', police: '197', ambulance: '190', fire: '198',
    embassy_ES: 'Embajada de España en Túnez: +216 71 782 217',
    useful_apps: [],
    safety_tips: ['Destino relativamente seguro. Túnez y Hammamet: turísticos y seguros.', 'Zonas fronterizas con Libia y Argelia: evitar — riesgo terrorista.', 'Interior del sur (Tataouine, Médenine): consulta avisos antes de visitar.'],
  },
  'Argelia': {
    emergency_general: '17/14/21', police: '17', ambulance: '21', fire: '14',
    embassy_ES: 'Embajada de España en Argel: +213 21 60 20 66',
    useful_apps: [],
    safety_tips: ['Argel: relativamente segura. Evita zonas periféricas y banlieues de noche.', 'Sur (Sahara argelino): extraordinario pero requiere permiso y guía oficial. Zona fronteriza — protocolo estricto.', 'Zonas fronterizas con Libia, Mali y Niger: evitar completamente.'],
  },
  'Libia': {
    emergency_general: '1515/193', police: '1515', ambulance: '193', fire: '191',
    embassy_ES: 'Embajada de España en Trípoli: suspendida actividad. Contactar Ministerio de Exteriores.',
    useful_apps: [],
    safety_tips: ['⚠️ NO VIAJAR. Guerra civil con múltiples facciones. Riesgo extremo en todo el país.', 'Solo personal humanitario acreditado con protocolos extremos.'],
  },
  'Sudán': {
    emergency_general: '999', police: '999', ambulance: '333', fire: '998',
    embassy_ES: 'Embajada de España en Jartum: suspendida. Ministerio de Exteriores.',
    useful_apps: [],
    safety_tips: ['⚠️ NO VIAJAR. Conflicto armado activo desde abril 2023 entre SAF y RSF.', 'Jartum bajo combates directos. Riesgo extremo en la mayoría del país.'],
  },
  'Somalia': {
    emergency_general: '888', police: '888', ambulance: '888', fire: '888',
    embassy_ES: 'Embajada de España en Nairobi cubre Somalia.',
    useful_apps: [],
    safety_tips: ['⚠️ NO VIAJAR. Estado fallido con riesgo extremo. Al-Shabaab activo.', 'Mogadiscio: riesgo muy alto. Solo personal humanitario y periodistas con escolta.', 'Somalilandia (norte): relativamente más estable pero sin reconocimiento internacional.'],
  },
  'Madagascar': {
    emergency_general: '117/118', police: '117', ambulance: '118', fire: '119',
    embassy_ES: 'Embajada de España en Pretoria cubre Madagascar.',
    useful_apps: [],
    safety_tips: ['Antananarivo: cuidado con robos, especialmente en mercados (Zoma).', 'Carreteras del sur: en mal estado. Solo 4x4 fuera de ciudad.', 'Naturaleza única: parques naturales con lémures. Sigue solo a guías registrados.', 'Malaria: profilaxis imprescindible en zonas costeras y bajas.'],
  },
  'Malawi': {
    emergency_general: '997/998', police: '997', ambulance: '998', fire: '998',
    embassy_ES: 'Embajada de España en Harare (Zimbabwe) cubre Malawi.',
    useful_apps: [],
    safety_tips: ['País relativamente seguro. Lago Malawi: precaución con bilharzia (esquistosomiasis) — no nadar en zona de juncos.', 'Lilongüe: cuidado en Old Town y mercados con objetos de valor.', 'Malaria: profilaxis imprescindible.'],
  },
  'Zambia': {
    emergency_general: '991/993/999', police: '991', ambulance: '993', fire: '993',
    embassy_ES: 'Embajada de España en Harare cubre Zambia.',
    useful_apps: [],
    safety_tips: ['Lusaka: cuidado con robos en Comesa Market y zonas concurridas.', 'Victoria Falls (Livingstone): fantástico. Cruce a Zimbabwe fácil y seguro.', 'Safari South Luangwa y Kafue: solo con guía certificado. Nunca a pie sin autorización.', 'Malaria: profilaxis imprescindible.'],
  },
  'Benín': {
    emergency_general: '117/118', police: '117', ambulance: '118', fire: '118',
    embassy_ES: 'Embajada de España en Abiyán (Costa de Marfil) cubre Benín.',
    useful_apps: [],
    safety_tips: ['Relativamente estable. Cotonou: cuidado con robos en zonas de mercado.', 'Norte (frontera Burkina Faso y Niger): consulta avisos actuales — actividad terrorista en la región.', 'Malaria: profilaxis recomendada. Vacuna fiebre amarilla obligatoria.'],
  },
  'Burkina Faso': {
    emergency_general: '17/15/18', police: '17', ambulance: '18', fire: '18',
    embassy_ES: 'Embajada de España en Abiyán cubre Burkina Faso.',
    useful_apps: [],
    safety_tips: ['⚠️ Viaje muy desaconsejado. Riesgo terrorista muy alto en gran parte del país.', 'Interior y norte: ataques de grupos yihadistas frecuentes. Solo Uagadugú con precauciones extremas y brevemente.'],
  },
  'Chad': {
    emergency_general: '17/18', police: '17', ambulance: '18', fire: '18',
    embassy_ES: 'Embajada de España en Yaundé (Camerún) cubre Chad.',
    useful_apps: [],
    safety_tips: ['⚠️ Viaje muy desaconsejado. Conflicto armado y grupos terroristas en múltiples zonas.', 'N\'Djamena: solo con escolta y protocolos estrictos. Solo visitas esenciales.'],
  },
  'Congo': {
    emergency_general: '117/118', police: '117', ambulance: '118', fire: '118',
    embassy_ES: 'Embajada de España en Kinshasa (RDC) cubre Congo Brazzaville.',
    useful_apps: [],
    safety_tips: ['Brazzaville: relativamente estable pero con carencias de seguridad. Cuidado de noche.', 'Pool (sur) y frontera RDC: conflictos ocasionales. Consulta antes de visitar.'],
  },
  'Guinea': {
    emergency_general: '117/122', police: '117', ambulance: '122', fire: '122',
    embassy_ES: 'Embajada de España en Dakar (Senegal) cubre Guinea.',
    useful_apps: [],
    safety_tips: ['Conakry: robos frecuentes. No pasees de noche.', 'Interior: carreteras difíciles. Solo 4x4 en temporada de lluvias.', 'Malaria: profilaxis imprescindible. Vacuna fiebre amarilla obligatoria.'],
  },
  'Mali': {
    emergency_general: '17/15/18', police: '17', ambulance: '15', fire: '18',
    embassy_ES: 'Embajada de España en Dakar cubre Mali.',
    useful_apps: [],
    safety_tips: ['⚠️ NO VIAJAR. Presencia yihadista masiva. Norte y centro del país: riesgo extremo.', 'Bamako: riesgo alto. Solo visitas imprescindibles con escolta.'],
  },
  'Níger': {
    emergency_general: '17/15/18', police: '17', ambulance: '15', fire: '18',
    embassy_ES: 'Embajada de España en Dakar cubre Níger.',
    useful_apps: [],
    safety_tips: ['⚠️ NO VIAJAR. Golpe de estado (2023). Presencia terrorista activa. Todo el país desaconsejado.'],
  },
  'Togo': {
    emergency_general: '117/118', police: '117', ambulance: '118', fire: '118',
    embassy_ES: 'Embajada de España en Abiyán cubre Togo.',
    useful_apps: [],
    safety_tips: ['Lomé: relativamente segura. Cuidado con robos en zonas de mercado y playas.', 'Norte (frontera Burkina Faso): consulta avisos actuales — actividad terrorista en la región.'],
  },
  'Sierra Leona': {
    emergency_general: '999/019', police: '999', ambulance: '019', fire: '019',
    embassy_ES: 'Embajada de España en Dakar cubre Sierra Leona.',
    useful_apps: [],
    safety_tips: ['Freetown: relativamente estable. Playas de la Península de Freetown son seguras.', 'Interior: carreteras en muy mal estado. Solo 4x4.', 'Malaria: profilaxis imprescindible.'],
  },
  'Liberia': {
    emergency_general: '911', police: '911', ambulance: '911', fire: '911',
    embassy_ES: 'Embajada de España en Abiyán cubre Liberia.',
    useful_apps: [],
    safety_tips: ['Monrovia: cuidado en West Point y zonas periféricas. No pasees de noche.', 'Infraestructura muy limitada. Solo vehículo todo terreno fuera de ciudades.', 'Malaria: profilaxis imprescindible.'],
  },
  'Eritrea': {
    emergency_general: '114', police: '113', ambulance: '114', fire: '115',
    embassy_ES: 'Embajada de España en Addis Abeba cubre Eritrea.',
    useful_apps: [],
    safety_tips: ['País muy cerrado. Periodismo y fotografía muy restringidos.', 'Frontera con Etiopía y Djibouti: conflictos potenciales. Zonas militarizadas.', 'Solo turismo organizado — guía oficial obligatorio.'],
  },
  'Yibuti': {
    emergency_general: '17/18', police: '17', ambulance: '18', fire: '18',
    embassy_ES: 'Embajada de España en Addis Abeba cubre Yibuti.',
    useful_apps: [],
    safety_tips: ['Ciudad de Yibuti: relativamente segura. Evita zonas de refugiados de noche.', 'Frontera con Eritrea y Somalia: zonas peligrosas. Nunca te acerques sin escolta.', 'Lago Assal y Lago Abbé: espectaculares. Solo con guía 4x4.'],
  },
  'Cabo Verde': {
    emergency_general: '132/130', police: '132', ambulance: '130', fire: '131',
    embassy_ES: 'Embajada de España en Dakar cubre Cabo Verde.',
    useful_apps: [],
    safety_tips: ['Relativamente seguro. Sal y São Vicente: más seguras. Santiago (Praia): precauciones en Plateau de noche.', 'Corrientes oceánicas muy fuertes en algunas islas — no subestimes el océano.'],
  },
  'Seychelles': {
    emergency_general: '999/888', police: '999', ambulance: '151', fire: '999',
    embassy_ES: 'Embajada de España en Nairobi cubre Seychelles.',
    useful_apps: [],
    safety_tips: ['País muy seguro. Victoria (Mahé): pequeño y fácil de recorrer.', 'Corrientes oceánicas fuertes en algunas playas (Anse Source d\'Argent): solo baño en zonas habilitadas.'],
  },
  'Mauricio': {
    emergency_general: '999/114', police: '999', ambulance: '114', fire: '115',
    embassy_ES: 'Embajada de España en Pretoria cubre Mauricio.',
    useful_apps: [],
    safety_tips: ['País muy seguro. Port Louis: cuidado en mercados con objetos de valor.', 'Buceo y submarinismo: certifícate con operadoras PADI. Corrientes en costas del sur.'],
  },
  'Comoras': {
    emergency_general: '17/15', police: '17', ambulance: '15', fire: '15',
    embassy_ES: 'Embajada de España en Antananarivo (Madagascar) cubre Comoras.',
    useful_apps: [],
    safety_tips: ['Relativamente seguro. Moroni: precauciones básicas. No pasees de noche con objetos de valor.', 'Volcán Karthala (Ngazidja): activo. Consulta alertas antes de senderismo.'],
  },
  'Suazilandia': {
    emergency_general: '999', police: '999', ambulance: '977', fire: '933',
    embassy_ES: 'Embajada de España en Pretoria cubre Suazilandia (Esuatini).',
    useful_apps: [],
    safety_tips: ['País relativamente seguro. Mbabane: precauciones básicas de noche.', 'Ceremonias culturales (Umhlanga, Incwala): espectaculares y abiertas a turistas con respeto.'],
  },
  'Lesoto': {
    emergency_general: '124/122', police: '123', ambulance: '124', fire: '122',
    embassy_ES: 'Embajada de España en Pretoria cubre Lesoto.',
    useful_apps: [],
    safety_tips: ['Maseru: relativamente segura. Zona montañosa (Drakensberg): espectacular pero clima imprevisible.', 'Pony trekking: única forma de acceder a zonas remotas — muy recomendado.'],
  },
  'Sudán del Sur': {
    emergency_general: '999', police: '999', ambulance: '999', fire: '999',
    embassy_ES: 'No hay embajada española. Ministerio de Exteriores.',
    useful_apps: [],
    safety_tips: ['⚠️ NO VIAJAR. Conflicto armado activo. País con crisis humanitaria severa.', 'Solo personal humanitario acreditado con protocolos de seguridad extremos.'],
  },

  // ══ OCEANÍA COMPLETO ══════════════════════════════════════════════════════════

  'Papúa Nueva Guinea': {
    emergency_general: '000', police: '000', ambulance: '111', fire: '110',
    embassy_ES: 'Embajada de España en Camberra (Australia) cubre Papúa Nueva Guinea.',
    useful_apps: [],
    safety_tips: ['Port Moresby: una de las ciudades más peligrosas del Pacífico. Nunca pasees a pie.', 'Interior: tribus remotas — solo con guía de confianza. Cultura muy diversa y compleja.', 'Malaria: profilaxis imprescindible en zonas bajas.'],
  },
  'Fiyi': {
    emergency_general: '911', police: '917', ambulance: '911', fire: '911',
    embassy_ES: 'Embajada de España en Camberra cubre Fiyi.',
    useful_apps: [],
    safety_tips: ['País seguro para turistas. Suva: cuidado de noche fuera de zonas hoteleras.', 'Ciclones: temporada nov-abr. Sigue alertas meteorológicas.', 'Kava (yaqona): bebida cultural que te ofrecerán en ceremonias. Protocolo: acepta con las manos juntas y di "bula".'],
  },
  'Samoa': {
    emergency_general: '999', police: '995', ambulance: '996', fire: '994',
    embassy_ES: 'Embajada de España en Wellington (NZ) cubre Samoa.',
    useful_apps: [],
    safety_tips: ['País muy seguro. Código de conducta local (fa\'a Samoa): respeta costumbres locales en pueblos.', 'Tsunamis: historial sísmico. En terremoto busca terreno elevado inmediatamente.'],
  },
  'Tonga': {
    emergency_general: '911', police: '922', ambulance: '911', fire: '911',
    embassy_ES: 'Embajada de España en Wellington cubre Tonga.',
    useful_apps: [],
    safety_tips: ['País tranquilo y seguro. Día de descanso muy estricto (domingo): casi todo cerrado. Respeta el silencio.', 'Ballenas jorobadas (jul-oct): avistamientos impresionantes con normas estrictas de distancia.'],
  },
  'Vanuatu': {
    emergency_general: '112', police: '22222', ambulance: '22100', fire: '22222',
    embassy_ES: 'Embajada de España en Camberra cubre Vanuatu.',
    useful_apps: [],
    safety_tips: ['País seguro. Volcán Yasur (Tanna): activo y visitable — una de las experiencias más impresionantes del mundo.', 'Ciclones: temporada nov-abr. Sigue alertas.'],
  },
  'Islas Salomón': {
    emergency_general: '999', police: '999', ambulance: '999', fire: '999',
    embassy_ES: 'Embajada de España en Camberra cubre Islas Salomón.',
    useful_apps: [],
    safety_tips: ['Honiara: cuidado de noche. Tensiones étnicas históricas.', 'Buceo de los mejores del mundo. Solo con operadoras certificadas.', 'Malaria: profilaxis imprescindible.'],
  },
  'Islas Cook': {
    emergency_general: '999', police: '999', ambulance: '998', fire: '996',
    embassy_ES: 'Embajada de España en Wellington cubre Islas Cook.',
    useful_apps: [],
    safety_tips: ['Rarotonga: muy segura y tranquila. Ciclones: temporada nov-abr.', 'Buceo excelente. Alquiler de scooter popular — usa casco.'],
  },
  'Polinesia Francesa': {
    emergency_general: '15/17/18', police: '17', ambulance: '15', fire: '18',
    embassy_ES: 'Consulado de España en Papeete: +689 40 541 244',
    useful_apps: [],
    safety_tips: ['Territorio francés. Muy seguro. Papeete: cuidado de noche en zonas de bares.', 'Bora Bora, Moorea: paradisíacas. Corrientes oceánicas en pasos del arrecife.'],
  },
  'Nueva Caledonia': {
    emergency_general: '15/17/18', police: '17', ambulance: '15', fire: '18',
    embassy_ES: 'Consulado de España en Nouméa: +687 272 733',
    useful_apps: [],
    safety_tips: ['Territorio francés. Nouméa: relativamente segura. Cuidado de noche en zonas periféricas.', 'Tensiones entre comunidades canacos y colonos europeos han aumentado (2024). Consulta situación actual.'],
  },

});