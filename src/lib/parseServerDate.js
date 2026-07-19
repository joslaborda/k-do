// base44 estampa `created_date` (y otros timestamps automáticos que el
// cliente no controla) en UTC, pero la cadena que devuelve no siempre trae
// el sufijo `Z` / offset. Sin él, tanto `new Date()` como `parseISO` de
// date-fns interpretan la hora como LOCAL, no UTC — el síntoma es que algo
// recién creado aparece "hace 2 horas" (el desfase de España en verano,
// CEST = UTC+2) en vez de "ahora mismo".
//
// Solo afecta a timestamps con hora ('...T...'); las fechas sin hora
// ('2026-07-19') ya se interpretan como UTC-medianoche por spec y añadirles
// 'Z' las rompería. Si la cadena ya trae Z/offset, se deja tal cual.
export function parseServerDate(value) {
  if (!value) return null;
  if (value.includes('T') && !/Z$|[+-]\d{2}:?\d{2}$/.test(value)) {
    return new Date(`${value}Z`);
  }
  return new Date(value);
}
