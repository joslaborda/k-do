/**
 * visaMatrix.js — Matriz completa de visados para Kōdo
 * Fuentes: IATA, Timatic, Henley Passport Index, consulados oficiales
 * Actualizado: mayo 2026
 *
 * Estructura por entrada:
 * VISA_MATRIX[destinoISO][origenISO] = {
 *   needed: boolean,
 *   days: number | null,       // días máx sin visado
 *   eVisa: boolean,            // e-visa disponible
 *   cost: string | null,       // coste aproximado
 *   info: string,              // info práctica
 *   url: string | null,        // URL oficial para tramitar
 * }
 *
 * Si origen no está en VISA_MATRIX[destino], usar getVisaInfo() que busca por grupo
 */

// ─────────────────────────────────────────────────────────────────────────────
// Grupos de pasaportes (por acuerdos reales de libre circulación)
// ─────────────────────────────────────────────────────────────────────────────
export const PASSPORT_GROUPS = {
  SCHENGEN:     ['ES','FR','DE','IT','PT','NL','BE','AT','GR','PL','CZ','HU','SK','SI','HR','SE','DK','FI','EE','LV','LT','LU','MT','CY','RO','BG','CH','NO','IS','LI','IE'],
  LATAM_STRONG: ['AR','CL','UY','BR','CO','MX','PE','EC','CR','PA','PY','BO','VE'],
  LATAM_WEAK:   ['GT','HN','SV','NI','DO','GY','SR','TT','BB','JM','BZ'],
  LATAM_RESTRICTED: ['CU','HT'],
  ANGLOPHONE:   ['US','CA','AU','NZ','GB'],
  ASIA_STRONG:  ['JP','KR','SG','HK','TW'],
  GULF:         ['AE','QA','BH','KW','SA','OM'],
  AFRICA:       ['ZA','MA','NG','KE','GH','ET','TZ','UG','SN','CI','CM','AO','MZ','MG','TN','DZ','LY','SD','SO','CD','CG','CF','TD','ML','NE','BF','GN','SL','LR','GM','GW','BI','RW','MW','ZM','ZW','BW','NA','LS','SZ','CV','ST','KM','SC','MU','RE','DJ','ER','SS'],
  ASIA_OTHER:   ['CN','IN','PK','BD','LK','NP','BT','MM','KH','LA','VN','PH','ID','MY','TH','MN','KZ','UZ','TJ','KG','TM','AF','IR','IQ','SY','YE','LB','JO','IL','PS'],
  EASTERN_EU:   ['UA','BY','MD','GE','AM','AZ','XK','BA','ME','MK','AL','RS'],
};

function getGroup(iso) {
  for (const [g, list] of Object.entries(PASSPORT_GROUPS)) {
    if (list.includes(iso)) return g;
  }
  return 'OTHER';
}

const FREE = (days = 90, info = '') => ({
  needed: false, days, eVisa: false, cost: null,
  info: info || `Sin visado hasta ${days} días.`, url: null,
});
const EVISA = (cost, days, info, url = null) => ({
  needed: true, days, eVisa: true, cost,
  info, url,
});
const EMBASSY = (info) => ({
  needed: true, days: null, eVisa: false, cost: null,
  info, url: null,
});
const ON_ARRIVAL = (cost, days, info) => ({
  needed: true, days, eVisa: false, cost,
  info, url: null,
});

// ─────────────────────────────────────────────────────────────────────────────
// VISA MATRIX
// ─────────────────────────────────────────────────────────────────────────────
export const VISA_MATRIX = {

  // ══════════════════════════════════════════════════════════════════════════
  // EUROPA — DESTINOS
  // ══════════════════════════════════════════════════════════════════════════

  // ── España ────────────────────────────────────────────────────────────────
  'ES': {
    'ES': FREE(0, 'Tu país de origen.'),
    _SCHENGEN:     FREE(0, 'Ciudadano UE/Schengen — libre circulación sin límite.'),
    _LATAM_STRONG: FREE(90, 'Sin visado hasta 90 días por semestre (acuerdo bilateral).'),
    _LATAM_WEAK:   FREE(90, 'Sin visado hasta 90 días — verifica vigencia del acuerdo bilateral.'),
    'CU':          FREE(90, 'Sin visado hasta 90 días (acuerdo bilateral Cuba-España).'),
    'HT':          EMBASSY('Visado necesario — tramitar en embajada española en Puerto Príncipe.'),
    _ANGLOPHONE:   FREE(90, 'Sin visado hasta 90 días en zona Schengen.'),
    _ASIA_STRONG:  FREE(90, 'Sin visado hasta 90 días.'),
    _ASIA_OTHER:   EMBASSY('Visado Schengen necesario — tramitar en embajada española o consulado.'),
    'CN':          FREE(90, 'Sin visado para ciudadanos chinos desde 2023 (acuerdo temporal).'),
    'IN':          EMBASSY('Visado Schengen necesario — tramitar con antelación.'),
    'MA':          FREE(90, 'Sin visado hasta 90 días (acuerdo bilateral).'),
    'TN':          FREE(90, 'Sin visado hasta 90 días.'),
    'DZ':          EMBASSY('Visado necesario — tramitar en consulado español.'),
    _GULF:         FREE(90, 'Sin visado hasta 90 días.'),
    _AFRICA:       EMBASSY('Visado Schengen necesario — tramitar en embajada.'),
    _EASTERN_EU:   FREE(90, 'Sin visado hasta 90 días.'),
    'UA':          FREE(90, 'Sin visado hasta 90 días.'),
    'BY':          EMBASSY('Visado necesario.'),
    _default:      EMBASSY('Consulta el consulado español más cercano para requisitos de visado.'),
  },

  // ── Francia ───────────────────────────────────────────────────────────────
  'FR': {
    _SCHENGEN:     FREE(0, 'Ciudadano UE/Schengen — libre circulación.'),
    _LATAM_STRONG: FREE(90, 'Sin visado hasta 90 días (Schengen).'),
    _LATAM_WEAK:   EMBASSY('Visado Schengen necesario — tramitar en consulado francés.'),
    'CU':          FREE(90, 'Sin visado hasta 30 días (acuerdo bilateral).'),
    'HT':          FREE(90, 'Sin visado hasta 90 días.'),
    'MA':          FREE(90, 'Sin visado hasta 90 días.'),
    'TN':          FREE(90, 'Sin visado hasta 90 días.'),
    _ANGLOPHONE:   FREE(90, 'Sin visado hasta 90 días.'),
    _ASIA_STRONG:  FREE(90, 'Sin visado hasta 90 días.'),
    'CN':          FREE(15, 'Sin visado hasta 15 días (acuerdo 2024).'),
    _GULF:         FREE(90, 'Sin visado hasta 90 días.'),
    _AFRICA:       EMBASSY('Visado Schengen necesario.'),
    _default:      EMBASSY('Visado Schengen necesario — tramitar en embajada francesa.'),
  },

  // ── Alemania ──────────────────────────────────────────────────────────────
  'DE': {
    _SCHENGEN:     FREE(0, 'Libre circulación.'),
    _LATAM_STRONG: FREE(90, 'Sin visado hasta 90 días (Schengen).'),
    _LATAM_WEAK:   EMBASSY('Visado Schengen — tramitar en consulado alemán.'),
    'MA':          FREE(90, 'Sin visado hasta 90 días.'),
    _ANGLOPHONE:   FREE(90, 'Sin visado.'),
    _ASIA_STRONG:  FREE(90, 'Sin visado.'),
    _GULF:         FREE(90, 'Sin visado.'),
    _default:      EMBASSY('Visado Schengen necesario — tramitar en embajada alemana.'),
  },

  // ── Italia ────────────────────────────────────────────────────────────────
  'IT': {
    _SCHENGEN:     FREE(0, 'Libre circulación.'),
    _LATAM_STRONG: FREE(90, 'Sin visado hasta 90 días.'),
    _LATAM_WEAK:   EMBASSY('Visado Schengen necesario.'),
    'MA':          FREE(90, 'Sin visado.'),
    'TN':          FREE(90, 'Sin visado.'),
    _ANGLOPHONE:   FREE(90, 'Sin visado.'),
    _ASIA_STRONG:  FREE(90, 'Sin visado.'),
    _GULF:         FREE(90, 'Sin visado.'),
    _default:      EMBASSY('Visado Schengen necesario.'),
  },

  // ── Portugal ──────────────────────────────────────────────────────────────
  'PT': {
    _SCHENGEN:     FREE(0, 'Libre circulación.'),
    'BR':          FREE(90, 'Sin visado hasta 90 días — también opción de larga estancia por acuerdo CPLP.'),
    _LATAM_STRONG: FREE(90, 'Sin visado hasta 90 días.'),
    _LATAM_WEAK:   EMBASSY('Visado Schengen necesario.'),
    'CV':          FREE(90, 'Sin visado (CPLP).'),
    'AO':          FREE(90, 'Sin visado hasta 90 días.'),
    'MZ':          FREE(90, 'Sin visado hasta 90 días.'),
    _ANGLOPHONE:   FREE(90, 'Sin visado.'),
    _ASIA_STRONG:  FREE(90, 'Sin visado.'),
    _default:      EMBASSY('Visado Schengen necesario.'),
  },

  // ── Reino Unido ───────────────────────────────────────────────────────────
  'GB': {
    'GB':          FREE(0, 'Tu país.'),
    _SCHENGEN:     { needed: true, days: 180, eVisa: true, cost: '10 GBP', info: 'ETA (Electronic Travel Authorisation) necesaria desde 2024 — 10 GBP. No es visado pero es obligatoria. Tramitar en gov.uk/eta.', url: 'https://www.gov.uk/get-electronic-travel-authorisation' },
    'US':          FREE(180, 'Sin visado hasta 6 meses. Visa Waiver Program.'),
    'CA':          FREE(180, 'Sin visado hasta 6 meses.'),
    'AU':          FREE(180, 'Sin visado hasta 6 meses.'),
    'NZ':          FREE(180, 'Sin visado hasta 6 meses.'),
    _LATAM_STRONG: FREE(180, 'Sin visado hasta 6 meses.'),
    'MX':          FREE(180, 'Sin visado hasta 6 meses.'),
    'AR':          FREE(180, 'Sin visado hasta 6 meses.'),
    'BR':          FREE(180, 'Sin visado hasta 6 meses.'),
    'CO':          FREE(180, 'Sin visado hasta 6 meses.'),
    'GT':          EMBASSY('Visado necesario — tramitar en embajada británica.'),
    'HN':          EMBASSY('Visado necesario.'),
    'SV':          EMBASSY('Visado necesario.'),
    'NI':          EMBASSY('Visado necesario.'),
    'CU':          EMBASSY('Visado necesario.'),
    'HT':          EMBASSY('Visado necesario.'),
    _ASIA_STRONG:  FREE(180, 'Sin visado hasta 6 meses.'),
    'IN':          EMBASSY('Visado necesario — tramitar en gov.uk/visas-immigration.'),
    'CN':          EMBASSY('Visado necesario.'),
    'PK':          EMBASSY('Visado necesario.'),
    _GULF:         FREE(180, 'Sin visado hasta 6 meses.'),
    'MA':          FREE(180, 'Sin visado.'),
    'ZA':          FREE(180, 'Sin visado.'),
    _AFRICA:       EMBASSY('Visado necesario — tramitar en embajada británica o VFS Global.'),
    _default:      EMBASSY('Visado necesario — tramitar en embajada británica o VFS Global.'),
  },

  // ── Schengen genérico (aplica a todos los países Schengen no listados arriba) ──
  // Nota: en getVisaInfo() se usa este bloque para cualquier destino Schengen
  '_SCHENGEN_GENERIC': {
    _SCHENGEN:     FREE(0, 'Libre circulación — no hay control de fronteras internas.'),
    _LATAM_STRONG: FREE(90, 'Sin visado hasta 90 días por cada período de 180 días en zona Schengen.'),
    'MX':          FREE(90, 'Sin visado hasta 90 días.'),
    'AR':          FREE(90, 'Sin visado hasta 90 días.'),
    'BR':          FREE(90, 'Sin visado hasta 90 días.'),
    'CL':          FREE(90, 'Sin visado hasta 90 días.'),
    'CO':          FREE(90, 'Sin visado hasta 90 días.'),
    'PE':          FREE(90, 'Sin visado hasta 90 días.'),
    'UY':          FREE(90, 'Sin visado hasta 90 días.'),
    'EC':          FREE(90, 'Sin visado hasta 90 días.'),
    'CR':          FREE(90, 'Sin visado hasta 90 días.'),
    'PA':          FREE(90, 'Sin visado hasta 90 días.'),
    'PY':          FREE(90, 'Sin visado hasta 90 días.'),
    'BO':          FREE(90, 'Sin visado hasta 90 días.'),
    'VE':          FREE(90, 'Sin visado hasta 90 días.'),
    'GT':          EMBASSY('Visado Schengen necesario — tramitar en consulado del país de destino o de representación. Formulario en VFS Global o consulado.'),
    'HN':          EMBASSY('Visado Schengen necesario.'),
    'SV':          EMBASSY('Visado Schengen necesario.'),
    'NI':          EMBASSY('Visado Schengen necesario.'),
    'CU':          FREE(90, 'Sin visado hasta 90 días (mayoría de países Schengen).'),
    'DO':          FREE(90, 'Sin visado hasta 90 días.'),
    'HT':          EMBASSY('Visado necesario.'),
    'GY':          FREE(90, 'Sin visado hasta 90 días.'),
    'SR':          EMBASSY('Visado necesario.'),
    _ANGLOPHONE:   FREE(90, 'Sin visado hasta 90 días.'),
    _ASIA_STRONG:  FREE(90, 'Sin visado hasta 90 días.'),
    'CN':          FREE(15, 'Sin visado hasta 15 días (acuerdo 2024 — verificar por país específico).'),
    'IN':          EMBASSY('Visado Schengen necesario.'),
    'PK':          EMBASSY('Visado Schengen necesario.'),
    'BD':          EMBASSY('Visado Schengen necesario.'),
    'LK':          EMBASSY('Visado Schengen necesario.'),
    'NP':          EMBASSY('Visado Schengen necesario.'),
    'MM':          EMBASSY('Visado Schengen necesario.'),
    'KH':          EMBASSY('Visado Schengen necesario.'),
    'LA':          EMBASSY('Visado Schengen necesario.'),
    'VN':          EMBASSY('Visado Schengen necesario.'),
    'PH':          EMBASSY('Visado Schengen necesario.'),
    'ID':          EMBASSY('Visado Schengen necesario.'),
    'MY':          FREE(90, 'Sin visado hasta 90 días.'),
    'TH':          FREE(30, 'Sin visado hasta 30 días.'),
    'MN':          EMBASSY('Visado Schengen necesario.'),
    _GULF:         FREE(90, 'Sin visado hasta 90 días.'),
    'MA':          FREE(90, 'Sin visado hasta 90 días.'),
    'TN':          FREE(90, 'Sin visado hasta 90 días.'),
    'DZ':          EMBASSY('Visado necesario.'),
    'NG':          EMBASSY('Visado necesario.'),
    'GH':          EMBASSY('Visado necesario.'),
    'KE':          EMBASSY('Visado necesario.'),
    'ZA':          FREE(90, 'Sin visado hasta 90 días.'),
    'ET':          EMBASSY('Visado necesario.'),
    'SN':          FREE(90, 'Sin visado hasta 90 días.'),
    _AFRICA:       EMBASSY('Visado Schengen necesario — tramitar en embajada o consulado del país destino.'),
    _EASTERN_EU:   FREE(90, 'Sin visado hasta 90 días (mayoría, verificar por país).'),
    'UA':          FREE(90, 'Sin visado hasta 90 días.'),
    'GE':          FREE(365, 'Sin visado hasta 1 año.'),
    'AM':          FREE(180, 'Sin visado hasta 180 días.'),
    'AZ':          EVISA('23 USD', 30, 'E-visa necesaria: 23 USD en evisa.gov.az.', 'https://evisa.gov.az'),
    'BY':          EMBASSY('Visado necesario.'),
    _default:      EMBASSY('Visado necesario — verificar en el consulado del país de destino.'),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ASIA — DESTINOS
  // ══════════════════════════════════════════════════════════════════════════

  // ── Japón ─────────────────────────────────────────────────────────────────
  'JP': {
    _SCHENGEN:     FREE(90, 'Sin visado hasta 90 días.'),
    _LATAM_STRONG: FREE(90, 'Sin visado hasta 90 días — incluye MX, AR, BR, CL, CO, PE, EC, UY, CR, PA, PY, BO, VE.'),
    'GT':          FREE(90, 'Sin visado hasta 90 días (acuerdo bilateral).'),
    'HN':          FREE(90, 'Sin visado hasta 90 días.'),
    'SV':          FREE(90, 'Sin visado hasta 90 días.'),
    'NI':          FREE(90, 'Sin visado hasta 90 días.'),
    'DO':          FREE(90, 'Sin visado hasta 90 días.'),
    'CU':          FREE(90, 'Sin visado hasta 90 días.'),
    'HT':          FREE(90, 'Sin visado hasta 90 días.'),
    _ANGLOPHONE:   FREE(90, 'Sin visado hasta 90 días.'),
    _ASIA_STRONG:  FREE(90, 'Sin visado hasta 90 días.'),
    'MY':          FREE(90, 'Sin visado hasta 90 días.'),
    'TH':          FREE(90, 'Sin visado hasta 90 días.'),
    'ID':          FREE(30, 'Sin visado hasta 30 días.'),
    'PH':          FREE(30, 'Sin visado hasta 30 días.'),
    'VN':          FREE(45, 'Sin visado hasta 45 días.'),
    'IN':          EVISA('2.000-3.000 JPY', 90, 'E-visa necesaria. Tramitar en mofa.go.jp.', 'https://www.mofa.go.jp'),
    'CN':          FREE(15, 'Sin visado hasta 15 días (reanudado 2023).'),
    'PK':          EMBASSY('Visado necesario — tramitar en embajada japonesa.'),
    'BD':          EMBASSY('Visado necesario.'),
    'LK':          FREE(30, 'Sin visado hasta 30 días.'),
    'NP':          FREE(90, 'Sin visado hasta 90 días.'),
    _GULF:         FREE(90, 'Sin visado hasta 90 días.'),
    'MA':          FREE(90, 'Sin visado hasta 90 días.'),
    'ZA':          FREE(90, 'Sin visado hasta 90 días.'),
    'NG':          EMBASSY('Visado necesario.'),
    'GH':          EMBASSY('Visado necesario.'),
    'KE':          EMBASSY('Visado necesario.'),
    'ET':          EMBASSY('Visado necesario.'),
    'TZ':          EMBASSY('Visado necesario.'),
    _AFRICA:       EMBASSY('Visado necesario — tramitar en embajada japonesa.'),
    _default:      EMBASSY('Visado necesario — tramitar en embajada japonesa o consulado.'),
  },

  // ── Tailandia ─────────────────────────────────────────────────────────────
  'TH': {
    _SCHENGEN:     FREE(60, 'Sin visado hasta 60 días (ampliable 30 días en inmigración). Renovado en 2024.'),
    _LATAM_STRONG: FREE(30, 'Sin visado hasta 30 días. Ampliable 30 días más en oficina de inmigración.'),
    'GT':          FREE(30, 'Sin visado hasta 30 días.'),
    'HN':          FREE(30, 'Sin visado hasta 30 días.'),
    'SV':          FREE(30, 'Sin visado hasta 30 días.'),
    'NI':          FREE(30, 'Sin visado hasta 30 días.'),
    'CU':          FREE(30, 'Sin visado hasta 30 días.'),
    'DO':          FREE(30, 'Sin visado hasta 30 días.'),
    'HT':          FREE(30, 'Sin visado hasta 30 días.'),
    _ANGLOPHONE:   FREE(30, 'Sin visado hasta 30 días.'),
    _ASIA_STRONG:  FREE(30, 'Sin visado hasta 30 días.'),
    'IN':          FREE(30, 'Sin visado hasta 30 días.'),
    'CN':          FREE(30, 'Sin visado hasta 30 días.'),
    'PK':          FREE(15, 'Sin visado hasta 15 días.'),
    _GULF:         FREE(30, 'Sin visado hasta 30 días.'),
    'MA':          FREE(30, 'Sin visado hasta 30 días.'),
    'ZA':          FREE(30, 'Sin visado hasta 30 días.'),
    'NG':          FREE(30, 'Sin visado hasta 30 días.'),
    _AFRICA:       FREE(30, 'Sin visado hasta 30 días (mayoría de pasaportes africanos).'),
    _default:      FREE(30, 'Sin visado hasta 30 días para la mayoría de pasaportes.'),
  },

  // ── Vietnam ───────────────────────────────────────────────────────────────
  'VN': {
    _SCHENGEN:     FREE(45, 'Sin visado hasta 45 días (renovado 2023). Antes 15 días — importante saberlo.'),
    _LATAM_STRONG: FREE(45, 'Sin visado hasta 45 días.'),
    'GT':          EVISA('25 USD', 90, 'E-visa: 25 USD en evisa.xuatnhapcanh.gov.vn. 90 días, entrada múltiple.', 'https://evisa.xuatnhapcanh.gov.vn'),
    'HN':          EVISA('25 USD', 90, 'E-visa necesaria: 25 USD.'),
    'SV':          EVISA('25 USD', 90, 'E-visa necesaria: 25 USD.'),
    'NI':          EVISA('25 USD', 90, 'E-visa necesaria: 25 USD.'),
    'CU':          EVISA('25 USD', 90, 'E-visa necesaria: 25 USD.'),
    'HT':          EVISA('25 USD', 90, 'E-visa necesaria: 25 USD.'),
    _ANGLOPHONE:   FREE(45, 'Sin visado hasta 45 días.'),
    _ASIA_STRONG:  FREE(45, 'Sin visado hasta 45 días.'),
    'IN':          FREE(45, 'Sin visado hasta 45 días.'),
    'CN':          FREE(30, 'Sin visado hasta 30 días.'),
    'PK':          EVISA('25 USD', 90, 'E-visa necesaria.'),
    _GULF:         FREE(30, 'Sin visado hasta 30 días.'),
    'MA':          FREE(30, 'Sin visado hasta 30 días.'),
    'ZA':          EVISA('25 USD', 90, 'E-visa: 25 USD.'),
    _AFRICA:       EVISA('25 USD', 90, 'E-visa: 25 USD para la mayoría de pasaportes africanos.'),
    _default:      EVISA('25 USD', 90, 'E-visa: 25 USD en evisa.xuatnhapcanh.gov.vn.', 'https://evisa.xuatnhapcanh.gov.vn'),
  },

  // ── Indonesia ─────────────────────────────────────────────────────────────
  'ID': {
    _SCHENGEN:     FREE(30, 'Sin visado hasta 30 días (Visa Free). Ampliable 30 días más.'),
    _LATAM_STRONG: FREE(30, 'Sin visado hasta 30 días.'),
    'GT':          ON_ARRIVAL('35 USD', 30, 'Visa on arrival: 35 USD en aeropuertos principales.'),
    'HN':          ON_ARRIVAL('35 USD', 30, 'Visa on arrival: 35 USD.'),
    'SV':          FREE(30, 'Sin visado hasta 30 días.'),
    'NI':          FREE(30, 'Sin visado hasta 30 días.'),
    'CU':          ON_ARRIVAL('35 USD', 30, 'Visa on arrival: 35 USD.'),
    'HT':          ON_ARRIVAL('35 USD', 30, 'Visa on arrival: 35 USD.'),
    _ANGLOPHONE:   FREE(30, 'Sin visado hasta 30 días.'),
    _ASIA_STRONG:  FREE(30, 'Sin visado hasta 30 días.'),
    'IN':          FREE(30, 'Sin visado hasta 30 días.'),
    'CN':          FREE(30, 'Sin visado hasta 30 días.'),
    'PK':          ON_ARRIVAL('35 USD', 30, 'Visa on arrival: 35 USD.'),
    _GULF:         FREE(30, 'Sin visado hasta 30 días.'),
    'MA':          FREE(30, 'Sin visado hasta 30 días.'),
    'ZA':          FREE(30, 'Sin visado hasta 30 días.'),
    _AFRICA:       ON_ARRIVAL('35 USD', 30, 'Visa on arrival: 35 USD para la mayoría de pasaportes africanos.'),
    _default:      ON_ARRIVAL('35 USD', 30, 'Visa on arrival: 35 USD en aeropuertos principales de Indonesia.'),
  },

  // ── India ─────────────────────────────────────────────────────────────────
  'IN': {
    _SCHENGEN:     EVISA('25-80 USD', 90, 'E-visa obligatoria: 25-80 USD según duración. Tramitar en indianvisaonline.gov.in al menos 4 días antes.', 'https://indianvisaonline.gov.in'),
    _LATAM_STRONG: EVISA('25 USD', 60, 'E-visa turística: 25 USD. Tramitar en indianvisaonline.gov.in.', 'https://indianvisaonline.gov.in'),
    _LATAM_WEAK:   EVISA('25 USD', 60, 'E-visa turística: 25 USD.'),
    _ANGLOPHONE:   EVISA('25-80 USD', 90, 'E-visa necesaria.'),
    'PK':          EMBASSY('Relaciones diplomáticas tensas — visado muy difícil de obtener.'),
    'BD':          FREE(90, 'Sin visado hasta 90 días (acuerdo bilateral).'),
    'NP':          FREE(0, 'Libre circulación — sin visado ni pasaporte (solo ID).'),
    'LK':          EVISA('20 USD', 30, 'E-visa: 20 USD en eta.gov.lk.'),
    'BT':          EMBASSY('Solo tours organizados — acceso muy controlado.'),
    'MM':          EVISA('50 USD', 28, 'E-visa: 50 USD.'),
    'CN':          EMBASSY('Visado necesario.'),
    _ASIA_STRONG:  EVISA('25 USD', 60, 'E-visa turística: 25 USD.'),
    _GULF:         EVISA('25 USD', 60, 'E-visa turística.'),
    'MA':          EVISA('25 USD', 60, 'E-visa turística.'),
    'ZA':          EVISA('25 USD', 60, 'E-visa turística.'),
    _AFRICA:       EVISA('25 USD', 60, 'E-visa turística: 25 USD.'),
    _default:      EVISA('25 USD', 60, 'E-visa turística: 25 USD en indianvisaonline.gov.in.', 'https://indianvisaonline.gov.in'),
  },

  // ── China ─────────────────────────────────────────────────────────────────
  'CN': {
    _SCHENGEN:     FREE(15, 'Sin visado hasta 15 días (acuerdo 2024 — verificar vigencia). Para más tiempo: visado en embajada china.'),
    'US':          EMBASSY('Visado necesario — tramitar en consulado chino.'),
    'CA':          FREE(10, 'Sin visado hasta 10 días (tránsito o turismo corto 2024).'),
    'AU':          FREE(15, 'Sin visado hasta 15 días (acuerdo 2024).'),
    'NZ':          FREE(15, 'Sin visado hasta 15 días.'),
    'GB':          FREE(15, 'Sin visado hasta 15 días (acuerdo 2024).'),
    _LATAM_STRONG: FREE(30, 'Sin visado hasta 30 días para la mayoría. MX: 30 días. AR: 30 días. BR: 30 días. CO: 30 días.'),
    'MX':          FREE(30, 'Sin visado hasta 30 días (acuerdo bilateral 2024).'),
    'AR':          FREE(30, 'Sin visado hasta 30 días.'),
    'BR':          FREE(30, 'Sin visado hasta 30 días.'),
    'CL':          FREE(30, 'Sin visado hasta 30 días.'),
    'CO':          FREE(30, 'Sin visado hasta 30 días.'),
    'PE':          FREE(30, 'Sin visado hasta 30 días.'),
    'GT':          EMBASSY('Visado necesario.'),
    'HN':          EMBASSY('Visado necesario.'),
    'SV':          EMBASSY('Visado necesario.'),
    'CU':          FREE(30, 'Sin visado hasta 30 días.'),
    _ASIA_STRONG:  FREE(15, 'Sin visado hasta 15 días.'),
    'JP':          FREE(15, 'Sin visado hasta 15 días (reanudado 2023).'),
    'KR':          FREE(30, 'Sin visado hasta 30 días.'),
    'SG':          FREE(30, 'Sin visado hasta 30 días.'),
    'MY':          FREE(30, 'Sin visado hasta 30 días.'),
    'TH':          FREE(30, 'Sin visado hasta 30 días.'),
    'IN':          EMBASSY('Visado necesario — relaciones tensas.'),
    'PK':          FREE(90, 'Sin visado hasta 90 días (acuerdo especial).'),
    _GULF:         FREE(30, 'Sin visado hasta 30 días (mayoría).'),
    'MA':          FREE(30, 'Sin visado hasta 30 días.'),
    'ZA':          FREE(30, 'Sin visado hasta 30 días.'),
    _AFRICA:       EMBASSY('Visado necesario para la mayoría de pasaportes africanos.'),
    _default:      EMBASSY('Visado necesario — tramitar en embajada o consulado chino.'),
  },

  // ── Corea del Sur ─────────────────────────────────────────────────────────
  'KR': {
    _SCHENGEN:     FREE(90, 'Sin visado hasta 90 días.'),
    _LATAM_STRONG: FREE(90, 'Sin visado hasta 90 días.'),
    'GT':          FREE(90, 'Sin visado hasta 90 días.'),
    'HN':          FREE(90, 'Sin visado hasta 90 días.'),
    'SV':          FREE(90, 'Sin visado hasta 90 días.'),
    'NI':          FREE(90, 'Sin visado hasta 90 días.'),
    'CU':          FREE(30, 'Sin visado hasta 30 días.'),
    'DO':          FREE(90, 'Sin visado hasta 90 días.'),
    'HT':          FREE(30, 'Sin visado hasta 30 días.'),
    _ANGLOPHONE:   FREE(90, 'Sin visado hasta 90 días.'),
    _ASIA_STRONG:  FREE(90, 'Sin visado hasta 90 días.'),
    'CN':          FREE(15, 'Sin visado hasta 15 días.'),
    'IN':          FREE(60, 'Sin visado hasta 60 días (acuerdo 2023).'),
    'TH':          FREE(90, 'Sin visado hasta 90 días.'),
    'MY':          FREE(90, 'Sin visado hasta 90 días.'),
    'PH':          FREE(59, 'Sin visado hasta 59 días.'),
    'ID':          FREE(30, 'Sin visado hasta 30 días.'),
    'VN':          FREE(45, 'Sin visado hasta 45 días.'),
    'PK':          EMBASSY('Visado necesario.'),
    _GULF:         FREE(90, 'Sin visado hasta 90 días.'),
    'MA':          FREE(90, 'Sin visado hasta 90 días.'),
    'ZA':          FREE(30, 'Sin visado hasta 30 días.'),
    'NG':          EMBASSY('Visado necesario.'),
    _AFRICA:       EMBASSY('Visado necesario para la mayoría de pasaportes africanos.'),
    _default:      EMBASSY('Visado necesario — tramitar en embajada coreana.'),
  },

  // ── Singapur ──────────────────────────────────────────────────────────────
  'SG': {
    _SCHENGEN:     FREE(30, 'Sin visado hasta 30 días.'),
    _LATAM_STRONG: FREE(30, 'Sin visado hasta 30 días.'),
    'GT':          FREE(30, 'Sin visado hasta 30 días.'),
    'HN':          FREE(30, 'Sin visado hasta 30 días.'),
    'SV':          FREE(30, 'Sin visado hasta 30 días.'),
    'NI':          FREE(30, 'Sin visado hasta 30 días.'),
    'CU':          FREE(30, 'Sin visado hasta 30 días.'),
    'HT':          FREE(30, 'Sin visado hasta 30 días.'),
    _ANGLOPHONE:   FREE(90, 'Sin visado hasta 90 días.'),
    _ASIA_STRONG:  FREE(30, 'Sin visado hasta 30 días.'),
    'CN':          FREE(30, 'Sin visado hasta 30 días.'),
    'IN':          FREE(30, 'Sin visado hasta 30 días.'),
    'PH':          FREE(30, 'Sin visado hasta 30 días.'),
    'ID':          FREE(30, 'Sin visado hasta 30 días.'),
    'MY':          FREE(30, 'Sin visado hasta 30 días.'),
    'TH':          FREE(30, 'Sin visado hasta 30 días.'),
    'VN':          FREE(30, 'Sin visado hasta 30 días.'),
    'PK':          EMBASSY('Visado necesario.'),
    _GULF:         FREE(30, 'Sin visado hasta 30 días.'),
    'MA':          FREE(30, 'Sin visado hasta 30 días.'),
    'ZA':          FREE(30, 'Sin visado hasta 30 días.'),
    'NG':          EMBASSY('Visado necesario.'),
    _AFRICA:       EMBASSY('Visado necesario para muchos pasaportes africanos.'),
    _default:      EMBASSY('Verificar en ica.gov.sg si se requiere visado.'),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ORIENTE MEDIO — DESTINOS
  // ══════════════════════════════════════════════════════════════════════════

  // ── Emiratos Árabes Unidos ────────────────────────────────────────────────
  'AE': {
    _SCHENGEN:     FREE(90, 'Sin visado hasta 90 días.'),
    _LATAM_STRONG: FREE(30, 'Sin visado hasta 30 días para la mayoría. AR/UY: 90 días.'),
    'AR':          FREE(90, 'Sin visado hasta 90 días.'),
    'UY':          FREE(90, 'Sin visado hasta 90 días.'),
    'MX':          FREE(30, 'Sin visado hasta 30 días.'),
    'BR':          FREE(90, 'Sin visado hasta 90 días.'),
    'CO':          FREE(30, 'Sin visado hasta 30 días.'),
    'CL':          FREE(90, 'Sin visado hasta 90 días.'),
    'PE':          FREE(30, 'Sin visado hasta 30 días.'),
    'GT':          EVISA('100 AED', 30, 'E-visa: aprox 30 USD en icp.gov.ae.', 'https://icp.gov.ae'),
    'HN':          EVISA('100 AED', 30, 'E-visa necesaria.'),
    'SV':          EVISA('100 AED', 30, 'E-visa necesaria.'),
    'NI':          EVISA('100 AED', 30, 'E-visa necesaria.'),
    'CU':          EVISA('100 AED', 30, 'E-visa necesaria.'),
    'HT':          EVISA('100 AED', 30, 'E-visa necesaria.'),
    _ANGLOPHONE:   FREE(30, 'Sin visado hasta 30 días.'),
    _ASIA_STRONG:  FREE(30, 'Sin visado hasta 30 días.'),
    'IN':          FREE(90, 'Sin visado hasta 90 días (acuerdo especial).'),
    'PK':          FREE(30, 'Sin visado hasta 30 días (acuerdo especial).'),
    'BD':          EVISA('100 AED', 30, 'E-visa necesaria.'),
    'PH':          FREE(30, 'Sin visado hasta 30 días.'),
    'CN':          FREE(30, 'Sin visado hasta 30 días.'),
    'MA':          FREE(90, 'Sin visado hasta 90 días.'),
    'TN':          FREE(30, 'Sin visado hasta 30 días.'),
    'ZA':          FREE(30, 'Sin visado hasta 30 días.'),
    'NG':          FREE(30, 'Sin visado hasta 30 días.'),
    'GH':          FREE(30, 'Sin visado hasta 30 días.'),
    'KE':          FREE(30, 'Sin visado hasta 30 días.'),
    _AFRICA:       EVISA('100 AED', 30, 'E-visa disponible para la mayoría de pasaportes africanos.'),
    _default:      EVISA('100 AED', 30, 'E-visa disponible en icp.gov.ae.', 'https://icp.gov.ae'),
  },

  // ── Egipto ────────────────────────────────────────────────────────────────
  'EG': {
    _SCHENGEN:     EVISA('25 USD', 30, 'E-visa turística: 25 USD en visa2egypt.gov.eg. También visa on arrival en el aeropuerto (25 USD).', 'https://visa2egypt.gov.eg'),
    _LATAM_STRONG: EVISA('25 USD', 30, 'E-visa: 25 USD. También visa on arrival: 25 USD.'),
    'GT':          EVISA('25 USD', 30, 'E-visa o visa on arrival: 25 USD.'),
    'HN':          EVISA('25 USD', 30, 'E-visa o visa on arrival: 25 USD.'),
    'SV':          EVISA('25 USD', 30, 'E-visa o visa on arrival: 25 USD.'),
    'NI':          EVISA('25 USD', 30, 'E-visa o visa on arrival: 25 USD.'),
    'CU':          EVISA('25 USD', 30, 'E-visa o visa on arrival: 25 USD.'),
    'HT':          EVISA('25 USD', 30, 'E-visa o visa on arrival: 25 USD.'),
    _ANGLOPHONE:   EVISA('25 USD', 30, 'E-visa: 25 USD o visa on arrival.'),
    _ASIA_STRONG:  FREE(90, 'Sin visado hasta 90 días (acuerdo bilateral con mayoría de países asiáticos fuertes).'),
    'IN':          FREE(90, 'Sin visado hasta 90 días.'),
    'PK':          FREE(30, 'Sin visado hasta 30 días.'),
    'CN':          FREE(30, 'Sin visado hasta 30 días.'),
    _GULF:         FREE(90, 'Sin visado hasta 90 días.'),
    'MA':          FREE(90, 'Sin visado hasta 90 días.'),
    'TN':          FREE(90, 'Sin visado hasta 90 días.'),
    'ZA':          EVISA('25 USD', 30, 'E-visa: 25 USD.'),
    'NG':          EVISA('25 USD', 30, 'E-visa: 25 USD.'),
    'KE':          EVISA('25 USD', 30, 'E-visa: 25 USD.'),
    _AFRICA:       EVISA('25 USD', 30, 'E-visa o visa on arrival: 25 USD para la mayoría de pasaportes africanos.'),
    _default:      EVISA('25 USD', 30, 'E-visa: 25 USD en visa2egypt.gov.eg o visa on arrival en aeropuerto.', 'https://visa2egypt.gov.eg'),
  },

  // ── Marruecos ─────────────────────────────────────────────────────────────
  'MA': {
    _SCHENGEN:     FREE(90, 'Sin visado hasta 90 días.'),
    _LATAM_STRONG: FREE(90, 'Sin visado hasta 90 días.'),
    'GT':          FREE(90, 'Sin visado hasta 90 días.'),
    'HN':          FREE(90, 'Sin visado hasta 90 días.'),
    'SV':          FREE(90, 'Sin visado hasta 90 días.'),
    'NI':          FREE(90, 'Sin visado hasta 90 días.'),
    'CU':          FREE(90, 'Sin visado hasta 90 días.'),
    'HT':          FREE(90, 'Sin visado hasta 90 días.'),
    _ANGLOPHONE:   FREE(90, 'Sin visado hasta 90 días.'),
    _ASIA_STRONG:  FREE(90, 'Sin visado hasta 90 días.'),
    'IN':          FREE(90, 'Sin visado hasta 90 días.'),
    'CN':          FREE(90, 'Sin visado hasta 90 días.'),
    'NG':          FREE(90, 'Sin visado hasta 90 días.'),
    'ZA':          FREE(90, 'Sin visado hasta 90 días.'),
    'SN':          FREE(90, 'Sin visado hasta 90 días.'),
    _GULF:         FREE(90, 'Sin visado hasta 90 días.'),
    _AFRICA:       FREE(90, 'Sin visado hasta 90 días para la mayoría de países africanos.'),
    _LATAM_WEAK:   FREE(90, 'Sin visado hasta 90 días.'),
    _default:      FREE(90, 'Sin visado hasta 90 días para la mayoría de pasaportes.'),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // AMÉRICAS — DESTINOS
  // ══════════════════════════════════════════════════════════════════════════

  // ── Estados Unidos ────────────────────────────────────────────────────────
  'US': {
    'ES':          { needed: false, days: 90, eVisa: true, cost: '21 USD', info: 'ESTA necesaria: 21 USD en esta.cbp.dhs.gov. No es visado pero es obligatoria. Sin ESTA no embarcan.', url: 'https://esta.cbp.dhs.gov' },
    'FR':          { needed: false, days: 90, eVisa: true, cost: '21 USD', info: 'ESTA: 21 USD. Obligatoria para Visa Waiver Program.', url: 'https://esta.cbp.dhs.gov' },
    'DE':          { needed: false, days: 90, eVisa: true, cost: '21 USD', info: 'ESTA: 21 USD.', url: 'https://esta.cbp.dhs.gov' },
    _SCHENGEN:     { needed: false, days: 90, eVisa: true, cost: '21 USD', info: 'ESTA necesaria: 21 USD en esta.cbp.dhs.gov. Válida 2 años, múltiples entradas.', url: 'https://esta.cbp.dhs.gov' },
    'GB':          { needed: false, days: 90, eVisa: true, cost: '21 USD', info: 'ESTA: 21 USD.', url: 'https://esta.cbp.dhs.gov' },
    'AU':          { needed: false, days: 90, eVisa: true, cost: '21 USD', info: 'ESTA: 21 USD.', url: 'https://esta.cbp.dhs.gov' },
    'NZ':          { needed: false, days: 90, eVisa: true, cost: '21 USD', info: 'ESTA: 21 USD.', url: 'https://esta.cbp.dhs.gov' },
    'JP':          { needed: false, days: 90, eVisa: true, cost: '21 USD', info: 'ESTA: 21 USD.', url: 'https://esta.cbp.dhs.gov' },
    'KR':          { needed: false, days: 90, eVisa: true, cost: '21 USD', info: 'ESTA: 21 USD.', url: 'https://esta.cbp.dhs.gov' },
    'MX':          FREE(180, 'Sin visado hasta 180 días — tarjeta de turista FMM necesaria al entrar (incluida en vuelo).'),
    'AR':          EMBASSY('Visado B-1/B-2 necesario — tramitar en embajada estadounidense. Entrevista obligatoria.'),
    'BR':          EMBASSY('Visado B-1/B-2 necesario.'),
    'CL':          EMBASSY('Visado B-1/B-2 necesario.'),
    'CO':          EMBASSY('Visado B-1/B-2 necesario. Alto porcentaje de rechazo — prepara bien el expediente.'),
    'PE':          EMBASSY('Visado B-1/B-2 necesario.'),
    'EC':          EMBASSY('Visado B-1/B-2 necesario.'),
    'BO':          EMBASSY('Visado B-1/B-2 necesario.'),
    'PY':          EMBASSY('Visado B-1/B-2 necesario.'),
    'UY':          EMBASSY('Visado B-1/B-2 necesario.'),
    'VE':          EMBASSY('Visado B-1/B-2 necesario. Tramitar con mucha antelación.'),
    'GT':          EMBASSY('Visado B-1/B-2 necesario.'),
    'HN':          EMBASSY('Visado B-1/B-2 necesario.'),
    'SV':          EMBASSY('Visado B-1/B-2 necesario.'),
    'NI':          EMBASSY('Visado B-1/B-2 necesario.'),
    'CR':          EMBASSY('Visado B-1/B-2 necesario.'),
    'PA':          EMBASSY('Visado B-1/B-2 necesario.'),
    'CU':          EMBASSY('Relaciones normalizadas parcialmente — visa muy difícil. Consultar estado actual.'),
    'DO':          EMBASSY('Visado B-1/B-2 necesario.'),
    'HT':          EMBASSY('Visado B-1/B-2 necesario.'),
    'IN':          EMBASSY('Visado B-1/B-2 necesario.'),
    'CN':          EMBASSY('Visado B-1/B-2 necesario.'),
    'PK':          EMBASSY('Visado necesario — proceso muy riguroso.'),
    _GULF:         FREE(90, 'Sin visado hasta 90 días (mayoría de países del Golfo en Visa Waiver).'),
    'AE':          FREE(90, 'Sin visado hasta 90 días.'),
    'SA':          FREE(90, 'Sin visado hasta 90 días.'),
    'MA':          EMBASSY('Visado B-1/B-2 necesario.'),
    'ZA':          EMBASSY('Visado B-1/B-2 necesario.'),
    _AFRICA:       EMBASSY('Visado B-1/B-2 necesario para la mayoría de pasaportes africanos.'),
    _default:      EMBASSY('Visado B-1/B-2 necesario — tramitar en embajada de EE.UU. Entrevista obligatoria. Tramitar con meses de antelación.'),
  },

  // ── Canadá ────────────────────────────────────────────────────────────────
  'CA': {
    _SCHENGEN:     { needed: false, days: 180, eVisa: true, cost: '7 CAD', info: 'eTA necesaria: 7 CAD en canada.ca/en/immigration/services/visit-canada/eta. No es visado pero obligatoria para vuelo.', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html' },
    'GB':          { needed: false, days: 180, eVisa: true, cost: '7 CAD', info: 'eTA: 7 CAD.', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html' },
    'AU':          { needed: false, days: 180, eVisa: true, cost: '7 CAD', info: 'eTA: 7 CAD.' },
    'NZ':          { needed: false, days: 180, eVisa: true, cost: '7 CAD', info: 'eTA: 7 CAD.' },
    'JP':          { needed: false, days: 180, eVisa: true, cost: '7 CAD', info: 'eTA: 7 CAD.' },
    'KR':          { needed: false, days: 180, eVisa: true, cost: '7 CAD', info: 'eTA: 7 CAD.' },
    'MX':          EMBASSY('Visado necesario — tramitar en embajada canadiense.'),
    'AR':          EMBASSY('Visado necesario.'),
    'BR':          EMBASSY('Visado necesario.'),
    'CO':          EMBASSY('Visado necesario.'),
    'CL':          EMBASSY('Visado necesario.'),
    _LATAM_STRONG: EMBASSY('Visado necesario para la mayoría de pasaportes latinoamericanos.'),
    _LATAM_WEAK:   EMBASSY('Visado necesario.'),
    'IN':          EMBASSY('Visado necesario.'),
    'CN':          EMBASSY('Visado necesario.'),
    _GULF:         { needed: false, days: 180, eVisa: true, cost: '7 CAD', info: 'eTA necesaria: 7 CAD.' },
    _AFRICA:       EMBASSY('Visado necesario para la mayoría de pasaportes africanos.'),
    'ZA':          EMBASSY('Visado necesario.'),
    _default:      EMBASSY('Visado necesario — tramitar en ircc.canada.ca.'),
  },

  // ── Australia ─────────────────────────────────────────────────────────────
  'AU': {
    _SCHENGEN:     EVISA('20 AUD', 90, 'eVisitor (subclase 651): gratuita para ciudadanos UE. ETA (subclase 601): 20 AUD para algunos. Tramitar en immi.homeaffairs.gov.au.', 'https://immi.homeaffairs.gov.au'),
    'GB':          EVISA('0 AUD', 90, 'eVisitor gratuita para ciudadanos UK.'),
    'US':          EVISA('20 AUD', 90, 'ETA: 20 AUD.'),
    'CA':          EVISA('20 AUD', 90, 'ETA: 20 AUD.'),
    'NZ':          FREE(0, 'Libre acceso — los neozelandeses pueden vivir y trabajar en Australia sin visado.'),
    'JP':          EVISA('20 AUD', 90, 'ETA: 20 AUD.'),
    'KR':          EVISA('20 AUD', 90, 'ETA: 20 AUD.'),
    'SG':          EVISA('20 AUD', 90, 'ETA: 20 AUD.'),
    'MY':          EVISA('20 AUD', 90, 'ETA: 20 AUD.'),
    'HK':          EVISA('20 AUD', 90, 'ETA: 20 AUD.'),
    _LATAM_STRONG: EMBASSY('Visado electrónico o de embajada necesario — tramitar en immi.homeaffairs.gov.au.'),
    _LATAM_WEAK:   EMBASSY('Visado necesario.'),
    'IN':          EVISA('150 AUD', 90, 'e-Visa turística: aprox 150 AUD.'),
    'CN':          EVISA('150 AUD', 90, 'e-Visa turística necesaria.'),
    'PK':          EMBASSY('Visado necesario.'),
    _GULF:         EVISA('20 AUD', 90, 'ETA disponible para países del Golfo.'),
    'MA':          EMBASSY('Visado necesario.'),
    'ZA':          EMBASSY('Visado necesario.'),
    _AFRICA:       EMBASSY('Visado necesario para la mayoría de pasaportes africanos.'),
    _default:      EMBASSY('Visado necesario — tramitar en immi.homeaffairs.gov.au.'),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ÁFRICA — DESTINOS
  // ══════════════════════════════════════════════════════════════════════════

  // ── Sudáfrica ─────────────────────────────────────────────────────────────
  'ZA': {
    _SCHENGEN:     FREE(30, 'Sin visado hasta 30 días.'),
    _LATAM_STRONG: FREE(30, 'Sin visado hasta 30 días.'),
    'GT':          FREE(30, 'Sin visado hasta 30 días.'),
    'HN':          FREE(30, 'Sin visado hasta 30 días.'),
    'SV':          FREE(30, 'Sin visado hasta 30 días.'),
    'NI':          FREE(30, 'Sin visado hasta 30 días.'),
    'CU':          FREE(30, 'Sin visado hasta 30 días.'),
    'HT':          FREE(30, 'Sin visado hasta 30 días.'),
    _ANGLOPHONE:   FREE(30, 'Sin visado hasta 30 días.'),
    _ASIA_STRONG:  FREE(30, 'Sin visado hasta 30 días.'),
    'IN':          FREE(30, 'Sin visado hasta 30 días.'),
    'CN':          FREE(30, 'Sin visado hasta 30 días.'),
    'PK':          FREE(30, 'Sin visado hasta 30 días.'),
    _GULF:         FREE(30, 'Sin visado hasta 30 días.'),
    'MA':          FREE(30, 'Sin visado hasta 30 días.'),
    'ZA':          FREE(0, 'Tu país.'),
    'NG':          FREE(30, 'Sin visado hasta 30 días.'),
    'GH':          FREE(30, 'Sin visado hasta 30 días.'),
    'KE':          FREE(30, 'Sin visado hasta 30 días.'),
    'TZ':          FREE(30, 'Sin visado hasta 30 días.'),
    _AFRICA:       FREE(30, 'Sin visado hasta 30 días (SADC y la mayoría de pasaportes africanos).'),
    _default:      FREE(30, 'Sin visado hasta 30 días para la mayoría de pasaportes.'),
  },

  // ── Kenia ─────────────────────────────────────────────────────────────────
  'KE': {
    _SCHENGEN:     EVISA('50 USD', 90, 'E-visa: 50 USD en evisa.go.ke. Tramitar antes del viaje.', 'https://evisa.go.ke'),
    _LATAM_STRONG: EVISA('50 USD', 90, 'E-visa: 50 USD en evisa.go.ke.'),
    _LATAM_WEAK:   EVISA('50 USD', 90, 'E-visa: 50 USD.'),
    _ANGLOPHONE:   EVISA('50 USD', 90, 'E-visa: 50 USD.'),
    _ASIA_STRONG:  EVISA('50 USD', 90, 'E-visa: 50 USD.'),
    'IN':          EVISA('50 USD', 90, 'E-visa: 50 USD.'),
    'CN':          EVISA('50 USD', 90, 'E-visa: 50 USD.'),
    'EAC':         FREE(90, 'Sin visado para ciudadanos de la Comunidad de África Oriental (UG, TZ, RW, BI, SS).'),
    'TZ':          FREE(90, 'Sin visado — EAC.'),
    'UG':          FREE(90, 'Sin visado — EAC.'),
    'RW':          FREE(90, 'Sin visado — EAC.'),
    'ET':          EVISA('50 USD', 90, 'E-visa: 50 USD.'),
    'ZA':          EVISA('50 USD', 90, 'E-visa: 50 USD.'),
    'NG':          EVISA('50 USD', 90, 'E-visa: 50 USD.'),
    _GULF:         EVISA('50 USD', 90, 'E-visa: 50 USD.'),
    'MA':          EVISA('50 USD', 90, 'E-visa: 50 USD.'),
    _AFRICA:       EVISA('50 USD', 90, 'E-visa: 50 USD para la mayoría de pasaportes africanos.'),
    _default:      EVISA('50 USD', 90, 'E-visa necesaria: 50 USD en evisa.go.ke.', 'https://evisa.go.ke'),
  },


  // ══════════════════════════════════════════════════════════════════════════
  // AMERICA LATINA — DESTINOS
  // ══════════════════════════════════════════════════════════════════════════
  'MX': { _SCHENGEN: FREE(180,'Sin visado hasta 180 dias.'), _LATAM_STRONG: FREE(180,'Sin visado hasta 180 dias.'), _LATAM_WEAK: FREE(90,'Sin visado hasta 90 dias.'), 'CU': FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(180,'Sin visado hasta 180 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'IN': FREE(180,'Sin visado hasta 180 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(180,'Sin visado hasta 180 dias.'), 'MA': FREE(90,'Sin visado hasta 90 dias.'), _AFRICA: FREE(30,'Sin visado hasta 30 dias para la mayoria.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria de pasaportes.') },
  'CO': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_WEAK: FREE(90,'Sin visado hasta 90 dias.'), 'CU': FREE(30,'Sin visado hasta 30 dias.'), 'HT': FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'IN': FREE(90,'Sin visado hasta 90 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), 'MA': FREE(90,'Sin visado hasta 90 dias.'), _AFRICA: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'AR': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias — MERCOSUR.'), _LATAM_WEAK: FREE(90,'Sin visado hasta 90 dias.'), 'CU': FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'IN': FREE(90,'Sin visado hasta 90 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), _AFRICA: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'BR': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias — MERCOSUR.'), _LATAM_WEAK: FREE(90,'Sin visado hasta 90 dias.'), 'US': FREE(90,'Sin visado hasta 90 dias (reciprocidad 2024).'), 'GB': FREE(90,'Sin visado hasta 90 dias.'), 'AU': FREE(90,'Sin visado hasta 90 dias.'), 'CU': FREE(30,'Sin visado hasta 30 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'IN': FREE(90,'Sin visado hasta 90 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), _AFRICA: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'CL': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_WEAK: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'IN': FREE(90,'Sin visado hasta 90 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'PE': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias — CAN.'), _LATAM_WEAK: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'IN': FREE(90,'Sin visado hasta 90 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'EC': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_WEAK: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'IN': FREE(90,'Sin visado hasta 90 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(90,'Ecuador: politica de puertas abiertas — sin visado para casi todos.') },
  'BO': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_WEAK: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'IN': FREE(90,'Sin visado hasta 90 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'PY': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias — MERCOSUR.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'UY': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias — MERCOSUR.'), _LATAM_WEAK: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'IN': FREE(90,'Sin visado hasta 90 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'VE': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_WEAK: FREE(90,'Sin visado hasta 90 dias.'), 'CU': FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'CR': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'GT': FREE(90,'Sin visado — CA-4.'), 'HN': FREE(90,'Sin visado — CA-4.'), 'SV': FREE(90,'Sin visado — CA-4.'), 'NI': FREE(90,'Sin visado — CA-4.'), 'CU': FREE(30,'Sin visado hasta 30 dias.'), 'DO': FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'IN': FREE(30,'Sin visado hasta 30 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'PA': { _SCHENGEN: FREE(180,'Sin visado hasta 180 dias.'), _LATAM_STRONG: FREE(180,'Sin visado hasta 180 dias.'), 'GT': FREE(90,'Sin visado hasta 90 dias.'), 'HN': FREE(90,'Sin visado hasta 90 dias.'), 'SV': FREE(90,'Sin visado hasta 90 dias.'), 'NI': FREE(90,'Sin visado hasta 90 dias.'), 'CU': FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(180,'Sin visado hasta 180 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'GT': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'HN': FREE(90,'Sin visado — CA-4.'), 'SV': FREE(90,'Sin visado — CA-4.'), 'NI': FREE(90,'Sin visado — CA-4.'), 'CR': FREE(90,'Sin visado hasta 90 dias.'), 'PA': FREE(90,'Sin visado hasta 90 dias.'), 'MX': FREE(30,'Sin visado hasta 30 dias.'), 'CU': FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'HN': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'GT': FREE(90,'CA-4.'), 'SV': FREE(90,'CA-4.'), 'NI': FREE(90,'CA-4.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'SV': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'GT': FREE(90,'CA-4.'), 'HN': FREE(90,'CA-4.'), 'NI': FREE(90,'CA-4.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'NI': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias. Tarjeta turistica: 10 USD.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'GT': FREE(90,'CA-4.'), 'HN': FREE(90,'CA-4.'), 'SV': FREE(90,'CA-4.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'BZ': { _SCHENGEN: FREE(30,'Sin visado hasta 30 dias.'), _LATAM_STRONG: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'CU': { _SCHENGEN: ON_ARRIVAL('25-80 USD',30,'Tarjeta del turista obligatoria: 25 USD desde Cuba, hasta 80 USD desde exterior. Disponible en aeropuerto o con agencia de viajes.'), _LATAM_STRONG: ON_ARRIVAL('25 USD',30,'Tarjeta del turista: 25 USD en aeropuerto o consulado.'), _LATAM_WEAK: ON_ARRIVAL('25 USD',30,'Tarjeta del turista: 25 USD.'), _ANGLOPHONE: ON_ARRIVAL('25-80 USD',30,'Tarjeta del turista obligatoria. ATENCION ciudadanos EE.UU.: solo categorias autorizadas.'), _ASIA_STRONG: ON_ARRIVAL('25 USD',30,'Tarjeta del turista: 25 USD.'), _GULF: ON_ARRIVAL('25 USD',30,'Tarjeta del turista: 25 USD.'), _AFRICA: ON_ARRIVAL('25 USD',30,'Tarjeta del turista: 25 USD.'), _default: ON_ARRIVAL('25 USD',30,'Tarjeta del turista obligatoria: 25 USD. Disponible en aeropuerto.') },
  'DO': { _SCHENGEN: FREE(30,'Sin visado. Tarjeta turistica incluida en vuelo o 10 USD en aeropuerto.'), _LATAM_STRONG: FREE(30,'Sin visado. Tarjeta turistica: 10 USD.'), _LATAM_WEAK: FREE(30,'Sin visado hasta 30 dias.'), 'CU': FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(30,'Sin visado.'), _ASIA_STRONG: FREE(30,'Sin visado hasta 30 dias.'), 'IN': FREE(30,'Sin visado hasta 30 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'HT': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias. ALERTA: situacion de seguridad muy grave.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_WEAK: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(90,'Sin visado hasta 90 dias. ALERTA: NO VIAJAR segun la mayoria de ministerios de exteriores.') },
  'JM': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(180,'Sin visado hasta 180 dias.'), _default: FREE(30,'Sin visado hasta 30 dias.') },
  'BB': { _SCHENGEN: FREE(180,'Sin visado hasta 180 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(180,'Sin visado hasta 180 dias.'), _default: FREE(30,'Sin visado hasta 30 dias.') },
  'TT': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(30,'Sin visado hasta 30 dias.') },
  'LC': { _SCHENGEN: FREE(42,'Sin visado hasta 42 dias.'), _LATAM_STRONG: FREE(42,'Sin visado hasta 42 dias.'), _ANGLOPHONE: FREE(42,'Sin visado hasta 42 dias.'), _default: FREE(42,'Sin visado hasta 42 dias.') },
  'AG': { _SCHENGEN: FREE(30,'Sin visado hasta 30 dias.'), _LATAM_STRONG: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(180,'Sin visado hasta 180 dias.'), _default: FREE(30,'Sin visado hasta 30 dias.') },
  'GD': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(30,'Sin visado hasta 30 dias.') },
  'DM': { _SCHENGEN: FREE(21,'Sin visado hasta 21 dias.'), _LATAM_STRONG: FREE(21,'Sin visado hasta 21 dias.'), _ANGLOPHONE: FREE(21,'Sin visado hasta 21 dias.'), _default: FREE(21,'Sin visado hasta 21 dias.') },
  'KN': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(30,'Sin visado hasta 30 dias.') },
  'VC': { _SCHENGEN: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias.') },
  'BS': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(30,'Sin visado hasta 30 dias.') },
  'MF': { _SCHENGEN: FREE(0,'Territorio frances — libre circulacion UE.'), _default: FREE(90,'Sin visado hasta 90 dias.') },
  'MQ': { _SCHENGEN: FREE(0,'Departamento frances — libre circulacion UE.'), _default: FREE(90,'Sin visado hasta 90 dias.') },
  'GP': { _SCHENGEN: FREE(0,'Departamento frances — libre circulacion UE.'), _default: FREE(90,'Sin visado hasta 90 dias.') },
  'SX': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias — politica holandesa.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(90,'Sin visado hasta 90 dias.') },
  'AW': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(30,'Sin visado hasta 30 dias.') },
  'CW': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(30,'Sin visado hasta 30 dias.') },
  'SA': { _SCHENGEN: EVISA('130 USD',90,'E-visa turistica: 130 USD en visitsaudi.com. Incluye seguro medico.','https://www.visitsaudi.com'), _LATAM_STRONG: EVISA('130 USD',90,'E-visa turistica: 130 USD.'), _LATAM_WEAK: EVISA('130 USD',90,'E-visa turistica: 130 USD.'), _ANGLOPHONE: EVISA('130 USD',90,'E-visa turistica: 130 USD.'), _ASIA_STRONG: EVISA('130 USD',90,'E-visa turistica: 130 USD.'), 'PK': FREE(90,'Sin visado hasta 90 dias (acuerdo especial).'), _GULF: FREE(90,'Sin visado — CCG.'), 'EG': FREE(90,'Sin visado hasta 90 dias.'), 'MA': EVISA('130 USD',90,'E-visa turistica: 130 USD.'), _AFRICA: EVISA('130 USD',90,'E-visa turistica: 130 USD.'), _default: EVISA('130 USD',90,'E-visa turistica: 130 USD en visitsaudi.com.','https://www.visitsaudi.com') },
  'QA': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_WEAK: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), 'IN': FREE(30,'Sin visado hasta 30 dias.'), 'PK': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(90,'Sin visado — CCG.'), 'MA': FREE(90,'Sin visado hasta 90 dias.'), _AFRICA: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'JO': { _SCHENGEN: ON_ARRIVAL('40 JOD',30,'Visa on arrival: 40 JOD. Jordan Pass (visado + Petra): desde 70 JOD — muy recomendable.'), _LATAM_STRONG: ON_ARRIVAL('40 JOD',30,'Visa on arrival: 40 JOD o Jordan Pass desde 70 JOD.'), _ANGLOPHONE: ON_ARRIVAL('40 JOD',30,'Visa on arrival: 40 JOD.'), _ASIA_STRONG: FREE(30,'Sin visado hasta 30 dias.'), 'IN': FREE(30,'Sin visado hasta 30 dias.'), 'PK': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(90,'Sin visado — acuerdo arabe.'), 'MA': FREE(90,'Sin visado hasta 90 dias.'), 'EG': FREE(90,'Sin visado hasta 90 dias.'), _AFRICA: ON_ARRIVAL('40 JOD',30,'Visa on arrival: 40 JOD.'), _default: ON_ARRIVAL('40 JOD',30,'Visa on arrival: 40 JOD o Jordan Pass (incluye visado + Petra).') },
  'IL': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias. Verifica situacion de seguridad — conflicto activo en Gaza.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_WEAK: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), 'CU': EMBASSY('Relaciones diplomaticas complicadas — verificar.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'PK': EMBASSY('Pakistan no reconoce Israel — acceso imposible.'), 'AE': FREE(30,'Sin visado — Acuerdos de Abraham 2020.'), 'BH': FREE(30,'Sin visado — Acuerdos de Abraham 2020.'), 'MA': FREE(30,'Sin visado — Acuerdos de Abraham 2020.'), 'JO': FREE(30,'Sin visado — Tratado de paz 1994.'), 'EG': FREE(30,'Sin visado — Tratado de paz 1979.'), _GULF: EMBASSY('Verificar por pais — varios paises del Golfo no reconocen Israel.'), _AFRICA: EMBASSY('Verificar por pais — muchos paises africanos no reconocen Israel.'), _default: EMBASSY('Verificar en embajada israeli — muchos paises requieren visado.') },
  'MA': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_WEAK: FREE(90,'Sin visado hasta 90 dias.'), 'CU': FREE(90,'Sin visado hasta 90 dias.'), 'HT': FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'IN': FREE(90,'Sin visado hasta 90 dias.'), 'CN': FREE(90,'Sin visado hasta 90 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), 'ZA': FREE(90,'Sin visado hasta 90 dias.'), 'NG': FREE(90,'Sin visado hasta 90 dias.'), 'SN': FREE(90,'Sin visado hasta 90 dias.'), _AFRICA: FREE(90,'Sin visado hasta 90 dias para la mayoria de paises africanos.'), _default: FREE(90,'Sin visado hasta 90 dias para la mayoria de pasaportes.') },
  'TZ': { _SCHENGEN: EVISA('50 USD',90,'E-visa: 50 USD en eservices.immigration.go.tz.','https://eservices.immigration.go.tz'), _LATAM_STRONG: EVISA('50 USD',90,'E-visa: 50 USD.'), _LATAM_WEAK: EVISA('50 USD',90,'E-visa: 50 USD.'), _ANGLOPHONE: EVISA('50 USD',90,'E-visa: 50 USD.'), _ASIA_STRONG: EVISA('50 USD',90,'E-visa: 50 USD.'), 'IN': EVISA('50 USD',90,'E-visa: 50 USD.'), 'CN': EVISA('50 USD',90,'E-visa: 50 USD.'), 'KE': FREE(90,'Sin visado — EAC.'), 'UG': FREE(90,'Sin visado — EAC.'), 'RW': FREE(90,'Sin visado — EAC.'), 'ZA': EVISA('50 USD',90,'E-visa: 50 USD.'), _GULF: EVISA('50 USD',90,'E-visa: 50 USD.'), _AFRICA: EVISA('50 USD',90,'E-visa: 50 USD para la mayoria.'), _default: EVISA('50 USD',90,'E-visa: 50 USD en eservices.immigration.go.tz.','https://eservices.immigration.go.tz') },
  'ET': { _SCHENGEN: EVISA('52 USD',30,'E-visa: 52 USD en evisa.gov.et.','https://www.evisa.gov.et'), _LATAM_STRONG: EVISA('52 USD',30,'E-visa: 52 USD.'), _ANGLOPHONE: EVISA('52 USD',30,'E-visa: 52 USD.'), _ASIA_STRONG: EVISA('52 USD',30,'E-visa: 52 USD.'), 'IN': EVISA('52 USD',30,'E-visa: 52 USD.'), 'CN': EVISA('52 USD',30,'E-visa: 52 USD.'), _GULF: EVISA('52 USD',30,'E-visa: 52 USD.'), 'ZA': EVISA('52 USD',30,'E-visa: 52 USD.'), _AFRICA: EVISA('52 USD',30,'E-visa: 52 USD para la mayoria.'), _default: EVISA('52 USD',30,'E-visa obligatoria: 52 USD en evisa.gov.et.','https://www.evisa.gov.et') },
  'RW': { _SCHENGEN: EVISA('50 USD',30,'E-visa: 50 USD en irembo.gov.rw o visa on arrival.','https://irembo.gov.rw'), _LATAM_STRONG: EVISA('50 USD',30,'E-visa: 50 USD.'), _ANGLOPHONE: EVISA('50 USD',30,'E-visa: 50 USD.'), 'KE': FREE(90,'Sin visado — EAC.'), 'UG': FREE(90,'Sin visado — EAC.'), 'TZ': FREE(90,'Sin visado — EAC.'), 'ZA': FREE(30,'Sin visado hasta 30 dias.'), _AFRICA: FREE(30,'Rwanda: politica visa-free para casi todos los pasaportes africanos.'), 'IN': FREE(30,'Sin visado hasta 30 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: EVISA('50 USD',30,'E-visa: 50 USD.'), _default: EVISA('50 USD',30,'E-visa: 50 USD en irembo.gov.rw.','https://irembo.gov.rw') },
  'NG': { _SCHENGEN: EVISA('50 USD',90,'E-visa en immigration.gov.ng.','https://immigration.gov.ng'), _LATAM_STRONG: EVISA('50 USD',90,'E-visa: 50 USD.'), _ANGLOPHONE: EVISA('50 USD',90,'E-visa: 50 USD.'), _ASIA_STRONG: EVISA('50 USD',90,'E-visa: 50 USD.'), 'IN': EVISA('50 USD',90,'E-visa: 50 USD.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), 'GH': FREE(90,'Sin visado — ECOWAS.'), 'SN': FREE(90,'Sin visado — ECOWAS.'), 'CI': FREE(90,'Sin visado — ECOWAS.'), 'CM': FREE(90,'Sin visado hasta 90 dias.'), _GULF: EVISA('50 USD',90,'E-visa: 50 USD.'), _AFRICA: FREE(90,'Sin visado para pasaportes ECOWAS. Otros: verificar.'), _default: EVISA('50 USD',90,'E-visa en immigration.gov.ng.','https://immigration.gov.ng') },
  'GH': { _SCHENGEN: EVISA('150 USD',60,'E-visa en ghanaimmigration.gov.gh.','https://ghanaimmigration.gov.gh'), _LATAM_STRONG: EVISA('150 USD',60,'E-visa: 150 USD.'), _ANGLOPHONE: EVISA('150 USD',60,'E-visa necesaria.'), 'NG': FREE(90,'Sin visado — ECOWAS.'), 'SN': FREE(90,'Sin visado — ECOWAS.'), 'CI': FREE(90,'Sin visado — ECOWAS.'), _AFRICA: FREE(90,'Sin visado para pasaportes ECOWAS. Otros: e-visa.'), 'IN': EVISA('150 USD',60,'E-visa necesaria.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: EVISA('150 USD',60,'E-visa necesaria.'), _default: EVISA('150 USD',60,'E-visa en ghanaimmigration.gov.gh.','https://ghanaimmigration.gov.gh') },
  'NZ': { _SCHENGEN: EVISA('23 NZD',90,'NZeTA obligatoria: 23 NZD en immigration.govt.nz. Tramitar antes del vuelo.','https://www.immigration.govt.nz'), 'GB': EVISA('23 NZD',90,'NZeTA: 23 NZD.','https://www.immigration.govt.nz'), 'US': EVISA('23 NZD',90,'NZeTA: 23 NZD.'), 'CA': EVISA('23 NZD',90,'NZeTA: 23 NZD.'), 'AU': FREE(0,'Libre acceso para ciudadanos australianos.'), _ASIA_STRONG: EVISA('23 NZD',90,'NZeTA: 23 NZD.'), _LATAM_STRONG: EMBASSY('Visado necesario — tramitar en immigration.govt.nz.'), _LATAM_WEAK: EMBASSY('Visado necesario.'), 'IN': EMBASSY('Visado necesario.'), 'CN': EMBASSY('Visado necesario.'), _GULF: EMBASSY('Visado necesario para la mayoria.'), _AFRICA: EMBASSY('Visado necesario para la mayoria de pasaportes africanos.'), _default: EMBASSY('Visado necesario — tramitar en immigration.govt.nz.') },
  'FJ': { _SCHENGEN: FREE(120,'Sin visado hasta 120 dias.'), _LATAM_STRONG: FREE(120,'Sin visado hasta 120 dias.'), _LATAM_WEAK: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(120,'Sin visado hasta 120 dias.'), _ASIA_STRONG: FREE(120,'Sin visado hasta 120 dias.'), 'IN': FREE(30,'Sin visado hasta 30 dias.'), 'CN': FREE(120,'Sin visado hasta 120 dias.'), _GULF: FREE(120,'Sin visado hasta 120 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'PF': { _SCHENGEN: FREE(0,'Territorio frances — libre circulacion UE.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(90,'Sin visado hasta 90 dias para la mayoria.') },
  'GE': { _SCHENGEN: FREE(365,'Sin visado hasta 365 dias. Georgia tiene una de las politicas mas abiertas del mundo.'), _LATAM_STRONG: FREE(365,'Sin visado hasta 365 dias.'), _LATAM_WEAK: FREE(365,'Sin visado hasta 365 dias.'), _ANGLOPHONE: FREE(365,'Sin visado hasta 365 dias.'), _ASIA_STRONG: FREE(365,'Sin visado hasta 365 dias.'), 'IN': FREE(365,'Sin visado hasta 365 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), 'PK': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(365,'Sin visado hasta 365 dias.'), _AFRICA: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'AM': { _SCHENGEN: FREE(180,'Sin visado hasta 180 dias.'), _LATAM_STRONG: FREE(180,'Sin visado hasta 180 dias.'), _ANGLOPHONE: FREE(180,'Sin visado hasta 180 dias.'), _ASIA_STRONG: FREE(180,'Sin visado hasta 180 dias.'), 'IN': FREE(180,'Sin visado hasta 180 dias.'), 'CN': FREE(90,'Sin visado hasta 90 dias.'), _GULF: FREE(180,'Sin visado hasta 180 dias.'), _default: FREE(90,'Sin visado hasta 90 dias para la mayoria.') },
  'AZ': { _SCHENGEN: EVISA('23 USD',30,'E-visa: 23 USD en evisa.gov.az. Tramite sencillo y rapido.','https://evisa.gov.az'), _LATAM_STRONG: EVISA('23 USD',30,'E-visa: 23 USD.'), _LATAM_WEAK: EVISA('23 USD',30,'E-visa: 23 USD.'), _ANGLOPHONE: EVISA('23 USD',30,'E-visa: 23 USD.'), _ASIA_STRONG: EVISA('23 USD',30,'E-visa: 23 USD.'), 'IN': EVISA('23 USD',30,'E-visa: 23 USD.'), 'CN': EVISA('23 USD',30,'E-visa: 23 USD.'), _GULF: FREE(30,'Sin visado hasta 30 dias.'), 'MA': EVISA('23 USD',30,'E-visa: 23 USD.'), _AFRICA: EVISA('23 USD',30,'E-visa: 23 USD.'), _default: EVISA('23 USD',30,'E-visa: 23 USD en evisa.gov.az.','https://evisa.gov.az') },
  'UZ': { _SCHENGEN: FREE(30,'Sin visado hasta 30 dias.'), _LATAM_STRONG: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(30,'Sin visado hasta 30 dias.'), _ASIA_STRONG: FREE(30,'Sin visado hasta 30 dias.'), 'IN': FREE(30,'Sin visado hasta 30 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },
  'KZ': { _SCHENGEN: FREE(30,'Sin visado hasta 30 dias.'), _LATAM_STRONG: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(30,'Sin visado hasta 30 dias.'), 'IN': FREE(30,'Sin visado hasta 30 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria.') },



  // ══════════════════════════════════════════════════════════════════════════
  // AFRICA OCCIDENTAL — DESTINOS
  // ══════════════════════════════════════════════════════════════════════════
  'SN': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_WEAK: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'IN': FREE(90,'Sin visado hasta 90 dias.'), 'CN': FREE(90,'Sin visado hasta 90 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), _AFRICA: FREE(90,'Sin visado hasta 90 dias para pasaportes ECOWAS y la mayoria africanos.'), _default: FREE(90,'Sin visado hasta 90 dias para la mayoria de pasaportes.') },
  'CM': { _SCHENGEN: EMBASSY('Visado necesario — tramitar en embajada camerunesa.'), _LATAM_STRONG: EMBASSY('Visado necesario.'), _ANGLOPHONE: EMBASSY('Visado necesario.'), 'NG': FREE(90,'Sin visado hasta 90 dias.'), 'GA': FREE(90,'Sin visado hasta 90 dias.'), 'CF': FREE(90,'Sin visado hasta 90 dias.'), _AFRICA: EMBASSY('Visado necesario para la mayoria de pasaportes no africanos o fuera de CEMAC.'), _default: EMBASSY('Visado necesario — tramitar en embajada de Camerun.') },
  'CI': { _SCHENGEN: EMBASSY('Visado necesario — e-visa disponible en snedai.ci.'), _LATAM_STRONG: EMBASSY('Visado necesario.'), _ANGLOPHONE: EMBASSY('Visado necesario.'), _AFRICA: FREE(90,'Sin visado para pasaportes ECOWAS.'), _default: EMBASSY('Visado necesario — e-visa en snedai.ci.') },
  'GA': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias — Gabon elimino visado para mayoria de pasaportes.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), _AFRICA: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(90,'Sin visado hasta 90 dias para la mayoria de pasaportes.') },
  'BJ': { _SCHENGEN: ON_ARRIVAL('50 USD',30,'Visa on arrival: 50 USD.'), _LATAM_STRONG: ON_ARRIVAL('50 USD',30,'Visa on arrival: 50 USD.'), _ANGLOPHONE: ON_ARRIVAL('50 USD',30,'Visa on arrival: 50 USD.'), _AFRICA: FREE(90,'Sin visado para pasaportes ECOWAS.'), _default: ON_ARRIVAL('50 USD',30,'Visa on arrival: 50 USD en el aeropuerto.') },
  'BF': { _SCHENGEN: EMBASSY('Visado necesario. Situacion de seguridad muy grave — NO VIAJAR.'), _default: EMBASSY('Visado necesario. NO VIAJAR — conflicto activo.') },
  'ML': { _SCHENGEN: EMBASSY('Visado necesario. NO VIAJAR — conflicto yihadista activo.'), _default: EMBASSY('Visado necesario. NO VIAJAR.') },
  'NE': { _SCHENGEN: EMBASSY('Visado necesario. NO VIAJAR — inestabilidad grave tras golpe de estado 2023.'), _default: EMBASSY('Visado necesario. NO VIAJAR.') },
  'TD': { _SCHENGEN: EMBASSY('Visado necesario — situacion de seguridad grave.'), _default: EMBASSY('Visado necesario.') },
  'GN': { _SCHENGEN: EMBASSY('Visado necesario.'), _LATAM_STRONG: EMBASSY('Visado necesario.'), _AFRICA: FREE(90,'Sin visado para pasaportes ECOWAS.'), _default: EMBASSY('Visado necesario.') },
  'GQ': { _SCHENGEN: EMBASSY('Visado necesario.'), _LATAM_STRONG: EMBASSY('Visado necesario.'), _AFRICA: EMBASSY('Visado necesario para la mayoria.'), _default: EMBASSY('Visado necesario.') },
  'GW': { _SCHENGEN: ON_ARRIVAL('45 USD',30,'Visa on arrival disponible.'), _LATAM_STRONG: ON_ARRIVAL('45 USD',30,'Visa on arrival.'), _AFRICA: FREE(90,'Sin visado para pasaportes ECOWAS.'), _default: ON_ARRIVAL('45 USD',30,'Visa on arrival.') },
  'LR': { _SCHENGEN: EVISA('70 USD',30,'E-visa en immigration.gov.lr.','https://immigration.gov.lr'), _LATAM_STRONG: EVISA('70 USD',30,'E-visa.'), _AFRICA: FREE(90,'Sin visado para pasaportes ECOWAS.'), _default: EVISA('70 USD',30,'E-visa en immigration.gov.lr.') },
  'SL': { _SCHENGEN: EVISA('80 USD',30,'E-visa en evisa.sl.','https://evisa.sl'), _LATAM_STRONG: EVISA('80 USD',30,'E-visa.'), _AFRICA: FREE(90,'Sin visado para pasaportes ECOWAS.'), _default: EVISA('80 USD',30,'E-visa en evisa.sl.') },
  'TG': { _SCHENGEN: FREE(0,'E-visa gratuita obligatoria en evisa.gouv.tg antes del viaje.'), _LATAM_STRONG: FREE(0,'E-visa gratuita.'), _ANGLOPHONE: FREE(0,'E-visa gratuita.'), _AFRICA: FREE(90,'Sin visado para pasaportes ECOWAS.'), _default: FREE(0,'E-visa gratuita tramitable en evisa.gouv.tg.') },
  'GM': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _AFRICA: FREE(90,'Sin visado para pasaportes ECOWAS y la mayoria africanos.'), _default: FREE(90,'Sin visado hasta 90 dias para la mayoria de pasaportes.') },
  'CV': { _SCHENGEN: FREE(0,'EASE (registro electronico gratuito) obligatorio en ease.gov.cv — no es visado.'), _LATAM_STRONG: FREE(0,'EASE gratuito obligatorio.'), _LATAM_WEAK: FREE(0,'EASE gratuito obligatorio.'), _ANGLOPHONE: FREE(0,'EASE gratuito obligatorio.'), _AFRICA: FREE(0,'EASE gratuito obligatorio.'), _default: FREE(0,'Registro EASE gratuito obligatorio en ease.gov.cv. Sin visado.') },
  'ST': { _SCHENGEN: FREE(0,'Sin visado — visado electronico gratuito en arrival.gov.st.'), _LATAM_STRONG: FREE(0,'Visado electronico gratuito.'), _ANGLOPHONE: FREE(0,'Visado electronico gratuito.'), _AFRICA: FREE(0,'Visado electronico gratuito.'), _default: FREE(0,'Visado electronico gratuito en arrival.gov.st.') },

  // ══════════════════════════════════════════════════════════════════════════
  // AFRICA CENTRAL — DESTINOS
  // ══════════════════════════════════════════════════════════════════════════
  'CG': { _SCHENGEN: EMBASSY('Visado necesario.'), _LATAM_STRONG: EMBASSY('Visado necesario.'), _AFRICA: EMBASSY('Visado necesario para la mayoria. CEMAC libre entre paises miembros.'), _default: EMBASSY('Visado necesario.') },
  'CD': { _SCHENGEN: EMBASSY('Visado necesario — tramitar en embajada de la RDC (Kinshasa).'), _LATAM_STRONG: EMBASSY('Visado necesario.'), _ANGLOPHONE: EMBASSY('Visado necesario.'), _AFRICA: EMBASSY('Visado necesario para la mayoria.'), _default: EMBASSY('Visado necesario.') },
  'CF': { _SCHENGEN: EMBASSY('Visado necesario. Situacion de seguridad muy grave.'), _default: EMBASSY('Visado necesario. NO VIAJAR — conflicto activo.') },
  'BI': { _SCHENGEN: ON_ARRIVAL('90 USD',30,'Visa on arrival: 90 USD.'), _LATAM_STRONG: ON_ARRIVAL('90 USD',30,'Visa on arrival: 90 USD.'), _ANGLOPHONE: ON_ARRIVAL('90 USD',30,'Visa on arrival: 90 USD.'), 'KE': FREE(90,'Sin visado — EAC.'), 'TZ': FREE(90,'Sin visado — EAC.'), 'UG': FREE(90,'Sin visado — EAC.'), _AFRICA: ON_ARRIVAL('90 USD',30,'Visa on arrival: 90 USD.'), _default: ON_ARRIVAL('90 USD',30,'Visa on arrival: 90 USD.') },

  // ══════════════════════════════════════════════════════════════════════════
  // AFRICA AUSTRAL E ISLAS — DESTINOS
  // ══════════════════════════════════════════════════════════════════════════
  'MW': { _SCHENGEN: FREE(30,'Sin visado hasta 30 dias.'), _LATAM_STRONG: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(30,'Sin visado hasta 30 dias.'), 'ZA': FREE(30,'Sin visado hasta 30 dias.'), 'ZM': FREE(30,'Sin visado hasta 30 dias.'), 'MZ': FREE(30,'Sin visado hasta 30 dias.'), _AFRICA: FREE(30,'Sin visado hasta 30 dias para la mayoria de pasaportes africanos.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria de pasaportes.') },
  'LS': { _SCHENGEN: FREE(30,'Sin visado hasta 30 dias.'), _LATAM_STRONG: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(30,'Sin visado hasta 30 dias.'), _AFRICA: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria de pasaportes.') },
  'SZ': { _SCHENGEN: FREE(30,'Sin visado hasta 30 dias.'), _LATAM_STRONG: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(30,'Sin visado hasta 30 dias.'), _AFRICA: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria de pasaportes.') },
  'KM': { _SCHENGEN: ON_ARRIVAL('30 USD',45,'Visa on arrival: 30 USD.'), _LATAM_STRONG: ON_ARRIVAL('30 USD',45,'Visa on arrival: 30 USD.'), _AFRICA: ON_ARRIVAL('30 USD',45,'Visa on arrival.'), _default: ON_ARRIVAL('30 USD',45,'Visa on arrival: 30 USD.') },
  'SC': { _SCHENGEN: FREE(30,'Sin visado — Travel Authorization electronica gratuita obligatoria.'), _LATAM_STRONG: FREE(30,'Travel Authorization gratuita obligatoria.'), _ANGLOPHONE: FREE(30,'Travel Authorization gratuita.'), _ASIA_STRONG: FREE(30,'Travel Authorization gratuita.'), _GULF: FREE(30,'Travel Authorization gratuita.'), _AFRICA: FREE(30,'Travel Authorization gratuita.'), _default: FREE(30,'Sin visado para todos los pasaportes. Travel Authorization gratuita obligatoria.') },
  'MU': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_WEAK: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'IN': FREE(90,'Sin visado hasta 90 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), 'PK': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), _AFRICA: FREE(90,'Sin visado hasta 90 dias para la mayoria de pasaportes africanos.'), _default: FREE(90,'Sin visado hasta 90 dias para la mayoria de pasaportes.') },
  'MG': { _SCHENGEN: ON_ARRIVAL('35 USD',90,'Visa on arrival: 35 USD para 30 dias, 70 USD para 60 dias.'), _LATAM_STRONG: ON_ARRIVAL('35 USD',30,'Visa on arrival: 35 USD.'), _ANGLOPHONE: ON_ARRIVAL('35 USD',30,'Visa on arrival: 35 USD.'), _AFRICA: ON_ARRIVAL('35 USD',30,'Visa on arrival: 35 USD para la mayoria.'), _default: ON_ARRIVAL('35 USD',30,'Visa on arrival: 35 USD en aeropuerto.') },
  'AO': { _SCHENGEN: EVISA('120 USD',30,'E-visa en portal.smevisa.gov.ao.','https://portal.smevisa.gov.ao'), _LATAM_STRONG: EVISA('120 USD',30,'E-visa: 120 USD.'), _ANGLOPHONE: EVISA('120 USD',30,'E-visa: 120 USD.'), _AFRICA: EVISA('120 USD',30,'E-visa: 120 USD para la mayoria.'), _default: EVISA('120 USD',30,'E-visa en portal.smevisa.gov.ao.','https://portal.smevisa.gov.ao') },
  'MZ': { _SCHENGEN: EVISA('50 USD',30,'E-visa disponible.'), _LATAM_STRONG: EVISA('50 USD',30,'E-visa: 50 USD.'), _ANGLOPHONE: EVISA('50 USD',30,'E-visa: 50 USD.'), 'ZA': FREE(30,'Sin visado hasta 30 dias.'), 'ZM': FREE(30,'Sin visado hasta 30 dias.'), 'TZ': FREE(30,'Sin visado hasta 30 dias.'), _AFRICA: EVISA('50 USD',30,'E-visa: 50 USD para la mayoria.'), _default: EVISA('50 USD',30,'E-visa disponible. Verificar en embajada mozambiquena.') },
  'ZM': { _SCHENGEN: EVISA('50 USD',30,'E-visa o visa on arrival: 50 USD. KAZA Univisa con Zimbabwe.'), _LATAM_STRONG: EVISA('50 USD',30,'E-visa: 50 USD.'), _ANGLOPHONE: EVISA('50 USD',30,'E-visa: 50 USD.'), 'ZW': FREE(30,'Sin visado hasta 30 dias.'), 'BW': FREE(30,'Sin visado hasta 30 dias.'), 'ZA': FREE(30,'Sin visado hasta 30 dias.'), _AFRICA: EVISA('50 USD',30,'E-visa: 50 USD.'), _default: EVISA('50 USD',30,'E-visa: 50 USD. KAZA Univisa (Zambia + Zimbabwe): 50 USD.') },
  'ZW': { _SCHENGEN: EVISA('30-75 USD',30,'E-visa o visa on arrival. KAZA Univisa con Zambia: 50 USD.'), _LATAM_STRONG: EVISA('75 USD',30,'E-visa o visa on arrival: 75 USD.'), _ANGLOPHONE: EVISA('30-75 USD',30,'E-visa disponible.'), 'ZA': FREE(30,'Sin visado hasta 30 dias.'), 'ZM': FREE(30,'Sin visado hasta 30 dias.'), 'BW': FREE(30,'Sin visado hasta 30 dias.'), _AFRICA: EVISA('30-75 USD',30,'E-visa o visa on arrival.'), _default: EVISA('30-75 USD',30,'E-visa o visa on arrival disponible.') },
  'BW': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'IN': FREE(90,'Sin visado hasta 90 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), _AFRICA: FREE(90,'Sin visado hasta 90 dias para SADC y la mayoria africanos.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria de pasaportes.') },
  'NA': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(30,'Sin visado hasta 30 dias.'), 'IN': FREE(30,'Sin visado hasta 30 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(30,'Sin visado hasta 30 dias.'), _AFRICA: FREE(90,'Sin visado hasta 90 dias para SADC y la mayoria africanos.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria de pasaportes.') },

  // ══════════════════════════════════════════════════════════════════════════
  // ORIENTE MEDIO ADICIONAL — DESTINOS
  // ══════════════════════════════════════════════════════════════════════════
  'LB': { _SCHENGEN: FREE(30,'Sin visado hasta 30 dias. ATENCION: situacion de seguridad muy inestable.'), _LATAM_STRONG: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(30,'Sin visado hasta 30 dias.'), 'MA': FREE(30,'Sin visado hasta 30 dias.'), 'EG': FREE(30,'Sin visado hasta 30 dias.'), 'SY': EMBASSY('Relaciones entre Libano y Siria complicadas — verificar.'), _AFRICA: FREE(30,'Sin visado hasta 30 dias para la mayoria.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria. Israelies: entrada prohibida.') },
  'SY': { _SCHENGEN: EMBASSY('Visado muy dificil. NO VIAJAR — conflicto activo aunque reducido.'), _default: EMBASSY('Visado necesario. Verificar situacion antes de viajar.') },
  'IQ': { _SCHENGEN: EMBASSY('Visado necesario. Kurdistan iraqui mas accesible.'), _LATAM_STRONG: EMBASSY('Visado necesario.'), _GULF: FREE(30,'Sin visado hasta 30 dias (mayoria paises del Golfo).'), _default: EMBASSY('Visado necesario — verificar situacion de seguridad.') },
  'IR': { _SCHENGEN: EMBASSY('Visado necesario — tramitar en embajada iranf. Proceso largo. Ciudadanos de EE.UU., UK y Canada: muy dificil.'), _LATAM_STRONG: EMBASSY('Visado necesario.'), _LATAM_WEAK: EMBASSY('Visado necesario.'), 'TR': FREE(30,'Sin visado hasta 30 dias.'), 'AZ': FREE(30,'Sin visado hasta 30 dias.'), 'AM': FREE(30,'Sin visado hasta 30 dias.'), _GULF: EMBASSY('Varios paises del Golfo: restricciones o visado necesario.'), _AFRICA: EMBASSY('Visado necesario para la mayoria.'), _default: EMBASSY('Visado necesario — tramitar en embajada de Iran.') },
  'YE': { _SCHENGEN: EMBASSY('Visado imposible en la practica. NO VIAJAR — guerra civil activa.'), _default: EMBASSY('NO VIAJAR — zona de guerra. Peligro extremo.') },
  'PS': { _SCHENGEN: FREE(90,'Acceso a traves de Israel (Cisjordania) o Egipto (Gaza). Gaza: acceso imposible actualmente.'), _LATAM_STRONG: FREE(90,'Acceso via Israel con mismo visado/exencion que Israel.'), _default: FREE(90,'Mismo regimen que Israel para Cisjordania. Gaza: inaccesible actualmente.') },

  // ══════════════════════════════════════════════════════════════════════════
  // ASIA ADICIONAL — DESTINOS
  // ══════════════════════════════════════════════════════════════════════════
  'BD': { _SCHENGEN: EVISA('51 USD',30,'E-visa en evisa.immigration.gov.bd.','https://evisa.immigration.gov.bd'), _LATAM_STRONG: EVISA('51 USD',30,'E-visa: 51 USD.'), _ANGLOPHONE: EVISA('51 USD',30,'E-visa: 51 USD.'), 'IN': FREE(90,'Sin visado hasta 90 dias (acuerdo bilateral).'), 'MY': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(30,'Sin visado hasta 30 dias.'), _ASIA_STRONG: EVISA('51 USD',30,'E-visa: 51 USD.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _AFRICA: EVISA('51 USD',30,'E-visa: 51 USD.'), _default: EVISA('51 USD',30,'E-visa en evisa.immigration.gov.bd.','https://evisa.immigration.gov.bd') },
  'LK': { _SCHENGEN: EVISA('35 USD',30,'ETA (Electronic Travel Authorization): 35 USD en eta.gov.lk.','https://www.eta.gov.lk'), _LATAM_STRONG: EVISA('35 USD',30,'ETA: 35 USD.'), _LATAM_WEAK: EVISA('35 USD',30,'ETA: 35 USD.'), _ANGLOPHONE: EVISA('35 USD',30,'ETA: 35 USD.'), _ASIA_STRONG: EVISA('20 USD',30,'ETA: 20 USD.'), 'IN': EVISA('20 USD',30,'ETA: 20 USD.'), 'CN': EVISA('20 USD',30,'ETA: 20 USD.'), 'PK': EVISA('20 USD',30,'ETA: 20 USD.'), _GULF: EVISA('35 USD',30,'ETA: 35 USD.'), 'MA': EVISA('35 USD',30,'ETA: 35 USD.'), _AFRICA: EVISA('35 USD',30,'ETA: 35 USD.'), _default: EVISA('35 USD',30,'ETA obligatoria: 35 USD en eta.gov.lk.','https://www.eta.gov.lk') },
  'NP': { _SCHENGEN: ON_ARRIVAL('30-50 USD',30,'Visa on arrival: 15 dias 30 USD, 30 dias 50 USD, 90 dias 125 USD. Tambien e-visa en nepaliport.com.'), _LATAM_STRONG: ON_ARRIVAL('30 USD',15,'Visa on arrival desde 30 USD.'), _LATAM_WEAK: ON_ARRIVAL('30 USD',15,'Visa on arrival desde 30 USD.'), _ANGLOPHONE: ON_ARRIVAL('30-50 USD',30,'Visa on arrival.'), 'IN': FREE(0,'Sin visado ni pasaporte — solo ID.'), 'CN': EMBASSY('Visado necesario.'), _ASIA_STRONG: ON_ARRIVAL('30 USD',15,'Visa on arrival.'), _GULF: ON_ARRIVAL('30 USD',15,'Visa on arrival.'), _AFRICA: ON_ARRIVAL('30 USD',15,'Visa on arrival.'), _default: ON_ARRIVAL('30 USD',15,'Visa on arrival disponible en aeropuerto de Katmandu y pasos fronterizos.') },
  'MM': { _SCHENGEN: EVISA('50 USD',28,'E-visa: 50 USD en evisa.moip.gov.mm. Situacion politica inestable.'), _LATAM_STRONG: EVISA('50 USD',28,'E-visa: 50 USD.'), _ANGLOPHONE: EVISA('50 USD',28,'E-visa: 50 USD.'), _ASIA_STRONG: EVISA('50 USD',28,'E-visa: 50 USD.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), 'TH': FREE(14,'Sin visado hasta 14 dias.'), 'IN': EVISA('50 USD',28,'E-visa: 50 USD.'), _GULF: EVISA('50 USD',28,'E-visa: 50 USD.'), _AFRICA: EVISA('50 USD',28,'E-visa: 50 USD.'), _default: EVISA('50 USD',28,'E-visa: 50 USD en evisa.moip.gov.mm. Verificar situacion politica.') },
  'KH': { _SCHENGEN: EVISA('36 USD',30,'E-visa: 36 USD en evisa.gov.kh. Tambien visa on arrival: 30 USD.','https://www.evisa.gov.kh'), _LATAM_STRONG: EVISA('36 USD',30,'E-visa: 36 USD.'), _LATAM_WEAK: EVISA('36 USD',30,'E-visa o visa on arrival: 30 USD.'), _ANGLOPHONE: EVISA('36 USD',30,'E-visa: 36 USD.'), _ASIA_STRONG: FREE(30,'Sin visado hasta 30 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), 'IN': EVISA('36 USD',30,'E-visa: 36 USD.'), _GULF: EVISA('36 USD',30,'E-visa: 36 USD.'), _AFRICA: EVISA('36 USD',30,'E-visa o visa on arrival: 30 USD.'), _default: EVISA('36 USD',30,'E-visa: 36 USD en evisa.gov.kh o visa on arrival: 30 USD.','https://www.evisa.gov.kh') },
  'BT': { _SCHENGEN: EVISA('200 USD per dia',5,'Solo tours organizados. Tasa de desarrollo sostenible: 100 USD/dia (revisada 2024) + vuelos especiales. Reservar via agencia autorizada.'), _LATAM_STRONG: EVISA('200 USD per dia',5,'Solo tours organizados con agencia autorizada.'), _ANGLOPHONE: EVISA('200 USD per dia',5,'Solo tours organizados.'), 'IN': FREE(0,'Libre acceso para ciudadanos indios (solo ID).'), 'BD': FREE(0,'Libre acceso.'), _default: EVISA('100+ USD per dia',5,'Solo tours organizados — no hay turismo independiente. Reservar en turismobutan.com.') },
  'AF': { _SCHENGEN: EMBASSY('Visado imposible. NO VIAJAR — peligro extremo de vida.'), _default: EMBASSY('NO VIAJAR — pais bajo control taliban.') },
  'TW': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_WEAK: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'IN': FREE(14,'Sin visado hasta 14 dias.'), 'CN': EMBASSY('China continental: Taiwan no permite entrada con pasaporte de la RPC directamente — proceso especial.'), 'PH': FREE(14,'Sin visado hasta 14 dias.'), 'MY': FREE(30,'Sin visado hasta 30 dias.'), 'TH': FREE(30,'Sin visado hasta 30 dias.'), 'VN': FREE(14,'Sin visado hasta 14 dias.'), 'ID': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(30,'Sin visado hasta 30 dias.'), 'MA': FREE(30,'Sin visado hasta 30 dias.'), 'ZA': FREE(30,'Sin visado hasta 30 dias.'), _AFRICA: FREE(30,'Sin visado hasta 30 dias para la mayoria.'), _default: FREE(14,'Sin visado hasta 14 dias para la mayoria de pasaportes.') },
  'KG': { _SCHENGEN: FREE(60,'Sin visado hasta 60 dias.'), _LATAM_STRONG: FREE(60,'Sin visado hasta 60 dias.'), _ANGLOPHONE: FREE(60,'Sin visado hasta 60 dias.'), _ASIA_STRONG: FREE(60,'Sin visado hasta 60 dias.'), 'IN': FREE(30,'Sin visado hasta 30 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria de pasaportes.') },
  'TJ': { _SCHENGEN: EVISA('50 USD',45,'E-visa: 50 USD en evvisa.tj. Incluir GBAO permit si visitas el Pamir.','https://www.evvisa.tj'), _LATAM_STRONG: EVISA('50 USD',45,'E-visa: 50 USD.'), _ANGLOPHONE: EVISA('50 USD',45,'E-visa: 50 USD.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), 'RU': FREE(30,'Sin visado hasta 30 dias.'), _GULF: EVISA('50 USD',45,'E-visa: 50 USD.'), _default: EVISA('50 USD',45,'E-visa en evvisa.tj.','https://www.evvisa.tj') },
  'TM': { _SCHENGEN: EMBASSY('Visado muy dificil — Letter of Invitation necesaria o visa de transito.'), _LATAM_STRONG: EMBASSY('Visado necesario — pais muy cerrado.'), _default: EMBASSY('Visado necesario — uno de los paises mas cerrados del mundo.') },
  'MN': { _SCHENGEN: FREE(30,'Sin visado hasta 30 dias.'), _LATAM_STRONG: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(30,'Sin visado hasta 30 dias.'), _ASIA_STRONG: FREE(30,'Sin visado hasta 30 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), 'RU': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria de pasaportes.') },
  'KP': { _SCHENGEN: EMBASSY('Solo tours organizados — acceso extremadamente restringido. Ciudadanos de EE.UU., Corea del Sur e Israel: prohibido.'), _default: EMBASSY('Solo tours organizados autorizados. La mayoria de pasaportes: prohibido o imposible.') },
  'BN': { _SCHENGEN: FREE(30,'Sin visado hasta 30 dias.'), _LATAM_STRONG: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(30,'Sin visado hasta 30 dias.'), _ASIA_STRONG: FREE(30,'Sin visado hasta 30 dias.'), 'MY': FREE(30,'Sin visado hasta 30 dias.'), 'SG': FREE(30,'Sin visado hasta 30 dias.'), 'ID': FREE(30,'Sin visado hasta 30 dias.'), 'CN': FREE(15,'Sin visado hasta 15 dias.'), 'IN': FREE(14,'Sin visado hasta 14 dias.'), _GULF: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(14,'Sin visado hasta 14 dias para la mayoria de pasaportes.') },

  // ══════════════════════════════════════════════════════════════════════════
  // OCEANIA ADICIONAL — DESTINOS
  // ══════════════════════════════════════════════════════════════════════════
  'SB': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(90,'Sin visado hasta 90 dias para la mayoria de pasaportes.') },
  'VU': { _SCHENGEN: FREE(30,'Sin visado hasta 30 dias.'), _LATAM_STRONG: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(30,'Sin visado hasta 30 dias.'), _ASIA_STRONG: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria de pasaportes.') },
  'WS': { _SCHENGEN: FREE(60,'Sin visado hasta 60 dias.'), _LATAM_STRONG: FREE(60,'Sin visado hasta 60 dias.'), _ANGLOPHONE: FREE(60,'Sin visado hasta 60 dias.'), _ASIA_STRONG: FREE(60,'Sin visado hasta 60 dias.'), _default: FREE(60,'Sin visado hasta 60 dias para la mayoria de pasaportes.') },
  'TO': { _SCHENGEN: FREE(31,'Sin visado hasta 31 dias.'), _LATAM_STRONG: FREE(31,'Sin visado hasta 31 dias.'), _ANGLOPHONE: FREE(31,'Sin visado hasta 31 dias.'), _ASIA_STRONG: FREE(31,'Sin visado hasta 31 dias.'), _default: FREE(31,'Sin visado hasta 31 dias para la mayoria de pasaportes.') },
  'KI': { _SCHENGEN: FREE(30,'Sin visado hasta 30 dias.'), _LATAM_STRONG: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria de pasaportes.') },
  'TV': { _SCHENGEN: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria de pasaportes.') },
  'NR': { _SCHENGEN: ON_ARRIVAL('100 AUD',30,'Visa on arrival: 100 AUD.'), _ANGLOPHONE: ON_ARRIVAL('100 AUD',30,'Visa on arrival: 100 AUD.'), _default: ON_ARRIVAL('100 AUD',30,'Visa on arrival: 100 AUD.') },
  'PW': { _SCHENGEN: FREE(30,'Sin visado hasta 30 dias.'), _LATAM_STRONG: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria de pasaportes.') },
  'FM': { _SCHENGEN: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria de pasaportes.') },
  'MH': { _SCHENGEN: FREE(30,'Sin visado hasta 30 dias.'), _ANGLOPHONE: FREE(30,'Sin visado hasta 30 dias.'), _default: FREE(30,'Sin visado hasta 30 dias para la mayoria de pasaportes.') },
  'CK': { _SCHENGEN: FREE(31,'Sin visado hasta 31 dias.'), _LATAM_STRONG: FREE(31,'Sin visado hasta 31 dias.'), _ANGLOPHONE: FREE(31,'Sin visado hasta 31 dias.'), _default: FREE(31,'Sin visado hasta 31 dias para la mayoria de pasaportes.') },
  'NC': { _SCHENGEN: FREE(0,'Territorio frances — libre circulacion UE.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(90,'Sin visado hasta 90 dias para la mayoria de pasaportes.') },
  'PG': { _SCHENGEN: ON_ARRIVAL('100 USD',60,'Visa on arrival: 100 USD aprox.'), _LATAM_STRONG: ON_ARRIVAL('100 USD',60,'Visa on arrival: 100 USD.'), _ANGLOPHONE: ON_ARRIVAL('100 USD',60,'Visa on arrival: 100 USD.'), _ASIA_STRONG: ON_ARRIVAL('100 USD',60,'Visa on arrival.'), _default: ON_ARRIVAL('100 USD',60,'Visa on arrival disponible en aeropuerto de Port Moresby.') },

  // ══════════════════════════════════════════════════════════════════════════
  // EUROPA ORIENTAL ADICIONAL — DESTINOS
  // ══════════════════════════════════════════════════════════════════════════
  'RU': { _SCHENGEN: EMBASSY('Visado necesario. Desde 2022: relaciones muy tensas, vuelos limitados, tarjetas no funcionan. Revisar situacion.'), _LATAM_STRONG: EMBASSY('Visado necesario.'), _LATAM_WEAK: EMBASSY('Visado necesario.'), _ANGLOPHONE: EMBASSY('Visado necesario.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), 'TR': FREE(60,'Sin visado hasta 60 dias.'), 'AZ': FREE(90,'Sin visado hasta 90 dias.'), 'AM': FREE(90,'Sin visado hasta 90 dias.'), 'GE': FREE(90,'Sin visado hasta 90 dias.'), _GULF: EMBASSY('Visado necesario para la mayoria.'), _AFRICA: EMBASSY('Visado necesario para la mayoria.'), _default: EMBASSY('Visado necesario — situacion diplomatica compleja desde 2022.') },
  'UA': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias. ATENCION: conflicto armado activo — NO VIAJAR.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'GE': FREE(90,'Sin visado hasta 90 dias.'), 'MD': FREE(90,'Sin visado hasta 90 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(90,'Sin visado hasta 90 dias. NO VIAJAR — conflicto armado activo.') },
  'BY': { _SCHENGEN: EMBASSY('Visado necesario. Situacion politica grave — verificar antes de viajar.'), _LATAM_STRONG: EMBASSY('Visado necesario.'), _ANGLOPHONE: EMBASSY('Visado necesario.'), 'RU': FREE(90,'Sin visado.'), _default: EMBASSY('Visado necesario. Situacion politica delicada.') },
  'MD': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'RU': FREE(90,'Sin visado.'), 'UA': FREE(90,'Sin visado.'), 'TR': FREE(90,'Sin visado.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(90,'Sin visado hasta 90 dias para la mayoria de pasaportes.') },
  'XK': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), 'RU': EMBASSY('Visado necesario — Russia no reconoce Kosovo.'), 'RS': EMBASSY('Serbia no reconoce Kosovo — entrada puede ser problematica.'), _default: FREE(90,'Sin visado hasta 90 dias para la mayoria de pasaportes.') },
  'BA': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'TR': FREE(90,'Sin visado hasta 90 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), 'MA': FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(90,'Sin visado hasta 90 dias para la mayoria de pasaportes.') },
  'ME': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), 'IN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), 'MA': FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(90,'Sin visado hasta 90 dias para la mayoria de pasaportes.') },
  'MK': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(90,'Sin visado hasta 90 dias para la mayoria de pasaportes.') },
  'AL': { _SCHENGEN: FREE(0,'Ciudadano UE — libre acceso. No es Schengen.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), 'IN': FREE(30,'Sin visado hasta 30 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(90,'Sin visado hasta 90 dias para la mayoria de pasaportes.') },
  'RS': { _SCHENGEN: FREE(90,'Sin visado hasta 90 dias.'), _LATAM_STRONG: FREE(90,'Sin visado hasta 90 dias.'), _ANGLOPHONE: FREE(90,'Sin visado hasta 90 dias.'), _ASIA_STRONG: FREE(90,'Sin visado hasta 90 dias.'), 'CN': FREE(30,'Sin visado hasta 30 dias.'), 'IN': FREE(90,'Sin visado hasta 90 dias.'), 'TR': FREE(90,'Sin visado hasta 90 dias.'), _GULF: FREE(90,'Sin visado hasta 90 dias.'), 'MA': FREE(90,'Sin visado hasta 90 dias.'), _default: FREE(90,'Sin visado hasta 90 dias para la mayoria de pasaportes.') },

  // ══ EUROPA ADICIONAL ══════════════════════════════════════════════════════

  'TR': { // Turquía
    _SCHENGEN:    { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días en 180. Pasaporte válido 6 meses.', url:null },
    _LATAM_STRONG:{ needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ASIA_STRONG: { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    'IN':         { needed:true,  days:null, eVisa:true, cost:'~15 USD', info:'E-Visa obligatoria. Tramitar en www.evisa.gov.tr', url:'https://www.evisa.gov.tr' },
    'CN':         { needed:false, days:30,  eVisa:false, cost:null, info:'Sin visado hasta 30 días desde 2023.', url:null },
    'PK':         { needed:true,  days:null, eVisa:true, cost:'~25 USD', info:'E-Visa necesaria. Tramitar online.', url:'https://www.evisa.gov.tr' },
    _default:     { needed:true,  days:null, eVisa:true, cost:'~50 USD', info:'E-Visa necesaria para la mayoría. Tramitar en evisa.gov.tr', url:'https://www.evisa.gov.tr' },
  },

  'IS': { // Islandia — Schengen
    _SCHENGEN:    { needed:false, days:0,  eVisa:false, cost:null, info:'Espacio Schengen — libre circulación.', url:null },
    _LATAM_STRONG:{ needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días (área Schengen).', url:null },
    _ANGLOPHONE:  { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ASIA_STRONG: { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _default:     { needed:true,  days:null, eVisa:false, cost:null, info:'Visado Schengen necesario. Tramitar en embajada danesa (representa a Islandia).', url:'https://www.um.dk/en/travel-and-residence/visas-to-denmark' },
  },

  'NO': { // Noruega — Schengen
    _SCHENGEN:    { needed:false, days:0,  eVisa:false, cost:null, info:'Área Schengen — libre circulación.', url:null },
    _LATAM_STRONG:{ needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ASIA_STRONG: { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _default:     { needed:true,  days:null, eVisa:false, cost:null, info:'Visado Schengen necesario. Tramitar en embajada noruega.', url:'https://www.udi.no/en/want-to-apply' },
  },

  'CH': { // Suiza — Schengen
    _SCHENGEN:    { needed:false, days:0,  eVisa:false, cost:null, info:'Área Schengen — libre circulación.', url:null },
    _LATAM_STRONG:{ needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ASIA_STRONG: { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _default:     { needed:true,  days:null, eVisa:false, cost:null, info:'Visado Schengen necesario. Tramitar en embajada suiza.', url:'https://www.sem.admin.ch/sem/en/home/sem/kontakt/kantonale_behoerden/adressen_kantone_und.html' },
  },

  // ══ ASIA ══════════════════════════════════════════════════════════════════

  'TH': { // Tailandia
    _SCHENGEN:    { needed:false, days:60, eVisa:false, cost:null, info:'Sin visado hasta 60 días desde 2024 (extensible a 30 días más).', url:null },
    _LATAM_STRONG:{ needed:false, days:30, eVisa:true,  cost:null, info:'Sin visado hasta 30 días. E-Visa disponible para estancias más largas.', url:'https://www.thaievisa.go.th' },
    _ANGLOPHONE:  { needed:false, days:60, eVisa:false, cost:null, info:'Sin visado hasta 60 días desde 2024.', url:null },
    _ASIA_STRONG: { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días (varía por país).', url:null },
    'IN':         { needed:true,  days:null, eVisa:true, cost:'~35 USD', info:'E-Visa disponible o visado en embajada.', url:'https://www.thaievisa.go.th' },
    'CN':         { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días desde 2023.', url:null },
    _default:     { needed:true,  days:null, eVisa:true, cost:'~35 USD', info:'E-Visa necesaria. Tramitar en thaievisa.go.th', url:'https://www.thaievisa.go.th' },
  },

  'VN': { // Vietnam
    _SCHENGEN:    { needed:false, days:45, eVisa:true,  cost:'~25 USD', info:'Sin visado hasta 45 días (pasaporte de 15 países UE exentos). Resto: e-visa en evisa.xuatnhapcanh.gov.vn', url:'https://evisa.xuatnhapcanh.gov.vn' },
    _LATAM_STRONG:{ needed:true,  days:null, eVisa:true, cost:'~25 USD', info:'E-Visa necesaria. Válida 90 días, estancia hasta 90 días.', url:'https://evisa.xuatnhapcanh.gov.vn' },
    _ANGLOPHONE:  { needed:false, days:45, eVisa:false, cost:null, info:'Sin visado hasta 45 días (EE.UU., UK, Canadá, Australia, NZ).', url:null },
    _ASIA_STRONG: { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días (Japón, Corea, Singapur).', url:null },
    'CN':         { needed:false, days:15, eVisa:false, cost:null, info:'Sin visado hasta 15 días.', url:null },
    'IN':         { needed:true,  days:null, eVisa:true, cost:'~25 USD', info:'E-Visa necesaria.', url:'https://evisa.xuatnhapcanh.gov.vn' },
    _default:     { needed:true,  days:null, eVisa:true, cost:'~25 USD', info:'E-Visa necesaria. Tramitar en evisa.xuatnhapcanh.gov.vn', url:'https://evisa.xuatnhapcanh.gov.vn' },
  },

  'ID': { // Indonesia
    _SCHENGEN:    { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días (Bali y aeropuertos principales). Extensible 30 días más.', url:null },
    _LATAM_STRONG:{ needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días en puntos de entrada autorizados.', url:null },
    _ANGLOPHONE:  { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    'CN':         { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días desde 2023.', url:null },
    'IN':         { needed:true,  days:null, eVisa:true, cost:'~35 USD', info:'Visa on arrival o E-Visa.', url:'https://molina.imigrasi.go.id' },
    _default:     { needed:true,  days:null, eVisa:true, cost:'~35 USD', info:'Visa on arrival disponible en aeropuertos principales (30 días, extensible). O E-Visa previa.', url:'https://molina.imigrasi.go.id' },
  },

  'IN': { // India
    _SCHENGEN:    { needed:true, days:null, eVisa:true, cost:'~25-80 USD', info:'E-Visa obligatoria (eVisa turista 30/90/180 días). Tramitar con mínimo 4 días de antelación.', url:'https://indianvisaonline.gov.in' },
    _LATAM_STRONG:{ needed:true, days:null, eVisa:true, cost:'~25 USD', info:'E-Visa necesaria para la mayoría de LATAM.', url:'https://indianvisaonline.gov.in' },
    _ANGLOPHONE:  { needed:true, days:null, eVisa:true, cost:'~25-80 USD', info:'E-Visa obligatoria. EE.UU./UK/Canadá/Australia: e-Visa 1 año múltiple entrada.', url:'https://indianvisaonline.gov.in' },
    _ASIA_STRONG: { needed:true, days:null, eVisa:true, cost:'~25 USD', info:'E-Visa necesaria (Japón, Corea, Singapur).', url:'https://indianvisaonline.gov.in' },
    'CN':         { needed:true, days:null, eVisa:false, cost:null, info:'Visado necesario. Proceso complejo actualmente. Tramitar en embajada.', url:'https://www.mea.gov.in' },
    'PK':         { needed:true, days:null, eVisa:false, cost:null, info:'Visado necesario. Muy restrictivo. Solo casos especiales.', url:null },
    _default:     { needed:true, days:null, eVisa:true, cost:'~25 USD', info:'E-Visa obligatoria para casi todos. Tramitar en indianvisaonline.gov.in', url:'https://indianvisaonline.gov.in' },
  },

  'CN': { // China
    _SCHENGEN:    { needed:true, days:null, eVisa:false, cost:'~80 EUR', info:'Visado necesario (tipo L turista). Tramitar en embajada/consulado con antelación. EXCEPCIÓN: Tránsito 72h/144h sin visado en algunos aeropuertos.', url:'https://www.visaforchina.cn' },
    _LATAM_STRONG:{ needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días (acuerdo bilateral con varios países LATAM desde 2023-2024).', url:null },
    _ANGLOPHONE:  { needed:false, days:10, eVisa:false, cost:null, info:'Sin visado hasta 10 días para EE.UU. y algunos países desde 2024 (prueba piloto). Verificar vigencia.', url:null },
    'JP':         { needed:false, days:15, eVisa:false, cost:null, info:'Sin visado hasta 15 días desde 2024.', url:null },
    'KR':         { needed:false, days:15, eVisa:false, cost:null, info:'Sin visado hasta 15 días desde 2023.', url:null },
    'SG':         { needed:false, days:15, eVisa:false, cost:null, info:'Sin visado hasta 15 días.', url:null },
    _default:     { needed:true, days:null, eVisa:false, cost:'~80 EUR', info:'Visado tipo L necesario. Tramitar en embajada china. Puede tomar 2-4 semanas.', url:'https://www.visaforchina.cn' },
  },

  'KR': { // Corea del Sur
    _SCHENGEN:    { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _LATAM_STRONG:{ needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ASIA_STRONG: { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    'CN':         { needed:false, days:15, eVisa:false, cost:null, info:'Sin visado hasta 15 días desde 2024.', url:null },
    'IN':         { needed:true,  days:null, eVisa:true, cost:null, info:'K-ETA o visado necesario.', url:'https://www.k-eta.go.kr' },
    _default:     { needed:true,  days:null, eVisa:true, cost:null, info:'K-ETA (autorización electrónica) necesaria para muchos países. Tramitar en k-eta.go.kr', url:'https://www.k-eta.go.kr' },
  },

  'SG': { // Singapur
    _SCHENGEN:    { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días (pasaportes UE).', url:null },
    _LATAM_STRONG:{ needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ASIA_STRONG: { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    'CN':         { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días desde 2023.', url:null },
    'IN':         { needed:true,  days:null, eVisa:true, cost:'~30 SGD', info:'Visado electrónico necesario. Tramitar online.', url:'https://eservices.ica.gov.sg' },
    _default:     { needed:true,  days:null, eVisa:true, cost:'~30 SGD', info:'Visado electrónico necesario. Tramitar en eservices.ica.gov.sg', url:'https://eservices.ica.gov.sg' },
  },

  'MY': { // Malasia
    _SCHENGEN:    { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _LATAM_STRONG:{ needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ASIA_STRONG: { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    'CN':         { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    'IN':         { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    _default:     { needed:true,  days:null, eVisa:true, cost:null, info:'eVisa disponible para muchos países. Tramitar en malaysiavisa.imi.gov.my', url:'https://malaysiavisa.imi.gov.my' },
  },

  'PH': { // Filipinas
    _SCHENGEN:    { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días (extensible en inmigración local).', url:null },
    _LATAM_STRONG:{ needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    'CN':         { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días desde 2023.', url:null },
    'IN':         { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    _default:     { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días para la mayoría de pasaportes. Solo necesitas billete de salida.', url:null },
  },

  'KH': { // Camboya
    _SCHENGEN:    { needed:false, days:30, eVisa:true, cost:'~30 USD', info:'Visa on arrival (30 días) o E-Visa online. Llevar foto pasaporte y efectivo USD.', url:'https://www.evisa.gov.kh' },
    _LATAM_STRONG:{ needed:false, days:30, eVisa:true, cost:'~30 USD', info:'Visa on arrival o E-Visa disponible.', url:'https://www.evisa.gov.kh' },
    _ANGLOPHONE:  { needed:false, days:30, eVisa:true, cost:'~30 USD', info:'Visa on arrival o E-Visa online.', url:'https://www.evisa.gov.kh' },
    _default:     { needed:true,  days:30, eVisa:true, cost:'~30 USD', info:'Visa on arrival (30 USD, 30 días) o E-Visa (evisa.gov.kh). Llevar foto y efectivo USD.', url:'https://www.evisa.gov.kh' },
  },

  'MM': { // Myanmar
    _SCHENGEN:    { needed:true,  days:28, eVisa:true, cost:'~50 USD', info:'E-Visa necesaria (28 días turista). Tramitar en evisa.moip.gov.mm', url:'https://evisa.moip.gov.mm' },
    _LATAM_STRONG:{ needed:true,  days:28, eVisa:true, cost:'~50 USD', info:'E-Visa necesaria.', url:'https://evisa.moip.gov.mm' },
    _ANGLOPHONE:  { needed:true,  days:28, eVisa:true, cost:'~50 USD', info:'E-Visa necesaria.', url:'https://evisa.moip.gov.mm' },
    _ASIA_STRONG: { needed:false, days:14, eVisa:false, cost:null, info:'Sin visado hasta 14 días (Japón, Corea, etc.).', url:null },
    _default:     { needed:true,  days:28, eVisa:true, cost:'~50 USD', info:'E-Visa necesaria. Tramitar en evisa.moip.gov.mm con al menos 2 semanas de antelación.', url:'https://evisa.moip.gov.mm' },
  },

  'LA': { // Laos
    _SCHENGEN:    { needed:false, days:30, eVisa:true, cost:'~35 USD', info:'Visa on arrival (30 días) o E-Visa online. Llevar foto pasaporte y efectivo USD.', url:'https://laoevisa.gov.la' },
    _LATAM_STRONG:{ needed:false, days:30, eVisa:true, cost:'~35 USD', info:'Visa on arrival o E-Visa disponible.', url:'https://laoevisa.gov.la' },
    _ANGLOPHONE:  { needed:false, days:30, eVisa:true, cost:'~35 USD', info:'Visa on arrival o E-Visa online.', url:'https://laoevisa.gov.la' },
    _ASIA_STRONG: { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    _default:     { needed:true,  days:30, eVisa:true, cost:'~35 USD', info:'Visa on arrival (~35 USD) o E-Visa (laoevisa.gov.la). Extensible 30 días.', url:'https://laoevisa.gov.la' },
  },

  'NP': { // Nepal
    _SCHENGEN:    { needed:true, days:90, eVisa:true, cost:'~30-100 USD', info:'Visa on arrival (15/30/90 días) o E-Visa online. Precio según duración.', url:'https://online.nepalimmigration.gov.np' },
    _LATAM_STRONG:{ needed:true, days:90, eVisa:true, cost:'~30-100 USD', info:'Visa on arrival o E-Visa necesaria.', url:'https://online.nepalimmigration.gov.np' },
    _ANGLOPHONE:  { needed:true, days:90, eVisa:true, cost:'~30-100 USD', info:'Visa on arrival o E-Visa. 15 días 30 USD, 30 días 50 USD, 90 días 125 USD.', url:'https://online.nepalimmigration.gov.np' },
    'IN':         { needed:false, days:null, eVisa:false, cost:null, info:'Ciudadanos indios no necesitan visado.', url:null },
    _default:     { needed:true, days:30, eVisa:true, cost:'~50 USD', info:'Visa on arrival o E-Visa en nepalimmigration.gov.np. 30 días es lo más común.', url:'https://online.nepalimmigration.gov.np' },
  },

  'LK': { // Sri Lanka
    _SCHENGEN:    { needed:true, days:30, eVisa:true, cost:'~35 USD', info:'E-Visa obligatoria (ETA). Tramitar en eta.gov.lk antes de viajar.', url:'https://eta.gov.lk' },
    _LATAM_STRONG:{ needed:true, days:30, eVisa:true, cost:'~35 USD', info:'E-Visa (ETA) necesaria.', url:'https://eta.gov.lk' },
    _ANGLOPHONE:  { needed:true, days:30, eVisa:true, cost:'~35 USD', info:'E-Visa (ETA) necesaria.', url:'https://eta.gov.lk' },
    'IN':         { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    _default:     { needed:true, days:30, eVisa:true, cost:'~35 USD', info:'E-Visa (ETA) obligatoria para casi todos. Tramitar en eta.gov.lk', url:'https://eta.gov.lk' },
  },

  'MV': { // Maldivas
    _default:     { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado para todos los pasaportes hasta 30 días. Se obtiene a la llegada. Solo necesitas reserva de hotel y billete de salida.', url:null },
  },

  'BT': { // Bután
    _SCHENGEN:    { needed:true, days:null, eVisa:false, cost:'~200+ USD/día', info:'Visado obligatorio + Tourist Sustainable Development Fee (200 USD/día). Solo con touroperador autorizado.', url:'https://www.tourism.gov.bt' },
    'IN':         { needed:false, days:null, eVisa:false, cost:null, info:'Ciudadanos indios solo necesitan permiso especial.', url:null },
    'BD':         { needed:false, days:null, eVisa:false, cost:null, info:'Ciudadanos bangladesíes solo necesitan permiso especial.', url:null },
    _default:     { needed:true, days:null, eVisa:false, cost:'~200 USD/día', info:'Visado obligatorio + tasa de sostenibilidad (~200 USD/día). Solo con agencia de viajes autorizada en Bután.', url:'https://www.tourism.gov.bt' },
  },

  // ══ ORIENTE MEDIO ════════════════════════════════════════════════════════

  'AE': { // Emiratos Árabes Unidos
    _SCHENGEN:    { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días. Pasaporte con validez mínima 6 meses.', url:null },
    _LATAM_STRONG:{ needed:false, days:30, eVisa:true,  cost:null, info:'Sin visado hasta 30 días a la llegada o E-Visa.', url:'https://icp.gov.ae' },
    _ANGLOPHONE:  { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ASIA_STRONG: { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    'IN':         { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días a la llegada.', url:null },
    'PK':         { needed:true,  days:null, eVisa:true, cost:null, info:'Visado necesario. Tramitar online.', url:'https://icp.gov.ae' },
    _default:     { needed:true,  days:null, eVisa:true, cost:null, info:'E-Visa disponible para muchos países. Tramitar en icp.gov.ae o con aerolínea (Emirates, Etihad sponsorean visas).', url:'https://icp.gov.ae' },
  },

  'SA': { // Arabia Saudí
    _SCHENGEN:    { needed:true, days:90, eVisa:true, cost:'~96 USD', info:'E-Visa turista disponible (90 días, múltiple entrada). Tramitar en visa.visitsaudi.com', url:'https://visa.visitsaudi.com' },
    _LATAM_STRONG:{ needed:true, days:90, eVisa:true, cost:'~96 USD', info:'E-Visa turista disponible.', url:'https://visa.visitsaudi.com' },
    _ANGLOPHONE:  { needed:true, days:90, eVisa:true, cost:'~96 USD', info:'E-Visa turista disponible.', url:'https://visa.visitsaudi.com' },
    _ASIA_STRONG: { needed:true, days:90, eVisa:true, cost:'~96 USD', info:'E-Visa disponible.', url:'https://visa.visitsaudi.com' },
    'IN':         { needed:true, days:30, eVisa:true, cost:'~96 USD', info:'E-Visa disponible.', url:'https://visa.visitsaudi.com' },
    _default:     { needed:true, days:null, eVisa:false, cost:null, info:'Acceso muy restrictivo. Solo peregrinación (Umra/Hajj) o negocios para muchos países. Contactar embajada.', url:'https://visa.visitsaudi.com' },
  },

  'QA': { // Qatar
    _SCHENGEN:    { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _LATAM_STRONG:{ needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días a la llegada.', url:null },
    _ANGLOPHONE:  { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ASIA_STRONG: { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    'IN':         { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días a la llegada.', url:null },
    _default:     { needed:true,  days:null, eVisa:true, cost:null, info:'E-Visa disponible para muchos países. Tramitar en portal.moi.gov.qa', url:'https://portal.moi.gov.qa' },
  },

  'JO': { // Jordania
    _SCHENGEN:    { needed:false, days:30, eVisa:true, cost:'~35 JOD', info:'Visado a la llegada (~35 JOD) o E-Visa online. Jordan Pass combina visado + entradas (recomendado).', url:'https://www.jordanpass.jo' },
    _LATAM_STRONG:{ needed:true,  days:30, eVisa:true, cost:'~35 JOD', info:'Visado a la llegada o E-Visa.', url:'https://www.jordanpass.jo' },
    _ANGLOPHONE:  { needed:false, days:30, eVisa:true, cost:'~35 JOD', info:'Visado a la llegada o Jordan Pass (recomendado).', url:'https://www.jordanpass.jo' },
    _default:     { needed:true,  days:30, eVisa:true, cost:'~35 JOD', info:'Visado a la llegada (35 JOD) o Jordan Pass (39 USD, incluye Petra y Wadi Rum). Evita la cola.', url:'https://www.jordanpass.jo' },
  },

  'IL': { // Israel
    _SCHENGEN:    { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días. Atención: sellos de Israel pueden causar problemas en países árabes.', url:null },
    _LATAM_STRONG:{ needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ASIA_STRONG: { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    'IN':         { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    'CN':         { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días desde 2024.', url:null },
    _default:     { needed:true,  days:null, eVisa:false, cost:null, info:'Visado necesario. Algunos países árabes y musulmanes tienen restricciones. Consultar embajada israelí.', url:'https://embassies.gov.il' },
  },

  'IR': { // Irán
    _SCHENGEN:    { needed:true, days:30, eVisa:true, cost:'~75 USD', info:'E-Visa disponible (excepto ciudadanos de EE.UU., UK, Canadá). Tramitar en evisairan.ir', url:'https://evisairan.ir' },
    _LATAM_STRONG:{ needed:true, days:30, eVisa:true, cost:'~75 USD', info:'E-Visa disponible.', url:'https://evisairan.ir' },
    'US':         { needed:true, days:null, eVisa:false, cost:null, info:'Visado extremadamente difícil de obtener. Solo con guía local. Consultar embajada.', url:null },
    'GB':         { needed:true, days:null, eVisa:false, cost:null, info:'Visado difícil. Requiere guía local. Consultar embajada.', url:null },
    'CA':         { needed:true, days:null, eVisa:false, cost:null, info:'Visado difícil. Requiere guía local. Consultar embajada.', url:null },
    _default:     { needed:true, days:30, eVisa:true, cost:'~75 USD', info:'E-Visa disponible para muchos países en evisairan.ir. Solo con circuito organizado o guía local para algunos.', url:'https://evisairan.ir' },
  },

  // ══ AFRICA ═══════════════════════════════════════════════════════════════

  'ZA': { // Sudáfrica
    _SCHENGEN:    { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días. Pasaporte con 2 páginas en blanco y 30 días de validez mínimos.', url:null },
    _LATAM_STRONG:{ needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ASIA_STRONG: { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    'IN':         { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    'CN':         { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    _default:     { needed:true,  days:null, eVisa:false, cost:null, info:'Visado necesario. Tramitar en embajada sudafricana. Algunos países africanos exentos.', url:'https://www.dha.gov.za' },
  },

  'KE': { // Kenia
    _SCHENGEN:    { needed:true, days:90, eVisa:true, cost:'~51 USD', info:'E-Visa obligatoria (eTa). Tramitar en etakenya.go.ke antes de viajar.', url:'https://etakenya.go.ke' },
    _LATAM_STRONG:{ needed:true, days:90, eVisa:true, cost:'~51 USD', info:'E-Visa (eTa) necesaria.', url:'https://etakenya.go.ke' },
    _ANGLOPHONE:  { needed:true, days:90, eVisa:true, cost:'~51 USD', info:'E-Visa (eTa) necesaria.', url:'https://etakenya.go.ke' },
    _AFRICA:      { needed:false, days:null, eVisa:false, cost:null, info:'Sin visado para muchos países africanos (East African Community).', url:null },
    _default:     { needed:true, days:90, eVisa:true, cost:'~51 USD', info:'eTa obligatorio para casi todos. Tramitar en etakenya.go.ke. Rápido y sencillo.', url:'https://etakenya.go.ke' },
  },

  'TZ': { // Tanzania (incluye Zanzíbar)
    _SCHENGEN:    { needed:true, days:90, eVisa:true, cost:'~50 USD', info:'Visa on arrival (~50 USD) o E-Visa previa. Llevar efectivo USD en el aeropuerto.', url:'https://eservices.immigration.go.tz' },
    _LATAM_STRONG:{ needed:true, days:90, eVisa:true, cost:'~50 USD', info:'Visa on arrival o E-Visa.', url:'https://eservices.immigration.go.tz' },
    _ANGLOPHONE:  { needed:true, days:90, eVisa:true, cost:'~50 USD', info:'Visa on arrival o E-Visa.', url:'https://eservices.immigration.go.tz' },
    _AFRICA:      { needed:false, days:null, eVisa:false, cost:null, info:'Sin visado para países de la East African Community.', url:null },
    _default:     { needed:true, days:90, eVisa:true, cost:'~50 USD', info:'Visa on arrival o E-Visa en eservices.immigration.go.tz. Llevar foto pasaporte y USD.', url:'https://eservices.immigration.go.tz' },
  },

  'ET': { // Etiopía
    _SCHENGEN:    { needed:true, days:30, eVisa:true, cost:'~52 USD', info:'E-Visa disponible (30 días turista). Tramitar en evisa.et', url:'https://www.evisa.et' },
    _LATAM_STRONG:{ needed:true, days:30, eVisa:true, cost:'~52 USD', info:'E-Visa disponible.', url:'https://www.evisa.et' },
    _ANGLOPHONE:  { needed:true, days:30, eVisa:true, cost:'~52 USD', info:'E-Visa disponible.', url:'https://www.evisa.et' },
    _AFRICA:      { needed:false, days:null, eVisa:false, cost:null, info:'Sin visado para muchos países africanos.', url:null },
    _default:     { needed:true, days:30, eVisa:true, cost:'~52 USD', info:'E-Visa disponible en evisa.et. Visa on arrival también disponible pero menos recomendado.', url:'https://www.evisa.et' },
  },

  'GH': { // Ghana
    _SCHENGEN:    { needed:true, days:60, eVisa:true, cost:'~100 USD', info:'Visado necesario. E-Visa disponible en portal.ghanaimmigration.org', url:'https://portal.ghanaimmigration.org' },
    _LATAM_STRONG:{ needed:true, days:60, eVisa:true, cost:'~100 USD', info:'E-Visa disponible.', url:'https://portal.ghanaimmigration.org' },
    _ANGLOPHONE:  { needed:true, days:60, eVisa:true, cost:'~100 USD', info:'E-Visa disponible.', url:'https://portal.ghanaimmigration.org' },
    _AFRICA:      { needed:false, days:null, eVisa:false, cost:null, info:'Sin visado para muchos países de ECOWAS.', url:null },
    _default:     { needed:true, days:60, eVisa:true, cost:'~100 USD', info:'E-Visa necesaria. Tramitar en portal.ghanaimmigration.org', url:'https://portal.ghanaimmigration.org' },
  },

  'MA': { // Marruecos
    _SCHENGEN:    { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días. Pasaporte con 6 meses de validez.', url:null },
    _LATAM_STRONG:{ needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ASIA_STRONG: { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    'IN':         { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días desde 2023.', url:null },
    'CN':         { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _default:     { needed:true,  days:null, eVisa:false, cost:null, info:'Visado necesario para la mayoría de países africanos y asiáticos restantes.', url:null },
  },

  'EG': { // Egipto
    _SCHENGEN:    { needed:true, days:30, eVisa:true, cost:'~25 USD', info:'E-Visa disponible (30 días turista) o visado a la llegada en aeropuerto (~25 USD). Tramitar en visa2egypt.com', url:'https://visa2egypt.com' },
    _LATAM_STRONG:{ needed:true, days:30, eVisa:true, cost:'~25 USD', info:'E-Visa o visado a la llegada.', url:'https://visa2egypt.com' },
    _ANGLOPHONE:  { needed:true, days:30, eVisa:true, cost:'~25 USD', info:'E-Visa o visado a la llegada (~25 USD).', url:'https://visa2egypt.com' },
    _ASIA_STRONG: { needed:true, days:30, eVisa:true, cost:'~25 USD', info:'E-Visa o visado a la llegada.', url:'https://visa2egypt.com' },
    'IN':         { needed:true, days:30, eVisa:true, cost:'~25 USD', info:'Visa on arrival disponible.', url:'https://visa2egypt.com' },
    _default:     { needed:true, days:30, eVisa:true, cost:'~25 USD', info:'Visado a la llegada (~25 USD) en aeropuertos egipcios o E-Visa online (visa2egypt.com). Llevar efectivo USD.', url:'https://visa2egypt.com' },
  },

  'TN': { // Túnez
    _SCHENGEN:    { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _LATAM_STRONG:{ needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _default:     { needed:true,  days:null, eVisa:false, cost:null, info:'Visado necesario. Tramitar en embajada tunecina.', url:null },
  },

  'NG': { // Nigeria
    _SCHENGEN:    { needed:true, days:90, eVisa:true, cost:'~100-160 USD', info:'E-Visa disponible (portal.immigration.gov.ng). Proceso puede ser lento.', url:'https://portal.immigration.gov.ng' },
    _LATAM_STRONG:{ needed:true, days:90, eVisa:true, cost:'~100 USD', info:'E-Visa disponible.', url:'https://portal.immigration.gov.ng' },
    _ANGLOPHONE:  { needed:true, days:90, eVisa:true, cost:'~100 USD', info:'E-Visa disponible.', url:'https://portal.immigration.gov.ng' },
    _AFRICA:      { needed:false, days:null, eVisa:false, cost:null, info:'Sin visado para países de ECOWAS.', url:null },
    _default:     { needed:true, days:null, eVisa:true, cost:'~100 USD', info:'E-Visa disponible en portal.immigration.gov.ng. Tramitar con 2+ semanas de antelación.', url:'https://portal.immigration.gov.ng' },
  },

  'SN': { // Senegal
    _SCHENGEN:    { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _LATAM_STRONG:{ needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _AFRICA:      { needed:false, days:null, eVisa:false, cost:null, info:'Sin visado para países de ECOWAS.', url:null },
    _default:     { needed:true,  days:null, eVisa:true, cost:null, info:'E-Visa disponible en consulat.sec.gouv.sn', url:'https://consulat.sec.gouv.sn' },
  },

  // ══ AMERICAS ═════════════════════════════════════════════════════════════

  'US': { // Estados Unidos
    _SCHENGEN:    { needed:false, days:90, eVisa:true, cost:'~21 USD', info:'ESTA obligatoria (no es visado, es autorización previa). Tramitar en esta.cbp.dhs.gov antes del viaje.', url:'https://esta.cbp.dhs.gov' },
    _LATAM_STRONG:{ needed:true, days:null, eVisa:false, cost:'~185 USD', info:'Visado B1/B2 necesario para la mayoría de LATAM. Tramitar en embajada USA. Espera de meses posible.', url:'https://travel.state.gov' },
    _LATAM_WEAK:  { needed:true, days:null, eVisa:false, cost:'~185 USD', info:'Visado necesario. Tasa de tramitación ~185 USD. Lista de espera larga.', url:'https://travel.state.gov' },
    'GB':         { needed:false, days:90, eVisa:true, cost:'~21 USD', info:'ESTA obligatoria (Visa Waiver Program).', url:'https://esta.cbp.dhs.gov' },
    'AU':         { needed:false, days:90, eVisa:true, cost:'~21 USD', info:'ESTA obligatoria.', url:'https://esta.cbp.dhs.gov' },
    'CA':         { needed:false, days:180, eVisa:false, cost:null, info:'Sin visado hasta 180 días (canadienses).', url:null },
    _ASIA_STRONG: { needed:false, days:90, eVisa:true, cost:'~21 USD', info:'ESTA (Japan, Korea, Singapore, etc.)', url:'https://esta.cbp.dhs.gov' },
    'IN':         { needed:true, days:null, eVisa:false, cost:'~185 USD', info:'Visado B1/B2 necesario. Tramitar en embajada. Espera larga posible.', url:'https://travel.state.gov' },
    'CN':         { needed:true, days:null, eVisa:false, cost:'~185 USD', info:'Visado B1/B2 necesario. Tramitar en embajada USA en China.', url:'https://travel.state.gov' },
    'MX':         { needed:false, days:180, eVisa:false, cost:null, info:'Sin visado hasta 180 días.', url:null },
    _AFRICA:      { needed:true, days:null, eVisa:false, cost:'~185 USD', info:'Visado necesario para la mayoría de pasaportes africanos.', url:'https://travel.state.gov' },
    _default:     { needed:true, days:null, eVisa:false, cost:'~185 USD', info:'Visado B1/B2 necesario. Tramitar en travel.state.gov. Proceso largo.', url:'https://travel.state.gov' },
  },

  'CA': { // Canadá
    _SCHENGEN:    { needed:false, days:180, eVisa:true, cost:'~7 CAD', info:'eTA obligatoria (no es visado). Tramitar en canada.ca/eta antes del vuelo.', url:'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html' },
    _LATAM_STRONG:{ needed:true, days:null, eVisa:false, cost:'~100 CAD', info:'Visado necesario. Tramitar en ircc.canada.ca. Proceso de 1-3 meses.', url:'https://ircc.canada.ca' },
    _ANGLOPHONE:  { needed:false, days:180, eVisa:true, cost:'~7 CAD', info:'eTA obligatoria (UK, Australia, NZ). EE.UU. exento totalmente.', url:'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html' },
    'US':         { needed:false, days:180, eVisa:false, cost:null, info:'Sin visado, sin eTA. Solo con pasaporte o licencia NEXUS.', url:null },
    _ASIA_STRONG: { needed:false, days:180, eVisa:true, cost:'~7 CAD', info:'eTA necesaria (Japón, Corea, Singapur).', url:'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html' },
    'IN':         { needed:true, days:null, eVisa:false, cost:'~100 CAD', info:'Visado necesario. Tramitar online en ircc.canada.ca', url:'https://ircc.canada.ca' },
    'CN':         { needed:true, days:null, eVisa:false, cost:'~100 CAD', info:'Visado necesario.', url:'https://ircc.canada.ca' },
    _default:     { needed:true, days:null, eVisa:false, cost:'~100 CAD', info:'Visado necesario. Tramitar en ircc.canada.ca. Proceso puede tomar meses.', url:'https://ircc.canada.ca' },
  },

  'AU': { // Australia
    _SCHENGEN:    { needed:true, days:90, eVisa:true, cost:'~20 AUD', info:'ETA (Electronic Travel Authority) obligatoria. Tramitar en eta.homeaffairs.gov.au o en la app Visa Verify.', url:'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601' },
    _LATAM_STRONG:{ needed:true, days:90, eVisa:true, cost:'~190 AUD', info:'eVisitor o visado turista necesario. Tramitar online.', url:'https://immi.homeaffairs.gov.au' },
    _ANGLOPHONE:  { needed:true, days:90, eVisa:true, cost:'~20 AUD', info:'ETA obligatoria (UK, USA, Canada, NZ).', url:'https://immi.homeaffairs.gov.au' },
    _ASIA_STRONG: { needed:true, days:90, eVisa:true, cost:'~20 AUD', info:'ETA disponible (Japón, Corea, Singapur, HK).', url:'https://immi.homeaffairs.gov.au' },
    'CN':         { needed:true, days:null, eVisa:false, cost:'~145 AUD', info:'Visado necesario. Tramitar en embajada australiana.', url:'https://immi.homeaffairs.gov.au' },
    'IN':         { needed:true, days:null, eVisa:false, cost:'~145 AUD', info:'Visado necesario. Tramitar online.', url:'https://immi.homeaffairs.gov.au' },
    'NZ':         { needed:false, days:null, eVisa:false, cost:null, info:'Sin visado para neozelandeses (Trans-Tasman).', url:null },
    _default:     { needed:true, days:null, eVisa:false, cost:'~145 AUD', info:'Visado turista necesario. Tramitar en immi.homeaffairs.gov.au', url:'https://immi.homeaffairs.gov.au' },
  },

  'NZ': { // Nueva Zelanda
    _SCHENGEN:    { needed:false, days:90, eVisa:true, cost:'~17 NZD', info:'NZeTA obligatoria (no es visado). Tramitar en app New Zealand Travel o en web.', url:'https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/nzeta' },
    _LATAM_STRONG:{ needed:true, days:null, eVisa:false, cost:'~211 NZD', info:'Visado turista necesario. Tramitar online.', url:'https://www.immigration.govt.nz' },
    _ANGLOPHONE:  { needed:false, days:null, eVisa:false, cost:null, info:'Sin visado para UK y Australia. EE.UU. y Canadá: NZeTA.', url:null },
    'AU':         { needed:false, days:null, eVisa:false, cost:null, info:'Sin visado para australianos.', url:null },
    _ASIA_STRONG: { needed:false, days:90, eVisa:true, cost:'~17 NZD', info:'NZeTA necesaria.', url:'https://www.immigration.govt.nz' },
    _default:     { needed:true, days:null, eVisa:false, cost:'~211 NZD', info:'Visado turista necesario. Tramitar en immigration.govt.nz', url:'https://www.immigration.govt.nz' },
  },

  // ══ LATINOAMÉRICA ADICIONAL ══════════════════════════════════════════════

  'MX': { // México
    _SCHENGEN:    { needed:false, days:180, eVisa:false, cost:null, info:'Sin visado hasta 180 días. Solo pasaporte con 6 meses de validez.', url:null },
    _LATAM_STRONG:{ needed:false, days:180, eVisa:false, cost:null, info:'Sin visado hasta 180 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:180, eVisa:false, cost:null, info:'Sin visado hasta 180 días.', url:null },
    _ASIA_STRONG: { needed:false, days:180, eVisa:false, cost:null, info:'Sin visado hasta 180 días.', url:null },
    'IN':         { needed:false, days:180, eVisa:false, cost:null, info:'Sin visado hasta 180 días desde 2024.', url:null },
    'CN':         { needed:false, days:180, eVisa:false, cost:null, info:'Sin visado hasta 180 días desde 2024.', url:null },
    _default:     { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90-180 días para la mayoría de pasaportes.', url:null },
  },

  'CO': { // Colombia
    _SCHENGEN:    { needed:false, days:180, eVisa:false, cost:null, info:'Sin visado hasta 180 días por año (no necesariamente consecutivos).', url:null },
    _LATAM_STRONG:{ needed:false, days:180, eVisa:false, cost:null, info:'Sin visado hasta 180 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:180, eVisa:false, cost:null, info:'Sin visado hasta 180 días.', url:null },
    _ASIA_STRONG: { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    'CN':         { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días desde 2023.', url:null },
    'IN':         { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _default:     { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días para la mayoría de pasaportes.', url:null },
  },

  'AR': { // Argentina
    _SCHENGEN:    { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _LATAM_STRONG:{ needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días (o ilimitado para algunos vecinos).', url:null },
    _ANGLOPHONE:  { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ASIA_STRONG: { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    'CN':         { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    'IN':         { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _default:     { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días para la mayoría de pasaportes occidentales.', url:null },
  },

  'BR': { // Brasil
    _SCHENGEN:    { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días (Schengen exentos desde 2023).', url:null },
    _LATAM_STRONG:{ needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días (EE.UU., UK, Australia, Canadá exentos desde 2024).', url:null },
    _ASIA_STRONG: { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    'CN':         { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    'IN':         { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días desde 2024.', url:null },
    _default:     { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días para la mayoría de pasaportes.', url:null },
  },

  'PE': { // Perú
    _SCHENGEN:    { needed:false, days:183, eVisa:false, cost:null, info:'Sin visado hasta 183 días.', url:null },
    _LATAM_STRONG:{ needed:false, days:183, eVisa:false, cost:null, info:'Sin visado hasta 183 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:183, eVisa:false, cost:null, info:'Sin visado hasta 183 días.', url:null },
    _ASIA_STRONG: { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    'CN':         { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    'IN':         { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _default:     { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días para la mayoría de pasaportes.', url:null },
  },

  'CL': { // Chile
    _SCHENGEN:    { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _LATAM_STRONG:{ needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ASIA_STRONG: { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    'CN':         { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    'IN':         { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _default:     { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días para la mayoría de pasaportes.', url:null },
  },

  'UY': { // Uruguay
    _SCHENGEN:    { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _LATAM_STRONG:{ needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _default:     { needed:false, days:90,  eVisa:false, cost:null, info:'Sin visado hasta 90 días para la mayoría de pasaportes.', url:null },
  },

  'CU': { // Cuba
    _SCHENGEN:    { needed:false, days:30, eVisa:false, cost:'~25 CUC tarjeta turista', info:'Sin visado pero OBLIGATORIA tarjeta de turista (rosa o verde). Se compra en aeropuerto o agencia (~25 EUR). Sin ella no embarcan.', url:null },
    _LATAM_STRONG:{ needed:false, days:30, eVisa:false, cost:'~25 USD tarjeta turista', info:'Tarjeta de turista obligatoria (~25 USD). Se compra en aeropuerto.', url:null },
    _ANGLOPHONE:  { needed:false, days:30, eVisa:false, cost:'~25 USD tarjeta turista', info:'Tarjeta turista obligatoria. EE.UU.: restricciones especiales — solo con licencia OFAC.', url:null },
    'US':         { needed:true,  days:null, eVisa:false, cost:null, info:'Ciudadanos americanos necesitan licencia OFAC. Muy restringido. Consultar normativa vigente.', url:'https://home.treasury.gov/policy-issues/financial-sanctions/sanctions-programs-and-country-information/cuba-sanctions' },
    _default:     { needed:false, days:30, eVisa:false, cost:'~25 USD tarjeta turista', info:'Tarjeta de turista obligatoria para casi todos (~25 USD). Sin ella no puedes embarcar.', url:null },
  },

  'DO': { // República Dominicana
    _SCHENGEN:    { needed:false, days:30, eVisa:false, cost:'~10 USD tarjeta turista', info:'Sin visado. La tarjeta de turista (~10 USD) está incluida en el precio del vuelo en la mayoría de aerolíneas.', url:null },
    _LATAM_STRONG:{ needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    _default:     { needed:false, days:30, eVisa:false, cost:null, info:'Sin visado hasta 30 días para la mayoría de pasaportes.', url:null },
  },

  'CR': { // Costa Rica
    _SCHENGEN:    { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _LATAM_STRONG:{ needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días.', url:null },
    _default:     { needed:false, days:90, eVisa:false, cost:null, info:'Sin visado hasta 90 días para la mayoría de pasaportes.', url:null },
  },

  // ══ CAUCASO Y ASIA CENTRAL ═══════════════════════════════════════════════

  'GE': { // Georgia
    _SCHENGEN:    { needed:false, days:365, eVisa:false, cost:null, info:'Sin visado hasta 365 días (¡un año!). Uno de los países más acogedores del mundo para viajeros.', url:null },
    _LATAM_STRONG:{ needed:false, days:365, eVisa:false, cost:null, info:'Sin visado hasta 365 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:365, eVisa:false, cost:null, info:'Sin visado hasta 365 días.', url:null },
    _ASIA_STRONG: { needed:false, days:365, eVisa:false, cost:null, info:'Sin visado hasta 365 días.', url:null },
    'IN':         { needed:false, days:365, eVisa:false, cost:null, info:'Sin visado hasta 365 días.', url:null },
    'CN':         { needed:false, days:30,  eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    _default:     { needed:true,  days:null, eVisa:true, cost:null, info:'E-Visa disponible en evisa.gov.ge', url:'https://www.evisa.gov.ge' },
  },

  'AM': { // Armenia
    _SCHENGEN:    { needed:false, days:180, eVisa:false, cost:null, info:'Sin visado hasta 180 días.', url:null },
    _LATAM_STRONG:{ needed:false, days:180, eVisa:false, cost:null, info:'Sin visado hasta 180 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:180, eVisa:false, cost:null, info:'Sin visado hasta 180 días.', url:null },
    _default:     { needed:true,  days:null, eVisa:true, cost:'~6 USD', info:'E-Visa disponible en evisa.mfa.am (~6 USD, 21 días).', url:'https://evisa.mfa.am' },
  },

  'AZ': { // Azerbaiyán
    _SCHENGEN:    { needed:true, days:30,  eVisa:true, cost:'~20 USD', info:'ASAN Visa (e-Visa) en evisa.gov.az. Fácil y rápido.', url:'https://evisa.gov.az' },
    _LATAM_STRONG:{ needed:true, days:30,  eVisa:true, cost:'~20 USD', info:'E-Visa necesaria.', url:'https://evisa.gov.az' },
    _ANGLOPHONE:  { needed:true, days:30,  eVisa:true, cost:'~20 USD', info:'E-Visa necesaria.', url:'https://evisa.gov.az' },
    _default:     { needed:true, days:30,  eVisa:true, cost:'~20 USD', info:'ASAN E-Visa en evisa.gov.az. Rápido (48h). 30 días turista.', url:'https://evisa.gov.az' },
  },

  'UZ': { // Uzbekistán
    _SCHENGEN:    { needed:false, days:30,  eVisa:false, cost:null, info:'Sin visado hasta 30 días para ciudadanos de muchos países europeos. Verifica en e-visa.uz', url:'https://e-visa.uz' },
    _ANGLOPHONE:  { needed:false, days:30,  eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    _LATAM_STRONG:{ needed:true,  days:30,  eVisa:true,  cost:'~20 USD', info:'E-Visa disponible en e-visa.uz', url:'https://e-visa.uz' },
    _default:     { needed:true,  days:30,  eVisa:true,  cost:'~20 USD', info:'E-Visa disponible en e-visa.uz. Fácil de tramitar.', url:'https://e-visa.uz' },
  },

  'KZ': { // Kazajistán
    _SCHENGEN:    { needed:false, days:30,  eVisa:false, cost:null, info:'Sin visado hasta 30 días para ciudadanos de muchos países europeos.', url:null },
    _ANGLOPHONE:  { needed:false, days:30,  eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    _LATAM_STRONG:{ needed:true,  days:null, eVisa:true,  cost:'~70 USD', info:'E-Visa disponible en viza.gov.kz', url:'https://viza.gov.kz' },
    _default:     { needed:true,  days:null, eVisa:true,  cost:'~70 USD', info:'E-Visa disponible en viza.gov.kz', url:'https://viza.gov.kz' },
  },

  'MN': { // Mongolia
    _SCHENGEN:    { needed:false, days:30,  eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:30,  eVisa:false, cost:null, info:'Sin visado hasta 30 días.', url:null },
    _LATAM_STRONG:{ needed:true,  days:30,  eVisa:true,  cost:'~50 USD', info:'E-Visa disponible en evisa.mn', url:'https://evisa.mn' },
    _default:     { needed:true,  days:30,  eVisa:true,  cost:'~50 USD', info:'E-Visa disponible en evisa.mn (30 días turista).', url:'https://evisa.mn' },
  },

  // ══ OCEANÍA ADICIONAL ════════════════════════════════════════════════════

  'PG': { // Papúa Nueva Guinea
    _SCHENGEN:    { needed:true, days:60, eVisa:false, cost:null, info:'Visado a la llegada (60 días) o tramitar en embajada. Llevar efectivo para tasas aeroportuarias.', url:null },
    _ANGLOPHONE:  { needed:true, days:60, eVisa:false, cost:null, info:'Visado a la llegada disponible.', url:null },
    _default:     { needed:true, days:60, eVisa:false, cost:null, info:'Visado a la llegada para la mayoría de pasaportes (60 días). Tramitar también en embajada PNG.', url:null },
  },

  'FJ': { // Fiyi
    _SCHENGEN:    { needed:false, days:120, eVisa:false, cost:null, info:'Sin visado hasta 120 días.', url:null },
    _ANGLOPHONE:  { needed:false, days:120, eVisa:false, cost:null, info:'Sin visado hasta 120 días.', url:null },
    _LATAM_STRONG:{ needed:false, days:120, eVisa:false, cost:null, info:'Sin visado hasta 120 días.', url:null },
    _default:     { needed:false, days:120, eVisa:false, cost:null, info:'Sin visado hasta 120 días para la mayoría de pasaportes.', url:null },
  },


  // ══ SCHENGEN DESTINOS FALTANTES (todos aplican mismas reglas) ════════════
  // Nota: estos países aplican idénticas reglas Schengen que ES/FR/DE
  'CY': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días Schengen.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },
  'CZ': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },
  'DK': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },
  'EE': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },
  'FI': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },
  'GR': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },
  'HU': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },
  'IE': { _SCHENGEN:FREE(0,'UE. Irlanda NO es Schengen pero libre circulación UE.'), _ANGLOPHONE:FREE(180,'Sin visado hasta 180 días.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:true,cost:null,info:'eVisa disponible en irishimmigration.ie',url:'https://www.irishimmigration.ie' } },
  'LT': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },
  'LU': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },
  'LV': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },
  'MT': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },
  'NL': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },
  'PL': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },
  'RO': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },
  'SE': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },
  'SK': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },
  'SI': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },
  'AT': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },
  'BE': { _SCHENGEN:FREE(0,'UE — libre circulación.'), _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado.'), _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado Schengen necesario.',url:null } },

  // ══ DESTINOS ADICIONALES ══════════════════════════════════════════════════
  'HK': { // Hong Kong
    _SCHENGEN:FREE(90,'Sin visado hasta 90 días.'), _LATAM_STRONG:FREE(30,'Sin visado hasta 30 días.'),
    _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(30,'Sin visado hasta 30 días.'),
    'CN':{ needed:false,days:30,eVisa:false,cost:null,info:'Sin visado hasta 30 días. HK tiene sistema de inmigración separado de China continental.',url:null },
    _default:{ needed:true,days:null,eVisa:true,cost:null,info:'Visa on arrival para muchos países o visado previo. Consulta immd.gov.hk',url:'https://www.immd.gov.hk' }
  },
  'TW': { // Taiwán
    _SCHENGEN:FREE(90,'Sin visado hasta 90 días.'), _LATAM_STRONG:FREE(30,'Sin visado hasta 30-90 días según país.'),
    _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'), _ASIA_STRONG:FREE(90,'Sin visado hasta 90 días.'),
    'IN':{ needed:true,days:null,eVisa:true,cost:null,info:'Visa de turismo electrónica disponible. Consultar boca.gov.tw',url:'https://www.boca.gov.tw' },
    _default:{ needed:true,days:null,eVisa:true,cost:null,info:'Visado necesario para algunos países. Ver boca.gov.tw',url:'https://www.boca.gov.tw' }
  },
  'MO': { // Macao
    _default:FREE(30,'Sin visado hasta 30 días para casi todos los pasaportes. Sistema de inmigración separado de China continental.')
  },
  'KW': { // Kuwait
    _SCHENGEN:FREE(90,'Sin visado hasta 90 días.'), _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'),
    _LATAM_STRONG:{ needed:true,days:null,eVisa:true,cost:null,info:'Visado online disponible en evisa.moi.gov.kw',url:'https://evisa.moi.gov.kw' },
    _ASIA_STRONG:FREE(90,'Sin visado hasta 90 días.'),
    _default:{ needed:true,days:null,eVisa:true,cost:null,info:'E-Visa en evisa.moi.gov.kw',url:'https://evisa.moi.gov.kw' }
  },
  'OM': { // Omán
    _SCHENGEN:FREE(30,'Sin visado hasta 30 días a la llegada.'), _ANGLOPHONE:FREE(30,'Sin visado hasta 30 días.'),
    _LATAM_STRONG:{ needed:true,days:null,eVisa:true,cost:'~20 USD',info:'E-Visa en evisa.rop.gov.om',url:'https://evisa.rop.gov.om' },
    _ASIA_STRONG:FREE(30,'Sin visado hasta 30 días.'),
    'IN':FREE(30,'Sin visado hasta 30 días desde 2023.'),
    _default:{ needed:true,days:null,eVisa:true,cost:'~20 USD',info:'E-Visa en evisa.rop.gov.om',url:'https://evisa.rop.gov.om' }
  },
  'DZ': { // Argelia
    _SCHENGEN:{ needed:true,days:90,eVisa:false,cost:null,info:'Visado necesario para la mayoría. Tramitar en embajada argelina.',url:null },
    _LATAM_STRONG:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado necesario.',url:null },
    _ANGLOPHONE:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado necesario.',url:null },
    'FR':FREE(90,'Ciudadanos franceses: sin visado hasta 90 días (acuerdo bilateral).'),
    'MA':FREE(90,'Sin visado (acuerdo bilateral Argelia-Marruecos).'),
    _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado necesario. Tramitar en embajada argelina con antelación.',url:null }
  },
  'LY': { // Libia
    _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado muy difícil. País en conflicto. Solo visitas esenciales con carta de invitación.',url:null }
  },
  'SD': { // Sudán
    _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado necesario. País en conflicto activo — no viajar.',url:null }
  },
  'SS': { // Sudán del Sur
    _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado necesario. País en conflicto activo — no viajar.',url:null }
  },
  'SO': { // Somalia
    _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado necesario. País extremadamente peligroso — no viajar.',url:null }
  },
  'SY': { // Siria
    _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado necesario. País en guerra — no viajar.',url:null }
  },
  'KP': { // Corea del Norte
    _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Acceso extremadamente restringido. Solo tours organizados muy específicos. La mayoría de pasaportes no pueden entrar.',url:null }
  },
  'RU': { // Rusia
    _SCHENGEN:{ needed:true,days:null,eVisa:true,cost:null,info:'E-Visa disponible en evisa.kdmid.ru. Relaciones diplomáticas muy tensas desde 2022. Muchos vuelos cancelados.',url:'https://evisa.kdmid.ru' },
    _LATAM_STRONG:{ needed:true,days:null,eVisa:true,cost:null,info:'E-Visa disponible para muchos países latinoamericanos.',url:'https://evisa.kdmid.ru' },
    _ANGLOPHONE:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado muy difícil de obtener (UK, USA, CA, AU). Relaciones diplomáticas rotas.',url:null },
    _ASIA_STRONG:FREE(14,'Sin visado hasta 14 días (Japón, Corea, Singapur).'),
    'CN':FREE(30,'Sin visado hasta 30 días.'),
    _default:{ needed:true,days:null,eVisa:true,cost:null,info:'E-Visa en evisa.kdmid.ru. Situación diplomática muy compleja en 2024.',url:'https://evisa.kdmid.ru' }
  },
  'BY': { // Bielorrusia
    _SCHENGEN:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado necesario. Régimen sancionado. Vuelos directos muy limitados desde UE.',url:null },
    _ANGLOPHONE:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado necesario para la mayoría.',url:null },
    'RU':FREE(30,'Sin visado — libre circulación bilateral.'),
    'CN':FREE(30,'Sin visado hasta 30 días.'),
    _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado necesario. Tramitar en embajada bielorrusa.',url:null }
  },
  'UA': { // Ucrania
    _SCHENGEN:FREE(90,'Sin visado hasta 90 días. ATENCIÓN: conflicto armado activo — no viajar.'),
    _ANGLOPHONE:FREE(90,'Sin visado hasta 90 días.'),
    _LATAM_STRONG:FREE(90,'Sin visado hasta 90 días.'),
    _ASIA_STRONG:FREE(90,'Sin visado hasta 90 días.'),
    _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado necesario para algunos países. País en guerra activa — no viajar.',url:null }
  },
  'UG': { // Uganda
    _SCHENGEN:{ needed:true,days:90,eVisa:true,cost:'~50 USD',info:'E-Visa en visas.immigration.go.ug',url:'https://visas.immigration.go.ug' },
    _LATAM_STRONG:{ needed:true,days:90,eVisa:true,cost:'~50 USD',info:'E-Visa disponible.',url:'https://visas.immigration.go.ug' },
    _ANGLOPHONE:{ needed:true,days:90,eVisa:true,cost:'~50 USD',info:'E-Visa disponible.',url:'https://visas.immigration.go.ug' },
    _AFRICA:FREE(null,'Sin visado para países de la EAC (East African Community).'),
    _default:{ needed:true,days:90,eVisa:true,cost:'~50 USD',info:'E-Visa en visas.immigration.go.ug',url:'https://visas.immigration.go.ug' }
  },
  'TL': { // Timor Oriental
    _default:{ needed:false,days:30,eVisa:false,cost:null,info:'Visa on arrival gratuita (30 días) para casi todos los pasaportes en aeropuerto de Dili.',url:null }
  },
  'ER': { // Eritrea
    _default:{ needed:true,days:null,eVisa:false,cost:null,info:'Visado necesario. País muy cerrado. Tramitar en embajada eritrea. Solo turismo muy organizado.',url:null }
  },

};

// ─────────────────────────────────────────────────────────────────────────────
// getVisaInfo — función principal para obtener info de visado
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {string} destinationISO - ISO del país de destino (ej: 'JP', 'EG')
 * @param {string} originISO - ISO del país de origen (pasaporte del usuario)
 * @param {string|null} secondOriginISO - Segunda nacionalidad (si existe)
 * @returns {{ needed: boolean, days: number|null, eVisa: boolean, cost: string|null, info: string, url: string|null, passport: string }}
 */
export function getVisaInfo(destinationISO, originISO, secondOriginISO = null) {
  const destData = VISA_MATRIX[destinationISO];
  
  if (!destData) {
    return {
      needed: null, days: null, eVisa: false, cost: null,
      info: 'No tenemos datos de visado para este destino. Consulta la embajada.',
      url: null, passport: originISO,
    };
  }

  function lookupForPassport(iso) {
    if (!iso) return null;
    // 1. Exact match
    if (destData[iso]) return { ...destData[iso], passport: iso };
    // 2. Group match
    const group = getGroup(iso);
    const groupKey = `_${group}`;
    if (destData[groupKey]) return { ...destData[groupKey], passport: iso };
    // 3. Schengen generic fallback (if destination is a Schengen country)
    if (VISA_MATRIX['_SCHENGEN_GENERIC']) {
      const sg = VISA_MATRIX['_SCHENGEN_GENERIC'];
      if (sg[iso]) return { ...sg[iso], passport: iso };
      if (sg[groupKey]) return { ...sg[groupKey], passport: iso };
    }
    // 4. Default
    if (destData['_default']) return { ...destData['_default'], passport: iso };
    return null;
  }

  const primary = lookupForPassport(originISO);
  const secondary = secondOriginISO ? lookupForPassport(secondOriginISO) : null;

  // If two passports, return the most favorable
  if (primary && secondary) {
    // Most favorable = needed:false > needed:true with eVisa > needed:true embassy
    const score = (v) => v.needed === false ? 0 : v.eVisa ? 1 : 2;
    if (score(secondary) < score(primary)) {
      return {
        ...secondary,
        info: `Con tu pasaporte de ${secondOriginISO}: ${secondary.info}`,
        note: `Con pasaporte de ${originISO}: ${primary.needed ? 'visado necesario' : 'sin visado'}`,
      };
    }
  }

  return primary || {
    needed: null, days: null, eVisa: false, cost: null,
    info: 'Información no disponible. Consulta la embajada del país de destino.',
    url: null, passport: originISO,
  };
}