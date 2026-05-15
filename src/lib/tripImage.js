/**
 * Stable, deterministic image resolution for trips.
 * Priority: cover_image → first city → country → destination → fallback
 * Uses Unsplash Source API (no key needed) with a stable seed per trip.
 */

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
  'phuket': 'photo-1552465011-b4e21bf6e79a',
  'chiang mai': 'photo-1508009603885-50cf7c579365',
  'seoul': 'photo-1517154421773-0529f29ea451',
  'busan': 'photo-1517154421773-0529f29ea451',
  'singapore': 'photo-1525625293386-3f8f99389edd',
  'hong kong': 'photo-1518509562904-e7ef99cdcc86',
  'beijing': 'photo-1508804185872-d7badad00f7d',
  'shanghai': 'photo-1474181487882-5abf3f0ba6c2',
  'bali': 'photo-1518548419970-58e3b4079ab2',
  'jakarta': 'photo-1518548419970-58e3b4079ab2',
  'hanoi': 'photo-1557750255-c76072a7aad1',
  'ho chi minh': 'photo-1583417319070-4a69db38a482',
  'hoi an': 'photo-1557750255-c76072a7aad1',
  'kuala lumpur': 'photo-1508009603885-50cf7c579365',
  'taipei': 'photo-1580136579312-94651dfd596d',
  'mumbai': 'photo-1529253355930-ddbe423a2ac7',
  'new delhi': 'photo-1567157577867-05ccb1388e66',
  'delhi': 'photo-1567157577867-05ccb1388e66',
  'jaipur': 'photo-1477587458883-47145ed6979e',
  'agra': 'photo-1548013146-72479768bada',
  'kathmandu': 'photo-1518050346340-aa2ec3bb424b',
  'colombo': 'photo-1590150093870-7e8f3d459adb',
  'phnom penh': 'photo-1557750255-c76072a7aad1',
  'siem reap': 'photo-1557750255-c76072a7aad1',
  'yangon': 'photo-1557750255-c76072a7aad1',
  'manila': 'photo-1518548419970-58e3b4079ab2',
  'doha': 'photo-1512453979798-5ea266f8880c',
  'abu dhabi': 'photo-1512453979798-5ea266f8880c',
  'riyadh': 'photo-1512453979798-5ea266f8880c',
  // Europe
  'paris': 'photo-1502602898657-3e91760cbb34',
  'nice': 'photo-1533105079780-92b9be482077',
  'marseille': 'photo-1507003211169-0a1dd7228f2d',
  'lyon': 'photo-1502602898657-3e91760cbb34',
  'rome': 'photo-1552832230-c0197dd311b5',
  'milan': 'photo-1513581166391-887a96ddeafd',
  'milán': 'photo-1513581166391-887a96ddeafd',
  'florence': 'photo-1543783207-ec64e4d95325',
  'florencia': 'photo-1543783207-ec64e4d95325',
  'venice': 'photo-1523906834658-6e24ef2386f9',
  'venecia': 'photo-1523906834658-6e24ef2386f9',
  'naples': 'photo-1552832230-c0197dd301b5',
  'barcelona': 'photo-1539037116277-4db20889f2d4',
  'madrid': 'photo-1543783207-ec64e4d95325',
  'seville': 'photo-1559566350-5db2d6f5e4af',
  'sevilla': 'photo-1559566350-5db2d6f5e4af',
  'granada': 'photo-1558618666-fcd25c85cd64',
  'valencia': 'photo-1548013146-72479768bada',
  'bilbao': 'photo-1543783207-ec64e4d95325',
  'amsterdam': 'photo-1534351590666-13e3e96b5902',
  'london': 'photo-1513635269975-59663e0ac1ad',
  'edinburgh': 'photo-1514924013411-cbf25faa35bb',
  'edimburgo': 'photo-1514924013411-cbf25faa35bb',
  'berlin': 'photo-1560969184-10fe8719e047',
  'munich': 'photo-1560969184-10fe8719e047',
  'hamburg': 'photo-1560969184-10fe8719e047',
  'prague': 'photo-1541849546-216549ae216d',
  'praga': 'photo-1541849546-216549ae216d',
  'vienna': 'photo-1516550893923-42d28e5677af',
  'viena': 'photo-1516550893923-42d28e5677af',
  'lisbon': 'photo-1555881400-74d7acaacd8b',
  'porto': 'photo-1555881400-74d7acaacd8b',
  'athens': 'photo-1533105079780-92b9be482077',
  'atenas': 'photo-1533105079780-92b9be482077',
  'santorini': 'photo-1533105079780-92b9be482077',
  'mykonos': 'photo-1533105079780-92b9be482077',
  'brussels': 'photo-1491557345352-5929e343eb89',
  'bruselas': 'photo-1491557345352-5929e343eb89',
  'zurich': 'photo-1515488764276-beab57ef3330',
  'zúrich': 'photo-1515488764276-beab57ef3330',
  'geneva': 'photo-1515488764276-beab57ef3330',
  'ginebra': 'photo-1515488764276-beab57ef3330',
  'interlaken': 'photo-1531366936337-7c912a4589a7',
  'copenhagen': 'photo-1513622470522-26c3c8a854bc',
  'copenhague': 'photo-1513622470522-26c3c8a854bc',
  'stockholm': 'photo-1509356843151-3e7d96241e11',
  'estocolmo': 'photo-1509356843151-3e7d96241e11',
  'oslo': 'photo-1531366936337-7c912a4589a7',
  'reykjavik': 'photo-1531366936337-7c912a4589a7',
  'reikiavik': 'photo-1531366936337-7c912a4589a7',
  'budapest': 'photo-1541849546-216549ae216d',
  'warsaw': 'photo-1541849546-216549ae216d',
  'varsovia': 'photo-1541849546-216549ae216d',
  'krakow': 'photo-1541849546-216549ae216d',
  'cracovia': 'photo-1541849546-216549ae216d',
  'dubrovnik': 'photo-1533105079780-92b9be482077',
  'split': 'photo-1533105079780-92b9be482077',
  'zagreb': 'photo-1541849546-216549ae216d',
  'ljubljana': 'photo-1515488764276-beab57ef3330',
  'oporto': 'photo-1555881400-74d7acaacd8b',
  // Egypt & Middle East
  'cairo': 'photo-1539650116574-75c0c6d73f6e',
  'el cairo': 'photo-1539650116574-75c0c6d73f6e',
  'luxor': 'photo-1568322445389-f64ac2515020',
  'aswan': 'photo-1545156521-77bd85671d30',
  'alejandría': 'photo-1570289965-ec95c05b4f02',
  'alexandria': 'photo-1570289965-ec95c05b4f02',
  'hurghada': 'photo-1548574505-5e239809ee19',
  'sharm el sheikh': 'photo-1544735716-392fe2489ffa',
  'amman': 'photo-1558618666-fcd25c85cd64',
  'petra': 'photo-1558618666-fcd25c85cd64',
  'tel aviv': 'photo-1558618666-fcd25c85cd64',
  'jerusalem': 'photo-1558618666-fcd25c85cd64',
  'jerusal\u00e9n': 'photo-1558618666-fcd25c85cd64',
  'beirut': 'photo-1558618666-fcd25c85cd64',
  'tehran': 'photo-1558618666-fcd25c85cd64',
  'isfahan': 'photo-1558618666-fcd25c85cd64',
  // Africa
  'marrakech': 'photo-1539020140153-e479b8c22e70',
  'fez': 'photo-1539020140153-e479b8c22e70',
  'fes': 'photo-1539020140153-e479b8c22e70',
  'casablanca': 'photo-1539020140153-e479b8c22e70',
  'nairobi': 'photo-1547471080-7cc2caa01a7e',
  'cape town': 'photo-1536859355448-76f92ebdc33d',
  'ciudad del cabo': 'photo-1536859355448-76f92ebdc33d',
  'johannesburg': 'photo-1536859355448-76f92ebdc33d',
  'dar es salaam': 'photo-1547471080-7cc2caa01a7e',
  'zanzibar': 'photo-1547471080-7cc2caa01a7e',
  // Americas
  'new york': 'photo-1496442226666-8d4d0e62e6e9',
  'nueva york': 'photo-1496442226666-8d4d0e62e6e9',
  'los angeles': 'photo-1580655653885-65763b2597d0',
  'san francisco': 'photo-1501594907352-04cda38ebc29',
  'miami': 'photo-1533106497176-45ae19e68ba2',
  'chicago': 'photo-1494522855154-9297ac14b55f',
  'las vegas': 'photo-1581351721010-8cf859cb14a4',
  'washington': 'photo-1501466044931-62695aada8e9',
  'boston': 'photo-1501466044931-62695aada8e9',
  'toronto': 'photo-1517090504586-fde19ea6066f',
  'vancouver': 'photo-1559494007-9f5847c49d94',
  'montreal': 'photo-1517090504586-fde19ea6066f',
  'mexico city': 'photo-1518659526054-190340b52735',
  'ciudad de mexico': 'photo-1518659526054-190340b52735',
  'ciudad de méxico': 'photo-1518659526054-190340b52735',
  'cancun': 'photo-1552074284-5e88ef1aef18',
  'cancún': 'photo-1552074284-5e88ef1aef18',
  'playa del carmen': 'photo-1552074284-5e88ef1aef18',
  'tulum': 'photo-1552074284-5e88ef1aef18',
  'havana': 'photo-1570831739435-6601aa3fa4fb',
  'la habana': 'photo-1570831739435-6601aa3fa4fb',
  'bogotá': 'photo-1597008641621-cefdcf718025',
  'bogota': 'photo-1597008641621-cefdcf718025',
  'cartagena': 'photo-1563227812-0ea4c22e6cc8',
  'medellín': 'photo-1569144157591-c60f3f82f137',
  'medellin': 'photo-1569144157591-c60f3f82f137',
  'cali': 'photo-1575384043002-22b0c1b24cd3',
  'san josé': 'photo-1507525428034-b723cf961d3e',
  'san jose': 'photo-1507525428034-b723cf961d3e',
  'manuel antonio': 'photo-1552832230-c0197dd311b5',
  'arenal': 'photo-1504701954957-2010ec3bcec1',
  'monteverde': 'photo-1518548419970-58e3b4079ab2',
  'tamarindo': 'photo-1507525428034-b723cf961d3e',
  'rio de janeiro': 'photo-1483729558449-99ef09a8c325',
  'são paulo': 'photo-1483729558449-99ef09a8c325',
  'salvador': 'photo-1483729558449-99ef09a8c325',
  'buenos aires': 'photo-1589909202802-8f4aadce1849',
  'lima': 'photo-1484723091739-30a097e8f929',
  'cusco': 'photo-1484723091739-30a097e8f929',
  'machu picchu': 'photo-1484723091739-30a097e8f929',
  'santiago': 'photo-1474266411885-af22de9ff8d2',
  'valparaíso': 'photo-1474266411885-af22de9ff8d2',
  'quito': 'photo-1504701954957-2010ec3bcec1',
  'galápagos': 'photo-1507525428034-b723cf961d3e',
  'galapagos': 'photo-1507525428034-b723cf961d3e',
  'panama city': 'photo-1507525428034-b723cf961d3e',
  'ciudad de panamá': 'photo-1507525428034-b723cf961d3e',
  // Oceania
  'sydney': 'photo-1506905925346-21bda4d32df4',
  'melbourne': 'photo-1506905925346-21bda4d32df4',
  'auckland': 'photo-1507699622108-4be3abd695ad',
  'queenstown': 'photo-1507699622108-4be3abd695ad',
  // Other
  'dubai': 'photo-1512453979798-5ea266f8880c',
  'istanbul': 'photo-1524231757912-21f4fe3a7200',
};

const COUNTRY_IMAGES = {
  // Europe
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
  'gran bretaña': 'photo-1513635269975-59663e0ac1ad',
  'reino unido': 'photo-1513635269975-59663e0ac1ad',
  'netherlands': 'photo-1534351590666-13e3e96b5902',
  'holanda': 'photo-1534351590666-13e3e96b5902',
  'países bajos': 'photo-1534351590666-13e3e96b5902',
  'greece': 'photo-1533105079780-92b9be482077',
  'grecia': 'photo-1533105079780-92b9be482077',
  'turkey': 'photo-1524231757912-21f4fe3a7200',
  'turquía': 'photo-1524231757912-21f4fe3a7200',
  'australia': 'photo-1506905925346-21bda4d32df4',
  'new zealand': 'photo-1507699622108-4be3abd695ad',
  'nueva zelanda': 'photo-1507699622108-4be3abd695ad',
  'morocco': 'photo-1539020140153-e479b8c22e70',
  'marruecos': 'photo-1539020140153-e479b8c22e70',
  'uae': 'photo-1512453979798-5ea266f8880c',
  'emiratos': 'photo-1512453979798-5ea266f8880c',
  'dubai': 'photo-1512453979798-5ea266f8880c',
  'singapore': 'photo-1525625293386-3f8f99389edd',
  'singapur': 'photo-1525625293386-3f8f99389edd',
  'brazil': 'photo-1483729558449-99ef09a8c325',
  'brasil': 'photo-1483729558449-99ef09a8c325',
  'argentina': 'photo-1589909202802-8f4aadce1849',
  'mexico': 'photo-1518659526054-190340b52735',
  'méxico': 'photo-1518659526054-190340b52735',
  'egypt': 'photo-1539650116574-75c0c6d73f6e',
  'egipto': 'photo-1539650116574-75c0c6d73f6e',
  // New additions
  'colombia': 'photo-1563227812-0ea4c22e6cc8',
  'costa rica': 'photo-1507525428034-b723cf961d3e',
  'perú': 'photo-1484723091739-30a097e8f929',
  'peru': 'photo-1484723091739-30a097e8f929',
  'chile': 'photo-1474266411885-af22de9ff8d2',
  'cuba': 'photo-1570831739435-6601aa3fa4fb',
  'panamá': 'photo-1507525428034-b723cf961d3e',
  'panama': 'photo-1507525428034-b723cf961d3e',
  'ecuador': 'photo-1504701954957-2010ec3bcec1',
  'bolivia': 'photo-1484723091739-30a097e8f929',
  'venezuela': 'photo-1483729558449-99ef09a8c325',
  'uruguay': 'photo-1589909202802-8f4aadce1849',
  'paraguay': 'photo-1483729558449-99ef09a8c325',
  'israel': 'photo-1558618666-fcd25c85cd64',
  'jordania': 'photo-1558618666-fcd25c85cd64',
  'jordan': 'photo-1558618666-fcd25c85cd64',
  'iran': 'photo-1558618666-fcd25c85cd64',
  'irán': 'photo-1558618666-fcd25c85cd64',
  'south africa': 'photo-1536859355448-76f92ebdc33d',
  'sudáfrica': 'photo-1536859355448-76f92ebdc33d',
  'kenya': 'photo-1547471080-7cc2caa01a7e',
  'kenia': 'photo-1547471080-7cc2caa01a7e',
  'tanzania': 'photo-1547471080-7cc2caa01a7e',
  'filipinas': 'photo-1518548419970-58e3b4079ab2',
  'philippines': 'photo-1518548419970-58e3b4079ab2',
  'india': 'photo-1529253355930-ddbe423a2ac7',
  'nepal': 'photo-1518050346340-aa2ec3bb424b',
  'sri lanka': 'photo-1590150093870-7e8f3d459adb',
  'myanmar': 'photo-1557750255-c76072a7aad1',
  'camboya': 'photo-1557750255-c76072a7aad1',
  'cambodia': 'photo-1557750255-c76072a7aad1',
  'malasia': 'photo-1508009603885-50cf7c579365',
  'malaysia': 'photo-1508009603885-50cf7c579365',
  'suecia': 'photo-1509356843151-3e7d96241e11',
  'sweden': 'photo-1509356843151-3e7d96241e11',
  'noruega': 'photo-1531366936337-7c912a4589a7',
  'norway': 'photo-1531366936337-7c912a4589a7',
  'dinamarca': 'photo-1513622470522-26c3c8a854bc',
  'denmark': 'photo-1513622470522-26c3c8a854bc',
  'finlandia': 'photo-1531366936337-7c912a4589a7',
  'finland': 'photo-1531366936337-7c912a4589a7',
  'islandia': 'photo-1531366936337-7c912a4589a7',
  'iceland': 'photo-1531366936337-7c912a4589a7',
  'suiza': 'photo-1515488764276-beab57ef3330',
  'switzerland': 'photo-1515488764276-beab57ef3330',
  'bélgica': 'photo-1491557345352-5929e343eb89',
  'belgium': 'photo-1491557345352-5929e343eb89',
  'escocia': 'photo-1514924013411-cbf25faa35bb',
  'scotland': 'photo-1514924013411-cbf25faa35bb',
  'irlanda': 'photo-1513635269975-59663e0ac1ad',
  'ireland': 'photo-1513635269975-59663e0ac1ad',
  'canadá': 'photo-1517090504586-fde19ea6066f',
  'canada': 'photo-1517090504586-fde19ea6066f',
  'polonia': 'photo-1541849546-216549ae216d',
  'poland': 'photo-1541849546-216549ae216d',
  'hungría': 'photo-1541849546-216549ae216d',
  'hungary': 'photo-1541849546-216549ae216d',
  'república checa': 'photo-1541849546-216549ae216d',
  'czech republic': 'photo-1541849546-216549ae216d',
  'austria': 'photo-1516550893923-42d28e5677af',
  'croacia': 'photo-1533105079780-92b9be482077',
  'croatia': 'photo-1533105079780-92b9be482077',
  'eslovenia': 'photo-1515488764276-beab57ef3330',
  'slovenia': 'photo-1515488764276-beab57ef3330',
  'serbia': 'photo-1541849546-216549ae216d',
  'rumanía': 'photo-1541849546-216549ae216d',
  'romania': 'photo-1541849546-216549ae216d',
  'bulgaria': 'photo-1533105079780-92b9be482077',
  'arabia saudita': 'photo-1512453979798-5ea266f8880c',
  'saudi arabia': 'photo-1512453979798-5ea266f8880c',
  'qatar': 'photo-1512453979798-5ea266f8880c',
  'kuwait': 'photo-1512453979798-5ea266f8880c',
  'omán': 'photo-1512453979798-5ea266f8880c',
  'oman': 'photo-1512453979798-5ea266f8880c',
  'túnez': 'photo-1539020140153-e479b8c22e70',
  'tunisia': 'photo-1539020140153-e479b8c22e70',
  'ghana': 'photo-1547471080-7cc2caa01a7e',
  'nigeria': 'photo-1547471080-7cc2caa01a7e',
  'senegal': 'photo-1547471080-7cc2caa01a7e',
  'etiopía': 'photo-1547471080-7cc2caa01a7e',
  'ethiopia': 'photo-1547471080-7cc2caa01a7e',
  'ruanda': 'photo-1547471080-7cc2caa01a7e',
  'rwanda': 'photo-1547471080-7cc2caa01a7e',
  'mozambique': 'photo-1547471080-7cc2caa01a7e',
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
  if (CITY_IMAGES[key]) return unsplashUrl(CITY_IMAGES[key]);
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
 */
export function getTripCoverImage(trip, cities = []) {
  if (trip?.cover_image) return trip.cover_image;

  if (cities.length > 0) {
    const firstCity = cities[0];
    if (firstCity.image_url) return firstCity.image_url;
    const img = lookupCity(firstCity.name);
    if (img) return img;
    for (let i = 1; i < cities.length; i++) {
      const img2 = lookupCity(cities[i].name);
      if (img2) return img2;
    }
  }

  const countryImg = lookupCountry(trip?.country) || lookupCountry(trip?.destination);
  if (countryImg) return countryImg;

  const destImg = lookupCity(trip?.destination);
  if (destImg) return destImg;

  if (trip?.id) {
    const idx = trip.id.charCodeAt(0) % FALLBACK_IMAGES.length;
    return unsplashUrl(FALLBACK_IMAGES[idx]);
  }

  return unsplashUrl(FALLBACK_IMAGES[0]);
}