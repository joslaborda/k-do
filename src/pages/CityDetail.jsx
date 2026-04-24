import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { 
  ArrowLeft, Plus, Calendar, ChevronDown, ChevronUp, 
  Edit2, Trash2, Save, MapPin, RefreshCw, Hotel
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { generateDaysForCity, regenerateDay, loadPreferences, updateVisitedPlaces } from '@/lib/itineraryAI';
import CitySettingsModal from '@/components/cities/CitySettingsModal';
import DayDocuments from '@/components/tickets/DayDocuments';
import UnlinkedCityDocuments from '@/components/tickets/UnlinkedCityDocuments';
import SpotsSection from '@/components/spots/SpotsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const cityImages = {
  // ── JAPÓN ──────────────────────────────────────────────────────────────────
  'Tokyo':          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600',
  'Tokio':          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600',
  'Kyoto':          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600',
  'Kioto':          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600',
  'Osaka':          'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=1600',
  'Hiroshima':      'https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?w=1600',
  'Hakone':         'https://images.unsplash.com/photo-1578637387939-43c525550085?w=1600',
  'Nara':           'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600',
  'Sapporo':        'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?w=1600',
  'Fukuoka':        'https://images.unsplash.com/photo-1606924734046-ee560d706fcf?w=1600',
  'Nagoya':         'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=1600',
  'Nikko':          'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=1600',
  'Kamakura':       'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=1600',
  // ── COREA DEL SUR ──────────────────────────────────────────────────────────
  'Seoul':          'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1600',
  'Seúl':           'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1600',
  'Busan':          'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=1600',
  'Jeju':           'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1600',
  // ── TAILANDIA ──────────────────────────────────────────────────────────────
  'Bangkok':        'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=1600',
  'Chiang Mai':     'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1600',
  'Phuket':         'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1600',
  'Krabi':          'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1600',
  'Koh Samui':      'https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=1600',
  // ── VIETNAM ────────────────────────────────────────────────────────────────
  'Hanoi':          'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=1600',
  'Hanói':          'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=1600',
  'Ho Chi Minh':    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1600',
  'Saigon':         'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1600',
  'Hoi An':         'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1600',
  'Da Nang':        'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1600',
  'Hue':            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600',
  'Ha Long':        'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600',
  // ── INDONESIA ──────────────────────────────────────────────────────────────
  'Bali':           'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600',
  'Ubud':           'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1600',
  'Jakarta':        'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=1600',
  'Yogyakarta':     'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1600',
  'Lombok':         'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1600',
  // ── SINGAPUR ───────────────────────────────────────────────────────────────
  'Singapore':      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1600',
  'Singapur':       'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1600',
  // ── CHINA ──────────────────────────────────────────────────────────────────
  'Beijing':        'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1600',
  'Pekín':          'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1600',
  'Shanghai':       'https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?w=1600',
  'Shanghái':       'https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?w=1600',
  'Chengdu':        'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600',
  'Guilin':         'https://images.unsplash.com/photo-1537531460737-91f0c655b8a5?w=1600',
  // ── INDIA ──────────────────────────────────────────────────────────────────
  'Mumbai':         'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1600',
  'Delhi':          'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1600',
  'Nueva Delhi':    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1600',
  'Jaipur':         'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=1600',
  'Agra':           'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1600',
  'Varanasi':       'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1600',
  'Goa':            'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1600',
  // ── MARRUECOS ──────────────────────────────────────────────────────────────
  'Marrakech':      'https://images.unsplash.com/photo-1597212618440-806262de4f0b?w=1600',
  'Fez':            'https://images.unsplash.com/photo-1553701538-049c8a87ef14?w=1600',
  'Fès':            'https://images.unsplash.com/photo-1553701538-049c8a87ef14?w=1600',
  'Chefchaouen':    'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1600',
  'Casablanca':     'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1600',
  'Essaouira':      'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1600',
  'Merzouga':       'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1600',
  // ── TURQUÍA ────────────────────────────────────────────────────────────────
  'Istanbul':       'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1600',
  'Estambul':       'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1600',
  'Cappadocia':     'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=1600',
  'Capadocia':      'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=1600',
  'Antalya':        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1600',
  'Pamukkale':      'https://images.unsplash.com/photo-1589561253898-768105ca91a8?w=1600',
  'Bodrum':         'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1600',
  // ── GRECIA ─────────────────────────────────────────────────────────────────
  'Athens':         'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1600',
  'Atenas':         'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1600',
  'Santorini':      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600',
  'Mykonos':        'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=1600',
  'Crete':          'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600',
  'Creta':          'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600',
  'Rhodes':         'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600',
  'Rodas':          'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600',
  // ── ITALIA ─────────────────────────────────────────────────────────────────
  'Rome':           'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600',
  'Roma':           'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600',
  'Florence':       'https://images.unsplash.com/photo-1541370976299-4d24be63b4a6?w=1600',
  'Florencia':      'https://images.unsplash.com/photo-1541370976299-4d24be63b4a6?w=1600',
  'Venice':         'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=1600',
  'Venecia':        'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=1600',
  'Milan':          'https://images.unsplash.com/photo-1512497405173-5df37d0fbb7e?w=1600',
  'Milán':          'https://images.unsplash.com/photo-1512497405173-5df37d0fbb7e?w=1600',
  'Naples':         'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=1600',
  'Nápoles':        'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=1600',
  'Amalfi':         'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=1600',
  'Cinque Terre':   'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1600',
  'Sicily':         'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=1600',
  'Sicilia':        'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=1600',
  // ── FRANCIA ────────────────────────────────────────────────────────────────
  'Paris':          'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1600',
  'París':          'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1600',
  'Lyon':           'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?w=1600',
  'Nice':           'https://images.unsplash.com/photo-1491166617655-0723a0e0a54d?w=1600',
  'Niza':           'https://images.unsplash.com/photo-1491166617655-0723a0e0a54d?w=1600',
  'Marseille':      'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?w=1600',
  'Marsella':       'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?w=1600',
  // ── ESPAÑA ─────────────────────────────────────────────────────────────────
  'Barcelona':      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1600',
  'Madrid':         'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600',
  'Seville':        'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600',
  'Sevilla':        'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600',
  'Granada':        'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600',
  'Valencia':       'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600',
  'San Sebastián':  'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600',
  'Bilbao':         'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600',
  // ── PORTUGAL ───────────────────────────────────────────────────────────────
  'Lisbon':         'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600',
  'Lisboa':         'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600',
  'Porto':          'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600',
  'Sintra':         'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600',
  // ── ALEMANIA ───────────────────────────────────────────────────────────────
  'Berlin':         'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600',
  'Berlín':         'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600',
  'Munich':         'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600',
  'Múnich':         'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600',
  'Hamburg':        'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600',
  'Hamburgo':       'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600',
  // ── REINO UNIDO ────────────────────────────────────────────────────────────
  'London':         'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600',
  'Londres':        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600',
  'Edinburgh':      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600',
  'Edimburgo':      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600',
  'Oxford':         'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600',
  // ── PAÍSES BAJOS ───────────────────────────────────────────────────────────
  'Amsterdam':      'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1600',
  // ── SUIZA ──────────────────────────────────────────────────────────────────
  'Zurich':         'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1600',
  'Zúrich':         'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1600',
  'Interlaken':     'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1600',
  'Lucerne':        'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1600',
  'Zermatt':        'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1600',
  // ── AUSTRIA ────────────────────────────────────────────────────────────────
  'Vienna':         'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1600',
  'Viena':          'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1600',
  'Salzburg':       'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1600',
  'Salzburgo':      'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1600',
  // ── REP. CHECA / HUNGRÍA / POLONIA ─────────────────────────────────────────
  'Prague':         'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1600',
  'Praga':          'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1600',
  'Budapest':       'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1600',
  'Krakow':         'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=1600',
  'Cracovia':       'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=1600',
  // ── CROACIA ────────────────────────────────────────────────────────────────
  'Dubrovnik':      'https://images.unsplash.com/photo-1555990793-da11153b2473?w=1600',
  'Split':          'https://images.unsplash.com/photo-1555990793-da11153b2473?w=1600',
  // ── NORUEGA / ISLANDIA ─────────────────────────────────────────────────────
  'Oslo':           'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600',
  'Bergen':         'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600',
  'Reykjavik':      'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1600',
  'Reikiavik':      'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1600',
  // ── ESTADOS UNIDOS ─────────────────────────────────────────────────────────
  'New York':       'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1600',
  'Nueva York':     'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1600',
  'Los Angeles':    'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=1600',
  'San Francisco':  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1600',
  'Chicago':        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600',
  'Miami':          'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=1600',
  'Las Vegas':      'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=1600',
  'Hawaii':         'https://images.unsplash.com/photo-1507876466758-e54b27ba70a8?w=1600',
  'Hawái':          'https://images.unsplash.com/photo-1507876466758-e54b27ba70a8?w=1600',
  // ── CANADÁ ─────────────────────────────────────────────────────────────────
  'Toronto':        'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1600',
  'Vancouver':      'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1600',
  'Montreal':       'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1600',
  // ── MÉXICO ─────────────────────────────────────────────────────────────────
  'Mexico City':    'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1600',
  'Ciudad de México':'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1600',
  'CDMX':           'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1600',
  'Cancun':         'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=1600',
  'Cancún':         'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=1600',
  'Oaxaca':         'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1600',
  'Tulum':          'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=1600',
  // ── ARGENTINA ──────────────────────────────────────────────────────────────
  'Buenos Aires':   'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1600',
  'Bariloche':      'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1600',
  'Mendoza':        'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1600',
  // ── COLOMBIA ───────────────────────────────────────────────────────────────
  'Bogotá':         'https://images.unsplash.com/photo-1533577116850-9cc66cad8a9b?w=1600',
  'Medellín':       'https://images.unsplash.com/photo-1533577116850-9cc66cad8a9b?w=1600',
  'Cartagena':      'https://images.unsplash.com/photo-1533577116850-9cc66cad8a9b?w=1600',
  // ── PERÚ ───────────────────────────────────────────────────────────────────
  'Lima':           'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1600',
  'Cusco':          'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1600',
  'Machu Picchu':   'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1600',
  // ── BRASIL ─────────────────────────────────────────────────────────────────
  'Rio de Janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600',
  'São Paulo':      'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600',
  // ── AUSTRALIA ──────────────────────────────────────────────────────────────
  'Sydney':         'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600',
  'Melbourne':      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600',
  // ── EMIRATOS / ORIENTE MEDIO ───────────────────────────────────────────────
  'Dubai':          'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600',
  'Abu Dhabi':      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600',
  'Petra':          'https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?w=1600',
  'Jerusalem':      'https://images.unsplash.com/photo-1548686304-89d188a80029?w=1600',
  'Jerusalén':      'https://images.unsplash.com/photo-1548686304-89d188a80029?w=1600',
  // ── EGIPTO ─────────────────────────────────────────────────────────────────
  'Cairo':          'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1600',
  'El Cairo':       'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1600',
  'Luxor':          'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1600',
  // ── SUDÁFRICA ──────────────────────────────────────────────────────────────
  'Cape Town':      'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600',
  'Ciudad del Cabo':'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600',
};

const countryImages = {
  'Japón':           'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1600',
  'Japan':           'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1600',
  'Italia':          'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600',
  'Italy':           'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600',
  'Francia':         'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1600',
  'France':          'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1600',
  'España':          'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600',
  'Spain':           'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600',
  'Portugal':        'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600',
  'Alemania':        'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600',
  'Germany':         'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600',
  'Reino Unido':     'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600',
  'United Kingdom':  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600',
  'Grecia':          'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600',
  'Greece':          'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600',
  'Turquía':         'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1600',
  'Turkey':          'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1600',
  'Marruecos':       'https://images.unsplash.com/photo-1597212618440-806262de4f0b?w=1600',
  'Morocco':         'https://images.unsplash.com/photo-1597212618440-806262de4f0b?w=1600',
  'Tailandia':       'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=1600',
  'Thailand':        'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=1600',
  'Vietnam':         'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600',
  'Indonesia':       'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600',
  'Singapur':        'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1600',
  'Singapore':       'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1600',
  'China':           'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1600',
  'India':           'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1600',
  'Corea del Sur':   'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1600',
  'South Korea':     'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1600',
  'México':          'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1600',
  'Mexico':          'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1600',
  'Argentina':       'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1600',
  'Colombia':        'https://images.unsplash.com/photo-1533577116850-9cc66cad8a9b?w=1600',
  'Perú':            'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1600',
  'Peru':            'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1600',
  'Brasil':          'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600',
  'Brazil':          'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600',
  'Chile':           'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600',
  'Estados Unidos':  'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1600',
  'United States':   'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1600',
  'Canadá':          'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1600',
  'Canada':          'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1600',
  'Australia':       'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600',
  'Nueva Zelanda':   'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1600',
  'New Zealand':     'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1600',
  'Egipto':          'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1600',
  'Egypt':           'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1600',
  'Emiratos Árabes': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600',
  'Jordania':        'https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?w=1600',
  'Jordan':          'https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?w=1600',
  'Israel':          'https://images.unsplash.com/photo-1548686304-89d188a80029?w=1600',
  'Sudáfrica':       'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600',
  'South Africa':    'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600',
  'Kenia':           'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600',
  'Kenya':           'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600',
  'Noruega':         'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600',
  'Norway':          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600',
  'Islandia':        'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1600',
  'Iceland':         'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1600',
  'Suiza':           'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1600',
  'Switzerland':     'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1600',
  'Austria':         'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1600',
  'Países Bajos':    'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1600',
  'Netherlands':     'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1600',
  'Croacia':         'https://images.unsplash.com/photo-1555990793-da11153b2473?w=1600',
  'Croatia':         'https://images.unsplash.com/photo-1555990793-da11153b2473?w=1600',
};

export default function CityDetail() {
   const urlParams = new URLSearchParams(window.location.search);
   const cityId = urlParams.get('id');
   const tripId = urlParams.get('trip_id');

  const { user: currentUser } = useAuth();
   const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dayToDelete, setDayToDelete] = useState(null);
  const [formData, setFormData] = useState({ title: '', date: '', content: '' });
  const [regeneratingCity, setRegeneratingCity] = useState(false);
  const [regeneratingDayId, setRegeneratingDayId] = useState(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();



  const { data: city } = useQuery({
    queryKey: ['city', cityId],
    queryFn: async () => {
      const cities = await base44.entities.City.filter({ id: cityId });
      return cities[0];
    },
    enabled: !!cityId,
    staleTime: 60000,
  });

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => base44.entities.Trip.get(tripId),
    enabled: !!tripId,
    staleTime: 60000,
  });

  const { data: days = [], isLoading } = useQuery({
    queryKey: ['itineraryDays', cityId],
    queryFn: () => base44.entities.ItineraryDay.filter({ city_id: cityId }, 'order'),
    enabled: !!cityId,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ItineraryDay.create({
      ...data,
      city_id: cityId,
      trip_id: tripId,
      order: days.length
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraryDays', cityId] });
      setDialogOpen(false);
      setFormData({ title: '', date: '', content: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ItineraryDay.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraryDays', cityId] });
      setDialogOpen(false);
      setEditingDay(null);
      setFormData({ title: '', date: '', content: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ItineraryDay.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraryDays', cityId] });
      setDeleteDialogOpen(false);
      setDayToDelete(null);
    }
  });

  const handleDeleteClick = (day) => {
    setDayToDelete(day);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (dayToDelete) {
      deleteMutation.mutate(dayToDelete.id);
    }
  };

  const toggleDay = (dayId) => {
    setExpandedDays(prev => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  const openEditDialog = (day) => {
    setEditingDay(day);
    setFormData({
      title: day.title,
      date: day.date || '',
      content: day.content || ''
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingDay(null);
    setFormData({ title: '', date: '', content: '' });
    setDialogOpen(true);
  };

  const handleRegenerateCity = async () => {
    if (!city || !trip) return;
    setRegeneratingCity(true);

    const [allDays, allCities] = await Promise.all([
      base44.entities.ItineraryDay.filter({ trip_id: tripId }),
      base44.entities.City.filter({ trip_id: tripId }, 'order'),
    ]);
    const preferences = await loadPreferences(tripId, trip);

    // Delete existing days for this city
    for (const day of days) {
      await base44.entities.ItineraryDay.delete(day.id);
    }

    const newDays = await generateDaysForCity({
      city,
      trip,
      existingDays: allDays.filter(d => d.city_id !== city.id),
      preferences,
      allCities: allCities.filter(c => c.id !== city.id),
    });

    for (let j = 0; j < newDays.length; j++) {
      await base44.entities.ItineraryDay.create({
        ...newDays[j],
        trip_id: tripId,
        city_id: cityId,
        order: j,
      });
    }

    // Update visited_places in the trip
    await updateVisitedPlaces(trip, newDays);

    queryClient.invalidateQueries({ queryKey: ['itineraryDays', cityId] });
    queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    setRegeneratingCity(false);
    toast({ title: `${city.name} regenerado 🎌`, description: 'El itinerario de esta ciudad ha sido actualizado.' });
  };

  const handleRegenerateDay = async (day) => {
    if (!city || !trip) return;
    setRegeneratingDayId(day.id);

    const [allDays, preferences] = await Promise.all([
      base44.entities.ItineraryDay.filter({ trip_id: tripId }),
      loadPreferences(tripId, trip),
    ]);

    const result = await regenerateDay({
      day,
      city,
      trip,
      allDays,
      preferences,
    });

    await base44.entities.ItineraryDay.update(day.id, {
      title: result.title,
      content: result.content,
    });

    // Update visited_places
    await updateVisitedPlaces(trip, [{ title: result.title, content: result.content }]);

    queryClient.invalidateQueries({ queryKey: ['itineraryDays', cityId] });
    queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    setRegeneratingDayId(null);
    toast({ title: 'Día regenerado ✨', description: `"${result.title}" listo.` });
  };

  const handleSave = () => {
    if (editingDay) {
      updateMutation.mutate({ 
        id: editingDay.id, 
        data: {
          ...formData,
          trip_id: tripId,
          city_id: cityId
        }
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (!city) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img 
          src={city.image_url || cityImages[city.name] || countryImages[city.country] || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600'}
          alt={city.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute top-6 left-6">
           <Link
             to={createPageUrl(`Cities?trip_id=${tripId}`)}
             className="inline-flex items-center gap-2 px-4 py-2 bg-orange-700 rounded-full text-white text-sm font-semibold hover:bg-white hover:text-orange-700 transition-all duration-200 border border-orange-700"
           >
             <ArrowLeft className="w-4 h-4" />
             Ruta
           </Link>
         </div>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
              <MapPin className="w-4 h-4" />
              <span>{city.country || 'Japan'}</span>
              {city.start_date && (
                <>
                  <span className="text-white/40">·</span>
                  <Calendar className="w-4 h-4" />
                  <span>
                    {city.start_date && city.end_date
                      ? `${format(new Date(city.start_date), 'd MMM')} – ${format(new Date(city.end_date), 'd MMM yyyy')}`
                      : format(new Date(city.start_date), 'd MMM yyyy')}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">{city.name}</h1>
                {city.accommodation && (
                  <div className="flex items-center gap-1.5 mt-2 text-white/75 text-sm">
                    <Hotel className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate max-w-xs">{city.accommodation}</span>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 mb-1">
                <CitySettingsModal city={city} tripId={tripId} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-6 pb-12 md:pb-6">
         <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
           <h2 className="text-xl font-semibold text-foreground">Itinerario</h2>
           <div className="flex items-center gap-2 flex-wrap">
             {city?.start_date && city?.end_date && (
               <Button
                 variant="outline"
                 size="sm"
                 onClick={handleRegenerateCity}
                 disabled={regeneratingCity}
                 className="text-orange-600 border-orange-200 hover:bg-orange-50"
               >
                 {regeneratingCity
                   ? <><div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-1.5" />Regenerando...</>
                   : <><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Regenerar ciudad</>
                 }
               </Button>
             )}
             <Button onClick={openNewDialog} className="bg-orange-700 hover:bg-orange-800">
               <Plus className="w-4 h-4 mr-2" />
               Añadir Día
             </Button>
           </div>
        </div>

        {isLoading ? (
           <div className="space-y-4">
             {[1, 2].map((i) => (
               <div key={i} className="h-24 bg-secondary rounded-xl animate-pulse" />
             ))}
           </div>
         ) : days.length === 0 ? (
           <div className="text-center py-16 glass border-2 border-dashed border-border rounded-2xl">
             <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
             <h3 className="text-lg font-medium text-foreground mb-2">Sin itinerario todavía</h3>
             <p className="text-muted-foreground mb-4">Empieza a planificar tus días en {city.name}</p>
             <Button onClick={openNewDialog} className="bg-orange-700 hover:bg-orange-800">
               <Plus className="w-4 h-4 mr-2" />
               Añadir primer día
             </Button>
           </div>
        ) : (
          <div className="space-y-4">
            {days.map((day, index) => (
              <Collapsible
                key={day.id}
                open={expandedDays[day.id]}
                onOpenChange={() => toggleDay(day.id)}
              >
                <div className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                    <CollapsibleTrigger asChild>
                    <div className="w-full p-5 flex items-center justify-between text-left hover:bg-secondary/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{day.title}</h3>
                          {day.date && (
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(day.date), 'EEEE, MMMM d')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegenerateDay(day);
                          }}
                          disabled={regeneratingDayId === day.id}
                          aria-label="Regenerar día con IA"
                          title="Regenerar día con IA"
                        >
                          {regeneratingDayId === day.id
                            ? <div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            : <RefreshCw className="w-3.5 h-3.5" />
                          }
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(day);
                          }}
                          aria-label="Editar día"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(day);
                          }}
                          aria-label="Eliminar día"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {expandedDays[day.id] ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-5 pb-5 pt-0 border-t border-border bg-white/50">
                        <div className="prose prose-sm max-w-none pt-4 text-foreground [&>*]:text-foreground">
                          <ReactMarkdown>{day.content || 'No details added yet.'}</ReactMarkdown>
                        </div>
                        <DayDocuments dayId={day.id} tripId={tripId} currentUserEmail={currentUser?.email} dayTitle={day.title} />
                      </div>
                    </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}

        {/* Unlinked documents section */}
        <UnlinkedCityDocuments cityId={cityId} tripId={tripId} currentUserEmail={currentUser?.email} />

        {/* Spots section */}
        <SpotsSection
          cityId={cityId}
          tripId={tripId}
          currentUserEmail={currentUser?.email}
          trip={trip}
          days={days}
        />
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
           <DialogHeader>
             <DialogTitle className="text-foreground">{editingDay ? 'Editar Día' : 'Añadir Nuevo Día'}</DialogTitle>
           </DialogHeader>
           <div className="space-y-4 pt-4">
             <div>
               <label className="text-sm font-medium text-foreground mb-1.5 block">Título</label>
              <Input
                placeholder="ej. Llegada + Dotonbori nocturno"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Detalles (soporta Markdown)
              </label>
              <Textarea
                placeholder="Añade los detalles del itinerario aquí..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={12}
                className="font-mono text-sm bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-foreground hover:bg-secondary/50">
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-orange-700 hover:bg-orange-800"
                  disabled={!formData.title.trim() || updateMutation.isPending || createMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {(updateMutation.isPending || createMutation.isPending) 
                  ? 'Guardando...' 
                  : editingDay ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar día?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar "{dayToDelete?.title}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}