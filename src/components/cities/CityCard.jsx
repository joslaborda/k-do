import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const cityImages = {
  // ── JAPÓN ──────────────────────────────────────────────────────────────────
  'Tokyo':          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
  'Tokio':          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
  'Kyoto':          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
  'Kioto':          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
  'Osaka':          'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800',
  'Hiroshima':      'https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?w=800',
  'Hakone':         'https://images.unsplash.com/photo-1578637387939-43c525550085?w=800',
  'Nara':           'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
  'Sapporo':        'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?w=800',
  'Fukuoka':        'https://images.unsplash.com/photo-1606924734046-ee560d706fcf?w=800',
  'Nagoya':         'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800',
  'Nikko':          'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=800',
  'Kamakura':       'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800',

  // ── COREA DEL SUR ──────────────────────────────────────────────────────────
  'Seoul':          'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800',
  'Seúl':           'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800',
  'Busan':          'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=800',
  'Jeju':           'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',

  // ── TAILANDIA ──────────────────────────────────────────────────────────────
  'Bangkok':        'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=800',
  'Chiang Mai':     'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
  'Phuket':         'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800',
  'Krabi':          'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
  'Koh Samui':      'https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=800',

  // ── VIETNAM ────────────────────────────────────────────────────────────────
  'Hanoi':          'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=800',
  'Hanói':          'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=800',
  'Ho Chi Minh':    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
  'Saigon':         'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
  'Hoi An':         'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
  'Da Nang':        'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
  'Hue':            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  'Ha Long':        'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',

  // ── INDONESIA ──────────────────────────────────────────────────────────────
  'Bali':           'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
  'Ubud':           'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800',
  'Jakarta':        'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=800',
  'Yogyakarta':     'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800',
  'Lombok':         'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800',

  // ── SINGAPUR ───────────────────────────────────────────────────────────────
  'Singapore':      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',
  'Singapur':       'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',

  // ── CHINA ──────────────────────────────────────────────────────────────────
  'Beijing':        'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
  'Pekín':          'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
  'Shanghai':       'https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?w=800',
  'Shanghái':       'https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?w=800',
  'Chengdu':        'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
  'Guilin':         'https://images.unsplash.com/photo-1537531460737-91f0c655b8a5?w=800',

  // ── INDIA ──────────────────────────────────────────────────────────────────
  'Mumbai':         'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800',
  'Delhi':          'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
  'Nueva Delhi':    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
  'Jaipur':         'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800',
  'Agra':           'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
  'Varanasi':       'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800',
  'Goa':            'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',

  // ── MARRUECOS ──────────────────────────────────────────────────────────────
  'Marrakech':      'https://images.unsplash.com/photo-1597212618440-806262de4f0b?w=800',
  'Fez':            'https://images.unsplash.com/photo-1553701538-049c8a87ef14?w=800',
  'Fès':            'https://images.unsplash.com/photo-1553701538-049c8a87ef14?w=800',
  'Chefchaouen':    'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800',
  'Casablanca':     'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
  'Essaouira':      'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800',
  'Merzouga':       'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',

  // ── TURQUÍA ────────────────────────────────────────────────────────────────
  'Istanbul':       'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800',
  'Estambul':       'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800',
  'Cappadocia':     'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800',
  'Capadocia':      'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800',
  'Antalya':        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
  'Pamukkale':      'https://images.unsplash.com/photo-1589561253898-768105ca91a8?w=800',
  'Bodrum':         'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',

  // ── GRECIA ─────────────────────────────────────────────────────────────────
  'Athens':         'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800',
  'Atenas':         'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800',
  'Santorini':      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
  'Mykonos':        'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=800',
  'Crete':          'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800',
  'Creta':          'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800',
  'Rhodes':         'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800',
  'Rodas':          'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800',

  // ── ITALIA ─────────────────────────────────────────────────────────────────
  'Rome':           'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
  'Roma':           'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
  'Florence':       'https://images.unsplash.com/photo-1541370976299-4d24be63b4a6?w=800',
  'Florencia':      'https://images.unsplash.com/photo-1541370976299-4d24be63b4a6?w=800',
  'Venice':         'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800',
  'Venecia':        'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800',
  'Milan':          'https://images.unsplash.com/photo-1512497405173-5df37d0fbb7e?w=800',
  'Milán':          'https://images.unsplash.com/photo-1512497405173-5df37d0fbb7e?w=800',
  'Naples':         'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800',
  'Nápoles':        'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800',
  'Amalfi':         'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800',
  'Cinque Terre':   'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=800',
  'Turin':          'https://images.unsplash.com/photo-1512497405173-5df37d0fbb7e?w=800',
  'Turín':          'https://images.unsplash.com/photo-1512497405173-5df37d0fbb7e?w=800',
  'Bologna':        'https://images.unsplash.com/photo-1541370976299-4d24be63b4a6?w=800',
  'Bolonia':        'https://images.unsplash.com/photo-1541370976299-4d24be63b4a6?w=800',
  'Sicily':         'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800',
  'Sicilia':        'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800',

  // ── FRANCIA ────────────────────────────────────────────────────────────────
  'Paris':          'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
  'París':          'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
  'Lyon':           'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?w=800',
  'Marseille':      'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?w=800',
  'Marsella':       'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?w=800',
  'Nice':           'https://images.unsplash.com/photo-1491166617655-0723a0e0a54d?w=800',
  'Niza':           'https://images.unsplash.com/photo-1491166617655-0723a0e0a54d?w=800',
  'Bordeaux':       'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?w=800',
  'Burdeos':        'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?w=800',
  'Strasbourg':     'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
  'Estrasburgo':    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
  'Mont Saint-Michel': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',

  // ── ESPAÑA ─────────────────────────────────────────────────────────────────
  'Barcelona':      'https://images.unsplash.com/photo-1464790719320-516ecd75af6c?w=800',
  'Madrid':         'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
  'Seville':        'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
  'Sevilla':        'https://images.unsplash.com/photo-1558618047-3c8c0e0e0e27?w=800',
  'Granada':        'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800',
  'Valencia':       'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800',
  'Bilbao':         'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800',
  'San Sebastián':  'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800',
  'Málaga':         'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800',
  'Toledo':         'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800',
  'Córdoba':        'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800',

  // ── PORTUGAL ───────────────────────────────────────────────────────────────
  'Lisbon':         'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
  'Lisboa':         'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=800',
  'Porto':          'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800',
  'Algarve':        'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
  'Sintra':         'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',

  // ── ALEMANIA ───────────────────────────────────────────────────────────────
  'Berlin':         'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
  'Berlín':         'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
  'Munich':         'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
  'Múnich':         'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
  'Hamburg':        'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
  'Hamburgo':       'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
  'Cologne':        'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
  'Colonia':        'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
  'Frankfurt':      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
  'Rothenburg':     'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',

  // ── REINO UNIDO ────────────────────────────────────────────────────────────
  'London':         'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
  'Londres':        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
  'Edinburgh':      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
  'Edimburgo':      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
  'Oxford':         'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
  'Cambridge':      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
  'Bath':           'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
  'Manchester':     'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',

  // ── PAÍSES BAJOS ───────────────────────────────────────────────────────────
  'Amsterdam':      'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
  'Rotterdam':      'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
  'The Hague':      'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
  'La Haya':        'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',

  // ── SUIZA ──────────────────────────────────────────────────────────────────
  'Zurich':         'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800',
  'Zúrich':         'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800',
  'Geneva':         'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800',
  'Ginebra':        'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800',
  'Interlaken':     'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800',
  'Lucerne':        'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800',
  'Lucerna':        'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800',
  'Zermatt':        'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800',

  // ── AUSTRIA ────────────────────────────────────────────────────────────────
  'Vienna':         'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800',
  'Viena':          'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800',
  'Salzburg':       'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800',
  'Salzburgo':      'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800',
  'Innsbruck':      'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800',

  // ── REPÚBLICA CHECA ────────────────────────────────────────────────────────
  'Prague':         'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800',
  'Praga':          'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800',
  'Cesky Krumlov': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800',

  // ── HUNGRÍA ────────────────────────────────────────────────────────────────
  'Budapest':       'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800',

  // ── POLONIA ────────────────────────────────────────────────────────────────
  'Krakow':         'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=800',
  'Cracovia':       'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=800',
  'Warsaw':         'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=800',
  'Varsovia':       'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=800',

  // ── CROACIA ────────────────────────────────────────────────────────────────
  'Dubrovnik':      'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800',
  'Split':          'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800',
  'Zagreb':         'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800',
  'Plitvice':       'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800',

  // ── NORUEGA ────────────────────────────────────────────────────────────────
  'Oslo':           'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
  'Bergen':         'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
  'Tromso':         'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
  'Tromsø':         'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',

  // ── ISLANDIA ───────────────────────────────────────────────────────────────
  'Reykjavik':      'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=800',
  'Reikiavik':      'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=800',

  // ── ESTADOS UNIDOS ─────────────────────────────────────────────────────────
  'New York':       'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800',
  'Nueva York':     'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800',
  'Los Angeles':    'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800',
  'Los Ángeles':    'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800',
  'San Francisco':  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
  'Chicago':        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
  'Miami':          'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800',
  'Las Vegas':      'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800',
  'Hawaii':         'https://images.unsplash.com/photo-1507876466758-e54b27ba70a8?w=800',
  'Hawái':          'https://images.unsplash.com/photo-1507876466758-e54b27ba70a8?w=800',
  'New Orleans':    'https://images.unsplash.com/photo-1568695291955-c8e2b1e8f0f9?w=800',
  'Nueva Orleans':  'https://images.unsplash.com/photo-1568695291955-c8e2b1e8f0f9?w=800',
  'Washington':     'https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=800',
  'Seattle':        'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800',
  'Boston':         'https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=800',

  // ── CANADÁ ─────────────────────────────────────────────────────────────────
  'Toronto':        'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800',
  'Vancouver':      'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800',
  'Montreal':       'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800',
  'Quebec':         'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800',
  'Banff':          'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800',

  // ── MÉXICO ─────────────────────────────────────────────────────────────────
  'Mexico City':    'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800',
  'Ciudad de México': 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800',
  'CDMX':           'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800',
  'Cancun':         'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800',
  'Cancún':         'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800',
  'Oaxaca':         'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800',
  'Guadalajara':    'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800',
  'Tulum':          'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800',
  'San Cristóbal':  'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800',

  // ── ARGENTINA ──────────────────────────────────────────────────────────────
  'Buenos Aires':   'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800',
  'Bariloche':      'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800',
  'Mendoza':        'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800',
  'Patagonia':      'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800',

  // ── COLOMBIA ───────────────────────────────────────────────────────────────
  'Bogotá':         'https://images.unsplash.com/photo-1533577116850-9cc66cad8a9b?w=800',
  'Medellín':       'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800',
  'Salento':        'https://images.unsplash.com/photo-1593467685842-9e10c3c5e8c3?w=800',
  'El Tayrona':     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  'Tayrona':        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  'Santa Marta':    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  'Cartagena':      'https://images.unsplash.com/photo-1583997052301-0e71dc7d56e2?w=800',

  // ── PERÚ ───────────────────────────────────────────────────────────────────
  'Lima':           'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
  'Cusco':          'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
  'Cuzco':          'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
  'Machu Picchu':   'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',

  // ── BRASIL ─────────────────────────────────────────────────────────────────
  'Rio de Janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
  'São Paulo':      'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
  'Sao Paulo':      'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
  'Salvador':       'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
  'Florianópolis':  'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',

  // ── CHILE ──────────────────────────────────────────────────────────────────
  'Santiago':       'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
  'Valparaíso':     'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
  'Atacama':        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',

  // ── AUSTRALIA ──────────────────────────────────────────────────────────────
  'Sydney':         'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
  'Melbourne':      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
  'Brisbane':       'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
  'Gold Coast':     'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
  'Cairns':         'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
  'Perth':          'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',

  // ── NUEVA ZELANDA ──────────────────────────────────────────────────────────
  'Auckland':       'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800',
  'Queenstown':     'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800',
  'Wellington':     'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800',

  // ── EGIPTO ─────────────────────────────────────────────────────────────────
  'Cairo':          'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800',
  'El Cairo':       'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800',
  'Luxor':          'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800',
  'Aswan':          'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800',
  'Asuán':          'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800',

  // ── EMIRATOS ───────────────────────────────────────────────────────────────
  'Dubai':          'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
  'Abu Dhabi':      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
  'Abu Dabi':       'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',

  // ── JORDANIA ───────────────────────────────────────────────────────────────
  'Petra':          'https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?w=800',
  'Amman':          'https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?w=800',
  'Wadi Rum':       'https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?w=800',

  // ── ISRAEL ─────────────────────────────────────────────────────────────────
  'Jerusalem':      'https://images.unsplash.com/photo-1548686304-89d188a80029?w=800',
  'Jerusalén':      'https://images.unsplash.com/photo-1548686304-89d188a80029?w=800',
  'Tel Aviv':       'https://images.unsplash.com/photo-1548686304-89d188a80029?w=800',

  // ── SUDÁFRICA ──────────────────────────────────────────────────────────────
  'Cape Town':      'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
  'Ciudad del Cabo':'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
  'Johannesburg':   'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
  'Johannesburgo':  'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
  'Kruger':         'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',

  // ── KENIA ──────────────────────────────────────────────────────────────────
  'Nairobi':        'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
  'Masai Mara':     'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
  'Serengeti':      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
  'Zanzibar':       'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
};

const countryImages = {
  'Japón':           'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800',
  'Japan':           'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800',
  'Italia':          'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
  'Italy':           'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
  'Francia':         'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
  'France':          'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
  'España':          'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800',
  'Spain':           'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800',
  'Portugal':        'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
  'Alemania':        'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
  'Germany':         'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
  'Reino Unido':     'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
  'United Kingdom':  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
  'Grecia':          'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
  'Greece':          'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
  'Turquía':         'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800',
  'Turkey':          'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800',
  'Marruecos':       'https://images.unsplash.com/photo-1597212618440-806262de4f0b?w=800',
  'Morocco':         'https://images.unsplash.com/photo-1597212618440-806262de4f0b?w=800',
  'Tailandia':       'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=800',
  'Thailand':        'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=800',
  'Vietnam':         'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
  'Indonesia':       'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
  'Singapur':        'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',
  'Singapore':       'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',
  'China':           'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
  'India':           'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
  'Corea del Sur':   'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800',
  'South Korea':     'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800',
  'México':          'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800',
  'Mexico':          'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800',
  'Argentina':       'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800',
  'Colombia':        'https://images.unsplash.com/photo-1533577116850-9cc66cad8a9b?w=800',
  'Perú':            'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
  'Peru':            'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
  'Brasil':          'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
  'Brazil':          'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
  'Chile':           'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
  'Estados Unidos':  'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800',
  'United States':   'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800',
  'Canadá':          'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800',
  'Canada':          'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800',
  'Australia':       'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
  'Nueva Zelanda':   'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800',
  'New Zealand':     'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800',
  'Egipto':          'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800',
  'Egypt':           'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800',
  'Emiratos Árabes': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
  'Jordania':        'https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?w=800',
  'Jordan':          'https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?w=800',
  'Israel':          'https://images.unsplash.com/photo-1548686304-89d188a80029?w=800',
  'Sudáfrica':       'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
  'South Africa':    'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
  'Kenia':           'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
  'Kenya':           'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
  'Noruega':         'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
  'Norway':          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
  'Islandia':        'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=800',
  'Iceland':         'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=800',
  'Suiza':           'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800',
  'Switzerland':     'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800',
  'Austria':         'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800',
  'Países Bajos':    'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
  'Netherlands':     'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
  'Croacia':         'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800',
  'Croatia':         'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800',
  'República Checa': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800',
  'Czech Republic':  'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800',
  'Hungría':         'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800',
  'Hungary':         'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800',
  'Polonia':         'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=800',
  'Poland':          'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=800',
};


export default function CityCard({ city, daysCount, tripId }) {
  const formatDateRange = () => {
    if (!city.start_date) return null;
    const start = new Date(city.start_date);
    const end = city.end_date ? new Date(city.end_date) : null;
    if (end && start.getTime() === end.getTime()) return format(start, 'd MMM', { locale: es });
    if (end) return `${format(start, 'd', { locale: es })}-${format(end, 'd MMM', { locale: es })}`;
    return format(start, 'd MMM', { locale: es });
  };

  const imageUrl =
    city.image_url ||
    cityImages[city.name] ||
    countryImages[city.country] ||
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800';

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Link to={createPageUrl(`CityDetail?id=${city.id}&trip_id=${tripId}`)}>
          <img
            src={imageUrl}
            alt={city.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
            <div>
              <div className="text-white text-xl font-bold leading-tight">{city.name}</div>
              {city.country && <div className="text-white/80 text-sm mt-0.5">{city.country}</div>}
              <div className="flex items-center gap-3 mt-1">
                {city.start_date && (
                  <span className="flex items-center gap-1 text-white/85 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateRange()}
                  </span>
                )}
                {daysCount > 0 && (
                  <span className="text-white/75 text-xs">{daysCount} {daysCount === 1 ? 'día' : 'días'}</span>
                )}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-orange-700 flex items-center justify-center text-white border-2 border-white/30 flex-shrink-0">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
