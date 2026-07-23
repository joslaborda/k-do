/**
 * holidaysDB.js — Festivos nacionales y locales para Kōdo
 * Fuentes: gobiernos oficiales, IATA, Wikipedia festivos oficiales
 * Cubre: festivos fijos + móviles calculados por año
 */

import { parseDateOnly } from '@/lib/tripContext';

// ─── Utilidades ───────────────────────────────────────────────────────────────

// Calcular Domingo de Pascua (algoritmo de Butcher/Meeus)
function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function fmt(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

// Siguiente lunes a partir de una fecha (Colombia mueve festivos a lunes)
function nextMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  if (day === 1) return d; // ya es lunes
  const diff = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

// ─── Base de festivos fijos por país ─────────────────────────────────────────
// Formato: { month, day, name, type: 'national'|'local', note? }
const FIXED_HOLIDAYS = {

  // ── ESPAÑA ──────────────────────────────────────────────────────────────────
  'España': [
    { month:1,  day:1,  name:'Año Nuevo',                    type:'national' },
    { month:1,  day:6,  name:'Reyes Magos',                  type:'national', note:'La mayoría de tiendas cierran.' },
    { month:5,  day:1,  name:'Día del Trabajador',           type:'national' },
    { month:8,  day:15, name:'Asunción de la Virgen',        type:'national' },
    { month:10, day:12, name:'Fiesta Nacional de España',    type:'national' },
    { month:11, day:1,  name:'Todos los Santos',             type:'national' },
    { month:12, day:6,  name:'Día de la Constitución',       type:'national' },
    { month:12, day:8,  name:'Inmaculada Concepción',        type:'national' },
    { month:12, day:25, name:'Navidad',                      type:'national' },
  ],

  // ── COLOMBIA ────────────────────────────────────────────────────────────────
  'Colombia': [
    { month:1,  day:1,  name:'Año Nuevo',                    type:'national' },
    { month:1,  day:6,  name:'Reyes Magos',                  type:'national', mobile:true }, // lunes
    { month:3,  day:19, name:'San José',                     type:'national', mobile:true }, // lunes
    { month:5,  day:1,  name:'Día del Trabajo',              type:'national' },
    { month:6,  day:29, name:'San Pedro y San Pablo',        type:'national', mobile:true },
    { month:7,  day:20, name:'Día de la Independencia',      type:'national', note:'Desfiles y celebraciones. Comercios pueden cerrar.' },
    { month:8,  day:7,  name:'Batalla de Boyacá',            type:'national' },
    { month:8,  day:15, name:'Asunción de la Virgen',        type:'national', mobile:true },
    { month:10, day:12, name:'Día de la Raza',               type:'national', mobile:true },
    { month:11, day:1,  name:'Todos los Santos',             type:'national', mobile:true },
    { month:11, day:11, name:'Independencia de Cartagena',   type:'national', mobile:true },
    { month:12, day:8,  name:'Inmaculada Concepción',        type:'national' },
    { month:12, day:25, name:'Navidad',                      type:'national' },
  ],

  // ── MÉXICO ──────────────────────────────────────────────────────────────────
  'México': [
    { month:1,  day:1,  name:'Año Nuevo',                    type:'national' },
    { month:2,  day:5,  name:'Día de la Constitución',       type:'national', mobile:true }, // primer lunes feb
    { month:3,  day:21, name:'Natalicio de Juárez',          type:'national', mobile:true }, // tercer lunes mar
    { month:5,  day:1,  name:'Día del Trabajo',              type:'national' },
    { month:9,  day:16, name:'Día de la Independencia',      type:'national', note:'Desfiles. Comercios pueden cerrar.' },
    { month:11, day:20, name:'Revolución Mexicana',          type:'national', mobile:true }, // tercer lunes nov
    { month:12, day:25, name:'Navidad',                      type:'national' },
  ],

  // ── ARGENTINA ───────────────────────────────────────────────────────────────
  'Argentina': [
    { month:1,  day:1,  name:'Año Nuevo',                    type:'national' },
    { month:3,  day:24, name:'Día de la Memoria',            type:'national' },
    { month:4,  day:2,  name:'Día del Veterano de Malvinas', type:'national' },
    { month:5,  day:1,  name:'Día del Trabajador',           type:'national' },
    { month:5,  day:25, name:'Revolución de Mayo',           type:'national', note:'Actos cívicos. Museos abiertos.' },
    { month:6,  day:17, name:'Martín Miguel de Güemes',      type:'national' },
    { month:6,  day:20, name:'Día de la Bandera',            type:'national' },
    { month:7,  day:9,  name:'Día de la Independencia',      type:'national', note:'Comercios cerrados.' },
    { month:8,  day:17, name:'Muerte del Gral. San Martín',  type:'national', mobile:true },
    { month:10, day:12, name:'Día del Respeto a la Diversidad', type:'national', mobile:true },
    { month:11, day:20, name:'Día de la Soberanía Nacional', type:'national', mobile:true },
    { month:12, day:8,  name:'Inmaculada Concepción',        type:'national' },
    { month:12, day:25, name:'Navidad',                      type:'national' },
  ],

  // ── PERÚ ────────────────────────────────────────────────────────────────────
  'Perú': [
    { month:1,  day:1,  name:'Año Nuevo',                    type:'national' },
    { month:5,  day:1,  name:'Día del Trabajo',              type:'national' },
    { month:6,  day:7,  name:'Batalla de Arica',             type:'national' },
    { month:6,  day:24, name:'Inti Raymi / San Juan',        type:'national', note:'Festividades en Cusco. Muy concurrido.' },
    { month:7,  day:28, name:'Fiestas Patrias',              type:'national', note:'Comercios cerrados. Desfiles militares.' },
    { month:7,  day:29, name:'Fiestas Patrias',              type:'national' },
    { month:8,  day:30, name:'Santa Rosa de Lima',           type:'national' },
    { month:10, day:8,  name:'Batalla de Angamos',           type:'national' },
    { month:11, day:1,  name:'Todos los Santos',             type:'national' },
    { month:12, day:8,  name:'Inmaculada Concepción',        type:'national' },
    { month:12, day:25, name:'Navidad',                      type:'national' },
  ],

  // ── CHILE ───────────────────────────────────────────────────────────────────
  'Chile': [
    { month:1,  day:1,  name:'Año Nuevo',                    type:'national' },
    { month:5,  day:1,  name:'Día del Trabajo',              type:'national' },
    { month:5,  day:21, name:'Glorias Navales',              type:'national' },
    { month:6,  day:20, name:'Día Nacional de los Pueblos Indígenas', type:'national' },
    { month:6,  day:29, name:'San Pedro y San Pablo',        type:'national' },
    { month:7,  day:16, name:'Virgen del Carmen',            type:'national' },
    { month:8,  day:15, name:'Asunción de la Virgen',        type:'national' },
    { month:9,  day:18, name:'Fiestas Patrias',              type:'national', note:'Todo cierra. Fondas y celebraciones.' },
    { month:9,  day:19, name:'Día de las Glorias del Ejército', type:'national' },
    { month:10, day:12, name:'Encuentro de Dos Mundos',      type:'national' },
    { month:10, day:31, name:'Día de las Iglesias Evangélicas', type:'national' },
    { month:11, day:1,  name:'Todos los Santos',             type:'national' },
    { month:12, day:8,  name:'Inmaculada Concepción',        type:'national' },
    { month:12, day:25, name:'Navidad',                      type:'national' },
  ],

  // ── BRASIL ──────────────────────────────────────────────────────────────────
  'Brasil': [
    { month:1,  day:1,  name:'Año Nuevo',                    type:'national' },
    { month:4,  day:21, name:'Tiradentes',                   type:'national' },
    { month:5,  day:1,  name:'Día del Trabajo',              type:'national' },
    { month:9,  day:7,  name:'Independência do Brasil',      type:'national', note:'Desfiles militares. Comercios pueden cerrar.' },
    { month:10, day:12, name:'Nossa Senhora Aparecida',      type:'national' },
    { month:11, day:2,  name:'Finados',                      type:'national' },
    { month:11, day:15, name:'Proclamação da República',     type:'national' },
    { month:12, day:25, name:'Natal',                        type:'national' },
  ],

  // ── JAPÓN ────────────────────────────────────────────────────────────────────
  'Japón': [
    { month:1,  day:1,  name:'Año Nuevo (Oshogatsu)',        type:'national', note:'Mayoría de negocios cerrados 1-3 enero.' },
    { month:1,  day:13, name:'Día de los Adultos',           type:'national', mobile:true }, // segundo lunes
    { month:2,  day:11, name:'Día de la Fundación Nacional', type:'national' },
    { month:2,  day:23, name:'Cumpleaños del Emperador',     type:'national' },
    { month:3,  day:20, name:'Equinoccio de Primavera',      type:'national' },
    { month:4,  day:29, name:'Día de Shōwa',                 type:'national' },
    { month:5,  day:3,  name:'Día de la Constitución',       type:'national' },
    { month:5,  day:4,  name:'Día Verde',                    type:'national' },
    { month:5,  day:5,  name:'Día del Niño',                 type:'national', note:'Semana Dorada (29 abr–5 may): todo lleno y caro.' },
    { month:7,  day:21, name:'Día del Mar',                  type:'national', mobile:true }, // tercer lunes
    { month:8,  day:11, name:'Día de la Montaña',            type:'national' },
    { month:9,  day:15, name:'Día del Respeto a los Mayores',type:'national', mobile:true }, // tercer lunes
    { month:9,  day:23, name:'Equinoccio de Otoño',          type:'national' },
    { month:10, day:13, name:'Día del Deporte',              type:'national', mobile:true }, // segundo lunes
    { month:11, day:3,  name:'Día de la Cultura',            type:'national' },
    { month:11, day:23, name:'Día del Trabajo',              type:'national' },
    { month:12, day:31, name:'Nochevieja (Ōmisoka)',         type:'national', note:'Muchos negocios cierran.' },
  ],

  // ── TAILANDIA ────────────────────────────────────────────────────────────────
  'Tailandia': [
    { month:1,  day:1,  name:'Año Nuevo',                    type:'national' },
    { month:4,  day:6,  name:'Día de Chakri',                type:'national' },
    { month:4,  day:13, name:'Songkran (Año Nuevo Thai)',    type:'national', note:'Festival del agua. 13-15 abr. Todo mojado.' },
    { month:4,  day:14, name:'Songkran',                     type:'national' },
    { month:4,  day:15, name:'Songkran',                     type:'national' },
    { month:5,  day:1,  name:'Día del Trabajo',              type:'national' },
    { month:5,  day:5,  name:'Día de la Coronación',        type:'national' },
    { month:7,  day:28, name:'Cumpleaños del Rey',           type:'national', note:'Decoraciones por todo el país.' },
    { month:8,  day:12, name:'Día de la Madre / Reina',      type:'national' },
    { month:10, day:13, name:'Día del Rey Bhumibol',         type:'national' },
    { month:10, day:23, name:'Día de Chulalongkorn',         type:'national' },
    { month:12, day:5,  name:'Día del Padre / Rey Rama IX',  type:'national' },
    { month:12, day:10, name:'Día de la Constitución',       type:'national' },
    { month:12, day:31, name:'Nochevieja',                   type:'national' },
  ],

  // ── VIETNAM ──────────────────────────────────────────────────────────────────
  'Vietnam': [
    { month:1,  day:1,  name:'Año Nuevo',                    type:'national' },
    { month:4,  day:30, name:'Día de la Reunificación',      type:'national', note:'Todo cierra. Muy festivo en Ho Chi Minh.' },
    { month:5,  day:1,  name:'Día Internacional del Trabajo',type:'national' },
    { month:9,  day:2,  name:'Día Nacional de Vietnam',      type:'national', note:'Fuegos artificiales. Comercios cerrados.' },
  ],

  // ── INDONESIA ────────────────────────────────────────────────────────────────
  'Indonesia': [
    { month:1,  day:1,  name:'Año Nuevo',                    type:'national' },
    { month:3,  day:29, name:'Día del Silencio (Nyepi)',     type:'national', note:'En Bali: todo cierra, silencio total, vuelos cancelados.' },
    { month:5,  day:1,  name:'Día del Trabajo',              type:'national' },
    { month:6,  day:1,  name:'Día de Pancasila',             type:'national' },
    { month:8,  day:17, name:'Día de la Independencia',      type:'national', note:'Ceremonias. Todo cierra.' },
    { month:12, day:25, name:'Navidad',                      type:'national' },
  ],

  // ── MARRUECOS ────────────────────────────────────────────────────────────────
  'Marruecos': [
    { month:1,  day:1,  name:'Año Nuevo',                    type:'national' },
    { month:1,  day:11, name:'Manifiesto de la Independencia', type:'national' },
    { month:5,  day:1,  name:'Día del Trabajo',              type:'national' },
    { month:7,  day:30, name:'Fiesta del Trono',             type:'national', note:'Celebraciones en todo el país.' },
    { month:8,  day:14, name:'Recuperación de Oued Eddahab', type:'national' },
    { month:8,  day:20, name:'Aniversario de la Revolución', type:'national' },
    { month:8,  day:21, name:'Cumpleaños del Rey',           type:'national' },
    { month:11, day:6,  name:'Marcha Verde',                 type:'national' },
    { month:11, day:18, name:'Día de la Independencia',      type:'national' },
  ],

  // ── ITALIA ───────────────────────────────────────────────────────────────────
  'Italia': [
    { month:1,  day:1,  name:'Capodanno',                    type:'national' },
    { month:1,  day:6,  name:'Epifania',                     type:'national', note:'Tiendas cerradas.' },
    { month:4,  day:25, name:'Liberazione',                  type:'national' },
    { month:5,  day:1,  name:'Festa del Lavoro',             type:'national' },
    { month:6,  day:2,  name:'Festa della Repubblica',       type:'national' },
    { month:8,  day:15, name:'Ferragosto',                   type:'national', note:'Todo Italia de vacaciones. Muchos negocios cierran agosto entero.' },
    { month:11, day:1,  name:'Ognissanti',                   type:'national' },
    { month:12, day:8,  name:'Immacolata Concezione',        type:'national' },
    { month:12, day:25, name:'Natale',                       type:'national' },
    { month:12, day:26, name:'Santo Stefano',                type:'national' },
  ],

  // ── FRANCIA ──────────────────────────────────────────────────────────────────
  'Francia': [
    { month:1,  day:1,  name:'Jour de l\'An',                type:'national' },
    { month:5,  day:1,  name:'Fête du Travail',              type:'national' },
    { month:5,  day:8,  name:'Victoire 1945',                type:'national' },
    { month:7,  day:14, name:'Fête Nationale (Bastille)',    type:'national', note:'Fuegos artificiales. Desfiles militares en París.' },
    { month:8,  day:15, name:'Assomption',                   type:'national' },
    { month:11, day:1,  name:'Toussaint',                    type:'national' },
    { month:11, day:11, name:'Armistice',                    type:'national' },
    { month:12, day:25, name:'Noël',                         type:'national' },
  ],

  // ── REINO UNIDO ──────────────────────────────────────────────────────────────
  'Reino Unido': [
    { month:1,  day:1,  name:'New Year\'s Day',              type:'national' },
    { month:5,  day:5,  name:'Early May Bank Holiday',       type:'national', mobile:true }, // primer lunes mayo
    { month:5,  day:26, name:'Spring Bank Holiday',          type:'national', mobile:true }, // último lunes mayo
    { month:8,  day:25, name:'Summer Bank Holiday',          type:'national', mobile:true }, // último lunes agosto
    { month:12, day:25, name:'Christmas Day',                type:'national' },
    { month:12, day:26, name:'Boxing Day',                   type:'national' },
  ],

  // ── ALEMANIA ─────────────────────────────────────────────────────────────────
  'Alemania': [
    { month:1,  day:1,  name:'Neujahr',                      type:'national' },
    { month:5,  day:1,  name:'Tag der Arbeit',               type:'national' },
    { month:10, day:3,  name:'Tag der Deutschen Einheit',    type:'national', note:'Día de la Unidad. Museos gratis en muchas ciudades.' },
    { month:12, day:25, name:'1. Weihnachtstag',             type:'national' },
    { month:12, day:26, name:'2. Weihnachtstag',             type:'national' },
  ],

  // ── PORTUGAL ─────────────────────────────────────────────────────────────────
  'Portugal': [
    { month:1,  day:1,  name:'Ano Novo',                     type:'national' },
    { month:4,  day:25, name:'Dia da Liberdade',             type:'national', note:'Claveles rojos en las calles de Lisboa.' },
    { month:5,  day:1,  name:'Dia do Trabalhador',           type:'national' },
    { month:6,  day:10, name:'Dia de Portugal',              type:'national' },
    { month:8,  day:15, name:'Assunção de Nossa Senhora',    type:'national' },
    { month:10, day:5,  name:'Dia da República',             type:'national' },
    { month:11, day:1,  name:'Dia de Todos os Santos',       type:'national' },
    { month:12, day:1,  name:'Dia da Restauração',           type:'national' },
    { month:12, day:8,  name:'Imaculada Conceição',          type:'national' },
    { month:12, day:25, name:'Natal',                        type:'national' },
  ],

  // ── GRECIA ───────────────────────────────────────────────────────────────────
  'Grecia': [
    { month:1,  day:1,  name:'Πρωτοχρονιά',                  type:'national' },
    { month:1,  day:6,  name:'Θεοφάνεια',                    type:'national' },
    { month:3,  day:25, name:'Εθνική Εορτή (Independencia)', type:'national', note:'Desfiles. Todo cierra.' },
    { month:5,  day:1,  name:'Εργατική Πρωτομαγιά',          type:'national' },
    { month:8,  day:15, name:'Κοίμηση Θεοτόκου',             type:'national', note:'Islas muy concurridas.' },
    { month:10, day:28, name:'Επέτειος του «Όχι»',           type:'national', note:'Desfiles militares.' },
    { month:12, day:25, name:'Χριστούγεννα',                 type:'national' },
    { month:12, day:26, name:'Σύναξη Θεοτόκου',              type:'national' },
  ],

  // ── TURQUÍA ──────────────────────────────────────────────────────────────────
  'Turquía': [
    { month:1,  day:1,  name:'Yılbaşı',                      type:'national' },
    { month:4,  day:23, name:'Ulusal Egemenlik ve Çocuk Bayramı', type:'national', note:'Día del Niño y de la Soberanía. Actos en todo el país.' },
    { month:5,  day:1,  name:'Emek ve Dayanışma Günü',       type:'national' },
    { month:5,  day:19, name:'Atatürk\'ü Anma Günü',         type:'national' },
    { month:7,  day:15, name:'Demokrasi Bayramı',            type:'national' },
    { month:8,  day:30, name:'Zafer Bayramı',                type:'national', note:'Día de la Victoria. Desfiles militares.' },
    { month:10, day:29, name:'Cumhuriyet Bayramı',           type:'national', note:'Día de la República. Fuegos artificiales.' },
  ],

  // ── INDIA ────────────────────────────────────────────────────────────────────
  'India': [
    { month:1,  day:26, name:'República de India',           type:'national', note:'Desfile en Nueva Delhi. Todo cierra.' },
    { month:8,  day:15, name:'Día de la Independencia',      type:'national', note:'Izada de bandera. Comercios cerrados.' },
    { month:10, day:2,  name:'Gandhi Jayanti',               type:'national' },
    { month:12, day:25, name:'Navidad',                      type:'national' },
  ],

  // ── SUDÁFRICA ────────────────────────────────────────────────────────────────
  'Sudáfrica': [
    { month:1,  day:1,  name:'New Year\'s Day',              type:'national' },
    { month:3,  day:21, name:'Human Rights Day',             type:'national' },
    { month:4,  day:27, name:'Freedom Day',                  type:'national', note:'Día de la libertad. Actos en todo el país.' },
    { month:5,  day:1,  name:'Workers\' Day',                type:'national' },
    { month:6,  day:16, name:'Youth Day',                    type:'national' },
    { month:8,  day:9,  name:'National Women\'s Day',        type:'national' },
    { month:9,  day:24, name:'Heritage Day',                 type:'national' },
    { month:12, day:16, name:'Day of Reconciliation',        type:'national' },
    { month:12, day:25, name:'Christmas Day',                type:'national' },
    { month:12, day:26, name:'Day of Goodwill',              type:'national' },
  ],

  // ── ESTADOS UNIDOS ───────────────────────────────────────────────────────────
  'Estados Unidos': [
    { month:1,  day:1,  name:'New Year\'s Day',              type:'national' },
    { month:7,  day:4,  name:'Independence Day',             type:'national', note:'Fuegos artificiales. Todo cierra.' },
    { month:11, day:11, name:'Veterans Day',                 type:'national' },
    { month:12, day:25, name:'Christmas Day',                type:'national' },
  ],

  // ── AUSTRALIA ────────────────────────────────────────────────────────────────
  'Australia': [
    { month:1,  day:1,  name:'New Year\'s Day',              type:'national' },
    { month:1,  day:26, name:'Australia Day',                type:'national', note:'Muchas celebraciones y también protestas.' },
    { month:4,  day:25, name:'ANZAC Day',                    type:'national' },
    { month:12, day:25, name:'Christmas Day',                type:'national' },
    { month:12, day:26, name:'Boxing Day',                   type:'national' },
  ],

  // ── CANADÁ ───────────────────────────────────────────────────────────────────
  'Canadá': [
    { month:1,  day:1,  name:'New Year\'s Day',              type:'national' },
    { month:7,  day:1,  name:'Canada Day',                   type:'national', note:'Fuegos artificiales. Todo cierra.' },
    { month:11, day:11, name:'Remembrance Day',              type:'national' },
    { month:12, day:25, name:'Christmas Day',                type:'national' },
    { month:12, day:26, name:'Boxing Day',                   type:'national' },
  ],

  // ── CUBA ─────────────────────────────────────────────────────────────────────
  'Cuba': [
    { month:1,  day:1,  name:'Triunfo de la Revolución',     type:'national', note:'Todo cierra. Actos políticos.' },
    { month:1,  day:2,  name:'Día de la Victoria',           type:'national' },
    { month:5,  day:1,  name:'Día de los Trabajadores',      type:'national' },
    { month:7,  day:25, name:'Conmemoración del Asalto',     type:'national' },
    { month:7,  day:26, name:'Día de la Rebeldía Nacional',  type:'national' },
    { month:10, day:10, name:'Inicio de las Guerras',        type:'national' },
    { month:12, day:25, name:'Navidad',                      type:'national' },
  ],

  // ── ECUADOR ──────────────────────────────────────────────────────────────────
  'Ecuador': [
    { month:1,  day:1,  name:'Año Nuevo',                    type:'national' },
    { month:5,  day:1,  name:'Día del Trabajo',              type:'national' },
    { month:5,  day:24, name:'Batalla del Pichincha',        type:'national' },
    { month:8,  day:10, name:'Primer Grito de Independencia',type:'national' },
    { month:10, day:9,  name:'Independencia de Guayaquil',   type:'national' },
    { month:11, day:2,  name:'Día de los Difuntos',          type:'national' },
    { month:11, day:3,  name:'Independencia de Cuenca',      type:'national' },
    { month:12, day:6,  name:'Fundación de Quito',           type:'local', cities:['Quito'], note:'Gran fiesta en Quito. Corridas, conciertos.' },
    { month:12, day:25, name:'Navidad',                      type:'national' },
  ],

  // ── URUGUAY ──────────────────────────────────────────────────────────────────
  'Uruguay': [
    { month:1,  day:1,  name:'Año Nuevo',                    type:'national' },
    { month:1,  day:6,  name:'Reyes Magos',                  type:'national' },
    { month:4,  day:19, name:'Desembarco de los 33',         type:'national' },
    { month:5,  day:1,  name:'Día del Trabajador',           type:'national' },
    { month:5,  day:18, name:'Batalla de Las Piedras',       type:'national' },
    { month:6,  day:19, name:'Natalicio de Artigas',         type:'national' },
    { month:7,  day:18, name:'Jura de la Constitución',      type:'national' },
    { month:8,  day:25, name:'Independencia de Uruguay',     type:'national' },
    { month:10, day:12, name:'Día de la Raza',               type:'national' },
    { month:11, day:2,  name:'Día de los Difuntos',          type:'national' },
    { month:12, day:25, name:'Navidad',                      type:'national' },
  ],

  // ── EMIRATOS ÁRABES UNIDOS ───────────────────────────────────────────────────
  'Emiratos Árabes': [
    { month:1,  day:1,  name:'Año Nuevo',                    type:'national' },
    { month:12, day:2,  name:'Día Nacional de los EAU',      type:'national', note:'Fuegos artificiales espectaculares en Dubai.' },
    { month:12, day:3,  name:'Día Nacional',                 type:'national' },
  ],

  // ── SINGAPUR ─────────────────────────────────────────────────────────────────
  'Singapur': [
    { month:1,  day:1,  name:'New Year\'s Day',              type:'national' },
    { month:5,  day:1,  name:'Labour Day',                   type:'national' },
    { month:8,  day:9,  name:'National Day',                 type:'national', note:'Desfile nacional espectacular.' },
    { month:12, day:25, name:'Christmas Day',                type:'national' },
  ],

  // ── NUEVA ZELANDA ────────────────────────────────────────────────────────────
  'Nueva Zelanda': [
    { month:1,  day:1,  name:'New Year\'s Day',              type:'national' },
    { month:2,  day:6,  name:'Waitangi Day',                 type:'national' },
    { month:4,  day:25, name:'ANZAC Day',                    type:'national' },
    { month:6,  day:2,  name:'King\'s Birthday',             type:'national', mobile:true },
    { month:10, day:27, name:'Labour Day',                   type:'national', mobile:true },
    { month:12, day:25, name:'Christmas Day',                type:'national' },
    { month:12, day:26, name:'Boxing Day',                   type:'national' },
  ],
};

// ─── Festivos móviles calculados ──────────────────────────────────────────────
function getMobileHolidays(country, year) {
  const easter = easterSunday(year);
  const holidays = [];

  // Semana Santa — España, Colombia, Italia, Francia, etc.
  const countries_easter = ['España','Colombia','Argentina','Chile','Perú','Uruguay','Ecuador','Italia','Francia','Portugal','Alemania','Grecia','Australia','Nueva Zelanda','Canadá'];
  if (countries_easter.includes(country)) {
    holidays.push({
      date: fmt(addDays(easter, -3)), // Jueves Santo
      name: 'Jueves Santo',
      type: 'national',
      note: 'Semana Santa. Comercios pueden cerrar.',
    });
    holidays.push({
      date: fmt(addDays(easter, -2)), // Viernes Santo
      name: 'Viernes Santo',
      type: 'national',
      note: 'Semana Santa. Mayoría de negocios cerrados.',
    });
    if (['España','Argentina','Chile','Colombia','Uruguay','Ecuador'].includes(country)) {
      holidays.push({
        date: fmt(addDays(easter, -1)), // Sábado Santo
        name: 'Sábado Santo',
        type: 'national',
      });
    }
    holidays.push({
      date: fmt(easter), // Domingo de Resurrección
      name: 'Domingo de Pascua',
      type: 'national',
    });
    if (['Italia','Francia','Alemania','Australia','Nueva Zelanda','Canadá','Reino Unido'].includes(country)) {
      holidays.push({
        date: fmt(addDays(easter, 1)), // Lunes de Pascua
        name: 'Lunes de Pascua',
        type: 'national',
      });
    }
    // Ascensión (39 días después de Pascua)
    if (['Francia','Alemania'].includes(country)) {
      holidays.push({
        date: fmt(addDays(easter, 39)),
        name: 'Ascensión',
        type: 'national',
      });
    }
    // Pentecostés (49 días)
    if (['Francia','Alemania'].includes(country)) {
      holidays.push({
        date: fmt(addDays(easter, 49)),
        name: 'Pentecostés',
        type: 'national',
      });
      holidays.push({
        date: fmt(addDays(easter, 50)),
        name: 'Lunes de Pentecostés',
        type: 'national',
      });
    }
  }

  // Carnaval de Brasil — 3 días antes del Miércoles de Ceniza (47 días antes de Pascua)
  if (country === 'Brasil') {
    const ashWed = addDays(easter, -46);
    holidays.push({ date: fmt(addDays(ashWed, -2)), name: 'Carnaval', type: 'national', note: 'Carnaval. Todo Brasil en fiesta. Vuelos y hoteles llenos.' });
    holidays.push({ date: fmt(addDays(ashWed, -1)), name: 'Carnaval', type: 'national', note: 'Carnaval.' });
    holidays.push({ date: fmt(ashWed), name: 'Cuarta-feira de Cinzas', type: 'national' });
    // Corpus Christi
    holidays.push({ date: fmt(addDays(easter, 60)), name: 'Corpus Christi', type: 'national' });
    // Tiradentes
    holidays.push({ date: fmt(addDays(easter, -2)), name: 'Paixão de Cristo', type: 'national' });
  }

  // Colombia también tiene Corpus Christi y Sagrado Corazón
  if (country === 'Colombia') {
    // Corpus Christi — 60 días después de Pascua, se mueve al siguiente lunes
    holidays.push({ date: fmt(nextMonday(addDays(easter, 60))), name: 'Corpus Christi', type: 'national' });
    // Sagrado Corazón
    holidays.push({ date: fmt(nextMonday(addDays(easter, 68))), name: 'Sagrado Corazón de Jesús', type: 'national' });
    // Ascensión
    holidays.push({ date: fmt(nextMonday(addDays(easter, 39))), name: 'Ascensión del Señor', type: 'national' });
  }

  // Thanksgiving USA — 4º jueves de noviembre
  if (country === 'Estados Unidos') {
    const nov1 = new Date(year, 10, 1);
    const dow = nov1.getDay();
    const firstThursday = dow <= 4 ? 5 - dow : 12 - dow;
    const thanksgiving = new Date(year, 10, firstThursday + 21);
    holidays.push({ date: fmt(thanksgiving), name: 'Thanksgiving', type: 'national', note: 'Todo cierra. Muchos viajan.' });
  }

  // Día de Acción de Gracias Canadá — 2º lunes de octubre
  if (country === 'Canadá') {
    const oct1 = new Date(year, 9, 1);
    const dow = oct1.getDay();
    const firstMon = dow <= 1 ? 2 - dow : 9 - dow;
    const thanksgiving = new Date(year, 9, firstMon + 7);
    holidays.push({ date: fmt(thanksgiving), name: 'Thanksgiving', type: 'national' });
  }

  return holidays;
}

// ─── Festivos locales por ciudad ──────────────────────────────────────────────
const CITY_HOLIDAYS = {
  // Colombia
  'Barranquilla': [
    { month:2, day:8,  name:'Carnaval de Barranquilla',   type:'local', note:'El carnaval más grande de Colombia. 4 días de fiesta. Hoteles llenos.' },
    { month:2, day:9,  name:'Carnaval de Barranquilla',   type:'local' },
    { month:2, day:10, name:'Carnaval de Barranquilla',   type:'local' },
    { month:2, day:11, name:'Batalla de Flores',          type:'local', note:'Desfile principal. Espectacular.' },
  ],
  'Medellín': [
    { month:8, day:7,  name:'Feria de las Flores',        type:'local', note:'Semana de la Feria. Desfile de silleteros, conciertos. Muy concurrido.' },
    { month:8, day:8,  name:'Feria de las Flores',        type:'local' },
    { month:12,day:7,  name:'Noche de las Velitas',       type:'local', note:'Tradición navideña con velas y faroles. Ciudad iluminada.' },
  ],
  'Bogotá': [
    { month:8, day:6,  name:'Festival Iberoamericano de Teatro', type:'local', note:'Años pares. Espectáculos por toda la ciudad.' },
  ],
  'Cali': [
    { month:12,day:25, name:'Feria de Cali',              type:'local', note:'Del 25 al 30 dic. Salsa, conciertos, fiestas. Ciudad muy activa.' },
    { month:12,day:26, name:'Feria de Cali',              type:'local' },
    { month:12,day:27, name:'Feria de Cali',              type:'local' },
    { month:12,day:28, name:'Feria de Cali',              type:'local' },
  ],

  // España
  'Barcelona': [
    { month:9, day:24, name:'La Mercè',                   type:'local', note:'Fiesta mayor de Barcelona. Fuegos, castellers, conciertos gratuitos.' },
    { month:4, day:23, name:'Sant Jordi',                 type:'local', note:'Rosas y libros en las calles. Romántico.' },
  ],
  'Madrid': [
    { month:5, day:15, name:'San Isidro',                 type:'local', note:'Fiesta de Madrid. Verbenas, chulapos, conciertos.' },
    { month:5, day:2,  name:'Fiesta de la Comunidad',     type:'local', note:'Festivo en Madrid.' },
  ],
  'Sevilla': [
    { month:4, day:18, name:'Feria de Abril',             type:'local', note:'Feria variable (2 semanas después de Semana Santa). Casetas, flamenco, caballos. Imprescindible.' },
  ],
  'Valencia': [
    { month:3, day:19, name:'Fallas',                     type:'local', note:'Del 15 al 19 mar. Petardos, fuego, fallas. Muy ruidoso por la noche.' },
    { month:3, day:15, name:'Fallas',                     type:'local' },
    { month:3, day:16, name:'Fallas',                     type:'local' },
    { month:3, day:17, name:'Fallas',                     type:'local' },
    { month:3, day:18, name:'Fallas',                     type:'local' },
    { month:10,day:9,  name:'Día de la Comunitat Valenciana', type:'local', note:'Festivo local.' },
  ],
  'Pamplona': [
    { month:7, day:6,  name:'San Fermín',                 type:'local', note:'Encierros del 6 al 14 jul. Ciudad abarrotada. Reserva con meses de antelación.' },
    { month:7, day:7,  name:'San Fermín',                 type:'local' },
    { month:7, day:8,  name:'San Fermín',                 type:'local' },
    { month:7, day:14, name:'San Fermín',                 type:'local' },
  ],
  'Tenerife': [
    { month:2, day:28, name:'Carnaval de Santa Cruz de Tenerife', type:'local', note:'Uno de los carnavales más grandes del mundo. Variable — febrero/marzo.' },
  ],

  // Japón
  'Kioto': [
    { month:7, day:17, name:'Gion Matsuri',               type:'local', note:'Festival más famoso de Japón. Carrozas por el centro. Julio entero festivo.' },
    { month:7, day:24, name:'Gion Matsuri (2ª parte)',     type:'local' },
  ],
  'Tokio': [
    { month:5, day:18, name:'Sanja Matsuri',              type:'local', note:'Festival de Asakusa. Tercera semana de mayo.' },
  ],
  'Osaka': [
    { month:7, day:25, name:'Tenjin Matsuri',             type:'local', note:'Festival de barcos en el río. Fuegos artificiales.' },
  ],

  // Tailandia
  'Chiang Mai': [
    { month:11,day:15, name:'Yi Peng (Festival de las Linternas)', type:'local', note:'Luna llena de noviembre. Miles de linternas al cielo. Variable.' },
    { month:4, day:13, name:'Songkran Chiang Mai',        type:'local', note:'El Songkran más intenso de Tailandia. Varios días de guerra de agua.' },
  ],

  // Brasil
  'Río de Janeiro': [
    { month:2, day:28, name:'Carnaval de Río',            type:'local', note:'El más famoso del mundo. Variable — 4 días antes del Miércoles de Ceniza. Todo lleno y muy caro.' },
    { month:9, day:7,  name:'Desfile del Siete de Septiembre', type:'local', note:'Desfile de independencia en Río. Avenida Presidente Vargas cortada.' },
  ],
};

// ─── API pública ─────────────────────────────────────────────────────────────

/**
 * Obtiene los festivos para un país/ciudad en una fecha concreta
 * @param {string} country — nombre del país normalizado
 * @param {string} dateStr — formato 'YYYY-MM-DD'
 * @param {string} [cityName] — nombre de la ciudad (para festivos locales)
 * @returns {Array<{name, type, note}>}
 */
export function getHolidaysForDate(country, dateStr, cityName = '') {
  if (!country || !dateStr) return [];
  const [year, month, day] = dateStr.split('-').map(Number);
  const result = [];

  // Festivos fijos nacionales
  const fixed = FIXED_HOLIDAYS[country] || [];
  fixed.forEach(h => {
    if (h.month === month && h.day === day) {
      result.push({ name: h.name, type: h.type, note: h.note });
    }
  });

  // Festivos móviles
  const mobile = getMobileHolidays(country, year);
  mobile.forEach(h => {
    if (h.date === dateStr) {
      result.push({ name: h.name, type: h.type, note: h.note });
    }
  });

  // Festivos locales por ciudad
  if (cityName) {
    // Buscar por nombre de ciudad (partial match)
    const cityKey = Object.keys(CITY_HOLIDAYS).find(k =>
      cityName.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(cityName.toLowerCase())
    );
    if (cityKey) {
      CITY_HOLIDAYS[cityKey].forEach(h => {
        if (h.month === month && h.day === day) {
          result.push({ name: h.name, type: 'local', note: h.note });
        }
      });
    }
  }

  return result;
}

/**
 * Obtiene todos los festivos de un país en un rango de fechas
 * @param {string} country
 * @param {string} startDate — 'YYYY-MM-DD'
 * @param {string} endDate — 'YYYY-MM-DD'
 * @param {Array<{name, country, start_date, end_date}>} cities — ciudades del viaje
 * @returns {Array<{date, name, type, note, city?}>}
 */
export function getHolidaysInRange(countries, startDate, endDate, cities = []) {
  if (!startDate || !endDate) return [];
  const result = [];
  // new Date('YYYY-MM-DD') parsea como medianoche UTC, pero el bucle avanza
  // y `fmt()` formatea en hora LOCAL — para usuarios en zonas horarias
  // negativas (Colombia, México, que este archivo soporta explícitamente
  // más abajo) todo el rango se desplazaba un día antes, perdiendo festivos
  // del último día del viaje. parseDateOnly ya evita esta trampa en
  // tripContext.js — se reutiliza aquí por el mismo motivo.
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (!start || !end) return [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = fmt(d);

    // Find which city we're in on this date
    const currentCity = cities.find(c =>
      c.start_date && c.end_date && dateStr >= c.start_date && dateStr <= c.end_date
    );
    const currentCountry = currentCity?.country || (countries.length > 0 ? countries[0] : '');

    const holidays = getHolidaysForDate(currentCountry, dateStr, currentCity?.name);
    holidays.forEach(h => {
      result.push({ date: dateStr, ...h, city: currentCity?.name, country: currentCountry });
    });
  }

  return result;
}

// ─── AMPLIACIÓN: TODOS LOS PAÍSES ─────────────────────────────────────────────
// Añadidos a FIXED_HOLIDAYS via merge al final del archivo

const EXTRA_HOLIDAYS = {

  // ══ EUROPA ADICIONAL ═════════════════════════════════════════════════════════

  'Suiza': [
    { month:1,  day:1,  name:'Neujahr',                        type:'national' },
    { month:8,  day:1,  name:'Bundesfeiertag',                 type:'national', note:'Día Nacional. Fuegos artificiales en todo el país.' },
    { month:12, day:25, name:'Weihnachten',                    type:'national' },
    { month:12, day:26, name:'Stephanstag',                    type:'national' },
  ],
  'Austria': [
    { month:1,  day:1,  name:'Neujahr',                        type:'national' },
    { month:1,  day:6,  name:'Heilige Drei Könige',            type:'national' },
    { month:5,  day:1,  name:'Staatsfeiertag',                 type:'national' },
    { month:8,  day:15, name:'Mariä Himmelfahrt',              type:'national' },
    { month:10, day:26, name:'Nationalfeiertag',               type:'national', note:'Día Nacional de Austria.' },
    { month:11, day:1,  name:'Allerheiligen',                  type:'national' },
    { month:12, day:8,  name:'Mariä Empfängnis',               type:'national' },
    { month:12, day:25, name:'Weihnachten',                    type:'national' },
    { month:12, day:26, name:'Stefanitag',                     type:'national' },
  ],
  'Bélgica': [
    { month:1,  day:1,  name:'Jour de l\'An',                  type:'national' },
    { month:5,  day:1,  name:'Fête du Travail',                type:'national' },
    { month:7,  day:21, name:'Fête Nationale',                 type:'national', note:'Día Nacional de Bélgica. Desfile militar en Bruselas.' },
    { month:8,  day:15, name:'Assomption',                     type:'national' },
    { month:11, day:1,  name:'Toussaint',                      type:'national' },
    { month:11, day:11, name:'Armistice',                      type:'national' },
    { month:12, day:25, name:'Noël',                           type:'national' },
  ],
  'Países Bajos': [
    { month:1,  day:1,  name:'Nieuwjaarsdag',                  type:'national' },
    { month:4,  day:27, name:'Koningsdag',                     type:'national', note:'Día del Rey. Todo de naranja. Mercadillos por las calles.' },
    { month:5,  day:5,  name:'Bevrijdingsdag',                 type:'national' },
    { month:12, day:25, name:'Eerste Kerstdag',                type:'national' },
    { month:12, day:26, name:'Tweede Kerstdag',                type:'national' },
  ],
  'Polonia': [
    { month:1,  day:1,  name:'Nowy Rok',                       type:'national' },
    { month:1,  day:6,  name:'Trzech Króli',                   type:'national' },
    { month:5,  day:1,  name:'Święto Pracy',                   type:'national' },
    { month:5,  day:3,  name:'Święto Konstytucji',             type:'national' },
    { month:8,  day:15, name:'Wniebowzięcie',                  type:'national' },
    { month:11, day:1,  name:'Wszystkich Świętych',            type:'national' },
    { month:11, day:11, name:'Święto Niepodległości',          type:'national' },
    { month:12, day:25, name:'Boże Narodzenie',                type:'national' },
    { month:12, day:26, name:'Drugi dzień świąt',              type:'national' },
  ],
  'República Checa': [
    { month:1,  day:1,  name:'Nový rok',                       type:'national' },
    { month:5,  day:1,  name:'Svátek práce',                   type:'national' },
    { month:5,  day:8,  name:'Den vítězství',                  type:'national' },
    { month:7,  day:5,  name:'Den slovanských věrozvěstů',     type:'national' },
    { month:7,  day:6,  name:'Den upálení Mistra Jana Husa',   type:'national' },
    { month:9,  day:28, name:'Den české státnosti',            type:'national' },
    { month:10, day:28, name:'Den vzniku Československa',      type:'national' },
    { month:11, day:17, name:'Den boje za svobodu',            type:'national' },
    { month:12, day:24, name:'Štědrý den',                     type:'national' },
    { month:12, day:25, name:'1. svátek vánoční',              type:'national' },
    { month:12, day:26, name:'2. svátek vánoční',              type:'national' },
  ],
  'Hungría': [
    { month:1,  day:1,  name:'Újév',                           type:'national' },
    { month:3,  day:15, name:'Nemzeti ünnep',                  type:'national', note:'Día de la Revolución de 1848.' },
    { month:5,  day:1,  name:'A munka ünnepe',                 type:'national' },
    { month:8,  day:20, name:'Államalapítás ünnepe',           type:'national', note:'Día de San Esteban. Fuegos artificiales en Budapest.' },
    { month:10, day:23, name:'Az 1956-os forradalom ünnepe',   type:'national' },
    { month:11, day:1,  name:'Mindenszentek',                  type:'national' },
    { month:12, day:25, name:'Karácsony',                      type:'national' },
    { month:12, day:26, name:'Karácsony 2. napja',             type:'national' },
  ],
  'Suecia': [
    { month:1,  day:1,  name:'Nyårsdagen',                     type:'national' },
    { month:1,  day:6,  name:'Trettondedag jul',               type:'national' },
    { month:5,  day:1,  name:'Första maj',                     type:'national' },
    { month:6,  day:6,  name:'Sveriges nationaldag',           type:'national' },
    { month:6,  day:21, name:'Midsommar',                      type:'national', note:'Solsticio de verano. Todo Suecia celebra. Muchos negocios cerrados.' },
    { month:12, day:24, name:'Julafton',                       type:'national', note:'Nochebuena es la celebración principal en Suecia.' },
    { month:12, day:25, name:'Juldagen',                       type:'national' },
    { month:12, day:26, name:'Annandag jul',                   type:'national' },
  ],
  'Noruega': [
    { month:1,  day:1,  name:'Første nyttårsdag',              type:'national' },
    { month:5,  day:1,  name:'Arbeidernes dag',                type:'national' },
    { month:5,  day:17, name:'Syttende mai',                   type:'national', note:'Día Nacional de Noruega. Desfiles de escolares, todos de fiesta.' },
    { month:12, day:25, name:'Første juledag',                 type:'national' },
    { month:12, day:26, name:'Andre juledag',                  type:'national' },
  ],
  'Dinamarca': [
    { month:1,  day:1,  name:'Nytårsdag',                      type:'national' },
    { month:6,  day:5,  name:'Grundlovsdag',                   type:'national', note:'Día de la Constitución.' },
    { month:12, day:25, name:'Juledag',                        type:'national' },
    { month:12, day:26, name:'Anden juledag',                  type:'national' },
  ],
  'Finlandia': [
    { month:1,  day:1,  name:'Uudenvuodenpäivä',               type:'national' },
    { month:1,  day:6,  name:'Loppiainen',                     type:'national' },
    { month:5,  day:1,  name:'Vappu',                          type:'national', note:'Vappu: estudiantes y trabajadores celebran en las calles.' },
    { month:6,  day:19, name:'Juhannuspäivä',                  type:'national', note:'Midsommar finlandés. Todo el país a las cabañas del lago.' },
    { month:12, day:6,  name:'Itsenäisyyspäivä',               type:'national', note:'Día de la Independencia de Finlandia.' },
    { month:12, day:24, name:'Jouluaatto',                      type:'national' },
    { month:12, day:25, name:'Joulupäivä',                     type:'national' },
    { month:12, day:26, name:'Tapaninpäivä',                   type:'national' },
  ],
  'Irlanda': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:3,  day:17, name:'St. Patrick\'s Day',             type:'national', note:'Día de San Patricio. Desfiles en Dublín. Todo de verde.' },
    { month:8,  day:4,  name:'August Bank Holiday',            type:'national', mobile:true },
    { month:10, day:27, name:'October Bank Holiday',           type:'national', mobile:true },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'St. Stephen\'s Day',             type:'national' },
  ],
  'Escocia': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:1,  day:2,  name:'2nd January',                    type:'national' },
    { month:11, day:30, name:'St. Andrew\'s Day',              type:'national' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'Boxing Day',                     type:'national' },
  ],
  'Croacia': [
    { month:1,  day:1,  name:'Nova godina',                    type:'national' },
    { month:1,  day:6,  name:'Sveta tri kralja',               type:'national' },
    { month:5,  day:1,  name:'Praznik rada',                   type:'national' },
    { month:5,  day:30, name:'Dan državnosti',                 type:'national' },
    { month:6,  day:22, name:'Dan antifašističke borbe',       type:'national' },
    { month:8,  day:5,  name:'Dan domovinske zahvalnosti',     type:'national' },
    { month:8,  day:15, name:'Velika Gospa',                   type:'national' },
    { month:10, day:8,  name:'Dan neovisnosti',                type:'national' },
    { month:11, day:1,  name:'Svi sveti',                      type:'national' },
    { month:12, day:25, name:'Božić',                          type:'national' },
    { month:12, day:26, name:'Sveti Stjepan',                  type:'national' },
  ],
  'Eslovenia': [
    { month:1,  day:1,  name:'Novo leto',                      type:'national' },
    { month:2,  day:8,  name:'Prešernov dan',                  type:'national' },
    { month:4,  day:27, name:'Dan upora proti okupatorju',     type:'national' },
    { month:5,  day:1,  name:'Praznik dela',                   type:'national' },
    { month:6,  day:25, name:'Dan državnosti',                 type:'national' },
    { month:8,  day:15, name:'Marijino vnebovzetje',           type:'national' },
    { month:10, day:31, name:'Dan reformacije',                type:'national' },
    { month:11, day:1,  name:'Dan spomina na mrtve',           type:'national' },
    { month:12, day:25, name:'Božič',                          type:'national' },
    { month:12, day:26, name:'Dan samostojnosti',              type:'national' },
  ],
  'Rumania': [
    { month:1,  day:1,  name:'Anul Nou',                       type:'national' },
    { month:1,  day:2,  name:'Anul Nou',                       type:'national' },
    { month:1,  day:24, name:'Ziua Unirii Principatelor',      type:'national' },
    { month:5,  day:1,  name:'Ziua Muncii',                    type:'national' },
    { month:6,  day:1,  name:'Ziua Copilului',                 type:'national' },
    { month:8,  day:15, name:'Adormirea Maicii Domnului',      type:'national' },
    { month:11, day:30, name:'Sfântul Andrei',                 type:'national' },
    { month:12, day:1,  name:'Ziua Națională a României',      type:'national', note:'Día Nacional. Desfiles en Bucarest.' },
    { month:12, day:25, name:'Crăciun',                        type:'national' },
    { month:12, day:26, name:'Crăciun',                        type:'national' },
  ],
  'Bulgaria': [
    { month:1,  day:1,  name:'Нова Година',                    type:'national' },
    { month:3,  day:3,  name:'Ден на Освобождението',          type:'national', note:'Día de la Liberación.' },
    { month:5,  day:1,  name:'Ден на труда',                   type:'national' },
    { month:5,  day:6,  name:'Гергьовден',                     type:'national' },
    { month:5,  day:24, name:'Ден на българската просвета',    type:'national' },
    { month:9,  day:6,  name:'Ден на Съединението',            type:'national' },
    { month:9,  day:22, name:'Ден на Независимостта',          type:'national' },
    { month:11, day:1,  name:'Ден на народните будители',      type:'national' },
    { month:12, day:24, name:'Бъдни вечер',                    type:'national' },
    { month:12, day:25, name:'Коледа',                         type:'national' },
    { month:12, day:26, name:'Коледа',                         type:'national' },
  ],
  'Serbia': [
    { month:1,  day:1,  name:'Nova godina',                    type:'national' },
    { month:1,  day:2,  name:'Nova godina',                    type:'national' },
    { month:1,  day:7,  name:'Božić',                          type:'national', note:'Navidad ortodoxa.' },
    { month:2,  day:15, name:'Dan državnosti',                 type:'national', note:'Día del Estado.' },
    { month:2,  day:16, name:'Dan državnosti',                 type:'national' },
    { month:5,  day:1,  name:'Praznik rada',                   type:'national' },
    { month:5,  day:2,  name:'Praznik rada',                   type:'national' },
    { month:11, day:11, name:'Dan primirja',                   type:'national' },
  ],
  'Grecia': [
    { month:1,  day:1,  name:'Πρωτοχρονιά',                   type:'national' },
    { month:1,  day:6,  name:'Θεοφάνεια',                     type:'national' },
    { month:3,  day:25, name:'Εθνική Εορτή',                   type:'national', note:'Día de la Independencia. Desfiles militares.' },
    { month:5,  day:1,  name:'Εργατική Πρωτομαγιά',           type:'national' },
    { month:8,  day:15, name:'Κοίμηση Θεοτόκου',              type:'national', note:'Islas muy concurridas.' },
    { month:10, day:28, name:'Επέτειος του Όχι',               type:'national', note:'Día del No. Desfiles.' },
    { month:12, day:25, name:'Χριστούγεννα',                   type:'national' },
    { month:12, day:26, name:'Σύναξη Θεοτόκου',               type:'national' },
  ],
  'Albania': [
    { month:1,  day:1,  name:'Viti i Ri',                      type:'national' },
    { month:3,  day:14, name:'Dita e Verës',                   type:'national' },
    { month:3,  day:22, name:'Dita e Nevruzit',                type:'national' },
    { month:4,  day:1,  name:'Dita e Sulltan Novruzit',        type:'national' },
    { month:5,  day:1,  name:'Dita Ndërkombëtare e Punës',     type:'national' },
    { month:10, day:19, name:'Dita e Nënë Terezës',            type:'national' },
    { month:11, day:28, name:'Dita e Pavarësisë',              type:'national' },
    { month:11, day:29, name:'Dita e Çlirimit',                type:'national' },
    { month:12, day:8,  name:'Dita Kombëtare e Rinisë',        type:'national' },
    { month:12, day:25, name:'Krishtlindjet',                  type:'national' },
  ],
  'Macedonia del Norte': [
    { month:1,  day:1,  name:'Нова Година',                    type:'national' },
    { month:1,  day:7,  name:'Православен Божиќ',              type:'national' },
    { month:4,  day:14, name:'Велики Петок',                   type:'national' },
    { month:5,  day:1,  name:'Ден на трудот',                  type:'national' },
    { month:5,  day:24, name:'Ден на светите Кирил и Методиј', type:'national' },
    { month:8,  day:2,  name:'Ден на Републиката',             type:'national' },
    { month:9,  day:8,  name:'Ден на независноста',            type:'national' },
    { month:10, day:11, name:'Ден на народното востание',      type:'national' },
    { month:12, day:8,  name:'Ден на Св. Климент Охридски',    type:'national' },
    { month:12, day:25, name:'Католички Божиќ',                type:'national' },
  ],
  'Bosnia y Herzegovina': [
    { month:1,  day:1,  name:'Nova Godina',                    type:'national' },
    { month:1,  day:9,  name:'Dan Republike Srpske',           type:'national' },
    { month:3,  day:1,  name:'Dan nezavisnosti BiH',           type:'national' },
    { month:5,  day:1,  name:'Praznik rada',                   type:'national' },
    { month:11, day:25, name:'Dan državnosti BiH',             type:'national' },
    { month:12, day:25, name:'Božić',                          type:'national' },
  ],
  'Montenegro': [
    { month:1,  day:1,  name:'Nova godina',                    type:'national' },
    { month:1,  day:7,  name:'Pravoslavni Božić',              type:'national' },
    { month:4,  day:27, name:'Dan nezavisnosti',               type:'national' },
    { month:5,  day:1,  name:'Praznik rada',                   type:'national' },
    { month:7,  day:13, name:'Dan državnosti',                 type:'national' },
    { month:12, day:25, name:'Katolički Božić',                type:'national' },
  ],
  'Kosovo': [
    { month:1,  day:1,  name:'Viti i Ri',                      type:'national' },
    { month:2,  day:17, name:'Dita e Pavarësisë',              type:'national', note:'Día de la Independencia de Kosovo.' },
    { month:4,  day:9,  name:'Dita e Kushtetutës',             type:'national' },
    { month:5,  day:1,  name:'Dita Ndërkombëtare e Punës',     type:'national' },
    { month:6,  day:15, name:'Dita e Heronjve',                type:'national' },
    { month:12, day:25, name:'Krishtlindjet',                  type:'national' },
  ],
  'Estonia': [
    { month:1,  day:1,  name:'Uusaasta',                       type:'national' },
    { month:2,  day:24, name:'Iseseisvuspäev',                 type:'national', note:'Día de la Independencia de Estonia.' },
    { month:5,  day:1,  name:'Kevadpüha',                      type:'national' },
    { month:6,  day:23, name:'Võidupüha',                      type:'national' },
    { month:6,  day:24, name:'Jaanipäev',                      type:'national', note:'San Juan. Hogueras y celebraciones midsommar.' },
    { month:8,  day:20, name:'Taasiseseisvumispäev',           type:'national' },
    { month:12, day:24, name:'Jõululaupäev',                   type:'national' },
    { month:12, day:25, name:'Esimene jõulupüha',              type:'national' },
    { month:12, day:26, name:'Teine jõulupüha',                type:'national' },
  ],
  'Letonia': [
    { month:1,  day:1,  name:'Jaunais gads',                   type:'national' },
    { month:5,  day:1,  name:'Darba svētki',                   type:'national' },
    { month:5,  day:4,  name:'Latvijas Republikas neatkarības atjaunošanas diena', type:'national' },
    { month:6,  day:23, name:'Līgo diena',                     type:'national', note:'Víspera de San Juan. Hogueras, canciones, naturaleza.' },
    { month:6,  day:24, name:'Jāņi',                           type:'national', note:'San Juan letón. Todo el país fuera de las ciudades.' },
    { month:11, day:18, name:'Latvijas Republikas proklamēšanas diena', type:'national' },
    { month:12, day:24, name:'Ziemassvētku vakars',            type:'national' },
    { month:12, day:25, name:'Ziemassvētki',                   type:'national' },
    { month:12, day:26, name:'Otrie Ziemassvētki',             type:'national' },
  ],
  'Lituania': [
    { month:1,  day:1,  name:'Naujieji metai',                 type:'national' },
    { month:2,  day:16, name:'Lietuvos valstybės atkūrimo diena', type:'national' },
    { month:3,  day:11, name:'Lietuvos nepriklausomybės atkūrimo diena', type:'national' },
    { month:5,  day:1,  name:'Tarptautinė darbo diena',        type:'national' },
    { month:6,  day:24, name:'Rasos ir Joninių šventė',        type:'national' },
    { month:7,  day:6,  name:'Valstybės diena',                type:'national' },
    { month:8,  day:15, name:'Žolinė',                         type:'national' },
    { month:11, day:1,  name:'Visų Šventųjų diena',            type:'national' },
    { month:12, day:24, name:'Kūčios',                         type:'national' },
    { month:12, day:25, name:'Šv. Kalėdų pirma diena',         type:'national' },
    { month:12, day:26, name:'Šv. Kalėdų antra diena',         type:'national' },
  ],
  'Eslovaquia': [
    { month:1,  day:1,  name:'Deň vzniku SR',                  type:'national' },
    { month:1,  day:6,  name:'Zjavenie Pána',                  type:'national' },
    { month:5,  day:1,  name:'Sviatok práce',                  type:'national' },
    { month:5,  day:8,  name:'Deň víťazstva',                  type:'national' },
    { month:7,  day:5,  name:'Sv. Cyril a Metod',              type:'national' },
    { month:8,  day:29, name:'SNP',                            type:'national' },
    { month:9,  day:1,  name:'Deň Ústavy',                     type:'national' },
    { month:9,  day:15, name:'Sedembolestná Panna Mária',      type:'national' },
    { month:11, day:1,  name:'Sviatok všetkých svätých',       type:'national' },
    { month:11, day:17, name:'Deň boja za slobodu',            type:'national' },
    { month:12, day:24, name:'Štedrý deň',                     type:'national' },
    { month:12, day:25, name:'Prvý sviatok vianočný',          type:'national' },
    { month:12, day:26, name:'Druhý sviatok vianočný',         type:'national' },
  ],
  'Malta': [
    { month:1,  day:1,  name:'L-Ewwel tas-Sena',               type:'national' },
    { month:2,  day:10, name:'Il-Festa tal-Imnarja',            type:'national' },
    { month:3,  day:19, name:'San Ġużepp',                     type:'national' },
    { month:3,  day:31, name:'Jum il-Ħelsien',                 type:'national' },
    { month:5,  day:1,  name:'Jum il-Ħaddiem',                 type:'national' },
    { month:6,  day:7,  name:'Sette Giugno',                   type:'national' },
    { month:6,  day:29, name:'L-Apostli San Pietru u San Pawl', type:'national' },
    { month:8,  day:15, name:'Santa Marija',                   type:'national' },
    { month:9,  day:8,  name:'Jum il-Vitorja',                 type:'national' },
    { month:9,  day:21, name:'Jum l-Indipendenza',             type:'national' },
    { month:12, day:8,  name:'Il-Kunċizzjoni',                 type:'national' },
    { month:12, day:13, name:'Jum ir-Repubblika',              type:'national' },
    { month:12, day:25, name:'Il-Milied',                      type:'national' },
  ],
  'Chipre': [
    { month:1,  day:1,  name:'Πρωτοχρονιά',                   type:'national' },
    { month:1,  day:6,  name:'Θεοφάνεια',                     type:'national' },
    { month:3,  day:25, name:'Εθνική Εορτή Ελλάδος',          type:'national' },
    { month:4,  day:1,  name:'Εθνική Εορτή Κύπρου',           type:'national' },
    { month:5,  day:1,  name:'Εργατική Πρωτομαγιά',           type:'national' },
    { month:8,  day:15, name:'Κοίμηση Θεοτόκου',              type:'national' },
    { month:10, day:1,  name:'Ημέρα Ανεξαρτησίας',            type:'national' },
    { month:10, day:28, name:'Επέτειος του Όχι',               type:'national' },
    { month:12, day:25, name:'Χριστούγεννα',                   type:'national' },
    { month:12, day:26, name:'Δεύτερη μέρα Χριστουγέννων',    type:'national' },
  ],
  'Luxemburgo': [
    { month:1,  day:1,  name:'Nouvel An',                      type:'national' },
    { month:5,  day:1,  name:'Fête du Travail',                type:'national' },
    { month:6,  day:23, name:'Fête Nationale',                 type:'national', note:'Día Nacional de Luxemburgo. Fuegos artificiales.' },
    { month:8,  day:15, name:'Assomption',                     type:'national' },
    { month:11, day:1,  name:'Toussaint',                      type:'national' },
    { month:12, day:25, name:'Noël',                           type:'national' },
    { month:12, day:26, name:'Saint-Étienne',                  type:'national' },
  ],
  'Islandia': [
    { month:1,  day:1,  name:'Nýársdagur',                    type:'national' },
    { month:5,  day:1,  name:'Verkalýðsdagurinn',             type:'national' },
    { month:6,  day:17, name:'Þjóðhátíðardagurinn',           type:'national', note:'Día Nacional de Islandia. Desfiles coloridos en Reikiavik.' },
    { month:12, day:24, name:'Aðfangadagur',                  type:'national' },
    { month:12, day:25, name:'Jóladagur',                     type:'national' },
    { month:12, day:26, name:'Annar jóladagur',               type:'national' },
    { month:12, day:31, name:'Gamlársdagur',                  type:'national' },
  ],
  'Ucrania': [
    { month:1,  day:1,  name:'Новий рік',                      type:'national' },
    { month:1,  day:7,  name:'Різдво Христове',                type:'national', note:'Navidad ortodoxa.' },
    { month:3,  day:8,  name:'Міжнародний жіночий день',       type:'national' },
    { month:5,  day:1,  name:'День праці',                     type:'national' },
    { month:5,  day:9,  name:'День перемоги',                  type:'national' },
    { month:6,  day:28, name:'День Конституції',               type:'national' },
    { month:8,  day:24, name:'День Незалежності',              type:'national', note:'Día de la Independencia. Desfiles en Kiev.' },
    { month:12, day:25, name:'Різдво Христове',                type:'national' },
  ],
  'Georgia': [
    { month:1,  day:1,  name:'ახალი წელი',                     type:'national' },
    { month:1,  day:2,  name:'ახალი წელი',                     type:'national' },
    { month:1,  day:7,  name:'შობა',                           type:'national', note:'Navidad ortodoxa georgiana.' },
    { month:3,  day:3,  name:'დედის დღე',                      type:'national' },
    { month:3,  day:8,  name:'ქალთა საერთაშორისო დღე',         type:'national' },
    { month:4,  day:9,  name:'ეროვნული ერთიანობის დღე',        type:'national' },
    { month:5,  day:9,  name:'გამარჯვების დღე',                type:'national' },
    { month:5,  day:12, name:'წმ. ანდრია პირველწოდებულის დღე', type:'national' },
    { month:5,  day:26, name:'დამოუკიდებლობის დღე',            type:'national', note:'Día de la Independencia.' },
    { month:8,  day:28, name:'მარიამობა',                      type:'national' },
    { month:10, day:14, name:'სვეტიცხოვლობა',                  type:'national' },
    { month:11, day:23, name:'გიორგობა',                       type:'national' },
  ],
  'Armenia': [
    { month:1,  day:1,  name:'Ամանոր',                         type:'national' },
    { month:1,  day:6,  name:'Սուրբ Ծնունդ',                   type:'national', note:'Navidad armenia.' },
    { month:3,  day:8,  name:'Կանանց միջազgային օր',           type:'national' },
    { month:4,  day:24, name:'Ցեղասպանության հիշատակի օր',    type:'national', note:'Día del Genocidio Armenio. Silencio y recogimiento.' },
    { month:5,  day:1,  name:'Աշxատանqի oր',                   type:'national' },
    { month:5,  day:9,  name:'Հաղthagան',                      type:'national' },
    { month:5,  day:28, name:'Հանeperditiepublika oр',         type:'national' },
    { month:7,  day:5,  name:'Սahмanadrut`yan oр',             type:'national' },
    { month:9,  day:21, name:'Ανteknկaqnut`yan oр',            type:'national', note:'Día de la Independencia.' },
    { month:12, day:31, name:'Hamshaxayin toner',              type:'national' },
  ],
  'Azerbaiyán': [
    { month:1,  day:1,  name:'Yeni il',                        type:'national' },
    { month:1,  day:20, name:'Ümumxalq hüzn günü',             type:'national', note:'Día del Duelo Nacional.' },
    { month:3,  day:8,  name:'Qadınlar günü',                  type:'national' },
    { month:3,  day:20, name:'Novruz bayramı',                 type:'national', note:'Año Nuevo persa. Grandes celebraciones.' },
    { month:5,  day:9,  name:'Qələbə günü',                    type:'national' },
    { month:5,  day:28, name:'Respublika günü',                type:'national' },
    { month:6,  day:15, name:'Milli qurtuluş günü',            type:'national' },
    { month:6,  day:26, name:'Silahlı Qüvvələr günü',          type:'national' },
    { month:10, day:18, name:'Müstəqillik günü',               type:'national' },
    { month:11, day:8,  name:'Zəfər günü',                     type:'national' },
    { month:11, day:12, name:'Konstitusiya günü',              type:'national' },
    { month:12, day:31, name:'Dünya azərbaycanlılarının həmrəylik günü', type:'national' },
  ],
  'Bielorrusia': [
    { month:1,  day:1,  name:'Новы год',                       type:'national' },
    { month:1,  day:7,  name:'Каляды',                         type:'national' },
    { month:3,  day:8,  name:'Дзень жанчын',                   type:'national' },
    { month:3,  day:15, name:'Дзень Канстытуцыі',              type:'national' },
    { month:4,  day:21, name:'Радаўніца',                      type:'national' },
    { month:5,  day:1,  name:'Дзень працы',                    type:'national' },
    { month:5,  day:9,  name:'Дзень Перамогі',                 type:'national', note:'Día de la Victoria. Grandes desfiles militares.' },
    { month:7,  day:3,  name:'Дзень Незалежнасці',             type:'national', note:'Día de la Independencia.' },
    { month:11, day:7,  name:'Дзень Кастрычніцкай рэвалюцыі', type:'national' },
    { month:12, day:25, name:'Раство Хрыстова',                type:'national' },
  ],
  'Moldavia': [
    { month:1,  day:1,  name:'Anul Nou',                       type:'national' },
    { month:1,  day:7,  name:'Crăciunul pe rit vechi',         type:'national' },
    { month:3,  day:8,  name:'Ziua Femeii',                    type:'national' },
    { month:5,  day:1,  name:'Ziua Muncii',                    type:'national' },
    { month:5,  day:9,  name:'Ziua Victoriei',                 type:'national' },
    { month:6,  day:1,  name:'Ziua Copilului',                 type:'national' },
    { month:8,  day:27, name:'Ziua Independenței',             type:'national', note:'Día de la Independencia.' },
    { month:8,  day:31, name:'Limba noastră',                  type:'national' },
    { month:12, day:25, name:'Crăciunul',                      type:'national' },
  ],

  // ══ ASIA ADICIONAL ═══════════════════════════════════════════════════════════

  'China': [
    { month:1,  day:1,  name:'Año Nuevo',                      type:'national' },
    { month:5,  day:1,  name:'Día del Trabajo',                type:'national', note:'Del 1 al 5 may. Masificación máxima en transporte y atracciones.' },
    { month:10, day:1,  name:'Día Nacional de China',          type:'national', note:'Semana Dorada: 1-7 oct. Todo lleno. Reserva con meses de antelación.' },
    { month:10, day:2,  name:'Día Nacional',                   type:'national' },
    { month:10, day:3,  name:'Día Nacional',                   type:'national' },
  ],
  'Corea del Sur': [
    { month:1,  day:1,  name:'신정',                            type:'national' },
    { month:3,  day:1,  name:'삼일절',                          type:'national', note:'Día del Movimiento de Independencia.' },
    { month:5,  day:5,  name:'어린이날',                         type:'national' },
    { month:6,  day:6,  name:'현충일',                           type:'national' },
    { month:8,  day:15, name:'광복절',                          type:'national', note:'Día de la Liberación. Todo cierra.' },
    { month:10, day:3,  name:'개천절',                          type:'national' },
    { month:10, day:9,  name:'한글날',                          type:'national' },
    { month:12, day:25, name:'크리스마스',                       type:'national' },
  ],
  'Hong Kong': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:4,  day:4,  name:'Ching Ming Festival',            type:'national' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:7,  day:1,  name:'SAR Establishment Day',          type:'national', note:'Aniversario de la handover a China. Desfiles.' },
    { month:10, day:1,  name:'National Day',                   type:'national' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'Boxing Day',                     type:'national' },
  ],
  'Taiwán': [
    { month:1,  day:1,  name:'Republic Day / New Year',        type:'national' },
    { month:2,  day:28, name:'Peace Memorial Day',             type:'national' },
    { month:4,  day:4,  name:'Children\'s Day',                type:'national' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:10, day:10, name:'National Day',                   type:'national', note:'Día Nacional. Desfile en Taipei.' },
  ],
  'Filipinas': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:4,  day:9,  name:'Araw ng Kagitingan',             type:'national' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:6,  day:12, name:'Independence Day',               type:'national', note:'Día de la Independencia. Desfiles.' },
    { month:8,  day:21, name:'Ninoy Aquino Day',               type:'national' },
    { month:8,  day:26, name:'National Heroes Day',            type:'national', mobile:true },
    { month:11, day:1,  name:'All Saints Day',                 type:'national', note:'Filipinos visitan cementerios. Todo el país se desplaza.' },
    { month:11, day:30, name:'Bonifacio Day',                  type:'national' },
    { month:12, day:25, name:'Christmas Day',                  type:'national', note:'La Navidad más larga del mundo: desde septiembre.' },
    { month:12, day:30, name:'Rizal Day',                      type:'national' },
    { month:12, day:31, name:'New Year\'s Eve',                type:'national' },
  ],
  'Malasia': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:2,  day:1,  name:'Federal Territory Day',          type:'national' },
    { month:5,  day:1,  name:'Workers\' Day',                  type:'national' },
    { month:6,  day:2,  name:'Yang di-Pertuan Agong Birthday', type:'national', mobile:true },
    { month:8,  day:31, name:'Hari Merdeka',                   type:'national', note:'Día Nacional. Desfiles en Kuala Lumpur.' },
    { month:9,  day:16, name:'Malaysia Day',                   type:'national' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
  ],
  'Myanmar': [
    { month:1,  day:4,  name:'Independence Day',               type:'national', note:'Día de la Independencia.' },
    { month:2,  day:12, name:'Union Day',                      type:'national' },
    { month:3,  day:2,  name:'Peasants Day',                   type:'national' },
    { month:4,  day:13, name:'Thingyan (Año Nuevo agua)',       type:'national', note:'Festival del agua. Varios días. Calles mojadas.' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:7,  day:19, name:'Martyrs Day',                    type:'national' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
  ],
  'Camboya': [
    { month:1,  day:1,  name:'International New Year',         type:'national' },
    { month:4,  day:14, name:'Khmer New Year',                 type:'national', note:'Año Nuevo jemer. 3 días. Todo cierra.' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:5,  day:13, name:'Royal Ploughing Ceremony',       type:'national' },
    { month:6,  day:1,  name:'International Children\'s Day',  type:'national' },
    { month:9,  day:24, name:'Constitutional Day',             type:'national' },
    { month:10, day:23, name:'Paris Peace Agreements Day',     type:'national' },
    { month:10, day:29, name:'Coronation Day',                 type:'national' },
    { month:11, day:9,  name:'Independence Day',               type:'national' },
    { month:12, day:10, name:'Human Rights Day',               type:'national' },
  ],
  'Laos': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:1,  day:20, name:'Army Day',                       type:'national' },
    { month:3,  day:8,  name:'Women\'s Day',                   type:'national' },
    { month:4,  day:14, name:'Lao New Year (Boun Pi Mai)',      type:'national', note:'Año Nuevo lao. Festival del agua 13-15 abr. Muy celebrado.' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:12, day:2,  name:'National Day',                   type:'national', note:'Día Nacional de Laos.' },
  ],
  'Nepal': [
    { month:1,  day:11, name:'Prithvi Jayanti',                type:'national' },
    { month:2,  day:19, name:'Democracy Day',                  type:'national' },
    { month:5,  day:29, name:'Republic Day',                   type:'national' },
    { month:9,  day:20, name:'Constitution Day',               type:'national' },
  ],
  'Sri Lanka': [
    { month:1,  day:15, name:'Thai Pongal',                    type:'national' },
    { month:2,  day:4,  name:'Independence Day',               type:'national', note:'Día de la Independencia.' },
    { month:4,  day:13, name:'Sinhala & Tamil New Year',       type:'national', note:'Año Nuevo cingalés y tamil. 13-14 abr. Todo cierra.' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
  ],
  'Bangladesh': [
    { month:2,  day:21, name:'Language Movement Day',          type:'national' },
    { month:3,  day:26, name:'Independence Day',               type:'national' },
    { month:4,  day:14, name:'Bengali New Year',               type:'national', note:'Pohela Boishakh. Celebraciones coloridas en Dhaka.' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:8,  day:15, name:'National Mourning Day',          type:'national' },
    { month:12, day:16, name:'Victory Day',                    type:'national' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
  ],
  'Pakistán': [
    { month:2,  day:5,  name:'Kashmir Solidarity Day',         type:'national' },
    { month:3,  day:23, name:'Pakistan Day',                   type:'national', note:'Día de Pakistán. Desfiles militares en Islamabad.' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:8,  day:14, name:'Independence Day',               type:'national', note:'Independencia de Pakistán. Celebraciones por todo el país.' },
    { month:11, day:9,  name:'Iqbal Day',                      type:'national' },
    { month:12, day:25, name:'Jinnah Day / Christmas',         type:'national' },
  ],
  'Kazajistán': [
    { month:1,  day:1,  name:'Новый год',                      type:'national' },
    { month:1,  day:2,  name:'Новый год',                      type:'national' },
    { month:3,  day:8,  name:'Международный женский день',     type:'national' },
    { month:3,  day:21, name:'Наурыз',                         type:'national', note:'Año Nuevo kazajo. Celebraciones 3 días.' },
    { month:5,  day:1,  name:'День единства народа',           type:'national' },
    { month:5,  day:7,  name:'День защитника Отечества',       type:'national' },
    { month:5,  day:9,  name:'День Победы',                    type:'national' },
    { month:6,  day:15, name:'День столицы',                   type:'national' },
    { month:7,  day:6,  name:'День Столицы',                   type:'national' },
    { month:8,  day:30, name:'День Конституции',               type:'national' },
    { month:10, day:25, name:'День Республики',                type:'national' },
    { month:12, day:1,  name:'День Первого Президента',        type:'national' },
    { month:12, day:16, name:'День Независимости',             type:'national', note:'Independencia de Kazajistán.' },
  ],
  'Uzbekistán': [
    { month:1,  day:1,  name:'Yangi yil',                      type:'national' },
    { month:3,  day:8,  name:'Xotin-qizlar kuni',              type:'national' },
    { month:3,  day:21, name:'Navro\'z',                       type:'national', note:'Año Nuevo persa. Gran celebración.' },
    { month:5,  day:9,  name:'Xotira va qadrlash kuni',        type:'national' },
    { month:6,  day:1,  name:'Bolalar himoyasi kuni',          type:'national' },
    { month:8,  day:31, name:'Mustaqillik kuni',               type:'national', note:'Independencia de Uzbekistán.' },
    { month:10, day:1,  name:'O\'qituvchi va murabbiylar kuni',type:'national' },
    { month:12, day:8,  name:'O\'zbekiston Konstitutsiyasi kuni',type:'national' },
  ],
  'Israel': [
    { month:4,  day:14, name:'Pésaj (Pascua judía)',           type:'national', note:'Semana de Pésaj. Muchas empresas cierran. Transporte limitado.' },
    { month:5,  day:14, name:'Día de la Independencia',        type:'national', note:'Yom Haatzmaut. Fecha variable según calendario hebreo.' },
    { month:9,  day:25, name:'Rosh Hashaná',                   type:'national', note:'Año Nuevo judío. Fecha variable. Todo cierra.' },
    { month:10, day:4,  name:'Yom Kipur',                      type:'national', note:'Día del Perdón. El país para completamente. No hay transporte.' },
    { month:12, day:25, name:'Navidad cristiana',              type:'national' },
  ],
  'Jordania': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:5,  day:25, name:'Independence Day',               type:'national', note:'Día de la Independencia de Jordania.' },
    { month:6,  day:10, name:'Army Day',                       type:'national' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
  ],
  'Líbano': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:2,  day:9,  name:'St. Maroun\'s Day',              type:'national' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:5,  day:25, name:'Liberation Day',                 type:'national' },
    { month:8,  day:15, name:'Assumption',                     type:'national' },
    { month:11, day:22, name:'Independence Day',               type:'national', note:'Independencia del Líbano.' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
  ],
  'Arabia Saudí': [
    { month:2,  day:22, name:'Día Fundacional',                type:'national' },
    { month:9,  day:23, name:'Día Nacional',                   type:'national', note:'Día Nacional de Arabia Saudí. Grandes celebraciones.' },
  ],
  'Kuwait': [
    { month:2,  day:25, name:'National Day',                   type:'national' },
    { month:2,  day:26, name:'Liberation Day',                 type:'national', note:'Liberación de Kuwait.' },
  ],
  'Bahréin': [
    { month:12, day:16, name:'National Day',                   type:'national' },
    { month:12, day:17, name:'National Day',                   type:'national' },
  ],
  'Omán': [
    { month:11, day:18, name:'National Day',                   type:'national' },
    { month:11, day:19, name:'National Day',                   type:'national', note:'Día Nacional de Omán. Espectáculos y fuegos artificiales.' },
  ],
  'Yemen': [
    { month:5,  day:22, name:'National Unity Day',             type:'national' },
    { month:9,  day:26, name:'Revolution Day',                 type:'national' },
    { month:10, day:14, name:'National Day',                   type:'national' },
    { month:11, day:30, name:'Independence Day',               type:'national' },
  ],
  'Irán': [
    { month:2,  day:11, name:'Revolución Islámica',            type:'national', note:'Aniversario de la Revolución. Todo cierra.' },
    { month:3,  day:20, name:'Nowruz (Año Nuevo persa)',       type:'national', note:'Año Nuevo iraní. Semana completa de festivos. Transporte saturado.' },
    { month:4,  day:1,  name:'Día de la República Islámica',   type:'national' },
    { month:6,  day:4,  name:'Muerte del Imam Jomeini',        type:'national' },
    { month:6,  day:5,  name:'Levantamiento de Jordad 15',     type:'national' },
  ],
  'Iraq': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:1,  day:6,  name:'Army Day',                       type:'national' },
    { month:3,  day:21, name:'Nawruz',                         type:'national' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:7,  day:14, name:'Republic Day',                   type:'national' },
    { month:10, day:3,  name:'National Day',                   type:'national' },
  ],
  'Afganistán': [
    { month:2,  day:15, name:'Liberation Day',                 type:'national' },
    { month:3,  day:21, name:'Nowruz',                         type:'national', note:'Año Nuevo afgano.' },
    { month:4,  day:28, name:'Victory of the Afghan Mujahideen', type:'national' },
    { month:8,  day:19, name:'Independence Day',               type:'national' },
  ],
  'Mongolia': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:7,  day:11, name:'Naadam Festival',                type:'national', note:'Festival nacional: lucha, tiro con arco, carreras. 11-13 jul. Imprescindible.' },
    { month:7,  day:12, name:'Naadam',                         type:'national' },
    { month:7,  day:13, name:'Naadam',                         type:'national' },
    { month:11, day:26, name:'Republic Day',                   type:'national' },
    { month:12, day:29, name:'Independence Day',               type:'national' },
  ],

  // ══ AMÉRICA ADICIONAL ════════════════════════════════════════════════════════

  'Venezuela': [
    { month:1,  day:1,  name:'Año Nuevo',                      type:'national' },
    { month:4,  day:19, name:'Declaración de Independencia',   type:'national' },
    { month:5,  day:1,  name:'Día del Trabajador',             type:'national' },
    { month:6,  day:24, name:'Batalla de Carabobo',            type:'national' },
    { month:7,  day:5,  name:'Día de la Independencia',        type:'national', note:'Comercios cerrados. Actos cívicos.' },
    { month:7,  day:24, name:'Natalicio de Simón Bolívar',     type:'national' },
    { month:10, day:12, name:'Día de la Resistencia Indígena', type:'national' },
    { month:12, day:24, name:'Nochebuena',                     type:'national' },
    { month:12, day:25, name:'Navidad',                        type:'national' },
    { month:12, day:31, name:'Nochevieja',                     type:'national' },
  ],
  'Bolivia': [
    { month:1,  day:1,  name:'Año Nuevo',                      type:'national' },
    { month:1,  day:22, name:'Día del Estado Plurinacional',   type:'national' },
    { month:5,  day:1,  name:'Día del Trabajo',                type:'national' },
    { month:6,  day:21, name:'Año Nuevo Aymara',               type:'national', note:'Inti Raymi. Tiwanaku abarrotado.' },
    { month:8,  day:6,  name:'Día de la Independencia',        type:'national', note:'Comercios cerrados. Desfiles.' },
    { month:11, day:2,  name:'Día de los Difuntos',            type:'national' },
    { month:12, day:25, name:'Navidad',                        type:'national' },
  ],
  'Paraguay': [
    { month:1,  day:1,  name:'Año Nuevo',                      type:'national' },
    { month:3,  day:1,  name:'Día de los Héroes',              type:'national' },
    { month:5,  day:1,  name:'Día del Trabajador',             type:'national' },
    { month:5,  day:15, name:'Día de la Independencia',        type:'national', note:'Todo cierra. Desfiles.' },
    { month:6,  day:12, name:'Fin de la Guerra del Chaco',     type:'national' },
    { month:8,  day:15, name:'Fundación de Asunción',          type:'national' },
    { month:9,  day:29, name:'Victoria de Boquerón',           type:'national' },
    { month:12, day:8,  name:'Virgen de Caacupé',              type:'national', note:'Peregrinación masiva a Caacupé. Carreteras colapsadas.' },
    { month:12, day:25, name:'Navidad',                        type:'national' },
  ],
  'Guatemala': [
    { month:1,  day:1,  name:'Año Nuevo',                      type:'national' },
    { month:6,  day:30, name:'Día del Ejército',               type:'national' },
    { month:9,  day:15, name:'Día de la Independencia',        type:'national', note:'Antorchas y desfiles. Todo el país de fiesta.' },
    { month:10, day:20, name:'Revolución de 1944',             type:'national' },
    { month:11, day:1,  name:'Día de Todos los Santos',        type:'national' },
    { month:12, day:24, name:'Nochebuena',                     type:'national' },
    { month:12, day:25, name:'Navidad',                        type:'national' },
    { month:12, day:31, name:'Nochevieja',                     type:'national' },
  ],
  'Honduras': [
    { month:1,  day:1,  name:'Año Nuevo',                      type:'national' },
    { month:4,  day:14, name:'Día de las Américas',            type:'national' },
    { month:5,  day:1,  name:'Día del Trabajo',                type:'national' },
    { month:9,  day:15, name:'Día de la Independencia',        type:'national' },
    { month:10, day:3,  name:'Día del Soldado',                type:'national' },
    { month:10, day:12, name:'Día de la Raza',                 type:'national' },
    { month:10, day:21, name:'Día de las Fuerzas Armadas',     type:'national' },
    { month:12, day:25, name:'Navidad',                        type:'national' },
  ],
  'El Salvador': [
    { month:1,  day:1,  name:'Año Nuevo',                      type:'national' },
    { month:5,  day:1,  name:'Día del Trabajo',                type:'national' },
    { month:8,  day:6,  name:'Fiestas Agostinas',              type:'national', note:'Fiesta del Salvador del Mundo. El Salvador más festivo del año.' },
    { month:9,  day:15, name:'Día de la Independencia',        type:'national' },
    { month:11, day:2,  name:'Día de los Difuntos',            type:'national' },
    { month:11, day:5,  name:'Primer Grito de Independencia',  type:'national' },
    { month:12, day:25, name:'Navidad',                        type:'national' },
  ],
  'Nicaragua': [
    { month:1,  day:1,  name:'Año Nuevo',                      type:'national' },
    { month:5,  day:1,  name:'Día del Trabajo',                type:'national' },
    { month:7,  day:19, name:'Revolución Sandinista',          type:'national', note:'Aniversario de la Revolución. Grandes actos en Managua.' },
    { month:9,  day:14, name:'Batalla de San Jacinto',         type:'national' },
    { month:9,  day:15, name:'Día de la Independencia',        type:'national' },
    { month:12, day:8,  name:'Inmaculada Concepción',          type:'national', note:'La Purísima. Celebraciones con altares y pólvora. Muy ruidoso.' },
    { month:12, day:25, name:'Navidad',                        type:'national' },
  ],
  'Costa Rica': [
    { month:1,  day:1,  name:'Año Nuevo',                      type:'national' },
    { month:4,  day:11, name:'Día de Juan Santamaría',         type:'national' },
    { month:5,  day:1,  name:'Día del Trabajador',             type:'national' },
    { month:7,  day:25, name:'Anexión de Guanacaste',          type:'national' },
    { month:8,  day:2,  name:'Día de la Virgen de los Ángeles',type:'national', note:'Romería masiva a Cartago. Las carreteras colapsan.' },
    { month:8,  day:15, name:'Día de la Madre',                type:'national' },
    { month:9,  day:15, name:'Día de la Independencia',        type:'national' },
    { month:12, day:25, name:'Navidad',                        type:'national' },
  ],
  'Panamá': [
    { month:1,  day:1,  name:'Año Nuevo',                      type:'national' },
    { month:1,  day:9,  name:'Día de los Mártires',            type:'national' },
    { month:5,  day:1,  name:'Día del Trabajador',             type:'national' },
    { month:11, day:3,  name:'Separación de Colombia',         type:'national' },
    { month:11, day:4,  name:'Día de la Bandera',              type:'national' },
    { month:11, day:5,  name:'Independencia de Colombia',      type:'national' },
    { month:11, day:10, name:'Primer Grito de Independencia',  type:'national' },
    { month:11, day:28, name:'Independencia de España',        type:'national' },
    { month:12, day:8,  name:'Día de la Madre',                type:'national' },
    { month:12, day:25, name:'Navidad',                        type:'national' },
  ],
  'Cuba': [
    { month:1,  day:1,  name:'Triunfo de la Revolución',       type:'national', note:'Todo cierra. Actos políticos.' },
    { month:1,  day:2,  name:'Día de la Victoria',             type:'national' },
    { month:4,  day:19, name:'Día de la Victoria de Playa Girón', type:'national' },
    { month:5,  day:1,  name:'Día de los Trabajadores',        type:'national' },
    { month:7,  day:25, name:'Conmemoración del Asalto al Moncada', type:'national' },
    { month:7,  day:26, name:'Día de la Rebeldía Nacional',    type:'national', note:'Actos en Santiago de Cuba.' },
    { month:7,  day:27, name:'Día de la Rebeldía',             type:'national' },
    { month:10, day:10, name:'Inicio de las Guerras de Independencia', type:'national' },
    { month:12, day:25, name:'Navidad',                        type:'national' },
  ],
  'República Dominicana': [
    { month:1,  day:1,  name:'Año Nuevo',                      type:'national' },
    { month:1,  day:6,  name:'Reyes Magos',                    type:'national' },
    { month:1,  day:21, name:'Virgen de la Altagracia',        type:'national' },
    { month:1,  day:26, name:'Duarte Day',                     type:'national' },
    { month:2,  day:27, name:'Día de la Independencia',        type:'national', note:'Todo cierra. Desfiles.' },
    { month:5,  day:1,  name:'Día del Trabajo',                type:'national' },
    { month:8,  day:16, name:'Restauración',                   type:'national' },
    { month:9,  day:24, name:'Virgen de las Mercedes',         type:'national' },
    { month:11, day:6,  name:'Constitución',                   type:'national' },
    { month:12, day:25, name:'Navidad',                        type:'national' },
  ],
  'Puerto Rico': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:1,  day:6,  name:'Reyes Magos',                    type:'national', note:'En PR se celebra mucho. Desfiles en muchos municipios.' },
    { month:1,  day:11, name:'Eugenio María de Hostos Birthday', type:'national' },
    { month:2,  day:18, name:'Presidents Day',                 type:'national', mobile:true },
    { month:3,  day:22, name:'Abolición de la Esclavitud',     type:'national' },
    { month:7,  day:4,  name:'Independence Day (USA)',         type:'national' },
    { month:7,  day:25, name:'Constitución de Puerto Rico',    type:'national' },
    { month:11, day:19, name:'Discovery of Puerto Rico',       type:'national' },
    { month:12, day:25, name:'Navidad',                        type:'national' },
  ],
  'Jamaica': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:2,  day:17, name:'Robert Nesta Marley Birthday',   type:'national' },
    { month:5,  day:23, name:'Labour Day',                     type:'national' },
    { month:8,  day:1,  name:'Emancipation Day',               type:'national' },
    { month:8,  day:6,  name:'Independence Day',               type:'national', note:'Independencia de Jamaica. Fuegos artificiales.' },
    { month:10, day:21, name:'National Heroes Day',            type:'national', mobile:true },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'Boxing Day',                     type:'national' },
  ],
  'Trinidad y Tobago': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:3,  day:30, name:'Spiritual Baptist Liberation Day', type:'national' },
    { month:5,  day:30, name:'Indian Arrival Day',             type:'national' },
    { month:6,  day:19, name:'Labour Day',                     type:'national' },
    { month:8,  day:1,  name:'Emancipation Day',               type:'national' },
    { month:8,  day:31, name:'Independence Day',               type:'national' },
    { month:9,  day:24, name:'Republic Day',                   type:'national' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'Boxing Day',                     type:'national' },
  ],

  // ══ ÁFRICA ADICIONAL ═════════════════════════════════════════════════════════

  'Egipto': [
    { month:1,  day:7,  name:'Navidad Copta',                  type:'national', note:'Navidad de la Iglesia Copta.' },
    { month:4,  day:25, name:'Día del Sinai',                  type:'national' },
    { month:5,  day:1,  name:'Día del Trabajo',                type:'national' },
    { month:6,  day:30, name:'Día de la Revolución de 2013',   type:'national' },
    { month:7,  day:23, name:'Revolución de 1952',             type:'national', note:'Revolución de 1952. Todo cierra.' },
    { month:10, day:6,  name:'Día de las Fuerzas Armadas',     type:'national' },
  ],
  'Túnez': [
    { month:1,  day:1,  name:'Fête du Nouvel An',              type:'national' },
    { month:3,  day:20, name:'Fête de l\'Indépendance',        type:'national' },
    { month:4,  day:9,  name:'Jour des Martyrs',               type:'national' },
    { month:5,  day:1,  name:'Fête du Travail',                type:'national' },
    { month:7,  day:25, name:'Fête de la République',          type:'national', note:'Día de la República.' },
    { month:8,  day:13, name:'Fête de la Femme',               type:'national' },
    { month:10, day:15, name:'Fête de l\'Évacuation',          type:'national' },
  ],
  'Argelia': [
    { month:1,  day:1,  name:'Jour de l\'An',                  type:'national' },
    { month:5,  day:1,  name:'Fête du Travail',                type:'national' },
    { month:6,  day:19, name:'Jour de la Récupération du pétrole', type:'national' },
    { month:7,  day:5,  name:'Fête de l\'Indépendance',        type:'national', note:'Independencia de Argelia. Todo cierra.' },
    { month:11, day:1,  name:'Fête de la Révolution',          type:'national' },
  ],
  'Libia': [
    { month:2,  day:17, name:'Día de la Revolución de 2011',   type:'national' },
    { month:3,  day:3,  name:'Día del Regreso de Ghadames',    type:'national' },
    { month:10, day:23, name:'Día de la Liberación',           type:'national' },
  ],
  'Nigeria': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:5,  day:1,  name:'Workers\' Day',                  type:'national' },
    { month:6,  day:12, name:'Democracy Day',                  type:'national' },
    { month:10, day:1,  name:'Independence Day',               type:'national', note:'Independencia de Nigeria. Todo cierra.' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'Boxing Day',                     type:'national' },
  ],
  'Ghana': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:3,  day:6,  name:'Independence Day',               type:'national', note:'Independencia de Ghana.' },
    { month:5,  day:1,  name:'Workers\' Day',                  type:'national' },
    { month:7,  day:1,  name:'Republic Day',                   type:'national' },
    { month:9,  day:21, name:'Founder\'s Day',                 type:'national' },
    { month:12, day:2,  name:'Farmers\' Day',                  type:'national', mobile:true },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'Boxing Day',                     type:'national' },
  ],
  'Kenia': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:6,  day:1,  name:'Madaraka Day',                   type:'national' },
    { month:10, day:10, name:'Huduma Day',                     type:'national' },
    { month:10, day:20, name:'Mashujaa Day',                   type:'national' },
    { month:12, day:12, name:'Jamhuri Day',                    type:'national', note:'Independencia de Kenia.' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'Boxing Day',                     type:'national' },
  ],
  'Tanzania': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:1,  day:12, name:'Zanzibar Revolution Day',        type:'national' },
    { month:4,  day:26, name:'Union Day',                      type:'national' },
    { month:5,  day:1,  name:'Workers\' Day',                  type:'national' },
    { month:7,  day:7,  name:'Saba Saba Day',                  type:'national' },
    { month:8,  day:8,  name:'Peasants Day',                   type:'national' },
    { month:10, day:14, name:'Nyerere Day',                    type:'national' },
    { month:12, day:9,  name:'Independence Day',               type:'national' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'Boxing Day',                     type:'national' },
  ],
  'Uganda': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:1,  day:26, name:'Liberation Day',                 type:'national' },
    { month:3,  day:8,  name:'Women\'s Day',                   type:'national' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:6,  day:3,  name:'Martyrs Day',                    type:'national' },
    { month:6,  day:9,  name:'National Heroes Day',            type:'national' },
    { month:10, day:9,  name:'Independence Day',               type:'national', note:'Independencia de Uganda.' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'Boxing Day',                     type:'national' },
  ],
  'Etiopía': [
    { month:1,  day:7,  name:'Ethiopian Christmas (Genna)',    type:'national', note:'Navidad etíope. Fecha según calendario etíope (7 ene gregoriano).' },
    { month:1,  day:19, name:'Ethiopian Epiphany (Timkat)',    type:'national', note:'Timkat: bautismo de Jesús. Procesiones en todo el país. Espectacular.' },
    { month:3,  day:2,  name:'Victory of Adwa',               type:'national' },
    { month:4,  day:6,  name:'Patriots Victory Day',          type:'national' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:5,  day:5,  name:'Ethiopian Patriots Day',        type:'national' },
    { month:5,  day:28, name:'Downfall of the Derg',          type:'national' },
    { month:9,  day:11, name:'Ethiopian New Year (Enkutatash)',type:'national', note:'Año Nuevo etíope. Fecha aprox (sept gregoriano).' },
    { month:9,  day:27, name:'Finding of the True Cross (Meskel)', type:'national', note:'Meskel: grandes hogueras y procesiones. Impresionante en Addis Abeba.' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
  ],
  'Senegal': [
    { month:1,  day:1,  name:'Jour de l\'An',                  type:'national' },
    { month:2,  day:4,  name:'Jour des Présidents',            type:'national' },
    { month:4,  day:4,  name:'Jour de l\'Indépendance',        type:'national', note:'Independencia de Senegal.' },
    { month:5,  day:1,  name:'Fête du Travail',                type:'national' },
    { month:8,  day:15, name:'Assomption',                     type:'national' },
    { month:11, day:1,  name:'Toussaint',                      type:'national' },
    { month:12, day:25, name:'Noël',                           type:'national' },
  ],
  'Costa de Marfil': [
    { month:1,  day:1,  name:'Nouvel An',                      type:'national' },
    { month:5,  day:1,  name:'Fête du Travail',                type:'national' },
    { month:8,  day:7,  name:'Fête Nationale',                 type:'national', note:'Independencia de Costa de Marfil.' },
    { month:8,  day:15, name:'Assomption',                     type:'national' },
    { month:11, day:1,  name:'Toussaint',                      type:'national' },
    { month:11, day:15, name:'Fête Nationale de la Paix',      type:'national' },
    { month:12, day:25, name:'Noël',                           type:'national' },
  ],
  'Camerún': [
    { month:1,  day:1,  name:'Nouvel An',                      type:'national' },
    { month:2,  day:11, name:'Youth Day',                      type:'national' },
    { month:5,  day:1,  name:'Fête du Travail',                type:'national' },
    { month:5,  day:20, name:'Fête Nationale',                 type:'national', note:'Día Nacional de Camerún.' },
    { month:8,  day:15, name:'Assomption',                     type:'national' },
    { month:12, day:25, name:'Noël',                           type:'national' },
  ],
  'Angola': [
    { month:1,  day:1,  name:'Ano Novo',                       type:'national' },
    { month:2,  day:4,  name:'Dia do Início da Luta Armada',   type:'national' },
    { month:3,  day:8,  name:'Dia da Mulher',                  type:'national' },
    { month:4,  day:4,  name:'Dia da Paz e Reconciliação',     type:'national' },
    { month:5,  day:1,  name:'Dia do Trabalhador',             type:'national' },
    { month:9,  day:17, name:'Dia do Herói Nacional',          type:'national' },
    { month:11, day:2,  name:'Dia dos Finados',                type:'national' },
    { month:11, day:11, name:'Dia da Independência',           type:'national', note:'Independencia de Angola.' },
    { month:12, day:25, name:'Natal',                          type:'national' },
  ],
  'Mozambique': [
    { month:1,  day:1,  name:'Ano Novo',                       type:'national' },
    { month:2,  day:3,  name:'Dia dos Heróis Moçambicanos',    type:'national' },
    { month:4,  day:7,  name:'Dia da Mulher Moçambicana',      type:'national' },
    { month:5,  day:1,  name:'Dia Internacional do Trabalho',  type:'national' },
    { month:6,  day:25, name:'Dia da Independência Nacional',  type:'national', note:'Independencia de Mozambique.' },
    { month:9,  day:7,  name:'Dia da Vitória',                 type:'national' },
    { month:10, day:4,  name:'Dia da Paz e Reconciliação',     type:'national' },
    { month:12, day:25, name:'Natal',                          type:'national' },
  ],
  'Zimbabwe': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:2,  day:21, name:'Robert Mugabe National Youth Day', type:'national' },
    { month:4,  day:18, name:'Independence Day',               type:'national', note:'Independencia de Zimbabwe.' },
    { month:5,  day:1,  name:'Workers\' Day',                  type:'national' },
    { month:5,  day:25, name:'Africa Day',                     type:'national' },
    { month:8,  day:11, name:'Heroes Day',                     type:'national' },
    { month:8,  day:12, name:'Defence Forces Day',             type:'national' },
    { month:12, day:22, name:'Unity Day',                      type:'national' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'Boxing Day',                     type:'national' },
  ],
  'Zambia': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:3,  day:11, name:'Youth Day',                      type:'national' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:5,  day:25, name:'Africa Freedom Day',             type:'national' },
    { month:7,  day:7,  name:'Heroes Day',                     type:'national', mobile:true },
    { month:7,  day:8,  name:'Unity Day',                      type:'national', mobile:true },
    { month:8,  day:5,  name:'Farmers Day',                    type:'national', mobile:true },
    { month:10, day:24, name:'Independence Day',               type:'national', note:'Independencia de Zambia.' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
  ],
  'Namibia': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:3,  day:21, name:'Independence Day',               type:'national', note:'Independencia de Namibia.' },
    { month:5,  day:1,  name:'Workers\' Day',                  type:'national' },
    { month:5,  day:4,  name:'Cassinga Day',                   type:'national' },
    { month:5,  day:25, name:'Africa Day',                     type:'national' },
    { month:8,  day:26, name:'Heroes Day',                     type:'national' },
    { month:9,  day:10, name:'Day of the Namibian Women',      type:'national' },
    { month:12, day:10, name:'Human Rights Day',               type:'national' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'Family Day',                     type:'national' },
  ],
  'Botsuana': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:5,  day:1,  name:'Workers\' Day',                  type:'national' },
    { month:7,  day:1,  name:'Sir Seretse Khama Day',          type:'national' },
    { month:7,  day:21, name:'President\'s Day',               type:'national', mobile:true },
    { month:9,  day:30, name:'Botswana Day',                   type:'national', note:'Independencia de Botsuana.' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'Boxing Day',                     type:'national' },
  ],
  'Ruanda': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:2,  day:1,  name:'Heroes Day',                     type:'national' },
    { month:4,  day:7,  name:'Genocide Memorial Day',          type:'national', note:'Día de la Memoria del Genocidio. Momento de silencio y recogimiento.' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:7,  day:1,  name:'Independence Day',               type:'national' },
    { month:7,  day:4,  name:'Liberation Day',                 type:'national' },
    { month:8,  day:1,  name:'Harvest Day',                    type:'national' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'Boxing Day',                     type:'national' },
  ],
  'Malawi': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:1,  day:15, name:'John Chilembwe Day',             type:'national' },
    { month:3,  day:3,  name:'Martyr\'s Day',                  type:'national' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:5,  day:14, name:'Kamuzu Day',                     type:'national' },
    { month:7,  day:6,  name:'Independence Day',               type:'national' },
    { month:10, day:17, name:'Mother\'s Day',                  type:'national', mobile:true },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'Boxing Day',                     type:'national' },
  ],
  'Sudán': [
    { month:1,  day:1,  name:'Independence Day',               type:'national', note:'Independencia de Sudán.' },
    { month:6,  day:30, name:'National Day',                   type:'national' },
  ],
  'Somalia': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:7,  day:1,  name:'Independence Day',               type:'national' },
  ],
  'Madagascar': [
    { month:1,  day:1,  name:'Nouvelle Année',                 type:'national' },
    { month:3,  day:29, name:'Martyrs Day',                    type:'national' },
    { month:5,  day:1,  name:'Fête du Travail',                type:'national' },
    { month:6,  day:26, name:'Fête Nationale',                 type:'national', note:'Independencia de Madagascar.' },
    { month:8,  day:15, name:'Assomption',                     type:'national' },
    { month:11, day:1,  name:'Toussaint',                      type:'national' },
    { month:12, day:25, name:'Noël',                           type:'national' },
  ],

  // ══ OCEANÍA ADICIONAL ════════════════════════════════════════════════════════

  'Papúa Nueva Guinea': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:6,  day:16, name:'Queen\'s Birthday',              type:'national', mobile:true },
    { month:7,  day:23, name:'Remembrance Day',                type:'national' },
    { month:8,  day:26, name:'Repentance Day',                 type:'national' },
    { month:9,  day:16, name:'Independence Day',               type:'national', note:'Independencia de PNG.' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'Boxing Day',                     type:'national' },
  ],
  'Fiyi': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:5,  day:1,  name:'Workers\' Day',                  type:'national' },
    { month:10, day:10, name:'Fiji Day',                       type:'national', note:'Independencia de Fiyi.' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'Boxing Day',                     type:'national' },
  ],
  'Samoa': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:6,  day:1,  name:'Independence Day',               type:'national' },
    { month:6,  day:2,  name:'Independence Day',               type:'national' },
    { month:8,  day:12, name:'Assumption',                     type:'national' },
    { month:10, day:12, name:'White Sunday',                   type:'national', mobile:true },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'Boxing Day',                     type:'national' },
  ],
  'Vanuatu': [
    { month:1,  day:1,  name:'New Year\'s Day',                type:'national' },
    { month:2,  day:21, name:'Father Lini Day',                type:'national' },
    { month:3,  day:5,  name:'Custom Chief\'s Day',            type:'national' },
    { month:5,  day:1,  name:'Labour Day',                     type:'national' },
    { month:5,  day:30, name:'Ascension Day',                  type:'national' },
    { month:7,  day:24, name:'Children\'s Day',                type:'national' },
    { month:7,  day:30, name:'Independence Day',               type:'national', note:'Independencia de Vanuatu.' },
    { month:8,  day:15, name:'Assumption',                     type:'national' },
    { month:10, day:5,  name:'Constitution Day',               type:'national' },
    { month:11, day:29, name:'Unity Day',                      type:'national' },
    { month:12, day:25, name:'Christmas Day',                  type:'national' },
    { month:12, day:26, name:'Family Day',                     type:'national' },
  ],
};

// Merge EXTRA_HOLIDAYS into FIXED_HOLIDAYS
Object.entries(EXTRA_HOLIDAYS).forEach(([country, holidays]) => {
  if (FIXED_HOLIDAYS[country]) {
    // Replace (more complete version)
    FIXED_HOLIDAYS[country] = holidays;
  } else {
    FIXED_HOLIDAYS[country] = holidays;
  }
});