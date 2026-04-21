export function normalizeText(str = '') {
  return str
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getAllCountries(locale = 'es-ES') {
  try {
    const regions = Intl.supportedValuesOf('region');
    const dn = new Intl.DisplayNames([locale], { type: 'region' });

    const countries = regions
      .map((code) => ({ code, label: dn.of(code) }))
      .filter((c) => c.label && c.label !== c.code)
      .sort((a, b) => a.label.localeCompare(b.label, locale));

    return countries;
  } catch {
    return [
      { code: 'ES', label: 'España' },
      { code: 'IT', label: 'Italia' },
      { code: 'FR', label: 'Francia' },
      { code: 'PT', label: 'Portugal' },
      { code: 'DE', label: 'Alemania' },
      { code: 'GB', label: 'Reino Unido' },
      { code: 'US', label: 'Estados Unidos' },
      { code: 'MX', label: 'México' },
      { code: 'AR', label: 'Argentina' },
      { code: 'BR', label: 'Brasil' },
      { code: 'JP', label: 'Japón' },
      { code: 'TH', label: 'Tailandia' },
      { code: 'KR', label: 'Corea del Sur' },
      { code: 'CN', label: 'China' },
      { code: 'VN', label: 'Vietnam' },
      { code: 'SG', label: 'Singapur' },
      { code: 'ID', label: 'Indonesia' },
      { code: 'MA', label: 'Marruecos' },
      { code: 'TR', label: 'Turquía' },
      { code: 'CH', label: 'Suiza' },
      { code: 'GR', label: 'Grecia' },
    ];
  }
}

export function canonicalizeCountry(input, countries) {
  const n = normalizeText(input);
  if (!n) return '';

  const exact = countries.find((c) => normalizeText(c.label) === n);
  if (exact) return exact.label;

  const loose = countries.find((c) => normalizeText(c.label).includes(n) || n.includes(normalizeText(c.label)));
  if (loose) return loose.label;

  return input.trim();
}