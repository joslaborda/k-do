/**
 * Extracts place names from markdown itinerary content.
 * Prioritizes: bold text, list items, headings.
 */
export function extractPlaces(content) {
  if (!content) return [];

  const places = new Set();

  // Bold text: **Place Name** or __Place Name__
  const boldMatches = content.matchAll(/\*\*([^*\n]+)\*\*|__([^_\n]+)__/g);
  for (const m of boldMatches) {
    const val = (m[1] || m[2]).trim();
    if (val.length > 2 && val.length < 60) places.add(val);
  }

  // Headings: ## Place or ### Place
  const headingMatches = content.matchAll(/^#{1,4}\s+(.+)$/gm);
  for (const m of headingMatches) {
    const val = m[1].trim();
    if (val.length > 2 && val.length < 60) places.add(val);
  }

  // List items: - Place or * Place
  const listMatches = content.matchAll(/^[\-\*]\s+(.+)$/gm);
  for (const m of listMatches) {
    // Strip inline bold/italic from list items
    const val = m[1].replace(/\*\*|__|\*|_/g, '').trim();
    if (val.length > 2 && val.length < 60) places.add(val);
  }

  // Deduplicate and return first 5 to keep URL reasonable
  return [...places].slice(0, 5);
}

/**
 * Builds a Google Maps directions URL.
 * origin: string (accommodation or city name)
 * places: string[]
 */
export function buildMapsUrl(origin, places, cityName) {
  const effectiveOrigin = origin || cityName;
  if (!places || places.length === 0) return null;

  const encode = (s) => encodeURIComponent(s.trim());

  const parts = [encode(effectiveOrigin), ...places.map(encode)];
  return `https://www.google.com/maps/dir/${parts.join('/')}`;
}