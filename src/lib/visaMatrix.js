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
    // 3. Schengen generic fallback
    const sg = VISA_MATRIX['_SCHENGEN_GENERIC'];
    if (sg) {
      if (sg[iso]) return { ...sg[iso], passport: iso };
      if (sg[groupKey]) return { ...sg[groupKey], passport: iso };
      if (sg['_default']) return { ...sg['_default'], passport: iso };
    }
    // 4. Default
    if (destData['_default']) return { ...destData['_default'], passport: iso };
    return null;
  }

  const primary = lookupForPassport(originISO);
  const secondary = secondOriginISO ? lookupForPassport(secondOriginISO) : null;

  // If two passports, return the most favorable
  if (primary && secondary) {
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