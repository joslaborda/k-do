/**
 * Stable, deterministic image resolution for trips.
 * Priority: cover_image → first city → country → destination → fallback
 * Uses Unsplash Source API (no key needed) with a stable seed per trip.
 */

// Well-known city → curated Unsplash photo ID for consistent, beautiful images
const CITY_IMAGES = {
  // Japan
  'tokyo': 'photo-1540959733332-eab4deabeeaf',
  'kyoto': 'photo-1493976040374-85c8e12f0c0e',
  'osaka': 'photo-1590559899731-a382839e5549',
  'hiroshima': 'photo-1528360983277-13d401cdc186',
  'nara': 'photo-1545569341-9eb8b30979d9',
  'hakone': 'photo-1578271887552-5ac3a72752bc',
  'sapporo': 'photo-1478436127897-769e1b3f0f36',
  'fukuoka': 'photo-1535979863199-3c77338429a0',
  'nikko': 'photo-1554797589-7241bb691973',
  // Asia
  'bangkok': 'photo-1508009603885-50cf7c579365',
  'seoul': 'photo-1517154421773-0529f29ea451',
  'singapore': 'photo-1525625293386-3f8f99389edd',
  'hong kong': 'photo-1518509562904-e7ef99cdcc86',
  'beijing': 'photo-1508804185872-d7badad00f7d',
  'shanghai': 'photo-1474181487882-5abf3f0ba6c2',
  'bali': 'photo-1518548419970-58e3b4079ab2',
  'hanoi': 'photo-1557750255-c76072a7aad1',
  'ho chi minh': 'photo-1583417319070-4a69db38a482',
  // Europe
  'paris': 'photo-1502602898657-3e91760cbb34',
  'rome': 'photo-1552832230-c0197dd311b5',
  'barcelona': 'photo-1539037116277-4db20889f2d4',
  'amsterdam': 'photo-1534351590666-13e3e96b5902',
  'london': 'photo-1513635269975-59663e0ac1ad',
  'berlin': 'photo-1560969184-10fe8719e047',
  'prague': 'photo-1541849546-216549ae216d',
  'vienna': 'photo-1516550893923-42d28e5677af',
  'lisbon': 'photo-1555881400-74d7acaacd8b',
  'madrid': 'photo-1543783207-ec64e4d95325',
  // Americas
  'new york': 'photo-1496442226666-8d4d0e62e6e9',
  'los angeles': 'photo-1580655653885-65763b2597d0',
  'miami': 'photo-1533106497176-45ae19e68ba2',
  'cancun': 'photo-1552074284-5e88ef1aef18',
  'rio de janeiro': 'photo-1483729558449-99ef09a8c325',
  'buenos aires': 'photo-1589909202802-8f4aadce1849',
  // Other
  'dubai': 'photo-1512453979798-5ea266f8880c',
  'istanbul': 'photo-1524231757912-21f4fe3a7200',
  'cairo': 'photo-1539650116574-75c0c6d73f6e',
  'sydney': 'photo-1506905925346-21bda4d32df4',
  'marrakech': 'photo-1539020140153-e479b8c22e70',
};

// Country fallback images
const COUNTRY_IMAGES = {
  'japan': 'photo-1493976040374-85c8e12f0c0e',
  'japón': 'photo-1493976040374-85c8e12f0c0e',
  'france': 'photo-1502602898657-3e91760cbb34',
  'francia': 'photo-1502602898657-3e91760cbb34',
  'italy': 'photo-1523906834658-6e24ef2386f9',
  'italia': 'photo-1523906834658-6e24ef2386f9',
  'spain': 'photo-1543783207-ec64e4d95325',
  'españa': 'photo-1543783207-ec64e4d95325',
  'thailand': 'photo-1508009603885-50cf7c579365',
  'tailandia': 'photo-1508009603885-50cf7c579365',
  'usa': 'photo-1496442226666-8d4d0e62e6e9',
  'united states': 'photo-1496442226666-8d4d0e62e6e9',
  'estados unidos': 'photo-1496442226666-8d4d0e62e6e9',
  'south korea': 'photo-1517154421773-0529f29ea451',
  'corea del sur': 'photo-1517154421773-0529f29ea451',
  'indonesia': 'photo-1518548419970-58e3b4079ab2',
  'vietnam': 'photo-1557750255-c76072a7aad1',
  'china': 'photo-1474181487882-5abf3f0ba6c2',
  'portugal': 'photo-1555881400-74d7acaacd8b',
  'germany': 'photo-1560969184-10fe8719e047',
  'alemania': 'photo-1560969184-10fe8719e047',
  'uk': 'photo-1513635269975-59663e0ac1ad',
  'england': 'photo-1513635269975-59663e0ac1ad',
  'amsterdam': 'photo-1534351590666-13e3e96b5902',
  'netherlands': 'photo-1534351590666-13e3e96b5902',
  'holanda': 'photo-1534351590666-13e3e96b5902',
  'greece': 'photo-1533105079780-92b9be482077',
  'grecia': 'photo-1533105079780-92b9be482077',
  'turkey': 'photo-1524231757912-21f4fe3a7200',
  'turquía': 'photo-1524231757912-21f4fe3a7200',
  'australia': 'photo-1506905925346-21bda4d32df4',
  'morocco': 'photo-1539020140153-e479b8c22e70',
  'marruecos': 'photo-1539020140153-e479b8c22e70',
  'uae': 'photo-1512453979798-5ea266f8880c',
  'dubai': 'photo-1512453979798-5ea266f8880c',
  'singapore': 'photo-1525625293386-3f8f99389edd',
  'singapur': 'photo-1525625293386-3f8f99389edd',
  'brazil': 'photo-1483729558449-99ef09a8c325',
  'brasil': 'photo-1483729558449-99ef09a8c325',
  'argentina': 'photo-1589909202802-8f4aadce1849',
  'mexico': 'photo-1552074284-5e88ef1aef18',
  'méxico': 'photo-1552074284-5e88ef1aef18',
  'egypt': 'photo-1539650116574-75c0c6d73f6e',
  'egipto': 'photo-1539650116574-75c0c6d73f6e',
};

const FALLBACK_IMAGES = [
  'photo-1488085061387-422e29b40080',
  'photo-1476514525535-07fb3b4ae5f1',
  'photo-1530521954074-e64f6810b32d',
  'photo-1506012787146-f92b2d7d6d96',
];

function unsplashUrl(photoId, width = 800) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

function normalize(str = '') {
  return str.toLowerCase().trim();
}

function lookupCity(cityName) {
  if (!cityName) return null;
  const key = normalize(cityName);
  // exact match
  if (CITY_IMAGES[key]) return unsplashUrl(CITY_IMAGES[key]);
  // partial match
  for (const [k, v] of Object.entries(CITY_IMAGES)) {
    if (key.includes(k) || k.includes(key)) return unsplashUrl(v);
  }
  return null;
}

function lookupCountry(countryName) {
  if (!countryName) return null;
  const key = normalize(countryName);
  if (COUNTRY_IMAGES[key]) return unsplashUrl(COUNTRY_IMAGES[key]);
  for (const [k, v] of Object.entries(COUNTRY_IMAGES)) {
    if (key.includes(k) || k.includes(key)) return unsplashUrl(v);
  }
  return null;
}

/**
 * Returns the best image URL for a trip card.
 * @param {object} trip - Trip entity
 * @param {Array}  cities - Sorted city list for this trip (order ASC)
 */
export function getTripCoverImage(trip, cities = []) {
  // P1: explicit cover_image set by user
  if (trip?.cover_image) return trip.cover_image;

  // P2: first city in itinerary
  if (cities.length > 0) {
    const firstCity = cities[0];
    // City may have its own image
    if (firstCity.image_url) return firstCity.image_url;
    const img = lookupCity(firstCity.name);
    if (img) return img;
    // Try subsequent cities
    for (let i = 1; i < cities.length; i++) {
      const img2 = lookupCity(cities[i].name);
      if (img2) return img2;
    }
  }

  // P3: country
  const countryImg = lookupCountry(trip?.country) || lookupCountry(trip?.destination);
  if (countryImg) return countryImg;

  // P4: destination text match (could be a city name too)
  const destImg = lookupCity(trip?.destination);
  if (destImg) return destImg;

  // P5: stable fallback based on trip id
  if (trip?.id) {
    const idx = trip.id.charCodeAt(0) % FALLBACK_IMAGES.length;
    return unsplashUrl(FALLBACK_IMAGES[idx]);
  }

  return unsplashUrl(FALLBACK_IMAGES[0]);
}