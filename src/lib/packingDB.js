/**
 * packingDB.js — Requisitos de viaje y sugerencias de equipaje por país
 * Cobertura global — optimizado para viajeros hispanohablantes
 */

export const COUNTRY_REQUIREMENTS = {

  'Afganistán': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all", "note": "Zona de conflicto — no se recomienda viajar"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido. Zona de conflicto — no se recomienda viajar' }, adapter: { needed: true, type: 'Tipo C/D/F', info: 'Varios tipos.' }, currency: { info: 'Afgani (AFN). Solo efectivo.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Polio', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Ministerio de AAEE: NO VIAJAR — peligro extremo de vida.'], emergency: '100 (policía) · 102 (ambulancia)' },

  'Albania': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, CU.' }, adapter: { needed: false, info: 'Tipo C/F — compatible.' }, currency: { info: 'Lek albanés (ALL). Efectivo imprescindible.' }, vaccines: [], tips: ['Costa Riviera albanesa: playas increíbles y aún asequibles.', 'Tirana está cambiando muy rápido.'], emergency: '112 · 129 (policía) · 127 (ambulancia)' },

  'Alemania': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F — compatible.' }, currency: { info: 'Euro. El efectivo sigue siendo muy usado en Alemania.' }, vaccines: [], tips: ['Muchos establecimientos solo aceptan efectivo.'], emergency: '112 · 110 (policía)' },

  'Andorra': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO.' }, adapter: { needed: false, info: 'Tipo C/F — igual que España.' }, currency: { info: 'Euro (EUR) aunque no es miembro de la UE.' }, vaccines: [], tips: ['Compras duty-free muy populares.', 'Esquí en invierno: Grandvalira es el mayor resort de los Pirineos.'], emergency: '110 (policía) · 116 (ambulancia)' },

  'Angola': { visa: { ES: 'evisa', US: 'evisa', UK: 'evisa', LATAM: {"evisa": "all"}, needed: true, info: 'e-Visa requerida para europeos. Latinoamericanos: e-Visa requerida.' }, adapter: { needed: false, info: 'Tipo C.' }, currency: { info: 'Kwanza (AOA). Efectivo USD muy aceptado.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }], tips: ['Luanda: una de las ciudades más caras de África.', 'Playas increíbles al sur.'], emergency: '113 (policía) · 112 (ambulancia)' },

  'Antigua y Barbuda': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE", "BO"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos.' }, currency: { info: 'Dólar del Caribe Oriental (XCD). USD también aceptado.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['365 playas — una por cada día del año.', 'English Harbour: histórica base naval inglesa y actual marina de lujo.'], emergency: '911' },

  'Arabia Saudí': { visa: {
    ES: 'evisa',
    US: 'evisa',
    UK: 'evisa',
    AU: 'evisa',
    CA: 'evisa',
    JP: 'evisa',
    KR: 'evisa',
    IN: 'evisa',
    CN: 'evisa',
    RU: 'evisa',
    LATAM: {
      required: ['EC', 'PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      evisa: ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY'],
      note: 'e-Visa turismo para 49 países. La mayoría en visa.mofa.gov.sa'
    },
    needed: true,
    info: 'España/UE: e-Visa · e-Visa turismo para 49 países. La mayoría en visa.mofa.gov.sa'
  }, needed: true, info: 'e-Visa requerida para europeos. e-Visa: AR, BR, CL, CO, MX, PE, UY, EC. Visado requerido: VE, BO, CU.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tres patillas cuadradas. Adaptador necesario.' }, currency: { info: 'Riyal saudí (SAR). Tarjeta muy aceptada.' }, vaccines: [{ name: 'Meningitis', priority: 'requerida para hajj/umra' }], tips: ['Mujeres pueden viajar solas.', 'Alcohol prohibido.', 'AlUla y Madain Saleh: Petra árabe.'], emergency: '999 (policía) · 997 (ambulancia) · 998 (bomberos)' },

  'Argelia': { visa: { ES: 'evisa', US: true, UK: true, LATAM: {"required": ["AR", "BR", "CL", "CO", "MX", "PE", "UY", "VE", "BO", "EC"], "free": ["CU"]}, needed: true, info: 'e-Visa requerida para europeos. Sin visado: CU. Visado requerido: AR, BR, CL, CO, MX, PE, UY, VE, BO, EC.' }, adapter: { needed: false, info: 'Tipo C/F — compatible.' }, currency: { info: 'Dinar argelino (DZD). Solo efectivo. No se puede sacar del país.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Sahara argelino: el más auténtico.', 'Turismo aún poco desarrollado.'], emergency: '17 (policía) · 14 (ambulancia)' },

  'Argentina': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado.' }, adapter: { needed: true, type: 'Tipo I', info: 'Tres clavijas en triángulo. Adaptador necesario.' }, currency: { info: 'Peso argentino (ARS). Economía compleja — infórmate del tipo de cambio.' }, vaccines: [], tips: ['La Patagonia requiere planificación — distancias enormes.'], emergency: '911' },

  'Armenia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: 'voa',
    CN: 'voa',
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      voa: ['VE']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PE, UY. Visa en llegada: VE. Visado requerido: BO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Dram armenio (AMD). Efectivo en zonas rurales.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Geghard y Garni: monasterios espectaculares.', 'Ereván: muy asequible.', 'No mencionar Nagorno-Karabaj imprudentemente.'], emergency: '102 (policía) · 103 (ambulancia)' },

  'Aruba': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE", "BO"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO.' }, adapter: { needed: true, type: 'Tipo A/B/F', info: 'Varios tipos. Adaptador universal.' }, currency: { info: 'Florín de Aruba (AWG). USD ampliamente aceptado. 1 USD ≈ 1.79 AWG.' }, vaccines: [], tips: ['Oranjestad: capital colorida y segura.', 'Eagle Beach: una de las mejores playas del Caribe.', 'Viento constante del noreste — ideal para windsurf y kitesurf.', 'País fuera de la zona de huracanes.'], emergency: '911' },

  'Australia': { visa: {
    ES: 'eta',
    US: 'eta',
    UK: 'eta',
    AU: false,
    CA: 'eta',
    JP: 'eta',
    KR: 'eta',
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      required: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'ETA/eVisitor para países VWP. LATAM necesita Visitor Visa (subclass 600).'
    },
    needed: true,
    info: 'España/UE: ETA electrónica · ETA/eVisitor para países VWP. LATAM necesita Visitor Visa (subclass 600).'
  }, needed: true, info: 'ETA electrónica para europeos. Visado requerido: AR, BR, CL, CO, MX, PE, UY, EC, VE, BO. LATAM necesita visa ETA o eVisitor. Algunos pueden calificar para eVisitor.' }, adapter: { needed: true, type: 'Tipo I', info: 'Australia y NZ usan tipo I — tres clavijas en triángulo. Adaptador necesario.' }, currency: { info: 'Dólar australiano (AUD). Tarjeta aceptada absolutamente en todo.' }, vaccines: [], tips: ['Distancias enormes — planifica vuelos internos.', 'Protector solar SPF50 obligatorio.', 'Vida marina peligrosa (medusas, tiburones) — haz caso a las señales.'], emergency: '000' },

  'Austria': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Euro.' }, vaccines: [], tips: ['Viena City Card merece la pena.'], emergency: '112 · 133 (policía) · 144 (ambulancia)' },

  'Azerbaiyán': { visa: {
    ES: 'evisa',
    US: 'evisa',
    UK: 'evisa',
    AU: 'evisa',
    CA: 'evisa',
    JP: 'evisa',
    KR: 'evisa',
    IN: 'evisa',
    CN: 'evisa',
    RU: false,
    LATAM: {
      required: ['EC', 'PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      evisa: ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY']
    },
    needed: true,
    info: 'España/UE: e-Visa'
  }, needed: true, info: 'e-Visa requerida para europeos. e-Visa: AR, BR, CL, CO, MX, PE. Visado requerido: VE, BO.' }, adapter: { needed: false, info: 'Compatible.' }, currency: { info: 'Manat azerbaiyano (AZN). Efectivo necesario fuera de Bakú.' }, vaccines: [{name: 'Hepatitis A', priority: 'recomendada'}], tips: ['Bakú: mezcla de ciudad amurallada medieval y rascacielos modernos.', 'Fuegos eternos del Yanar Dag: fenómeno natural único.'], emergency: '102 (policía) · 103 (ambulancia)' },

  'Bahamas': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY'],
      required: ['EC', 'PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos.' }, currency: { info: 'Dólar bahameño (BSD). Paridad 1:1 con USD — el dólar americano se acepta en todo.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Nassau: muy turística — Pink Sand Beach en Harbor Island para escapar.', 'Exumas: piscinas naturales con tiburones nodriza y cerdos nadadores.', 'Buceo con tiburones en Andros.'], emergency: '919 (policía) · 322-2221 (ambulancia)' },

  'Bahréin': { visa: {
    ES: 'evisa',
    US: 'evisa',
    UK: 'evisa',
    AU: 'evisa',
    CA: 'evisa',
    JP: 'evisa',
    KR: 'evisa',
    IN: 'evisa',
    CN: 'evisa',
    RU: 'evisa',
    LATAM: {
      required: ['PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      evisa: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PE', 'UY']
    },
    needed: true,
    info: 'España/UE: e-Visa'
  }, needed: true, info: 'e-Visa requerida para europeos. e-Visa: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC, CU.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tres patillas cuadradas.' }, currency: { info: 'Dinar bareiní (BHD). Tarjeta muy aceptada.' }, vaccines: [], tips: ['Árbol de la Vida: baobab de 400 años en pleno desierto.', 'Manama: cosmopolita y relajada.'], emergency: '999 (policía) · 999 (ambulancia)' },

  'Bangladés': { visa: {
    ES: 'voa',
    US: 'evisa',
    UK: 'evisa',
    AU: 'evisa',
    CA: 'evisa',
    JP: 'evisa',
    KR: 'evisa',
    IN: false,
    CN: 'voa',
    RU: 'evisa',
    LATAM: {
      required: ['EC', 'PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      evisa: ['BR', 'CL', 'CO', 'MX', 'PE', 'UY'],
      voa: ['AR']
    },
    needed: true,
    info: 'España/UE: visa en llegada · EEUU: e-Visa'
  }, needed: true, info: 'Visa en llegada para europeos. Visa en llegada: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: true, type: 'Tipo C/D/G/K', info: 'Varios tipos. Adaptador universal.' }, currency: { info: 'Taka bangladesí (BDT). Efectivo muy necesario.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Malaria', priority: 'profilaxis para zonas rurales' }], tips: ['Daca: una de las ciudades más densas del mundo.', 'Sundarban: el bosque de manglares más grande del mundo — tigres de Bengala.', 'Cox\'s Bazar: la playa más larga del mundo (120km).'], emergency: '999 (policía) · 199 (ambulancia)' },

  'Barbados': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY'],
      required: ['EC', 'PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos.' }, currency: { info: 'Dólar de Barbados (BBD). USD aceptado.' }, vaccines: [], tips: ['Bridgetown: capital más antigua del Caribe anglófono.', 'Snorkel excepcional.'], emergency: '211 (policía) · 511 (ambulancia)' },

  'Belice': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado.' }, adapter: { needed: true, type: 'Tipo A/B/G', info: 'Varios tipos. Adaptador universal.' }, currency: { info: 'Dólar de Belice (BZD). USD aceptado (1 USD = 2 BZD fijo).' }, vaccines: [{name: 'Hepatitis A', priority: 'recomendada'}, {name: 'Fiebre amarilla', priority: 'recomendada'}], tips: ['Gran Barrera de Coral del Caribe: segunda más grande del mundo.', 'Inglés es el idioma oficial — fácil para anglófonos.'], emergency: '911' },

  'Benín': { visa: { ES: 'evisa', US: 'evisa', UK: 'evisa', LATAM: {"evisa": "all"}, needed: true, info: 'e-Visa requerida para europeos. Latinoamericanos: e-Visa requerida.' }, adapter: { needed: true, type: 'Tipo C/E', info: 'Enchufes europeos — compatible con cargadores españoles.' }, currency: { info: 'Franco CFA Occidental (XOF). Solo efectivo fuera de Cotonú.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Ouidah: historia del comercio de esclavos, vudú y playas.', 'Cotonú: capital económica, más dinámica que Porto-Novo.', 'Repelente de mosquitos cada día sin excepción.'], emergency: '117 (policía) · 112 (ambulancia)' },

  'Bielorrusia': { visa: {
    ES: 'evisa',
    US: true,
    UK: true,
    AU: true,
    CA: true,
    JP: 'evisa',
    KR: 'evisa',
    IN: true,
    CN: true,
    RU: false,
    LATAM: {
      required: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: true,
    info: 'España/UE: e-Visa · EEUU: visado requerido'
  }, needed: true, info: 'e-Visa requerida para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Rublo bielorruso (BYN). Efectivo.' }, vaccines: [], tips: ['Verifica situación política antes de viajar.', 'Muchas sanciones internacionales vigentes.'], emergency: '112 · 102 (policía) · 103 (ambulancia)' },

  'Bolivia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado.' }, adapter: { needed: true, type: 'Tipo A/C', info: 'Adaptador recomendado.' }, currency: { info: 'Boliviano (BOB). Efectivo principalmente.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'recomendada (zonas tropicales)' }], tips: ['La Paz a 3.600m — aclimatación obligatoria.', 'Salar de Uyuni: impresionante en época de lluvia.'], emergency: '110 (policía) · 118 (ambulancia)' },

  'Bosnia y Herzegovina': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'MX', 'UY'],
      required: ['CO', 'EC', 'PA', 'PE', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, MX. Visado requerido: CO, PE, VE, BO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Marco convertible (BAM). Tipo fijo con el euro. Efectivo en zonas rurales.' }, vaccines: [], tips: ['Mostar: el Stari Most es impresionante.', 'Sarajevo: historia única — la ciudad del asedio.'], emergency: '112 · 122 (policía) · 124 (ambulancia)' },

  'Botswana': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE", "BO", "EC"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: true, type: 'Tipo D/G/M', info: 'Varios tipos. Adaptador universal.' }, currency: { info: 'Pula (BWP). Tarjeta aceptada en zonas turísticas.' }, vaccines: [{ name: 'Malaria', priority: 'profilaxis para delta del Okavango' }], tips: ['Okavango Delta: safari en mekoro (canoa).', 'Chobe: mayor concentración de elefantes del mundo.'], emergency: '999 (policía) · 997 (ambulancia)' },

  'Brasil': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado.' }, adapter: { needed: true, type: 'Tipo N', info: 'Tipo N — similar al C pero patillas más gruesas. Adaptador recomendado.' }, currency: { info: 'Real (BRL). Efectivo en playas y locales pequeños.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'recomendada' }], tips: ['No muestres móvil o joyas en la calle.', 'Uber muy popular y seguro.'], emergency: '190 (policía) · 192 (ambulancia)' },

  'Brunéi': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "MX", "BR", "CL"], "required": ["CO", "PE", "VE", "BO", "EC"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, MX, BR, CL. Visado requerido: CO, PE, VE, BO, EC.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tipo G — tres patillas cuadradas (herencia británica).' }, currency: { info: 'Dólar de Brunéi (BND). Paridad 1:1 con el dólar de Singapur.' }, vaccines: [], tips: ['Bandar Seri Begawan: capital pequeña y muy segura.', 'Mezquita de Omar Ali Saifuddien: una de las más bonitas del sudeste asiático.', 'Alcohol prohibido — sultanato islámico.', 'Ulu Temburong: naturaleza virgen accesible en barca.'], emergency: '993 (policía) · 991 (ambulancia)' },

  'Bulgaria': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Lev búlgaro (BGN). Tipo fijo con el euro.' }, vaccines: [], tips: ['Sofía es muy asequible.', 'Costa del Mar Negro: playas buenas y baratas.'], emergency: '112 · 166 (policía) · 150 (ambulancia)' },

  'Burkina Faso': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all", "note": "Zona de riesgo"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido. Zona de riesgo' }, adapter: { needed: false, info: 'Tipo C/E — compatible.' }, currency: { info: 'Franco CFA Occidental (XOF). Solo efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Meningitis', priority: 'recomendada' }], tips: ['Ministerio de AAEE desaconseja totalmente viajar — conflicto yihadista activo.', 'Si debes ir: registro en embajada, seguro especial de evacuación.'], emergency: '17 (policía) · 18 (bomberos)' },

  'Burundi': { visa: { ES: 'voa', US: 'voa', UK: 'voa', LATAM: {"required": "all"}, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: false, info: 'Tipo C/J.' }, currency: { info: 'Franco burundés (BIF). Solo efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Bujumbura: capital a orillas del lago Tanganica.', 'Lago Tanganica: el más largo del mundo y segundo más profundo.', 'Situación política inestable — verificar antes de viajar.'], emergency: '112 (policía) · 116 (ambulancia)' },

  'Bután': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all", "note": "Visa especial + tasa diaria obligatoria. Solo tours organizados."}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido. Visa especial + tasa diaria obligatoria. Solo tours organizados.' }, adapter: { needed: true, type: 'Tipo C/D/F', info: 'Varios tipos.' }, currency: { info: 'Ngultrum butanés (BTN). Paridad con rupia india. Efectivo.' }, vaccines: [{name: 'Hepatitis A', priority: 'recomendada'}], tips: ['El país que mide la Felicidad Nacional Bruta.', 'Nido del Tigre (Paro Taktsang): excursión icónica.', 'Solo para grupos organizados con guía licenciado.'], emergency: '113 (policía) · 112 (ambulancia)' },

  'Bélgica': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/E.' }, currency: { info: 'Euro.' }, vaccines: [], tips: ['Bruselas es sede de la UE — controles de seguridad frecuentes.'], emergency: '112 · 101 (policía) · 100 (ambulancia)' },

  'Cabo Verde': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'UY'],
      required: ['PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: false, info: 'Tipo C/F — compatible con europeos.' }, currency: { info: 'Escudo caboverdiano (CVE). Paridad fija con el euro. Tarjeta aceptada en zonas turísticas.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria', priority: 'profilaxis para Santiago y otros' }], tips: ['Sal y Boa Vista: las más turísticas.', 'Santo Antão: senderismo entre valles verdes espectaculares.', 'Santiago: cultura y gastronomía más auténtica.', 'Agua del grifo no potable.'], emergency: '132 (policía) · 130 (bomberos)' },

  'Camboya': { visa: {
    ES: 'evisa',
    US: 'evisa',
    UK: 'evisa',
    AU: 'evisa',
    CA: 'evisa',
    JP: 'evisa',
    KR: 'evisa',
    IN: 'evisa',
    CN: false,
    RU: false,
    LATAM: {
      required: ['CU', 'HT'],
      evisa: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'DO'],
      note: 'e-Visa $36 en evisa.gov.kh. China y Rusia sin visa. VOA también disponible.'
    },
    needed: true,
    info: 'España/UE: e-Visa · e-Visa $36 en evisa.gov.kh. China y Rusia sin visa. VOA también disponible.'
  }, needed: true, info: 'e-Visa requerida para europeos. Latinoamericanos: e-Visa requerida.' }, adapter: { needed: true, type: 'Tipo A/C/G', info: 'Varios tipos. Adaptador universal.' }, currency: { info: 'USD ampliamente aceptado. El riel (KHR) también circula.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Angkor Wat: cubrir hombros y rodillas.', 'No bebas agua del grifo.'], emergency: '117 (policía) · 119 (ambulancia)' },

  'Camerún': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: false, info: 'Tipo C/E — compatible.' }, currency: { info: 'Franco CFA Central (XAF). Efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Yaundé: capital política. Duala: capital económica.', 'Monte Camerún: volcán activo accesible.', 'Zona anglófona al noroeste — situación de seguridad delicada.'], emergency: '17 (policía) · 15 (ambulancia)' },

  'Canadá': { visa: {
    ES: 'eta',
    US: false,
    UK: 'eta',
    AU: 'eta',
    CA: false,
    JP: 'eta',
    KR: 'eta',
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      required: ['AR', 'BR', 'CL', 'CO', 'EC', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      eta: ['MX'],
      note: 'eTA para países VWP. México tiene eTA desde 2016. Resto LATAM requiere visa.'
    },
    needed: true,
    info: 'España/UE: ETA electrónica · EEUU: sin visa · eTA para países VWP. México tiene eTA desde 2016. Resto LATAM requiere visa.'
  }, needed: true, info: 'ETA electrónica para europeos. ETA: MX. Visado requerido: AR, BR, CL, CO, EC, PA, PE, PY, UY, VE, BO.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Mismo que EEUU. Adaptador necesario.' }, currency: { info: 'Dólar canadiense (CAD). Propina del 15-18%.' }, vaccines: [], tips: ['En invierno temperaturas extremas — ropa técnica obligatoria.'], emergency: '911' },

  'Chad': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: false, info: 'Tipo C/E/F.' }, currency: { info: 'Franco CFA Central (XAF). Solo efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Meningitis', priority: 'recomendada' }], tips: ['Lago Chad: reducido drásticamente por el cambio climático.', 'Desierto del Sahara: dunas de Ennedi espectaculares.', 'Infraestructura muy limitada — planificación rigurosa necesaria.'], emergency: '17 (policía)' },

  'Chile': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado.' }, adapter: { needed: false, info: 'Tipo C/L — compatible con enchufes españoles.' }, currency: { info: 'Peso chileno (CLP). Tarjeta aceptada en ciudades.' }, vaccines: [], tips: ['Atacama: protección solar extrema.', 'Vuelos internos necesarios para cubrir el país.'], emergency: '133 (policía) · 131 (ambulancia)' },

  'China': { visa: {
    ES: false,
    US: true,
    UK: true,
    AU: true,
    CA: true,
    JP: true,
    KR: false,
    IN: true,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'ES tiene 15 días sin visa (2024). US/UK/AU/CA/JP: visa requerida. KR sin visa. LATAM: muchos sin visa.'
    },
    needed: false,
    info: 'España/UE: sin visa · EEUU: visado requerido · ES tiene 15 días sin visa (2024). US/UK/AU/CA/JP: visa requerida. KR sin visa. LATAM: muchos sin visa.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY, EC. Visado requerido: VE, BO, CU. ES tiene 15 días sin visa desde 2024' }, adapter: { needed: true, type: 'Tipo A/C/I', info: 'Varios tipos. Adaptador universal recomendado.' }, currency: { info: 'Yuan (CNY). Alipay y WeChat Pay imprescindibles — descarga las apps antes de llegar.' }, vaccines: [{ name: 'Rabia', priority: 'considerar si contacto con animales' }], tips: ['Google/WhatsApp/Instagram no funcionan — instala VPN antes de entrar.', 'WeChat es esencial.'], emergency: '110 (policía) · 120 (ambulancia)' },

  'Chipre': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PE, UY. Visado requerido: VE, BO.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tres patillas cuadradas. Adaptador necesario.' }, currency: { info: 'Euro (EUR) en el sur. Lira turca en el norte.' }, vaccines: [], tips: ['Cruzar al norte: posible con pasaporte — verifica situación.', 'Paphos: mosaicos romanos impresionantes.'], emergency: '112 · 199 (policía) · 199 (ambulancia)' },

  'Colombia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Clavijas planas americanas. Europeos necesitan adaptador.' }, currency: { info: 'Peso colombiano (COP). Efectivo fuera de centros urbanos.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'recomendada (zonas selváticas)' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Usa InDriver o Uber.', 'Precaución nocturna en zonas desconocidas.'], emergency: '123' },

  'Comoras': { visa: { ES: 'voa', US: 'voa', UK: 'voa', LATAM: {"voa": "all"}, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visa en llegada.' }, adapter: { needed: false, info: 'Tipo C/E.' }, currency: { info: 'Franco comorense (KMF). Paridad fija con el euro. Efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'recomendada' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Tres islas volcánicas entre Mozambique y Madagascar.', 'Moroni: capital tranquila y auténtica.', 'Buceo con coelacantos — especie considerada extinta millones de años.'], emergency: '17 (policía)' },

  'Congo': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: false, info: 'Tipo C/E.' }, currency: { info: 'Franco CFA Central (XAF). Efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['No confundir con la República Democrática del Congo (Kinshasa).', 'Brazzaville: frente a Kinshasa en el río Congo — una de las únicas capitales gemelas del mundo.'], emergency: '117 (policía)' },

  'Corea del Norte': { visa: { needed: true, info: 'Visado extremadamente difícil. Solo tours organizados a través de agencias autorizadas. Ciudadanos de EE.UU., Corea del Sur e Israel: prohibido entrar. Situación política única en el mundo.' }, adapter: { needed: false, info: 'Tipo A/C/F.' }, currency: { info: 'Won norcoreano (KPW). Solo euros o USD — los turistas usan moneda extranjera.' }, vaccines: [], tips: ['Acceso solo con tour organizado — nunca turismo independiente.', 'Guías norcoreanos acompañan siempre.', 'No fotografiar militares, pobreza ni nada que el guía no autorice.'], emergency: 'No aplica — turismo solo organizado' },

  'Corea del Sur': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'UY'],
      required: ['PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PA, PE, UY, EC. Visado requerido: VE, BO, CU.' }, adapter: { needed: false, info: 'Tipo C/F — compatible.' }, currency: { info: 'Won (KRW). Tarjeta aceptada en casi todo.' }, vaccines: [], tips: ['Usa Kakao Maps — Google Maps no funciona bien en Corea.', 'T-Money card para transporte.'], emergency: '112 (policía) · 119 (ambulancia)' },

  'Costa Rica': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Clavijas americanas. Europeos necesitan adaptador.' }, currency: { info: 'Colón (CRC). El USD también es aceptado.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Alquila coche 4x4 para zonas remotas.', 'Temporada seca: diciembre-abril.'], emergency: '911' },

  'Costa de Marfil': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: false, info: 'Tipo C/E — compatible.' }, currency: { info: 'Franco CFA Occidental (XOF). Efectivo necesario fuera de Abiyán.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Abiyán: la ciudad más moderna y dinámica de África Occidental.', 'Grand-Bassam: primera capital colonial — UNESCO.', 'País relativamente seguro para África Occidental.'], emergency: '110 (policía) · 185 (SAMU)' },

  'Croacia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Euro (desde enero 2023).' }, vaccines: [], tips: ['Islas del Adriático: reserva ferrys en verano.'], emergency: '112 · 192 (policía) · 194 (ambulancia)' },

  'Cuba': { visa: {
    ES: false,
    US: true,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'Ciudadanos US: restricciones legales para turismo. ES/UE: tarjeta turista ~$25.'
    },
    needed: false,
    info: 'España/UE: sin visa · EEUU: visado requerido · Ciudadanos US: restricciones legales para turismo. ES/UE: tarjeta turista ~$25.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado. Ciudadanos US tienen restricciones legales para turismo. ES necesita tarjeta turista.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Clavijas americanas. Adaptador necesario.' }, currency: { info: 'Peso cubano (CUP). Solo efectivo — tarjetas internacionales no funcionan bien.' }, vaccines: [], tips: ['No lleves tarjetas de bancos americanos.', 'WiFi caro y escaso — tarjetas ETECSA en tiendas oficiales.', 'Casas particulares: mejor opción de alojamiento.'], emergency: '106 (policía) · 104 (ambulancia)' },

  'Curazao': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE.' }, adapter: { needed: true, type: 'Tipo A/B/F', info: 'Varios tipos.' }, currency: { info: 'Florín antillano (ANG). USD también aceptado.' }, vaccines: [], tips: ['Willemstad: capital de colores pastel — UNESCO.', 'Buceío excepcional — arrecifes en muy buen estado.', 'Fuera de la zona de huracanes — clima estable todo el año.'], emergency: '911' },

  'Dinamarca': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F/K.' }, currency: { info: 'Corona danesa (DKK). No usan euro.' }, vaccines: [], tips: ['Copenhague es muy ciclista — alquila una bici.'], emergency: '112' },

  'Dominica': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE", "BO"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO.' }, adapter: { needed: true, type: 'Tipo D/G', info: 'Tipo G principalmente. Adaptador necesario.' }, currency: { info: 'Dólar del Caribe Oriental (XCD). USD aceptado.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['La isla más verde del Caribe — naturaleza volcánica impresionante.', 'Boiling Lake: el segundo lago de agua hirviente más grande del mundo.', 'Snorkel y buceo en arrecifes volcánicos únicos.'], emergency: '999 (policía) · 999 (ambulancia)' },

  'Ecuador': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'Política de puertas abiertas — sin visa para casi todos.'
    },
    needed: false,
    info: 'España/UE: sin visa · Política de puertas abiertas — sin visa para casi todos.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos.' }, currency: { info: 'USD — moneda oficial.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Fiebre amarilla', priority: 'requerida para zonas amazónicas' }], tips: ['Galápagos: reserva con mucha antelación.', 'Quito a 2.850m — cuidado con el mal de altura.'], emergency: '911' },

  'Egipto': { visa: {
    ES: 'voa',
    US: 'voa',
    UK: 'voa',
    AU: 'voa',
    CA: 'voa',
    JP: 'voa',
    KR: 'voa',
    IN: 'voa',
    CN: 'voa',
    RU: 'voa',
    LATAM: {
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      voa: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      note: 'VOA $25 en aeropuerto. India, China, Rusia también VOA.'
    },
    needed: true,
    info: 'España/UE: visa en llegada · VOA $25 en aeropuerto. India, China, Rusia también VOA.'
  }, needed: true, info: 'Visa en llegada para europeos. Visa en llegada: AR, BR, CL, CO, MX, PE, UY, EC. Visado requerido: VE, BO, CU.' }, adapter: { needed: false, info: 'Tipo C/F — compatible.' }, currency: { info: 'Libra egipcia (EGP). Efectivo muy necesario.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }], tips: ['No bebas agua del grifo.', 'Las propinas (baksheesh) son muy comunes.'], emergency: '122 (policía) · 123 (ambulancia)' },

  'El Salvador': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos.' }, currency: { info: 'USD — moneda oficial. Bitcoin aceptado legalmente.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Surf en El Tunco y El Zonte.', 'País más pequeño de Centroamérica.'], emergency: '911' },

  'Emiratos Árabes Unidos': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: '90 días sin visa para muchos. India, China, Rusia también sin visa. Pasaportes VWP libres.'
    },
    needed: false,
    info: 'España/UE: sin visa · 90 días sin visa para muchos. India, China, Rusia también sin visa. Pasaportes VWP libres.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY, EC, PA. Visado requerido: VE, BO, CU.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tres patillas cuadradas. Adaptador necesario.' }, currency: { info: 'Dírham (AED). Tarjeta aceptada en todo.' }, vaccines: [], tips: ['Ropa respetuosa en zonas públicas y mezquitas.', 'Alcohol solo en hoteles y zonas específicas.'], emergency: '999 (policía) · 998 (ambulancia)' },

  'Eritrea': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: false, info: 'Tipo C/L.' }, currency: { info: 'Nakfa eritreo (ERN). Solo efectivo. Cambio oficial muy desfavorable.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'recomendada' }, { name: 'Malaria', priority: 'profilaxis recomendada' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Asmara: arquitectura italiana Art Déco UNESCO — ciudad sorprendente.', 'Uno de los países más cerrados del mundo — turismo muy controlado.', 'No fotografiar instalaciones militares ni gubernamentales.'], emergency: '112' },

  'Eslovaquia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/E.' }, currency: { info: 'Euro (EUR).' }, vaccines: [], tips: ['Bratislava: muy visitada desde Viena (1h en tren).', 'Altos Tatras: trekking espectacular.'], emergency: '112 · 158 (policía) · 155 (ambulancia)' },

  'Eslovenia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Euro.' }, vaccines: [], tips: ['Ljubljana es muy pequeña y caminable.', 'El lago Bled es impresionante pero muy concurrido.'], emergency: '112 · 113 (policía)' },

  'España': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F — estándar europeo.' }, currency: { info: 'Euro (EUR).' }, vaccines: [], tips: ['El 112 funciona en toda España.'], emergency: '112' },

  'Estados Unidos': { visa: {
    ES: 'esta',
    US: false,
    UK: 'esta',
    AU: 'esta',
    CA: 'esta',
    JP: 'esta',
    KR: 'esta',
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      required: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'ESTA para países VWP. Todos los LATAM necesitan visa B1/B2 (no hay excepciones).'
    },
    needed: true,
    info: 'España/UE: ESTA (visa waiver) · EEUU: sin visa · ESTA para países VWP. Todos los LATAM necesitan visa B1/B2 (no hay excepciones).'
  }, needed: true, info: 'ESTA para españoles (visa waiver electrónica). Latinoamericanos: visado requerido. Todos los LATAM necesitan visa B1/B2 (excepción rara)' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Clavijas planas americanas. Europeos necesitan adaptador.' }, currency: { info: 'Dólar (USD). Propina del 15-20% obligatoria.' }, vaccines: [], tips: ['Seguro médico imprescindible — la sanidad es carísima.', 'Tip obligatorio en restaurantes y servicios.'], emergency: '911' },

  'Estonia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Euro (EUR).' }, vaccines: [], tips: ['Tallinn: ciudad medieval más intacta de Europa.', 'País más digital del mundo — casi todo online.'], emergency: '112 · 110 (policía) · 112 (ambulancia)' },

  'Esuatini': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE", "BO", "EC"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: true, type: 'Tipo M', info: 'Tipo M — tres clavijas. Adaptador necesario.' }, currency: { info: 'Lilangeni (SZL). Paridad con el rand sudafricano — el ZAR también se acepta.' }, vaccines: [{ name: 'Malaria', priority: 'profilaxis para zonas bajas' }], tips: ['Manzini: ciudad principal con buen mercado artesanal.', 'Hlane Royal National Park: rinocerontes y leones.', 'La última monarquía absoluta de África.'], emergency: '999 (policía) · 977 (ambulancia)' },

  'Etiopía': { visa: {
    ES: 'evisa',
    US: 'evisa',
    UK: 'evisa',
    AU: 'evisa',
    CA: 'evisa',
    JP: 'evisa',
    KR: 'evisa',
    IN: 'evisa',
    CN: 'evisa',
    RU: 'evisa',
    LATAM: {
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      evisa: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      note: 'e-Visa en evisa.gov.et. VOA también disponible en Addis Abeba.'
    },
    needed: true,
    info: 'España/UE: e-Visa · e-Visa en evisa.gov.et. VOA también disponible en Addis Abeba.'
  }, needed: true, info: 'e-Visa requerida para europeos. Latinoamericanos: e-Visa requerida.' }, adapter: { needed: true, type: 'Tipo C/D/E/L', info: 'Varios tipos. Adaptador universal.' }, currency: { info: 'Birr etíope (ETB). Solo efectivo. No se puede sacar moneda.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria', priority: 'profilaxis para zonas bajas' }], tips: ['Lalibela: iglesias rupestres impresionantes.', 'Addis Abeba a 2.355m — primer día tranquilo.'], emergency: '991 (policía) · 907 (ambulancia)' },

  'Filipinas': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY, EC, VE. Visado requerido: BO, CU.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Clavijas americanas. Adaptador necesario.' }, currency: { info: 'Peso filipino (PHP). Efectivo muy usado fuera de Manila.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Temporada de tifones: junio-noviembre.'], emergency: '911' },

  'Finlandia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Euro (EUR). País muy caro.' }, vaccines: [], tips: ['Aurora boreal: mejor nov-feb en Laponia.', 'Sauna: experiencia cultural obligatoria.'], emergency: '112' },

  'Fiyi': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY'],
      required: ['EC', 'PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: true, type: 'Tipo I', info: 'Tipo I como Australia.' }, currency: { info: 'Dólar fiyiano (FJD). Tarjeta en resorts y ciudades. Efectivo en zonas rurales e islas remotas.' }, vaccines: [{name: 'Hepatitis A', priority: 'recomendada'}], tips: ['Arrecifes de coral entre los mejores del mundo.', 'Kava: bebida ceremonial — buen gesto probarla al llegar a una aldea.', 'Yasawa Islands: la Fiyi auténtica y menos turística.'], emergency: '911 · 917 (policía)' },

  'Francia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/E — compatible con enchufes españoles.' }, currency: { info: 'Euro. Tarjeta aceptada en casi todo.' }, vaccines: [], tips: ['El TGV conecta ciudades principales muy rápido.', 'Muchos museos en París tienen día gratuito.'], emergency: '112 · 17 (policía) · 15 (SAMU)' },

  'Gabón': { visa: { ES: 'evisa', US: 'evisa', UK: 'evisa', LATAM: {"evisa": "all"}, needed: true, info: 'e-Visa requerida para europeos. Latinoamericanos: e-Visa requerida.' }, adapter: { needed: false, info: 'Tipo C/E — compatible.' }, currency: { info: 'Franco CFA Central (XAF). Efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }], tips: ['Lopé: bosque primario con gorilas y elefantes — UNESCO.', 'Una de las mejores conservaciones de selva tropical de África.', 'Libreville: capital tranquila y segura.'], emergency: '1730 (policía) · 1300 (ambulancia)' },

  'Gambia': { visa: { ES: false, US: false, UK: false, LATAM: {"required": "all"}, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: visado requerido.' }, adapter: { needed: true, info: 'Tipo G — tres patillas cuadradas (herencia británica). Adaptador necesario.' }, currency: { info: 'Dalasi (GMD). Efectivo imprescindible.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['El país más pequeño de África continental.', 'Río Gambia: safari fluvial con hipopótamos y aves.', 'Banjul: capital pequeña y tranquila.'], emergency: '17 (policía) · 116 (ambulancia)' },

  'Georgia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      voa: ['VE'],
      note: '1 año sin visa para muchos pasaportes. India y China también libre.'
    },
    needed: false,
    info: 'España/UE: sin visa · 1 año sin visa para muchos pasaportes. India y China también libre.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PE, UY. Visado requerido: VE, BO.' }, adapter: { needed: false, info: 'Compatible con enchufes europeos.' }, currency: { info: 'Lari georgiano (GEL). Efectivo muy usado.' }, vaccines: [{name: 'Hepatitis A', priority: 'recomendada'}], tips: ['Tbilisi: ciudad encantadora con arquitectura única.', 'Vino georgiano: 8.000 años de tradición vinícola.', 'Kazbegi: montañas del Cáucaso impresionantes.'], emergency: '112 · 122 (policía) · 111 (ambulancia)' },

  'Ghana': { visa: {
    ES: true,
    US: true,
    UK: true,
    AU: true,
    CA: true,
    JP: true,
    KR: true,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      required: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'Visado requerido para casi todos. Ghana Immigration Service.'
    },
    needed: true,
    info: 'España/UE: visado requerido · Visado requerido para casi todos. Ghana Immigration Service.'
  }, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: true, type: 'Tipo D/G', info: 'Varios tipos. Adaptador universal.' }, currency: { info: 'Cedi (GHS). Efectivo muy necesario fuera de Accra.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }], tips: ['Accra: ciudad relativamente segura.', 'Cape Coast Castle: historia del comercio de esclavos impactante.'], emergency: '191 (policía) · 193 (ambulancia)' },

  'Gibraltar': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "MX", "CL", "BR"], "required": ["CO", "PE", "VE", "BO"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, MX, CL, BR. Visado requerido: CO, PE, VE, BO.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tipo G — tres patillas cuadradas (británico). Adaptador necesario aunque solo son 6km cuadrados.' }, currency: { info: 'Libra gibraltareña (GIP). Paridad con GBP. Las libras de Gibraltar no se aceptan en UK. EUR también válido.' }, vaccines: [], tips: ['El Peñón: macacos de Berbería — los únicos monos salvajes de Europa.', 'Cueva de San Miguel: formaciones de estalactitas impresionantes.', 'Compras sin IVA — gasolina y tabaco mucho más baratos.'], emergency: '999 (policía) · 190 (ambulancia)' },

  'Granada': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE", "BO"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tipo G — tres patillas cuadradas.' }, currency: { info: 'Dólar del Caribe Oriental (XCD). USD aceptado.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['La isla de la Especiería — nuez moscada y canela en plantaciones visitables.', 'St. George\'s: una de las capitales más bonitas del Caribe.', 'Grand Anse Beach: playa de arena blanca de 3km.'], emergency: '911' },

  'Grecia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Euro. En islas pequeñas lleva efectivo.' }, vaccines: [], tips: ['En verano el calor es extremo.', 'Reserva ferrys entre islas con antelación.'], emergency: '112 · 100 (policía) · 166 (ambulancia)' },

  'Groenlandia': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE", "BO"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO.' }, adapter: { needed: false, info: 'Tipo C/K — tipo danés.' }, currency: { info: 'Corona danesa (DKK).' }, vaccines: [], tips: ['Ilulissat: fiordos de hielo UNESCO impresionantes.', 'Vuelos solo desde Copenhague o Islandia.'], emergency: '112' },

  'Guatemala': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY, VE, BO.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Clavijas americanas. Adaptador necesario.' }, currency: { info: 'Quetzal (GTQ). Efectivo necesario.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Antigua muy segura y bonita.', 'No bebas agua del grifo.'], emergency: '110 (policía) · 122 (ambulancia)' },

  'Guinea': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: false, info: 'Tipo C/F/K.' }, currency: { info: 'Franco guineano (GNF). Solo efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Conakri: ciudad caótica en una península.', 'Fouta Djallon: paisaje de mesetas y cascadas espectacular.'], emergency: '17 (policía)' },

  'Guinea Ecuatorial': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: false, info: 'Tipo C/E.' }, currency: { info: 'Franco CFA Central (XAF). Efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }], tips: ['Único país hispanohablante de África.', 'Malabo en la isla de Bioko — conectada por avión con la parte continental.'], emergency: '112' },

  'Guinea-Bisáu': { visa: { ES: 'voa', US: 'voa', UK: 'voa', LATAM: {"voa": "all"}, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visa en llegada.' }, adapter: { needed: false, info: 'Tipo C.' }, currency: { info: 'Franco CFA Occidental (XOF). Solo efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }], tips: ['Archipiélago de las Bijagós: paraíso natural poco visitado.', 'Infraestructura muy limitada — guía especializado recomendado.'], emergency: '117 (policía)' },

  'Guyana': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY", "VE"], "required": ["BO"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY, VE. Visado requerido: BO.' }, adapter: { needed: true, type: 'Tipo A/B/D/G', info: 'Varios tipos. Adaptador universal.' }, currency: { info: 'Dólar guyanés (GYD). USD aceptado.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis recomendada' }], tips: ['Ecoturismo increíble en selva amazónica.', 'Georgetown es la capital.'], emergency: '911' },

  'Guyana Francesa': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE", "BO", "EC"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: false, info: 'Tipo C/E/F — estándar europeo.' }, currency: { info: 'Euro — territorio francés de ultramar.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis para interior' }], tips: ['Cayena es la capital.', 'Base de lanzamiento de Arianespace en Kourou.'], emergency: '15 (SAMU) · 17 (policía) · 18 (bomberos)' },

  'Haití': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'Zona de riesgo elevado — consultar avisos oficiales.'
    },
    needed: false,
    info: 'España/UE: sin visa · Zona de riesgo elevado — consultar avisos oficiales.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos.' }, currency: { info: 'Gourde (HTG). Solo efectivo.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Fiebre amarilla', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Situación de seguridad inestable — verifica antes de viajar.', 'Solo agua embotellada.'], emergency: '114 (policía)' },

  'Honduras': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY, VE, BO.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos. Adaptador europeo necesario.' }, currency: { info: 'Lempira (HNL). Efectivo en zonas rurales.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Fiebre amarilla', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Islas de la Bahía: buceo excelente.', 'Copán Ruinas: zona maya imprescindible.'], emergency: '911' },

  'Hungría': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Forinto húngaro (HUF). No usan euro.' }, vaccines: [], tips: ['Budapest es muy asequible.'], emergency: '112 · 107 (policía) · 104 (ambulancia)' },

  'India': { visa: {
    ES: 'evisa',
    US: 'evisa',
    UK: 'evisa',
    AU: 'evisa',
    CA: 'evisa',
    JP: 'evisa',
    KR: 'evisa',
    IN: false,
    CN: true,
    RU: true,
    LATAM: {
      required: ['CU', 'HT'],
      evisa: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'DO'],
      note: 'e-Visa disponible para casi todos. indianvisaonline.gov.in. Al menos 4 días antes.'
    },
    needed: true,
    info: 'España/UE: e-Visa · e-Visa disponible para casi todos. indianvisaonline.gov.in. Al menos 4 días antes.'
  }, needed: true, info: 'e-Visa requerida para europeos. e-Visa: AR, BR, CL, CO, MX, PE, UY, EC, VE. Visado requerido: BO, CU.' }, adapter: { needed: true, type: 'Tipo C/D/M', info: 'Varios tipos. Adaptador universal necesario.' }, currency: { info: 'Rupia (INR). Efectivo necesario fuera de ciudades grandes.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Rabia', priority: 'considerar' }, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Solo agua embotellada.', 'Lleva papel higiénico propio.', 'Seguro médico con cobertura alta.'], emergency: '100 (policía) · 102 (ambulancia)' },

  'Indonesia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: 'voa',
    CN: 'voa',
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'Sin visa 30 días para 169 países. VOA para India y China.'
    },
    needed: false,
    info: 'España/UE: sin visa · Sin visa 30 días para 169 países. VOA para India y China.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY, EC. Visado requerido: VE, BO.' }, adapter: { needed: false, info: 'Tipo C/F — compatible con enchufes europeos.' }, currency: { info: 'Rupia (IDR). Efectivo en zonas fuera de centros turísticos.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Repelente de mosquitos esencial.', 'En Bali, respeta las ceremonias.'], emergency: '110 (policía) · 118 (ambulancia)' },

  'Irak': { visa: { needed: true, info: 'Visado necesario. Zona del Kurdistán iraní más accesible con e-visa.' }, adapter: { needed: false, info: 'Tipo C/D/G.' }, currency: { info: 'Dinar iraquí (IQD). Solo efectivo.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Situación de seguridad inestable fuera del Kurdistán.', 'Ur y Babilonia: historia mesopotamia única.'], emergency: '104 (policía)' },

  'Irlanda': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      required: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'No es Schengen. LATAM necesita visa. ES libre por CTA.'
    },
    needed: false,
    info: 'España/UE: sin visa · No es Schengen. LATAM necesita visa. ES libre por CTA.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Visado requerido: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY, VE, BO.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tres patillas cuadradas como UK. Adaptador necesario.' }, currency: { info: 'Euro.' }, vaccines: [], tips: ['El clima es muy cambiante — lleva siempre impermeable.'], emergency: '112 · 999' },

  'Irán': { visa: {
    ES: 'voa',
    US: true,
    UK: true,
    AU: true,
    CA: true,
    JP: 'voa',
    KR: 'voa',
    IN: 'voa',
    CN: false,
    RU: false,
    LATAM: {
      free: ['CU'],
      required: ['EC', 'PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'DO', 'HT'],
      voa: ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY'],
      note: 'US/UK/CA: visa requerida con dificultades. Cuba libre. China/Rusia sin visa.'
    },
    needed: true,
    info: 'España/UE: visa en llegada · EEUU: visado requerido · US/UK/CA: visa requerida con dificultades. Cuba libre. China/Rusia sin visa.'
  }, needed: true, info: 'Visa en llegada para europeos. Visa en llegada: AR, MX, CL, BR, CO, PE, UY. Visado requerido: VE, BO, EC, CU.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Rial iraní (IRR). Solo efectivo — tarjetas internacionales no funcionan.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Lleva mucho efectivo en USD o EUR.', 'Shiraz, Isfahan y Persépolis: imprescindibles.', 'Mujeres: cubrir cabello en espacios públicos.'], emergency: '110 (policía) · 115 (ambulancia)' },

  'Islandia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Corona islandesa (ISK). Tarjeta aceptada absolutamente en todo.' }, vaccines: [], tips: ['Alquila coche — esencial para el Ring Road.', 'Auroras: sep-mar.', 'Aguas termales: Geysir, Strokkur, Blue Lagoon.'], emergency: '112' },

  'Islas Cook': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "MX", "CL", "BR", "UY"], "required": ["CO", "PE", "VE", "BO", "EC"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, MX, CL, BR, UY. Visado requerido: CO, PE, VE, BO, EC.' }, adapter: { needed: true, type: 'Tipo I', info: 'Tipo I — como Australia y Nueva Zelanda.' }, currency: { info: 'Dólar neozelandés (NZD). También el dólar de las Islas Cook (paridad con NZD).' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Rarotonga: isla principal con pico central y laguna azul.', 'Aitutaki: la laguna más bonita del Pacífico Sur.', 'Sin señales de tráfico y sin semáforos — isla muy tranquila.'], emergency: '999 (policía) · 998 (ambulancia)' },

  'Islas Feroe': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE", "BO"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Corona feroesa (FOK) y DKK. Tarjeta aceptada en todo.' }, vaccines: [], tips: ['Paisajes más dramáticos de Europa.', 'Torshavn: capital más pequeña de Europa nórdica.'], emergency: '112' },

  'Islas Marshall': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "MX", "CL", "BR"], "required": ["CO", "PE", "VE", "BO", "EC", "UY"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, MX, CL, BR. Visado requerido: CO, PE, VE, BO, EC, UY.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos.' }, currency: { info: 'USD — moneda oficial.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Majuro: capital en un atolón.', 'Bikini Atoll: zona de pruebas nucleares — ahora sitio de buceo en pecios radiactivos, UNESCO.', 'Uno de los países más amenazados por el cambio climático.'], emergency: '625 (policía)' },

  'Islas Salomón': { visa: { ES: 'voa', US: 'voa', UK: 'voa', LATAM: {"required": "all"}, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: true, type: 'Tipo G/I', info: 'Varios tipos. Adaptador universal.' }, currency: { info: 'Dólar de las Islas Salomón (SBD). Efectivo.' }, vaccines: [{ name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Buceo en pecios de la II Guerra Mundial entre los mejores del mundo.', 'Honiara: capital modesta pero acogedora.', 'Laguna Marovo: laguna de barrera doble — UNESCO.'], emergency: '999 (policía)' },

  'Israel': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'Puede denegar entrada a personas con sellos de países árabes no reconocidos.'
    },
    needed: false,
    info: 'España/UE: sin visa · Puede denegar entrada a personas con sellos de países árabes no reconocidos.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY, EC, PA. Visado requerido: VE, BO, CU.' }, adapter: { needed: true, type: 'Tipo H', info: 'Israel tiene su propio enchufe tipo H. Adaptador necesario.' }, currency: { info: 'Séquel (ILS). Tarjeta aceptada en casi todo.' }, vaccines: [], tips: ['Consulta siempre el Ministerio de AAEE antes de viajar.'], emergency: '100 (policía) · 101 (ambulancia)' },

  'Italia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F/L — enchufes españoles funcionan.' }, currency: { info: 'Euro. Lleva efectivo para zonas turísticas.' }, vaccines: [], tips: ['Reserva el Vaticano y la Uffizi con antelación.', 'Valida siempre el billete de tren.'], emergency: '112 · 118 (ambulancia) · 113 (policía)' },

  'Jamaica': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'MX', 'PA', 'PE', 'UY'],
      required: ['EC', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos. Adaptador europeo necesario.' }, currency: { info: 'Dólar jamaicano (JMD). USD muy aceptado en zonas turísticas.' }, vaccines: [{name: 'Hepatitis A', priority: 'recomendada'}], tips: ['Kingston: cuidado con carteristas.', 'Montego Bay y Negril: playas increíbles.'], emergency: '119' },

  'Japón': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'MX', 'PA', 'PE', 'UY'],
      required: ['EC', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PA, PE, UY. Visado requerido: VE, BO, EC, GT, HN, NI, SV, CU, DO.' }, adapter: { needed: true, type: 'Tipo A', info: 'Dos clavijas planas. Adaptador necesario.' }, currency: { info: 'Yen (JPY). El efectivo es imprescindible — muchos locales no aceptan tarjeta.' }, vaccines: [], tips: ['Suica/Pasmo card para el transporte.', 'Compra SIM de datos en el aeropuerto.', 'JR Pass: actívalo el primer día de uso.'], emergency: '110 (policía) · 119 (ambulancia)' },

  'Jordania': { visa: {
    ES: 'voa',
    US: 'voa',
    UK: 'voa',
    AU: 'voa',
    CA: 'voa',
    JP: 'voa',
    KR: 'voa',
    IN: 'voa',
    CN: true,
    RU: 'voa',
    LATAM: {
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      voa: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY']
    },
    needed: true,
    info: 'España/UE: visa en llegada'
  }, needed: true, info: 'Visa en llegada para europeos. Visa en llegada: AR, BR, CL, CO, MX, PE, UY, EC. Visado requerido: VE, BO, CU.' }, adapter: { needed: true, type: 'Tipo C/D/G', info: 'Adaptador universal recomendado.' }, currency: { info: 'Dinar jordano (JOD). Efectivo fuera de Amán.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Jordan Pass es la mejor opción si visitas Petra.'], emergency: '911' },

  'Kazajistán': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: 'evisa',
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'MX'],
      required: ['EC', 'PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      evisa: ['BR', 'CL', 'CO', 'PE', 'UY'],
      note: 'Muchos países libres 30 días. AR/MX también libres.'
    },
    needed: false,
    info: 'España/UE: sin visa · Muchos países libres 30 días. AR/MX también libres.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, MX. e-Visa: CL, CO, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: false, info: 'Compatible.' }, currency: { info: 'Tenge kazajo (KZT). Efectivo muy necesario fuera de Almaty y Astana.' }, vaccines: [{name: 'Hepatitis A', priority: 'recomendada'}], tips: ['Astana (Nur-Sultan): una de las capitales más futuristas del mundo.', 'Almaty: ciudad más vibrante y cultural.'], emergency: '102 (policía) · 103 (ambulancia)' },

  'Kenia': { visa: {
    ES: 'evisa',
    US: 'evisa',
    UK: 'evisa',
    AU: 'evisa',
    CA: 'evisa',
    JP: 'evisa',
    KR: 'evisa',
    IN: 'evisa',
    CN: 'evisa',
    RU: 'evisa',
    LATAM: {
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      evisa: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      note: 'e-Visa en etims.go.ke. Tramitar al menos 3 días antes.'
    },
    needed: true,
    info: 'España/UE: e-Visa · e-Visa en etims.go.ke. Tramitar al menos 3 días antes.'
  }, needed: true, info: 'e-Visa requerida para europeos. Latinoamericanos: e-Visa requerida.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tres patillas cuadradas. Adaptador necesario.' }, currency: { info: 'Chelín keniano (KES). M-Pesa muy usado. Efectivo en zonas rurales.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }], tips: ['Safari en Masái Mara: jul-oct la gran migración.', 'Nairobi: cuidado con carteristas en zonas concurridas.', 'Repelente de mosquitos cada día.'], emergency: '999 (policía) · 999 (ambulancia)' },

  'Kirguistán': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "MX"], "evisa": ["BR", "CL", "CO", "PE", "UY"], "required": ["VE", "BO", "EC"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, MX. e-Visa: BR, CL, CO, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Som kirguís (KGS). Efectivo imprescindible fuera de Biskek.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Rabia', priority: 'considerar para zonas rurales' }], tips: ['Biskek: ciudad soviética sorprendentemente agradable.', 'Lago Song-Köl: a 3.016m — yurtas y caballos en paisaje alpino.', 'Cabalgata por las montañas de Tian Shan con familias nómadas.'], emergency: '102 (policía) · 103 (ambulancia)' },

  'Kiribati': { visa: { ES: 'voa', US: 'voa', UK: 'voa', LATAM: {"required": "all"}, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: true, type: 'Tipo I', info: 'Tipo I — como Australia.' }, currency: { info: 'Dólar australiano (AUD).' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['El país con el mayor territorio marino del mundo.', 'Primer país en recibir el año nuevo — Christmas Island.', 'Gravemente amenazado por la subida del nivel del mar.'], emergency: '999' },

  'Kosovo': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'MX'],
      required: ['CO', 'EC', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, MX, CL, BR. Visado requerido: CO, PE, VE, BO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Euro (EUR) aunque no es miembro de la UE.' }, vaccines: [], tips: ['Pristina es pequeña y muy joven.', 'Pecë/Peć: monasterios medievales espectaculares.'], emergency: '112 · 192 (policía)' },

  'Kuwait': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      required: ['EC', 'PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      evisa: ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. e-Visa: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC, CU.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tres patillas cuadradas.' }, currency: { info: 'Dinar kuwaití (KWD). La moneda más valiosa del mundo. Tarjeta aceptada.' }, vaccines: [], tips: ['Poco turismo aún — destino auténtico.', 'Souk Al-Mubarakiya: mercado tradicional.'], emergency: '112 (policía) · 112 (ambulancia)' },

  'Laos': { visa: {
    ES: 'voa',
    US: 'voa',
    UK: 'voa',
    AU: 'voa',
    CA: 'voa',
    JP: false,
    KR: false,
    IN: 'voa',
    CN: false,
    RU: false,
    LATAM: {
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      voa: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      note: 'JP/KR sin visa. VOA para la mayoría. CN/RU sin visa.'
    },
    needed: true,
    info: 'España/UE: visa en llegada · JP/KR sin visa. VOA para la mayoría. CN/RU sin visa.'
  }, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visa en llegada.' }, adapter: { needed: true, type: 'Tipo A/B/C', info: 'Varios tipos. Adaptador universal.' }, currency: { info: 'Kip (LAK). Efectivo y USD o baht tailandés aceptados. 1€ ≈ 22.000 LAK.' }, vaccines: [{name: 'Hepatitis A', priority: 'recomendada'}, {name: 'Tifoidea', priority: 'recomendada'}, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Luang Prabang: ciudad más tranquila y espiritual del Sudeste Asiático.', 'Vang Vieng: tubing y kayak en el río Nam Song.', 'Si Phan Don: 4.000 islas y las cataratas Khone Phapheng.'], emergency: '191 (policía) · 195 (ambulancia)' },

  'Lesoto': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE", "BO", "EC"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: true, type: 'Tipo M', info: 'Tipo M — tres clavijas.' }, currency: { info: 'Loti (LSL). Paridad con el rand sudafricano — el ZAR también se acepta.' }, vaccines: [], tips: ['El único país del mundo completamente por encima de los 1.400m de altitud.', 'Sani Pass: la carretera de montaña más espectacular de Sudáfrica.', 'Esquí en Afriski: única estación de esquí de África austral.'], emergency: '123 (policía) · 121 (ambulancia)' },

  'Letonia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Euro (EUR).' }, vaccines: [], tips: ['Riga: arquitectura Art Nouveau única.', 'Jürmala: playa báltica a 30min de Riga.'], emergency: '112 · 110 (policía) · 113 (ambulancia)' },

  'Liberia': { visa: { ES: true, US: false, UK: false, LATAM: {"required": "all"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos.' }, currency: { info: 'Dólar liberiano (LRD). USD también aceptado.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Monrovia: fundada por esclavos liberados de EE.UU.', 'Playa de Robertsport: surf de clase mundial poco conocido.'], emergency: '911' },

  'Libia': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all", "note": "Zona de riesgo — no se recomienda viajar"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido. Zona de riesgo — no se recomienda viajar' }, adapter: { needed: false, info: 'Tipo C/D/F/L.' }, currency: { info: 'Dinar libio (LYD).' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Ministerio de AAEE desaconseja totalmente viajar.'], emergency: '1515 (policía)' },

  'Liechtenstein': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO.' }, adapter: { needed: true, type: 'Tipo J', info: 'Mismo enchufe que Suiza. Adaptador necesario.' }, currency: { info: 'Franco suizo (CHF).' }, vaccines: [], tips: ['El país más pequeño con frontera con Alemania y Austria.', 'Vaduz: capital con castillo sobre la colina.'], emergency: '112 · 117 (policía) · 144 (ambulancia)' },

  'Lituania': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Euro (EUR).' }, vaccines: [], tips: ['Vilnius: casco antiguo UNESCO muy bien conservado.', 'Colina de las Cruces en Šiauliai.'], emergency: '112 · 02 (policía) · 03 (ambulancia)' },

  'Luxemburgo': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Euro (EUR). País muy caro.' }, vaccines: [], tips: ['Ciudad de Luxemburgo: ciudad capital más bella de Europa para muchos.'], emergency: '112 · 113 (policía) · 112 (ambulancia)' },

  'Líbano': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "MX", "UY"], "voa": ["CO", "PE", "EC"], "required": ["VE", "BO", "CU"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, MX, UY. Visa en llegada: CO, PE, EC. Visado requerido: VE, BO, CU.' }, adapter: { needed: true, type: 'Tipo A/B/C/D/G', info: 'Varios tipos. Adaptador universal.' }, currency: { info: 'Libra libanesa (LBP). Economía dolarizada en la práctica — usar USD.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Beirut: la ciudad más cosmopolita y caótica de Oriente Medio.', 'Valles de Kadisha y cedros del Líbano: UNESCO.', 'Situación económica y política muy grave desde 2019.'], emergency: '112 (policía) · 140 (ambulancia)' },

  'Macedonia del Norte': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY'],
      required: ['EC', 'PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Denar macedonio (MKD). Efectivo muy usado.' }, vaccines: [], tips: ['Ohrid: ciudad lacustre UNESCO.', 'Skopje: arquitectura peculiar y controvertida.'], emergency: '112 · 192 (policía) · 194 (ambulancia)' },

  'Madagascar': { visa: {
    ES: 'voa',
    US: 'voa',
    UK: 'voa',
    AU: 'voa',
    CA: 'voa',
    JP: 'voa',
    KR: 'voa',
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      voa: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY']
    },
    needed: true,
    info: 'España/UE: visa en llegada'
  }, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visa en llegada.' }, adapter: { needed: false, info: 'Tipo C/D/E.' }, currency: { info: 'Ariary malgache (MGA). Solo efectivo.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }], tips: ['Lémures: solo existen aquí.', 'Baobabs: Avenue des Baobabs al atardecer.', 'Playas en el este: temporada ciclónica dic-mar.'], emergency: '117 (policía) · 119 (ambulancia)' },

  'Malasia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'India, China, Rusia: sin visa. La mayoría sin visa 90 días.'
    },
    needed: false,
    info: 'España/UE: sin visa · India, China, Rusia: sin visa. La mayoría sin visa 90 días.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY, EC. Visado requerido: VE, BO, CU.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tipo G — tres patillas cuadradas (herencia británica).' }, currency: { info: 'Ringgit malayo (MYR). Tarjeta aceptada ampliamente en ciudades.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria', priority: 'profilaxis para zonas de selva en Borneo' }], tips: ['Kuala Lumpur: ciudad moderna y accesible — Torres Petronas.', 'Penang: gastronomía callejera mejor valorada del sudeste asiático.', 'Borneo malayo: orangutanes en Sepilok y selva primaria.', 'País muy seguro y organizado.'], emergency: '999 (policía) · 999 (ambulancia)' },

  'Malaui': { visa: { ES: 'voa', US: 'voa', UK: 'voa', LATAM: {"voa": "all"}, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visa en llegada.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tres patillas cuadradas (herencia británica).' }, currency: { info: 'Kwacha malauí (MWK). Efectivo necesario.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'recomendada' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Lago Malaui: el lago más nadable y snorkeleable del mundo.', 'Kayak con hipopótamos en el río Shire.', 'País muy seguro y amigable — el "Corazón Cálido de África".'], emergency: '999 (policía) · 998 (ambulancia)' },

  'Maldivas': { visa: {
    ES: 'voa',
    US: 'voa',
    UK: 'voa',
    AU: 'voa',
    CA: 'voa',
    JP: 'voa',
    KR: 'voa',
    IN: 'voa',
    CN: 'voa',
    RU: 'voa',
    LATAM: {
      voa: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'Todos sin visa — VOA gratuita 30 días a la llegada.'
    },
    needed: true,
    info: 'España/UE: visa en llegada · Todos sin visa — VOA gratuita 30 días a la llegada.'
  }, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visa en llegada.' }, adapter: { needed: true, type: 'Tipo D/G/J/K/L', info: 'Varios tipos. Adaptador universal.' }, currency: { info: 'Rufiyaa maldiva (MVR). USD aceptado en todos los resorts. Efectivo local fuera de los resorts.' }, vaccines: [], tips: ['Resorts: todos incluido generalmente.', 'Snorkel con tiburones ballena en Ari Atoll.', 'Mejor nov-abr (estación seca).', 'Presupuesto: puede ser muy caro — busca guesthouses en islas locales para reducir coste.'], emergency: '119 (policía) · 102 (ambulancia)' },

  'Malta': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tres patillas cuadradas — como UK. Adaptador necesario.' }, currency: { info: 'Euro (EUR).' }, vaccines: [], tips: ['La Valeta es la capital más pequeña de la UE.', 'Gozo: más tranquila que Malta principal.'], emergency: '112 · 191 (policía) · 196 (ambulancia)' },

  'Malí': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all", "note": "Zona de riesgo"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido. Zona de riesgo' }, adapter: { needed: false, info: 'Tipo C/E.' }, currency: { info: 'Franco CFA Occidental (XOF). Solo efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Meningitis', priority: 'recomendada' }], tips: ['Ministerio de AAEE: NO VIAJAR — conflicto yihadista muy activo.', 'Tombuctú: históricamente imprescindible, actualmente inaccesible con seguridad.'], emergency: '17 (policía)' },

  'Marruecos': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'CU'],
      required: ['HN', 'NI', 'SV', 'GT', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY, EC, BO, VE. Visado requerido: CU.' }, adapter: { needed: false, info: 'Tipo C/E — compatible con enchufes españoles.' }, currency: { info: 'Dírham (MAD). No se puede sacar del país. Efectivo necesario en zocos.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Negocia siempre precios en zocos.', 'No bebas agua del grifo.', 'Ropa respetuosa en zonas conservadoras.'], emergency: '190 (policía) · 150 (ambulancia)' },

  'Martinica': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE", "BO", "EC"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: false, info: 'Tipo C/E — estándar francés, compatible.' }, currency: { info: 'Euro — departamento francés de ultramar.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Fort-de-France: capital francesa del Caribe con todo el sistema galorancés.', 'Monte Pelée: volcán que destruyó Saint-Pierre en 1902.', 'Presqu\'île de la Caravelle: naturaleza virgen y senderismo.'], emergency: '17 (policía) · 15 (SAMU) · 18 (bomberos)' },

  'Mauricio': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: true,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'India y Rusia sin visa. CN necesita visa.'
    },
    needed: false,
    info: 'España/UE: sin visa · India y Rusia sin visa. CN necesita visa.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY, EC. Visado requerido: VE, BO, CU.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tipo G — tres patillas cuadradas. Adaptador necesario.' }, currency: { info: 'Rupia mauriciana (MUR). Tarjeta aceptada ampliamente.' }, vaccines: [], tips: ['Port Louis: ciudad cosmopolita y multicultural.', 'Île-aux-Cerfs: la laguna turquesa más famosa del Índico.', 'Gastronomía increíble — mezcla india, china, africana y francesa.', 'Mejor nov-abr (temporada seca).'], emergency: '999 (policía) · 114 (ambulancia)' },

  'Mauritania': { visa: { ES: 'voa', US: true, UK: true, LATAM: {"required": "all"}, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: false, info: 'Tipo C.' }, currency: { info: 'Ouguiya mauritana (MRU). Solo efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria', priority: 'profilaxis' }], tips: ['Desierto del Sahara: dunas de Erg Ouane.', 'Banc d\'Arguin: aves migratorias UNESCO.'], emergency: '17 (policía)' },

  'Micronesia': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "MX", "CL", "BR", "UY"], "required": ["CO", "PE", "VE", "BO", "EC"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, MX, CL, BR, UY. Visado requerido: CO, PE, VE, BO, EC.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos.' }, currency: { info: 'USD — moneda oficial.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Pohnpei: Nan Madol, ciudad megalítica sobre el agua — UNESCO.', 'Truk/Chuuk: uno de los mejores destinos de buceo en pecios de la II Guerra Mundial.'], emergency: '911' },

  'Moldavia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'MX', 'UY'],
      required: ['CO', 'EC', 'PA', 'PE', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, MX, CL, BR, UY. Visado requerido: CO, PE, VE, BO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Leu moldavo (MDL). Efectivo.' }, vaccines: [], tips: ['Chisinau: ciudad tranquila y asequible.', 'Transnistria: región separatista — requiere cuidado.'], emergency: '112 · 902 (policía) · 903 (ambulancia)' },

  'Mongolia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: false,
    RU: false,
    LATAM: {
      required: ['EC', 'PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      evisa: ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY'],
      note: 'ES sin visa 30d. CN y RU sin visa. Resto evisa disponible.'
    },
    needed: false,
    info: 'España/UE: sin visa · ES sin visa 30d. CN y RU sin visa. Resto evisa disponible.'
  }, needed: false, info: 'Sin visado para europeos/españoles. e-Visa: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: true, type: 'Tipo C/E', info: 'Varios tipos. Adaptador universal recomendado.' }, currency: { info: 'Tögrög mongol (MNT). Efectivo imprescindible.' }, vaccines: [{name: 'Hepatitis A', priority: 'recomendada'}], tips: ['Desierto del Gobi: dunas, dinosaurios y camellos.', 'Naadam: festival nacional en julio — lucha, tiro con arco y equitación.', 'Familia nómada: experiencia auténtica en ger.'], emergency: '102 (policía) · 103 (ambulancia)' },

  'Montenegro': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY'],
      required: ['EC', 'PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Euro (EUR) aunque no es miembro de la UE.' }, vaccines: [], tips: ['Kotor: ciudad amurallada UNESCO.', 'Lago Shan: kayak entre montañas.'], emergency: '112 · 122 (policía) · 124 (ambulancia)' },

  'Mozambique': { visa: {
    ES: 'voa',
    US: 'voa',
    UK: 'voa',
    AU: 'voa',
    CA: 'voa',
    JP: 'voa',
    KR: 'voa',
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      voa: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY']
    },
    needed: true,
    info: 'España/UE: visa en llegada'
  }, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visa en llegada.' }, adapter: { needed: true, type: 'Tipo C/F/M', info: 'Varios tipos. Adaptador universal.' }, currency: { info: 'Metical (MZN). Efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'recomendada' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }], tips: ['Islas Quirimbas: paraíso poco conocido.', 'Maputo: la capital más viva de África austral.'], emergency: '119 (policía) · 117 (ambulancia)' },

  'Myanmar': { visa: {
    ES: 'evisa',
    US: 'evisa',
    UK: 'evisa',
    AU: 'evisa',
    CA: 'evisa',
    JP: 'evisa',
    KR: 'evisa',
    IN: true,
    CN: false,
    RU: false,
    LATAM: {
      required: ['PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      evisa: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PE', 'UY'],
      note: 'Situación política inestable — verificar avisos. evisa.moip.gov.mm'
    },
    needed: true,
    info: 'España/UE: e-Visa · Situación política inestable — verificar avisos. evisa.moip.gov.mm'
  }, needed: true, info: 'e-Visa requerida para europeos. e-Visa: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: true, type: 'Tipo A/C/D/G', info: 'Varios tipos. Adaptador universal.' }, currency: { info: 'Kyat (MMK). Solo efectivo en billetes USD nuevos (sin arrugas) o tarjetas locales. Las tarjetas internacionales no funcionan bien.' }, vaccines: [{name: 'Hepatitis A', priority: 'recomendada'}, {name: 'Malaria', priority: 'profilaxis para zonas rurales'}], tips: ['Golpe militar 2021 — situación muy inestable.', 'Bagan: más de 2.000 templos budistas — espectacular.', 'Inle Lake: pueblo sobre el agua único.'], emergency: '199 (policía) · 192 (ambulancia)' },

  'México': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'Política de puertas abiertas — prácticamente todos sin visa hasta 180 días.'
    },
    needed: false,
    info: 'España/UE: sin visa · Política de puertas abiertas — prácticamente todos sin visa hasta 180 días.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Clavijas planas americanas. Europeos necesitan adaptador.' }, currency: { info: 'Peso mexicano (MXN). Efectivo en mercados y zonas rurales.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }], tips: ['Usa Uber — más seguro que taxis de calle.', 'No bebas agua del grifo.'], emergency: '911' },

  'Mónaco': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO.' }, adapter: { needed: false, info: 'Tipo C/E/F — estándar francés.' }, currency: { info: 'Euro (EUR). El lugar más caro del mundo.' }, vaccines: [], tips: ['Monte Carlo Casino: código de vestimenta.', 'Gran Premio de Mónaco: mayo.'], emergency: '17 (policía) · 15 (SAMU) · 18 (bomberos)' },

  'Namibia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PE', 'UY'],
      required: ['PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: true, type: 'Tipo D/M', info: 'Tipo M principalmente. Adaptador necesario.' }, currency: { info: 'Dólar namibio (NAD). Paridad con ZAR — rand también aceptado.' }, vaccines: [{ name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Sossusvlei: dunas más altas del mundo.', 'Etosha: safari con fondo de sal blanca.', 'Alquila 4x4 para el interior.'], emergency: '10111 (policía) · 10177 (ambulancia)' },

  'Nauru': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: true, type: 'Tipo I', info: 'Tipo I — como Australia.' }, currency: { info: 'Dólar australiano (AUD).' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['El tercer país más pequeño del mundo (21 km²).', 'Otrora el país más rico per cápita del mundo gracias al fosfato.', 'Pocas instalaciones turísticas — destino muy auténtico.'], emergency: '110 (policía)' },

  'Nepal': { visa: {
    ES: 'voa',
    US: 'voa',
    UK: 'voa',
    AU: 'voa',
    CA: 'voa',
    JP: 'voa',
    KR: 'voa',
    IN: false,
    CN: false,
    RU: 'voa',
    LATAM: {
      voa: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'VOA en aeropuerto de Katmandú. India y China: sin visa.'
    },
    needed: true,
    info: 'España/UE: visa en llegada · VOA en aeropuerto de Katmandú. India y China: sin visa.'
  }, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visa en llegada.' }, adapter: { needed: true, type: 'Tipo C/D/M', info: 'Adaptador universal necesario.' }, currency: { info: 'Rupia nepalesa (NPR). Solo efectivo en zonas de trekking.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Rabia', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Aclimatarse despacio para el mal de altura.', 'Lleva mucho efectivo para el Himalaya.'], emergency: '100 (policía) · 102 (ambulancia)' },

  'Nicaragua': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY, VE, BO.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos.' }, currency: { info: 'Córdoba (NIO). USD ampliamente aceptado.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Granada es la ciudad más bonita.', 'León: base para ascenso a volcanes.'], emergency: '118 (policía) · 128 (ambulancia)' },

  'Nigeria': { visa: {
    ES: true,
    US: true,
    UK: true,
    AU: true,
    CA: true,
    JP: true,
    KR: true,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      required: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: true,
    info: 'España/UE: visado requerido'
  }, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: true, type: 'Tipo D/G', info: 'Varios tipos. Adaptador universal.' }, currency: { info: 'Naira (NGN). Efectivo muy necesario.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }], tips: ['Lagos: ciudad caótica pero vibrante.', 'Verifica seguridad por zonas — norte del país evitar.'], emergency: '767 (policía) · 112 (emergencias)' },

  'Noruega': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Corona noruega (NOK). Uno de los países más caros del mundo.' }, vaccines: [], tips: ['Todo con tarjeta — apenas se usa efectivo.', 'Ferrys para fiordos: reserva con semanas de antelación.'], emergency: '112 · 02800 (policía) · 113 (ambulancia)' },

  'Nueva Caledonia': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE", "BO", "EC"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: false, info: 'Tipo C/E/F — estándar francés.' }, currency: { info: 'Franco Pacífico CFP (XPF). Paridad fija con el euro.' }, vaccines: [], tips: ['Noumea: la ciudad más francesa fuera de Francia.', 'Segunda laguna de barrera de coral más grande del mundo — UNESCO.', 'Isla de los Pinos: playa de Oro entre las más bonitas del Pacífico.'], emergency: '17 (policía) · 15 (SAMU)' },

  'Nueva Zelanda': { visa: {
    ES: 'nzeta',
    US: 'nzeta',
    UK: 'nzeta',
    AU: false,
    CA: 'nzeta',
    JP: 'nzeta',
    KR: 'nzeta',
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      required: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'NZeTA para países VWP. LATAM necesita visa de visitante.'
    },
    needed: true,
    info: 'España/UE: NZeTA electrónica · NZeTA para países VWP. LATAM necesita visa de visitante.'
  }, needed: true, info: 'NZeTA electrónica para europeos. Visado requerido: AR, BR, CL, CO, MX, PE, UY, EC, VE, BO.' }, adapter: { needed: true, type: 'Tipo I', info: 'Mismo que Australia.' }, currency: { info: 'Dólar neozelandés (NZD). Tarjeta aceptada en todo.' }, vaccines: [], tips: ['Te Anau y Milford Sound: imprescindibles.', 'Alquila campervan — la mejor forma de ver el país.', 'Queenstown: aventura todo el año.'], emergency: '111' },

  'Níger': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: false, info: 'Tipo A/C/D/E.' }, currency: { info: 'Franco CFA Occidental (XOF). Solo efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Meningitis', priority: 'recomendada' }], tips: ['Ministerio de AAEE: NO VIAJAR — inestabilidad política grave tras golpe de estado.'], emergency: '17 (policía)' },

  'Omán': { visa: {
    ES: 'evisa',
    US: 'evisa',
    UK: 'evisa',
    AU: 'evisa',
    CA: 'evisa',
    JP: 'evisa',
    KR: 'evisa',
    IN: 'evisa',
    CN: 'evisa',
    RU: 'evisa',
    LATAM: {
      required: ['PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      evisa: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PE', 'UY']
    },
    needed: true,
    info: 'España/UE: e-Visa'
  }, needed: true, info: 'e-Visa requerida para europeos. e-Visa: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC, CU.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tres patillas cuadradas.' }, currency: { info: 'Riyal omaní (OMR). Tarjeta muy aceptada.' }, vaccines: [{ name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Uno de los países más seguros del mundo árabe.', 'Salalah en monzón (jun-sep): verde y único.', 'Wadis: cañones con agua espectaculares.'], emergency: '9999 (policía) · 9999 (ambulancia)' },

  'Pakistán': { visa: {
    ES: 'evisa',
    US: 'evisa',
    UK: 'evisa',
    AU: 'evisa',
    CA: 'evisa',
    JP: 'evisa',
    KR: 'evisa',
    IN: true,
    CN: false,
    RU: 'evisa',
    LATAM: {
      required: ['EC', 'PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      evisa: ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY'],
      note: 'e-Visa para 175 países en visa.nadra.gov.pk. India necesita visa específica.'
    },
    needed: true,
    info: 'España/UE: e-Visa · e-Visa para 175 países en visa.nadra.gov.pk. India necesita visa específica.'
  }, needed: true, info: 'e-Visa requerida para europeos. e-Visa: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC, CU.' }, adapter: { needed: true, type: 'Tipo C/D/G/M', info: 'Varios tipos. Adaptador universal.' }, currency: { info: 'Rupia pakistaní (PKR). Efectivo necesario.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Rabia', priority: 'considerar' }, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Norte de Pakistán (Gilgit-Baltistán): montañas más espectaculares del planeta.', 'Karakorum Highway: una de las carreteras más impresionantes del mundo.'], emergency: '15 (policía) · 115 (ambulancia)' },

  'Palaos': { visa: { ES: 'voa', US: false, UK: 'voa', LATAM: {"voa": "all"}, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visa en llegada.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos.' }, currency: { info: 'USD — moneda oficial.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Jellyfish Lake: nadar entre millones de medusas sin aguijón — único en el mundo.', 'Arrecife de coral entre los mejor conservados del Pacífico.', 'Blue Corner: uno de los 10 mejores sitios de buceo del mundo.'], emergency: '911' },

  'Panamá': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos.' }, currency: { info: 'USD — moneda oficial (el Balboa tiene igual valor).' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Fiebre amarilla', priority: 'recomendada para zonas selváticas' }, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Canal de Panamá: reserva la visita.', 'Casco Viejo es imprescindible.'], emergency: '911' },

  'Papúa Nueva Guinea': { visa: { ES: 'voa', US: 'voa', UK: 'voa', LATAM: {"required": "all"}, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: true, type: 'Tipo I', info: 'Tipo I — como Australia.' }, currency: { info: 'Kina (PGK). Efectivo imprescindible.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida si vienes de zona endémica' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Una de las mayores diversidades culturales del mundo.', 'Turismo aún poco desarrollado — agencias especializadas necesarias.'], emergency: '000' },

  'Paraguay': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado.' }, adapter: { needed: true, type: 'Tipo A/B/C', info: 'Varios tipos. Adaptador universal.' }, currency: { info: 'Guaraní (PYG). Solo efectivo en zonas rurales.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Fiebre amarilla', priority: 'recomendada' }], tips: ['Ciudad del Este: zona franca de compras.', 'Asunción: ciudad pequeña y asequible.'], emergency: '911' },

  'Países Bajos': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Euro.' }, vaccines: [], tips: ['Cuidado con los carriles bici en Amsterdam.'], emergency: '112' },

  'Perú': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado.' }, adapter: { needed: true, type: 'Tipo A/B/C', info: 'Varios tipos. Adaptador recomendado.' }, currency: { info: 'Sol (PEN). Efectivo en Cusco y Machu Picchu.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Fiebre amarilla', priority: 'recomendada (Amazonas)' }], tips: ['Cusco a 3.400m — aclimatarse 2 días.', 'Tren a Machu Picchu: reserva con meses de antelación.'], emergency: '105 (policía) · 117 (ambulancia)' },

  'Polinesia Francesa': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE", "BO", "EC"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: false, info: 'Estándar francés.' }, currency: { info: 'Franco Pacífico CFP (XPF). Tarjeta aceptada en Tahití y Bora Bora. Efectivo en islas remotas.' }, vaccines: [], tips: ['Bora Bora: uno de los destinos más caros del mundo.', 'Moorea: más asequible que Bora Bora e igual de bonita.', 'Fakarava: snorkel con tiburones en paso de arrecife — impresionante.'], emergency: '17 (policía) · 15 (SAMU)' },

  'Polonia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/E.' }, currency: { info: 'Esloti polaco (PLN). No usan euro.' }, vaccines: [], tips: ['Cracovia y Varsovia son asequibles.'], emergency: '112 · 997 (policía) · 999 (ambulancia)' },

  'Portugal': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F — igual que España.' }, currency: { info: 'Euro.' }, vaccines: [], tips: ['Cuidado con carteristas en los tranvías de Lisboa.'], emergency: '112' },

  'Puerto Rico': { visa: { ES: false, US: false, UK: false, LATAM: {"required": "all", "note": "Territorio US — aplican reglas de EEUU"}, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: visado requerido. Territorio US — aplican reglas de EEUU' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Clavijas americanas. Europeos necesitan adaptador.' }, currency: { info: 'Dólar (USD).' }, vaccines: [], tips: ['Es como estar en EEUU pero con sabor caribeño.'], emergency: '911' },

  'Qatar': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'Sin visa para 80+ países. India, China, Rusia también libres.'
    },
    needed: false,
    info: 'España/UE: sin visa · Sin visa para 80+ países. India, China, Rusia también libres.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visa en llegada: EC. Visado requerido: VE, BO, CU.' }, adapter: { needed: true, type: 'Tipo D/G', info: 'Tipo G principalmente. Adaptador necesario.' }, currency: { info: 'Riyal catarí (QAR). Tarjeta ampliamente aceptada.' }, vaccines: [], tips: ['Alcohol solo en hoteles y bares licenciados.', 'Ropa respetuosa en lugares públicos.', 'Calor extremo jun-sep — planifica actividades por las mañanas.'], emergency: '999' },

  'Reino Unido': { visa: {
    ES: 'eta',
    US: 'eta',
    UK: false,
    AU: 'eta',
    CA: 'eta',
    JP: 'eta',
    KR: 'eta',
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      required: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'ETA para pasaportes del VWP desde 2024. LATAM requiere Standard Visitor Visa.'
    },
    needed: true,
    info: 'España/UE: ETA electrónica · ETA para pasaportes del VWP desde 2024. LATAM requiere Standard Visitor Visa.'
  }, needed: true, info: 'ETA electrónica para europeos. Visado requerido: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY, VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tres patillas cuadradas. Adaptador imprescindible.' }, currency: { info: 'Libra esterlina (GBP). Tarjeta ampliamente aceptada.' }, vaccines: [], tips: ['Circulación por la izquierda.', 'Oyster Card para transporte en Londres.'], emergency: '999 · 112' },

  'República Checa': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/E.' }, currency: { info: 'Corona checa (CZK). No usan euro.' }, vaccines: [], tips: ['Praga muy concurrida en temporada alta — reserva con antelación.'], emergency: '112 · 158 (policía) · 155 (ambulancia)' },

  'República Dominicana': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'Tarjeta turista incluida en precio del vuelo para la mayoría.'
    },
    needed: false,
    info: 'España/UE: sin visa · Tarjeta turista incluida en precio del vuelo para la mayoría.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos.' }, currency: { info: 'Peso dominicano (DOP). USD muy aceptado en zonas turísticas.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Agua embotellada siempre.', 'Santo Domingo: primera ciudad colonial de América.'], emergency: '911' },

  'Ruanda': { visa: {
    ES: 'voa',
    US: 'voa',
    UK: 'voa',
    AU: 'voa',
    CA: 'voa',
    JP: 'voa',
    KR: 'voa',
    IN: 'voa',
    CN: 'voa',
    RU: 'voa',
    LATAM: {
      voa: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'VOA gratuita para todos los países.'
    },
    needed: true,
    info: 'España/UE: visa en llegada · VOA gratuita para todos los países.'
  }, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visa en llegada.' }, adapter: { needed: true, type: 'Tipo C/J', info: 'Varios tipos. Adaptador universal.' }, currency: { info: 'Franco ruandés (RWF). Efectivo y tarjeta en Kigali.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis' }], tips: ['Kigali: ciudad más limpia de África.', 'Gorilas: 1.500 USD el permiso — vale cada dólar.'], emergency: '112 · 113 (policía)' },

  'Rumanía': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Leu rumano (RON). No usa euro.' }, vaccines: [], tips: ['Transilvania: sí, existe y es impresionante.', 'Bucarest tiene mucho más que la fama gris.'], emergency: '112 · 955 (policía) · 961 (ambulancia)' },

  'Rusia': { visa: {
    ES: 'evisa',
    US: true,
    UK: true,
    AU: true,
    CA: true,
    JP: 'evisa',
    KR: 'evisa',
    IN: true,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'CU'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'DO', 'HT'],
      note: 'Muchos países occidentales tienen relaciones diplomáticas tensas. Verificar sanciones vigentes.'
    },
    needed: true,
    info: 'España/UE: e-Visa · EEUU: visado requerido · Muchos países occidentales tienen relaciones diplomáticas tensas. Verificar sanciones vigentes.'
  }, needed: true, info: 'e-Visa requerida para europeos. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, UY. Visado requerido: VE, BO, CU.' }, adapter: { needed: false, info: 'Tipo C/F — compatible.' }, currency: { info: 'Rublo ruso (RUB). Solo efectivo — tarjetas VISA/Mastercard no funcionan en Rusia desde 2022.' }, vaccines: [], tips: ['Sanciones internacionales 2022: verificar vigencia de visado y opciones de vuelo.', 'Mir Card local para pagos en efectivo.', 'San Petersburgo y Moscú: ciudades con patrimonio artístico impresionante.'], emergency: '112 · 102 (policía) · 103 (ambulancia)' },

  'Saint-Martin': { visa: { needed: false, info: 'Parte francesa — libre circulación UE. Parte holandesa (Sint Maarten): sin visado.' }, adapter: { needed: true, type: 'Tipo A/B/C/E', info: 'Mezcla americana (parte holandesa) y francesa (parte francesa). Adaptador universal.' }, currency: { info: 'Euro en la parte francesa (MF). Dólar de Antillas Neerlandesas o USD en la parte holandesa (SX).' }, vaccines: [], tips: ['Una isla dividida en dos países — cruzar sin control fronterizo.', 'Maho Beach: aviones aterrizando a metros de la playa.', 'Marigot (francés): ambiente más tranquilo. Philipsburg (holandés): más comercial.'], emergency: '17 (policía FR) · 111 (policía NL)' },

  'Samoa': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "MX", "CL", "BR"], "required": ["CO", "PE", "VE", "BO", "EC", "UY"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, MX, CL, BR. Visado requerido: CO, PE, VE, BO, EC, UY.' }, adapter: { needed: true, type: 'Tipo I', info: 'Tipo I como Australia. Adaptador necesario.' }, currency: { info: 'Tālā samoano (WST). Efectivo.' }, vaccines: [{name: 'Hepatitis A', priority: 'recomendada'}], tips: ['Cultura Fa\'a Samoa: respetar las tradiciones locales.', 'To Sua Ocean Trench: la piscina natural más espectacular del Pacífico.', 'Aguas cristalinas y arrecifes de coral.'], emergency: '999 (policía) · 994 (ambulancia)' },

  'San Cristóbal y Nieves': { visa: { needed: false, info: 'Sin visado hasta 90 días para la mayoría de pasaportes.' }, adapter: { needed: true, type: 'Tipo A/B/D/G', info: 'Varios tipos.' }, currency: { info: 'Dólar del Caribe Oriental (XCD). USD aceptado.' }, vaccines: [], tips: ['Brimstone Hill: fortaleza UNESCO con vistas al mar.', 'Nevis Peak: senderismo hasta el pico entre nubes.', 'País de solo 55.000 habitantes — turismo muy tranquilo.'], emergency: '911' },

  'San Marino': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO.' }, adapter: { needed: false, info: 'Tipo C/F/L — compatible.' }, currency: { info: 'Euro (EUR).' }, vaccines: [], tips: ['El país independiente más antiguo del mundo.', 'Monte Titano: vistas panorámicas.'], emergency: '112 · 0549-888888 (policía)' },

  'San Vicente': { visa: { needed: false, info: 'Sin visado hasta 30 días para la mayoría de pasaportes.' }, adapter: { needed: true, type: 'Tipo G/I', info: 'Varios tipos. Adaptador necesario.' }, currency: { info: 'Dólar del Caribe Oriental (XCD). USD aceptado.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Las Grenadinas: archipiélago con Tobago Cays — arrecifes vírgenes.', 'Mustique: isla privada de celebridades.', 'La Soufrière: volcán activo — erupción 2021.'], emergency: '999 (policía) · 999 (ambulancia)' },

  'Santa Lucía': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE", "BO"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tipo G — tres patillas cuadradas.' }, currency: { info: 'Dólar del Caribe Oriental (XCD). USD aceptado.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Los Pitons: volcanes gemelos UNESCO — el paisaje más icónico del Caribe.', 'Rodney Bay: centro turístico con marinera y restaurantes.', 'Chocolate bean-to-bar en plantaciones de cacao visitables.'], emergency: '999 (policía) · 911 (ambulancia)' },

  'Santo Tomé y Príncipe': { visa: { ES: 'voa', US: 'voa', UK: 'voa', LATAM: {"voa": "all"}, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visa en llegada.' }, adapter: { needed: false, info: 'Tipo C/F — compatible.' }, currency: { info: 'Dobra (STN). Paridad fija con el euro.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }], tips: ['El segundo país más pequeño de África.', 'Cacao premium de las mejores plantaciones del mundo.', 'Roça Sundy: donde Einstein predijo el eclipse que confirmó la relatividad.'], emergency: '112' },

  'Senegal': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'UY'],
      required: ['PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: false, info: 'Tipo C/E.' }, currency: { info: 'Franco CFA (XOF). Efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis' }], tips: ['Dakar: animada capital.', 'Isla de Gorée: historia del comercio de esclavos.', 'Casamance: zona más verde y tranquila.'], emergency: '17 (policía) · 15 (ambulancia)' },

  'Serbia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, CU.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Dinar serbio (RSD). Efectivo principalmente.' }, vaccines: [], tips: ['Belgrado tiene vida nocturna increíble.'], emergency: '112 · 192 (policía) · 194 (ambulancia)' },

  'Seychelles': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'Tous los países sin visa. Permiso de visitante gratuito a la llegada.'
    },
    needed: false,
    info: 'España/UE: sin visa · Tous los países sin visa. Permiso de visitante gratuito a la llegada.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tipo G — tres patillas cuadradas. Adaptador necesario.' }, currency: { info: 'Rupia de Seychelles (SCR). Tarjeta aceptada. USD y EUR también muy aceptados.' }, vaccines: [], tips: ['Praslin: Vallée de Mai con las coco de mer — UNESCO.', 'La Digue: la isla con las playas de granito más famosas del mundo.', 'Mahé: isla principal con el aeropuerto y la capital Victoria.', 'Snorkel y buceo de clase mundial.'], emergency: '999 (policía) · 151 (ambulancia)' },

  'Sierra Leona': { visa: { ES: false, US: false, UK: false, LATAM: {"required": "all"}, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: visado requerido.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tres patillas cuadradas (herencia británica). Adaptador necesario.' }, currency: { info: 'Leone (SLL/SLE). Efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Freetown: ciudad en colinas con playas cercanas.', 'Playas de Tokeh y River No. 2: entre las más bonitas de África Occidental.'], emergency: '999 (policía) · 999 (ambulancia)' },

  'Singapur': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: 'evisa',
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'India sin visa. China eVisa. La mayoría sin visa 30-90 días.'
    },
    needed: false,
    info: 'España/UE: sin visa · India sin visa. China eVisa. La mayoría sin visa 30-90 días.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY, EC. Visado requerido: VE, BO, CU.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tres patillas cuadradas. Adaptador necesario.' }, currency: { info: 'Dólar singapurense (SGD). Tarjeta aceptada en todo.' }, vaccines: [], tips: ['Hawker Centers para comer barato.', 'MRT eficiente y económico.'], emergency: '999 (policía) · 995 (ambulancia)' },

  'Sint Maarten': { visa: { needed: false, info: 'Parte holandesa del Caribe — sin visado para la mayoría de pasaportes.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos.' }, currency: { info: 'Florín antillano (ANG). USD muy aceptado.' }, vaccines: [], tips: ['Maho Beach: los aviones pasan a metros de la arena al aterrizar.', 'Philipsburg: puerto de cruceros con duty-free.', 'Misma isla que la Saint-Martin francesa — sin frontera.'], emergency: '111 (policía) · 912 (ambulancia)' },

  'Somalia': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all", "note": "Zona de alto riesgo — no viajar"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido. Zona de alto riesgo — no viajar' }, adapter: { needed: true, type: 'Tipo A/C', info: 'Varios tipos.' }, currency: { info: 'Chelín somalí (SOS). Solo efectivo. USD muy aceptado.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'recomendada' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }], tips: ['Ministerio de AAEE: NO VIAJAR — peligro extremo de secuestro y violencia.', 'Somalilandia (Hargeisa) es considerablemente más segura que el sur.'], emergency: '888 (policía)' },

  'Sri Lanka': { visa: {
    ES: 'eta',
    US: 'eta',
    UK: 'eta',
    AU: 'eta',
    CA: 'eta',
    JP: 'eta',
    KR: 'eta',
    IN: false,
    CN: 'eta',
    RU: 'eta',
    LATAM: {
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      eta: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      note: 'ETA online ~$20. eta.gov.lk. India sin visa.'
    },
    needed: true,
    info: 'España/UE: ETA electrónica · ETA online ~$20. eta.gov.lk. India sin visa.'
  }, needed: true, info: 'ETA electrónica para europeos. ETA: AR, BR, CL, CO, MX, PE, UY, EC. Visado requerido: VE, BO.' }, adapter: { needed: true, type: 'Tipo D/G', info: 'Tipo D y G. Adaptador necesario.' }, currency: { info: 'Rupia de Sri Lanka (LKR). Efectivo necesario.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Ropa respetuosa para templos.', 'Malaria en algunas zonas — consultar.'], emergency: '119 (policía) · 110 (ambulancia)' },

  'Sudáfrica': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'UY'],
      required: ['PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY, EC. Visado requerido: VE, BO, CU.' }, adapter: { needed: true, type: 'Tipo M', info: 'Tipo M — tres clavijas redondas grandes. Adaptador necesario.' }, currency: { info: 'Rand (ZAR). Tarjeta en zonas urbanas.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida si vienes de zona endémica' }, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['No camines solo de noche.', 'Uber es económico y seguro.'], emergency: '10111 (policía) · 10177 (ambulancia)' },

  'Sudán': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all", "note": "Zona de conflicto — no viajar"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido. Zona de conflicto — no viajar' }, adapter: { needed: false, info: 'Tipo C/D.' }, currency: { info: 'Libra sudanesa (SDG).' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Conflicto armado activo — NO VIAJAR.'], emergency: '999 (policía)' },

  'Sudán del Sur': { visa: { ES: 'voa', US: 'voa', UK: 'voa', LATAM: {"required": "all", "note": "Zona de riesgo alto"}, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visado requerido. Zona de riesgo alto' }, adapter: { needed: true, type: 'Tipo G', info: 'Tres patillas cuadradas.' }, currency: { info: 'Libra sursudanesa (SSP). Solo efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Meningitis', priority: 'recomendada' }], tips: ['Ministerio de AAEE: NO VIAJAR — conflicto armado activo.'], emergency: '911' },

  'Suecia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Corona sueca (SEK). País prácticamente cashless.' }, vaccines: [], tips: ['Muchos museos en Estocolmo son gratuitos.'], emergency: '112' },

  'Suiza': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, EC, MX, PA, PE, PY, UY. Visado requerido: VE, BO, HN, NI, SV, GT, CU, HT, DO.' }, adapter: { needed: true, type: 'Tipo J', info: 'Suiza tiene su propio enchufe. Adaptador necesario.' }, currency: { info: 'Franco suizo (CHF). Todo es muy caro — presupuesta el doble.' }, vaccines: [], tips: ['Transporte público impecable.', 'Swiss Travel Pass si usas mucho el tren.'], emergency: '112 · 117 (policía) · 144 (ambulancia)' },

  'Surinam': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE", "BO", "EC"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: false, info: 'Tipo C/F — compatible con enchufes europeos.' }, currency: { info: 'Dólar surinamés (SRD). USD aceptado en Paramaribo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis para zonas selváticas' }], tips: ['Paramaribo: casco colonial UNESCO impresionante.'], emergency: '115 (policía) · 113 (ambulancia)' },

  'Tailandia': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'ES 60 días. India/China/Rusia: sin visa. La mayoría del LATAM libre.'
    },
    needed: false,
    info: 'España/UE: sin visa · ES 60 días. India/China/Rusia: sin visa. La mayoría del LATAM libre.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY, EC. Visado requerido: VE, BO, CU. ES sin visa 60d. LATAM libre verificar duración.' }, adapter: { needed: true, type: 'Tipo A/B/C', info: 'Varios tipos. Adaptador universal recomendado.' }, currency: { info: 'Baht (THB). Los cajeros cobran comisión alta (220 THB). Lleva efectivo.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Usa Grab en vez de taxis de calle.', 'No bebas agua del grifo.', 'Ropa que cubra para templos.'], emergency: '191 (policía) · 1669 (ambulancia)' },

  'Taiwan': { visa: { needed: false, info: 'Sin visado para españoles hasta 90 días. Latinoamericanos: sin visado hasta 90 días (verificar por país).' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos. Adaptador europeo necesario.' }, currency: { info: 'Nuevo dólar taiwanés (TWD). Tarjeta aceptada en ciudades. Efectivo para mercados y transporte.' }, vaccines: [], tips: ['Taipei: noche de mercados nocturnos y templos entre rascacielos.', 'Taroko Gorge: cañón de mármol espectacular.', 'Gastronomía: la mejor de todo el sudeste asiático para muchos.', 'País muy seguro y organizado.'], emergency: '110 (policía) · 119 (ambulancia)' },

  'Tanzania': { visa: {
    ES: 'voa',
    US: 'voa',
    UK: 'voa',
    AU: 'voa',
    CA: 'voa',
    JP: 'voa',
    KR: 'voa',
    IN: 'voa',
    CN: 'voa',
    RU: 'voa',
    LATAM: {
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      voa: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      note: 'VOA $50 en aeropuerto. También evisa disponible.'
    },
    needed: true,
    info: 'España/UE: visa en llegada · VOA $50 en aeropuerto. También evisa disponible.'
  }, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visa en llegada.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tres patillas cuadradas.' }, currency: { info: 'Chelín tanzano (TZS). Efectivo necesario. USD aceptado en zonas turísticas.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Serengeti: Great Migration dic-mar (calving) y jul-sep.', 'Kilimanjaro: aclimatación seria — no subestimar.', 'Zanzíbar: playa después del safari.'], emergency: '112 · 112 (policía)' },

  'Tayikistán': { visa: { ES: 'evisa', US: 'evisa', UK: 'evisa', LATAM: {"evisa": ["AR", "MX", "CL", "CO", "PE"], "required": ["VE", "BO", "EC", "BR", "UY"]}, needed: true, info: 'e-Visa requerida para europeos. e-Visa: AR, MX, CL, CO, PE. Visado requerido: VE, BO, EC, BR, UY.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Somoni tayiko (TJS). Efectivo imprescindible — pocos cajeros.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }], tips: ['Carretera del Pamir: una de las carreteras más épicas del mundo a 4.000m+.', 'Fanskie gory: lagos turquesas y picos de 5.000m para senderismo.', 'Dushanbé: capital tranquila con buena base.'], emergency: '02 (policía) · 03 (ambulancia)' },

  'Timor Oriental': { visa: { ES: 'voa', US: 'voa', UK: 'voa', LATAM: {"voa": "all"}, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visa en llegada.' }, adapter: { needed: true, type: 'Tipo C/E/F/I', info: 'Varios tipos.' }, currency: { info: 'USD — moneda oficial.' }, vaccines: [{ name: 'Malaria', priority: 'profilaxis' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Uno de los países más jóvenes del mundo.', 'Snorkel excepcional.'], emergency: '112' },

  'Togo': { visa: { ES: 'voa', US: 'voa', UK: 'voa', LATAM: {"voa": "all"}, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visa en llegada.' }, adapter: { needed: false, info: 'Tipo C/E.' }, currency: { info: 'Franco CFA Occidental (XOF). Efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }], tips: ['Lomé: la única capital africana que limita directamente con el océano.', 'Kpalimé: mercado de artesanía y excursiones a cascadas.'], emergency: '117 (policía)' },

  'Tonga': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "MX", "CL", "BR"], "required": ["CO", "PE", "VE", "BO", "EC", "UY"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, MX, CL, BR. Visado requerido: CO, PE, VE, BO, EC, UY.' }, adapter: { needed: true, type: 'Tipo I', info: 'Tipo I.' }, currency: { info: 'Paʻanga tongano (TOP). Efectivo.' }, vaccines: [{name: 'Hepatitis A', priority: 'recomendada'}], tips: ['Nadar con ballenas jorobadas: jul-oct — experiencia única en el mundo.', 'El único reino polinésico nunca colonizado.', '175 islas de las cuales 36 habitadas.'], emergency: '922 (policía) · 911 (ambulancia)' },

  'Trinidad y Tobago': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY'],
      required: ['EC', 'PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos.' }, currency: { info: 'Dólar de Trinidad y Tobago (TTD). USD aceptado.' }, vaccines: [{name: 'Hepatitis A', priority: 'recomendada'}], tips: ['Carnaval de Trinidad: febrero — uno de los mejores del Caribe.', 'Tobago: naturaleza increíble y playas tranquilas.'], emergency: '999' },

  'Turkmenistán': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all", "note": "Visado muy restrictivo — solo con itinerario organizado"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido. Visado muy restrictivo — solo con itinerario organizado' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Manat turcomano (TMT). Solo efectivo.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Crater de Darvaza (Puerta del Infierno): cráter de gas ardiendo en el desierto — único en el mundo.', 'Asjabad: una de las ciudades más peculiares del mundo — toda de mármol blanco.', 'País más cerrado de Asia Central.'], emergency: '02 (policía) · 03 (ambulancia)' },

  'Turquía': { visa: {
    ES: 'evisa',
    US: 'evisa',
    UK: 'evisa',
    AU: 'evisa',
    CA: 'evisa',
    JP: false,
    KR: false,
    IN: 'evisa',
    CN: true,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'MX', 'PA', 'PE', 'PY', 'UY'],
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      evisa: ['EC'],
      note: 'e-Visa para la mayoría. €50 aprox. En evisa.gov.tr'
    },
    needed: true,
    info: 'España/UE: e-Visa · e-Visa para la mayoría. €50 aprox. En evisa.gov.tr'
  }, needed: true, info: 'e-Visa requerida para europeos. Sin visado: AR, BR, CL, CO, MX, PA, PE, UY. e-Visa: EC. Visado requerido: VE, BO, CU.' }, adapter: { needed: false, info: 'Tipo C/F — compatible con enchufes españoles.' }, currency: { info: 'Lira turca (TRY). Mejor cambiar allí.' }, vaccines: [], tips: ['El Gran Bazar cierra domingos.', 'Negocia precios en mercados.'], emergency: '112 · 155 (policía)' },

  'Tuvalu': { visa: { ES: 'voa', US: 'voa', UK: 'voa', LATAM: {"required": "all"}, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: true, type: 'Tipo I', info: 'Tipo I — como Australia.' }, currency: { info: 'Dólar australiano (AUD).' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['El cuarto país más pequeño del mundo.', 'Funafuti: capital y único atolón con aeropuerto.', 'Uno de los países más amenazados del mundo por el cambio climático — podría desaparecer en el siglo XXI.'], emergency: '911' },

  'Túnez': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'UY'],
      required: ['PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC, CU.' }, adapter: { needed: false, info: 'Tipo C/E — compatible.' }, currency: { info: 'Dinar tunecino (TND). No se puede sacar del país. Efectivo necesario.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Medinas de Túnez y Sfax: UNESCO.', 'Sousse y Djerba para playa.', 'No bebas agua del grifo.'], emergency: '197 (policía) · 190 (ambulancia)' },

  'Ucrania': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'MX', 'UY'],
      required: ['CO', 'EC', 'PA', 'PE', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'Situación de guerra activa — no se recomienda viajar.'
    },
    needed: false,
    info: 'España/UE: sin visa · Situación de guerra activa — no se recomienda viajar.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, MX, CL, BR, UY. Visado requerido: CO, PE, VE, BO.' }, adapter: { needed: false, info: 'Tipo C/F.' }, currency: { info: 'Hryvnia (UAH). Efectivo.' }, vaccines: [], tips: ['NO VIAJAR — conflicto armado activo desde feb 2022.', 'Consulta siempre el Ministerio de AAEE.'], emergency: '112 · 102 (policía) · 103 (ambulancia)' },

  'Uganda': { visa: {
    ES: 'evisa',
    US: 'evisa',
    UK: 'evisa',
    AU: 'evisa',
    CA: 'evisa',
    JP: 'evisa',
    KR: 'evisa',
    IN: 'evisa',
    CN: 'evisa',
    RU: 'evisa',
    LATAM: {
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      evisa: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY']
    },
    needed: true,
    info: 'España/UE: e-Visa'
  }, needed: true, info: 'e-Visa requerida para europeos. Latinoamericanos: e-Visa requerida.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tres patillas cuadradas.' }, currency: { info: 'Chelín ugandés (UGX). Efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'requerida' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }], tips: ['Gorilas de montaña: permiso 600 USD — reservar con meses de antelación.', 'Bwindi Impenetrable Forest imprescindible.'], emergency: '999 (policía) · 112 (ambulancia)' },

  'Uruguay': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado.' }, adapter: { needed: true, type: 'Tipo C/F/L', info: 'Uruguay usa tipo L. Adaptador recomendado.' }, currency: { info: 'Peso uruguayo (UYU). Tarjeta ampliamente aceptada.' }, vaccines: [], tips: ['Uno de los países más seguros de Sudamérica.'], emergency: '911' },

  'Uzbekistán': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: 'evisa',
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'MX'],
      required: ['EC', 'PA', 'PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      evisa: ['BR', 'CL', 'CO', 'PE', 'UY']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, MX. e-Visa: BR, CL, CO, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: false, info: 'Compatible.' }, currency: { info: 'Som uzbeko (UZS). Efectivo imprescindible — cajeros escasos fuera de Taskent.' }, vaccines: [{name: 'Hepatitis A', priority: 'recomendada'}, {name: 'Tifoidea', priority: 'recomendada'}], tips: ['Samarcanda: la ciudad de Tamerlán — impresionante.', 'Bujará: la ciudad más medieval de Asia Central.', 'La Ruta de la Seda en estado puro.'], emergency: '102 (policía) · 103 (ambulancia)' },

  'Vanuatu': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "MX", "UY"], "required": ["CO", "PE", "VE", "BO", "EC"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, MX, UY. Visado requerido: CO, PE, VE, BO, EC.' }, adapter: { needed: true, type: 'Tipo I', info: 'Tipo I.' }, currency: { info: 'Vatu (VUV). Efectivo.' }, vaccines: [{name: 'Malaria', priority: 'profilaxis recomendada'}], tips: ['Volcán Yasur en Tanna: uno de los volcanes más accesibles y activos del mundo.', '80 islas y más de 100 idiomas diferentes.', 'Snorkel en Million Dollar Point: barcos de guerra de la II Guerra Mundial.'], emergency: '112' },

  'Venezuela': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: false,
    RU: false,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Enchufes americanos.' }, currency: { info: 'Bolívar digital (VES). USD y EUR muy aceptados. Zelle popular.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'recomendada' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Verifica situación política y seguridad antes de viajar.', 'Paga en USD para mejores precios.'], emergency: '911' },

  'Vietnam': { visa: {
    ES: 'evisa',
    US: 'evisa',
    UK: 'evisa',
    AU: 'evisa',
    CA: 'evisa',
    JP: 'evisa',
    KR: 'evisa',
    IN: 'evisa',
    CN: false,
    RU: false,
    LATAM: {
      required: ['VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      evisa: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'PY', 'UY'],
      note: 'e-Visa ~$25, válida 90 días. China y Rusia: sin visa.'
    },
    needed: true,
    info: 'España/UE: e-Visa · e-Visa ~$25, válida 90 días. China y Rusia: sin visa.'
  }, needed: true, info: 'e-Visa requerida para europeos. e-Visa: AR, BR, CL, CO, MX, PE, UY, EC. Visado requerido: VE, BO, CU.' }, adapter: { needed: true, type: 'Tipo A/C', info: 'Adaptador recomendado.' }, currency: { info: 'Dong (VND). Solo efectivo. 1€ ≈ 26.000 VND.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Usa Grab para transporte.', 'Cruza la calle despacio y sin parar.'], emergency: '113 (policía) · 115 (ambulancia)' },

  'Yemen': { visa: { needed: true, info: 'Visado imposible en la práctica. NO VIAJAR — guerra civil activa desde 2014.' }, adapter: { needed: false, info: 'Tipo A/D/G.' }, currency: { info: 'Rial yemení (YER). Solo efectivo.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'recomendada' }, { name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Ministerio de AAEE: NO VIAJAR — zona de guerra activa y riesgo de secuestro extremo.'], emergency: 'No aplica' },

  'Yibuti': { visa: { ES: 'voa', US: 'voa', UK: 'voa', LATAM: {"voa": "all"}, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visa en llegada.' }, adapter: { needed: false, info: 'Tipo C/E.' }, currency: { info: 'Franco yibutiano (DJF). Paridad fija con USD.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'recomendada' }, { name: 'Malaria', priority: 'profilaxis recomendada' }], tips: ['Lago Assal: el punto más bajo de África y uno de los más salados del mundo.', 'Nadar con tiburones ballena en el Golfo de Tadjourah: nov-feb.', 'Puerta de entrada estratégica entre África y Arabia.'], emergency: '17 (policía) · 15 (ambulancia)' },

  'Zambia': { visa: { ES: 'voa', US: 'voa', UK: 'voa', LATAM: {"voa": "all"}, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visa en llegada.' }, adapter: { needed: true, type: 'Tipo C/D/G', info: 'Varios tipos.' }, currency: { info: 'Kwacha zambiano (ZMW). USD aceptado en zonas turísticas.' }, vaccines: [{ name: 'Fiebre amarilla', priority: 'recomendada' }, { name: 'Malaria', priority: 'profilaxis obligatoria' }], tips: ['Victoria Falls: mejor en abr-jun cuando lleva más agua.', 'KAZA Univisa para ver las cataratas desde ambos lados.'], emergency: '999 (policía) · 993 (ambulancia)' },

  'Zimbabue': { visa: { ES: 'voa', US: 'voa', UK: 'voa', LATAM: {"voa": "all"}, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visa en llegada.' }, adapter: { needed: true, type: 'Tipo D/G', info: 'Varios tipos.' }, currency: { info: 'USD principalmente. Dólar zimbabuense existe pero inestable.' }, vaccines: [{ name: 'Malaria', priority: 'profilaxis' }, { name: 'Fiebre amarilla', priority: 'recomendada' }], tips: ['Victoria Falls: ver desde el lado zimbabuense (más impactante).', 'Parque Nacional Hwange: elefantes en masa.'], emergency: '999 · 994 (ambulancia)' },

  // Países adicionales
  'Botsuana': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE", "BO", "EC"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO, EC.' }, adapter: { needed: true, type: 'Tipo D/G/M', info: 'Adaptador universal necesario.' }, currency: { info: 'Pula (BWP). Tarjeta aceptada en ciudades.' }, vaccines: [{ name: 'Fiebre Amarilla', priority: 'recomendada si vienes de zona endémica' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Destino de safari — Okavango Delta imprescindible.'], emergency: '999' },

  'Ciudad del Vaticano': { visa: { ES: false, US: false, UK: false, LATAM: {"free": "all"}, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado.' }, adapter: { needed: false, info: 'Tipo C/F — igual que Italia.' }, currency: { info: 'Euro.' }, vaccines: [], tips: ['Museos Vaticanos: reserva online obligatoria.', 'Ropa que cubra hombros y rodillas.'], emergency: '112' },

  'Hong Kong': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: false,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'CO', 'EC', 'MX', 'PA', 'PE', 'UY'],
      required: ['PY', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT'],
      note: 'India tiene acceso sin visa. China necesita Permiso de Viaje.'
    },
    needed: false,
    info: 'España/UE: sin visa · India tiene acceso sin visa. China necesita Permiso de Viaje.'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY, EC. Visado requerido: VE, BO.' }, info: 'Sin visado hasta 90 días para España y muchos países latinoamericanos.' }, adapter: { needed: true, type: 'Tipo G', info: 'Tres patillas cuadradas. Adaptador necesario.' }, currency: { info: 'Dólar de Hong Kong (HKD). Tarjeta ampliamente aceptada.' }, vaccines: [], tips: ['Octopus Card para transporte.', 'MTR eficiente y económico.', 'Google no bloqueado (a diferencia de China continental).'], emergency: '999' },

  'Iraq': { visa: { ES: 'voa', US: 'voa', UK: 'voa', LATAM: {"required": "all", "note": "Zona de riesgo — no se recomienda turismo"}, needed: true, info: 'Visa en llegada para europeos. Latinoamericanos: visado requerido. Zona de riesgo — no se recomienda turismo' }, adapter: { needed: true, type: 'Tipo C/D/G', info: 'Varios tipos. Adaptador universal necesario.' }, currency: { info: 'Dinar iraquí (IQD). Solo efectivo.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }, { name: 'Malaria (quimioprofilaxis)', priority: 'consulta médico antes de viajar' }], tips: ['Zona de conflicto — consulta avisos oficiales.', 'Seguro de evacuación médica imprescindible.'], emergency: '104 (policía) · 122 (ambulancia)' },

  'Macao': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY", "EC"], "required": ["VE", "BO"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY, EC. Visado requerido: VE, BO.' }, adapter: { needed: true, type: 'Tipo G/M', info: 'Adaptador necesario.' }, currency: { info: 'Pataca (MOP). También aceptan HKD en muchos sitios.' }, vaccines: [], tips: ['Ferri desde Hong Kong (1h).', 'Casinos solo para mayores de 21.', 'UNESCO: centro histórico gratuito.'], emergency: '999' },

  'Palestina': { visa: { ES: false, US: false, UK: false, LATAM: {"free": "all", "note": "Acceso via Israel. Situación compleja — consultar."}, needed: false, info: 'Sin visado para europeos/españoles. Latinoamericanos: sin visado. Acceso via Israel. Situación compleja — consultar.' }, adapter: { needed: true, type: 'Tipo C/H', info: 'Tipo H israelí. Adaptador necesario.' }, currency: { info: 'Séquel israelí (ILS) y Dinar jordano (JOD).' }, vaccines: [], tips: ['Situación política compleja — sigue los avisos de tu Ministerio de Exteriores.'], emergency: '101' },

  'República Centroafricana': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: true, type: 'Tipo C/E', info: 'Adaptador necesario.' }, currency: { info: 'Franco CFA (XAF). Solo efectivo.' }, vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria', priority: 'quimioprofilaxis recomendada' }, { name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Zona de alto riesgo — viaje solo esencial.', 'Seguro con evacuación médica obligatorio.'], emergency: '117' },

  'República Democrática del Congo': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido.' }, adapter: { needed: true, type: 'Tipo C/D', info: 'Adaptador necesario.' }, currency: { info: 'Franco congoleño (CDF). Solo efectivo.' }, vaccines: [{ name: 'Fiebre Amarilla', priority: 'obligatoria para entrada' }, { name: 'Malaria', priority: 'quimioprofilaxis imprescindible' }, { name: 'Cólera', priority: 'recomendada' }], tips: ['Zona de alto riesgo — consulta avisos oficiales.', 'Seguro con evacuación médica obligatorio.'], emergency: '112' },

  'Saint Kitts y Nevis': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE", "BO"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Dos clavijas planas americanas. Adaptador necesario.' }, currency: { info: 'Dólar del Caribe Oriental (XCD). Tarjeta aceptada en hoteles.' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Destino de lujo caribeño.'], emergency: '911' },

  'San Vicente y las Granadinas': { visa: { ES: false, US: false, UK: false, LATAM: {"free": ["AR", "BR", "CL", "CO", "MX", "PE", "UY"], "required": ["VE", "BO"]}, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, CO, MX, PE, UY. Visado requerido: VE, BO.' }, adapter: { needed: true, type: 'Tipo A/B/G', info: 'Varios tipos. Adaptador universal recomendado.' }, currency: { info: 'Dólar del Caribe Oriental (XCD).' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }], tips: ['Archipiélago volcánico.', 'Bequia es la isla más tranquila.'], emergency: '999' },

  'Siria': { visa: { ES: true, US: true, UK: true, LATAM: {"required": "all", "note": "Zona de conflicto — no viajar"}, needed: true, info: 'Visado requerido para europeos. Latinoamericanos: visado requerido. Zona de conflicto — no viajar' }, adapter: { needed: true, type: 'Tipo C/E/L', info: 'Adaptador necesario.' }, currency: { info: 'Libra siria (SYP).' }, vaccines: [{ name: 'Hepatitis A', priority: 'recomendada' }, { name: 'Tifoidea', priority: 'recomendada' }], tips: ['ZONA DE GUERRA — evitar viaje.', 'Consulta avisos del Ministerio de Exteriores.'], emergency: '110' },

  'Taiwán': { visa: {
    ES: false,
    US: false,
    UK: false,
    AU: false,
    CA: false,
    JP: false,
    KR: false,
    IN: true,
    CN: true,
    RU: true,
    LATAM: {
      free: ['AR', 'BR', 'CL', 'MX', 'PY', 'UY'],
      required: ['CO', 'EC', 'PA', 'PE', 'VE', 'BO', 'HN', 'NI', 'SV', 'GT', 'CU', 'DO', 'HT']
    },
    needed: false,
    info: 'España/UE: sin visa'
  }, needed: false, info: 'Sin visado para europeos/españoles. Sin visado: AR, BR, CL, MX, PY, UY. Visado requerido: CO, PE, VE, BO, EC.' }, info: 'Sin visado para españoles, mexicanos, argentinos, chilenos, brasileños hasta 90 días.' }, adapter: { needed: true, type: 'Tipo A/B', info: 'Dos clavijas planas americanas. Adaptador necesario.' }, currency: { info: 'Dólar taiwanés (TWD). Tarjeta aceptada en ciudades.' }, vaccines: [], tips: ['EasyCard para transporte.', 'Street food increíble en los mercados nocturnos.', 'MRT eficiente en Taipei.'], emergency: '110 (policía) · 119 (ambulancia)' },

};

export function getSmartPackingList(country) {
  const req = COUNTRY_REQUIREMENTS[country] || null;
  const items = [...PACKING_TEMPLATES.base];
  if (req?.adapter?.needed) items.push(...PACKING_TEMPLATES.adapter);
  const asiaCountries = ['Japón', 'Tailandia', 'Vietnam', 'India', 'Indonesia', 'China', 'Corea del Sur', 'Camboya', 'Filipinas', 'Nepal', 'Sri Lanka', 'Singapur'];
  if (asiaCountries.includes(country)) items.push(...PACKING_TEMPLATES.asia);
  if (country === 'Japón') items.push(...PACKING_TEMPLATES.japan_extra);
  if (country === 'Estados Unidos' || country === 'Canadá') items.push(...PACKING_TEMPLATES.usa_extra);
  const seen = new Set();
  return { items: items.filter(i => { if (seen.has(i.name)) return false; seen.add(i.name); return true; }), requirements: req };
}
/**
 * Devuelve los requisitos de viaje para un país destino,
 * adaptando la info de visado según la nacionalidad del viajero.
 */
export function getCountryRequirements(destination, homeCountry = 'España') {
  const norm = (str) => (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const hn = norm(homeCountry);

  // Detectar código de pasaporte
  const detect = (keys) => keys.some(k => hn.includes(k));

  const passportCode = (() => {
    if (detect(['espana','spain','español'])) return 'ES';
    if (detect(['estados unidos','united states','eeuu'])) return 'US';
    if (detect(['reino unido','united kingdom','britain'])) return 'UK';
    if (detect(['australia'])) return 'AU';
    if (detect(['canad'])) return 'CA';
    if (detect(['japon','japan'])) return 'JP';
    if (detect(['corea del sur','south korea'])) return 'KR';
    if (detect(['india'])) return 'IN';
    if (detect(['chin'])) return 'CN';
    if (detect(['rusia','russia'])) return 'RU';
    if (detect(['argentin'])) return 'AR';
    if (detect(['brasil','brazil'])) return 'BR';
    if (detect(['chile'])) return 'CL';
    if (detect(['colombi'])) return 'CO';
    if (detect(['ecuad'])) return 'EC';
    if (detect(['mexic'])) return 'MX';
    if (detect(['panam'])) return 'PA';
    if (detect(['peru','perú'])) return 'PE';
    if (detect(['paragua'])) return 'PY';
    if (detect(['urugua'])) return 'UY';
    if (detect(['venezuel'])) return 'VE';
    if (detect(['boliv'])) return 'BO';
    if (detect(['hondur'])) return 'HN';
    if (detect(['nicarag'])) return 'NI';
    if (detect(['el salv','salvador'])) return 'SV';
    if (detect(['guatemal'])) return 'GT';
    if (detect(['cuba'])) return 'CU';
    if (detect(['dominicana','dominican','rep dom'])) return 'DO';
    if (detect(['haiti','haití'])) return 'HT';
    if (detect(['portug'])) return 'PT';
    if (detect(['franc'])) return 'FR';
    if (detect(['aleman','german'])) return 'DE';
    if (detect(['ital'])) return 'IT';
    return 'ES'; // fallback a España si no se reconoce
  })();

  const req = COUNTRY_REQUIREMENTS[destination] || null;
  if (!req) return null;

  const visa = req.visa || {};

  // Resolver visado para este pasaporte
  let visaNeeded = visa.needed;
  let visaType = null;

  // Buscar primero en campos directos (AU, CA, JP, KR, IN, CN, RU, AR, BR, etc.)
  if (passportCode in visa && visa[passportCode] !== undefined) {
    const v = visa[passportCode];
    visaNeeded = v === false ? false : (v === true ? true : null);
    visaType = typeof v === 'string' ? v : null;
  } else {
    // Buscar en LATAM
    const latam = visa.LATAM || {};
    const free = latam.free || [];
    const required = latam.required || [];
    const evisa = latam.evisa || [];
    const voa = latam.voa || [];
    const eta = latam.eta || [];

    const inList = (list) => list === 'all' || (Array.isArray(list) && list.includes(passportCode));

    if (inList(free)) { visaNeeded = false; visaType = null; }
    else if (inList(evisa)) { visaNeeded = null; visaType = 'evisa'; }
    else if (inList(voa)) { visaNeeded = null; visaType = 'voa'; }
    else if (inList(eta)) { visaNeeded = null; visaType = 'eta'; }
    else if (inList(required)) { visaNeeded = true; visaType = null; }
    else {
      // ES como fallback para pasaportes europeos no reconocidos
      const europassports = ['PT','FR','DE','IT','NL','BE','AT','GR','SE','NO','DK','FI','PL','CZ','HU','RO','BG','HR','SI','SK','EE','LV','LT','LU','MT','CY'];
      if (europassports.includes(passportCode) && 'ES' in visa) {
        const v = visa.ES;
        visaNeeded = v === false ? false : (v === true ? true : null);
        visaType = typeof v === 'string' ? v : null;
      }
    }
  }

  const visaLabel = visaType === 'evisa' ? 'e-Visa requerida' :
                    visaType === 'voa' ? 'Visa en llegada' :
                    visaType === 'eta' ? 'ETA / Autorización electrónica' :
                    visaType === 'esta' ? 'ESTA requerida' :
                    visaType === 'nzeta' ? 'NZeTA requerida' :
                    visaNeeded === false ? 'Sin visado' :
                    visaNeeded === true ? 'Visado requerido' : 'Verificar con consulado';

  return {
    ...req,
    visa: {
      ...req.visa,
      needed: visaNeeded,
      type: visaType,
      label: visaLabel,
      passportCode,
      info: req.visa?.info || '',
    }
  };
}