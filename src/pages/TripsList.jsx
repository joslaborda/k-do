import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import TripTemplates from '@/components/trip/TripTemplates';
import { toast } from '@/components/ui/use-toast';
import TripCard from '@/components/trip/TripCard';

const OTHER_LABEL = 'Other / Otra';

const COUNTRY_PRESETS = [
  { country: 'España', currency: 'EUR', symbol: '€', language: 'Spanish', languageCode: 'es-ES' },
  { country: 'Italia', currency: 'EUR', symbol: '€', language: 'Italian', languageCode: 'it-IT' },
  { country: 'Francia', currency: 'EUR', symbol: '€', language: 'French', languageCode: 'fr-FR' },
  { country: 'Portugal', currency: 'EUR', symbol: '€', language: 'Portuguese', languageCode: 'pt-PT' },
  { country: 'Alemania', currency: 'EUR', symbol: '€', language: 'German', languageCode: 'de-DE' },
  { country: 'Reino Unido', currency: 'GBP', symbol: '£', language: 'English', languageCode: 'en-GB' },
  { country: 'Estados Unidos', currency: 'USD', symbol: '$', language: 'English', languageCode: 'en-US' },
  { country: 'México', currency: 'MXN', symbol: '$', language: 'Spanish', languageCode: 'es-MX' },
  { country: 'Argentina', currency: 'ARS', symbol: '$', language: 'Spanish', languageCode: 'es-AR' },
  { country: 'Brasil', currency: 'BRL', symbol: 'R$', language: 'Portuguese', languageCode: 'pt-BR' },
  { country: 'Japón', currency: 'JPY', symbol: '¥', language: 'Japanese', languageCode: 'ja-JP' },
  { country: 'Tailandia', currency: 'THB', symbol: '฿', language: 'Thai', languageCode: 'th-TH' },
  { country: 'Corea del Sur', currency: 'KRW', symbol: '₩', language: 'Korean', languageCode: 'ko-KR' },
  { country: 'China', currency: 'CNY', symbol: '¥', language: 'Chinese', languageCode: 'zh-CN' },
  { country: 'Vietnam', currency: 'VND', symbol: '₫', language: 'Vietnamese', languageCode: 'vi-VN' },
  { country: 'Singapur', currency: 'SGD', symbol: '$', language: 'English', languageCode: 'en-SG' },
  { country: 'Indonesia', currency: 'IDR', symbol: 'Rp', language: 'Indonesian', languageCode: 'id-ID' },
  { country: 'Marruecos', currency: 'MAD', symbol: 'DH', language: 'Arabic', languageCode: 'ar-MA' },
  { country: 'Turquía', currency: 'TRY', symbol: '₺', language: 'Turkish', languageCode: 'tr-TR' },
  { country: 'Suiza', currency: 'CHF', symbol: 'Fr', language: 'German', languageCode: 'de-CH' },
  { country: 'Grecia', currency: 'EUR', symbol: '€', language: 'Greek', languageCode: 'el-GR' },
];

const TOP_CITIES_BY_COUNTRY = {
  España: [
    'Madrid','Barcelona','Valencia','Sevilla','Bilbao','Málaga','Granada','Zaragoza','Alicante','San Sebastián',
    'Córdoba','Toledo','Salamanca','Santiago de Compostela','Palma de Mallorca','Ibiza','Tenerife','Las Palmas de Gran Canaria','Mallorca','Marbella',
    'Santander','Oviedo','Gijón','Pamplona','Valladolid','Murcia','Tarragona','Girona','Cádiz','Segovia'
  ],
  Italia: [
    'Roma','Milán','Venecia','Florencia','Nápoles','Turín','Bolonia','Génova','Verona','Pisa',
    'Siena','Bari','Palermo','Catania','Trieste','Padua','Parma','Modena','Lecce','Trento',
    'Vicenza','Brescia','Perugia','Ravenna','Cagliari','Ancona','Lucca','Como','Sorrento','Cinque Terre'
  ],
  Francia: [
    'París','Marsella','Lyon','Toulouse','Niza','Nantes','Estrasburgo','Montpellier','Burdeos','Lille',
    'Rennes','Reims','Le Havre','Saint-Étienne','Toulon','Grenoble','Dijon','Angers','Nîmes','Aix-en-Provence',
    'Avignon','Cannes','Saint-Malo','Biarritz','Annecy','Tours','Metz','Nancy','Besançon','Perpignan'
  ],
  Portugal: [
    'Lisboa','Oporto','Coímbra','Braga','Faro','Aveiro','Évora','Guimarães','Cascais','Sintra',
    'Madeira (Funchal)','Azores (Ponta Delgada)','Setúbal','Viseu','Leiria','Portimão','Lagos','Albufeira','Tavira','Tomar',
    'Óbidos','Nazaré','Ericeira','Peniche','Chaves','Viana do Castelo','Beja','Santarém','Figueira da Foz','Covilhã'
  ],
  Alemania: [
    'Berlín','Múnich','Hamburgo','Colonia','Fráncfort','Stuttgart','Düsseldorf','Dresde','Leipzig','Núremberg',
    'Heidelberg','Bremen','Hannover','Bonn','Augsburgo','Wiesbaden','Freiburg','Mannheim','Mainz','Essen',
    'Dortmund','Kiel','Rostock','Regensburg','Weimar','Potsdam','Würzburg','Lübeck','Aachen','Garmisch-Partenkirchen'
  ],
  'Reino Unido': [
    'Londres','Edimburgo','Manchester','Liverpool','Birmingham','Bristol','Glasgow','Cambridge','Oxford','Bath',
    'Brighton','York','Newcastle','Leeds','Cardiff','Belfast','Inverness','Portsmouth','Southampton','Nottingham',
    'Sheffield','Canterbury','Stratford-upon-Avon','Stonehenge','Windermere','Aberdeen','Swansea','Leicester','Coventry','Durham'
  ],
  'Estados Unidos': [
    'New York','Los Angeles','San Francisco','Miami','Chicago','Las Vegas','Washington D.C.','Boston','Seattle','San Diego',
    'Austin','New Orleans','Orlando','Philadelphia','Denver','Portland','Atlanta','Nashville','Houston','Dallas',
    'Phoenix','Minneapolis','Detroit','Salt Lake City','Honolulu','Tampa','Charlotte','Pittsburgh','Cleveland','San Jose'
  ],
  México: [
    'Ciudad de México','Cancún','Guadalajara','Monterrey','Tulum','Playa del Carmen','Puerto Vallarta','Oaxaca','Mérida','San Miguel de Allende',
    'Puebla','Guanajuato','Querétaro','Toluca','Chiapas (San Cristóbal)','Veracruz','Acapulco','Cozumel','Los Cabos','La Paz',
    'Mazatlán','Morelia','Tepotzotlán','Xalapa','Aguascalientes','León','Tijuana','Ensenada','Campeche','Bacalar'
  ],
  Argentina: [
    'Buenos Aires','Bariloche','Mendoza','Córdoba','Rosario','Ushuaia','El Calafate','Salta','Mar del Plata','Iguazú',
    'La Plata','San Juan','San Luis','Neuquén','Puerto Madryn','Tigre','Tandil','San Martín de los Andes','Villa La Angostura','Jujuy (Purmamarca)',
    'Bahía Blanca','Santa Fe','Corrientes','Resistencia','Comodoro Rivadavia','Río Gallegos','Trelew','San Rafael','Cafayate','Chaltén'
  ],
  Brasil: [
    'Río de Janeiro','São Paulo','Salvador','Brasília','Fortaleza','Recife','Florianópolis','Curitiba','Porto Alegre','Belo Horizonte',
    'Manaus','Belém','Natal','João Pessoa','Maceió','Vitória','Campinas','Santos','Foz do Iguaçu','Bonito',
    'Ilhabela','Búzios','Paraty','Jericoacoara','Lençóis Maranhenses','Ouro Preto','Gramado','Petrópolis','Olinda','Arraial do Cabo'
  ],
  Japón: [
    'Tokyo','Kyoto','Osaka','Hiroshima','Nara','Hakone','Sapporo','Fukuoka','Nikko','Nagoya',
    'Kobe','Yokohama','Kamakura','Kanazawa','Takayama','Sendai','Kumamoto','Nagasaki','Okinawa (Naha)','Kagoshima',
    'Matsumoto','Shizuoka','Toyama','Okayama','Himeji','Beppu','Koyasan','Fuji Five Lakes','Kawagoe','Ise'
  ],
  Tailandia: [
    'Bangkok','Chiang Mai','Phuket','Krabi','Pattaya','Ayutthaya','Chiang Rai','Koh Samui','Koh Phi Phi','Hua Hin',
    'Sukhothai','Pai','Kanchanaburi','Koh Tao','Koh Phangan','Surat Thani','Hat Yai','Trang','Koh Lanta','Udon Thani',
    'Ubon Ratchathani','Nakhon Ratchasima','Lampang','Nan','Rayong','Koh Chang','Samut Prakan','Mae Hong Son','Chumphon','Phetchabun'
  ],
  'Corea del Sur': [
    'Seoul','Busan','Incheon','Daegu','Daejeon','Gwangju','Suwon','Jeonju','Gyeongju','Jeju',
    'Gangneung','Pyeongchang','Ulsan','Pohang','Chuncheon','Seogwipo','Sokcho','Andong','Tongyeong','Yeosu',
    'Gimhae','Changwon','Mokpo','Suncheon','Iksan','Cheonan','Seongnam','Yongin','Ilsan','Anyang'
  ],
  China: [
    'Beijing','Shanghai','Hong Kong','Shenzhen','Guangzhou','Chengdu','Hangzhou','Xi’an','Nanjing','Suzhou',
    'Wuhan','Chongqing','Tianjin','Xiamen','Harbin','Qingdao','Dalian','Kunming','Sanya','Lhasa',
    'Zhangjiajie','Guilin','Yangshuo','Foshan','Zhuhai','Ningbo','Changsha','Jinan','Urumqi','Hefei'
  ],
  Vietnam: [
    'Hanoi','Ho Chi Minh City','Da Nang','Hoi An','Hue','Nha Trang','Da Lat','Ha Long','Sapa','Can Tho',
    'Phu Quoc','Vung Tau','Mui Ne','Hai Phong','Ninh Binh','Quy Nhon','Phong Nha','Dong Hoi','Buon Ma Thuot','Pleiku',
    'Con Dao','Bac Ninh','Ha Tinh','Thanh Hoa','Vinh','Lao Cai','Cao Bang','Lang Son','My Tho','Ben Tre'
  ],
  Singapur: [
    'Singapore','Marina Bay','Sentosa','Chinatown','Little India','Kampong Glam','Orchard','Clarke Quay','Bugis','Tiong Bahru',
    'East Coast','Botanic Gardens','Gardens by the Bay','Jurong','Holland Village','Punggol','Joo Chiat','Kallang','Novena','Toa Payoh',
    'Woodlands','Pasir Ris','Ang Mo Kio','Serangoon','Bukit Timah','Clementi','Queenstown','Raffles Place','HarbourFront','Seletar'
  ],
  Indonesia: [
    'Bali','Jakarta','Yogyakarta','Bandung','Surabaya','Ubud','Lombok','Gili Islands','Seminyak','Uluwatu',
    'Komodo (Labuan Bajo)','Flores','Makassar','Medan','Padang','Malang','Bogor','Batam','Bintan','Solo',
    'Manado','Bunaken','Raja Ampat','Jayapura','Denpasar','Canggu','Nusa Penida','Nusa Lembongan','Balikpapan','Samarinda'
  ],
  Marruecos: [
    'Marrakech','Casablanca','Fez','Rabat','Tánger','Chefchaouen','Essaouira','Agadir','Meknes','Ouarzazate',
    'Merzouga','Ifrane','Tetouan','Asilah','El Jadida','Oujda','Al Hoceima','Safi','Taroudant','Tiznit',
    'Errachidia','Midelt','Beni Mellal','Khenifra','Nador','Dakhla','Laayoune','Sidi Ifni','Azrou','Aït Benhaddou'
  ],
  Turquía: [
    'Istanbul','Ankara','Izmir','Antalya','Bursa','Cappadocia (Göreme)','Pamukkale','Bodrum','Fethiye','Marmaris',
    'Konya','Trabzon','Gaziantep','Adana','Mersin','Eskisehir','Samsun','Kusadasi','Alanya','Side',
    'Canakkale','Edirne','Sanliurfa','Kayseri','Rize','Amasya','Kars','Van','Sivas','Diyarbakir'
  ],
  Suiza: [
    'Zúrich','Ginebra','Lucerna','Berna','Basel','Interlaken','Zermatt','Lausana','Montreux','Lugano',
    'St. Moritz','Grindelwald','Jungfraujoch','Thun','Friburgo','Sion','Chur','Davos','Appenzell','Schaffhausen',
    'Brienz','Wengen','Kandersteg','Andermatt','Neuchâtel','St. Gallen','Arosa','Mürren','Bellinzona','Locarno'
  ],
  Grecia: [
    'Atenas','Salónica','Santorini','Mykonos','Creta (Heraklion)','Rodas','Corfú','Naxos','Paros','Milos',
    'Kos','Delphi','Meteora','Nafplio','Patras','Chania','Rethymno','Kavala','Volos','Ioannina',
    'Zakynthos','Kefalonia','Samos','Thassos','Skopelos','Hydra','Spetses','Mystras','Olympia','Lefkada'
  ],
};

const COUNTRIES = Object.keys(TOP_CITIES_BY_COUNTRY);

const CURRENCY_OPTIONS = [
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CHF', label: 'CHF (Fr)' },
  { value: 'MXN', label: 'MXN ($)' },
  { value: 'ARS', label: 'ARS ($)' },
  { value: 'BRL', label: 'BRL (R$)' },
  { value: 'THB', label: 'THB (฿)' },
  { value: 'KRW', label: 'KRW (₩)' },
  { value: 'CNY', label: 'CNY (¥)' },
  { value: 'VND', label: 'VND (₫)' },
  { value: 'MAD', label: 'MAD (DH)' },
  { value: 'TRY', label: 'TRY (₺)' },
  { value: 'SGD', label: 'SGD ($)' },
  { value: 'IDR', label: 'IDR (Rp)' },
];

function currencySymbolFromCode(code) {
  if (code === 'EUR') return '€';
  if (code === 'USD') return '$';
  if (code === 'GBP') return '£';
  if (code === 'JPY') return '¥';
  if (code === 'CHF') return 'Fr';
  if (code === 'THB') return '฿';
  if (code === 'KRW') return '₩';
  if (code === 'CNY') return '¥';
  if (code === 'VND') return '₫';
  if (code === 'MAD') return 'DH';
  if (code === 'TRY') return '₺';
  if (code === 'BRL') return 'R$';
  if (code === 'IDR') return 'Rp';
  if (code === 'MXN') return '$';
  if (code === 'ARS') return '$';
  if (code === 'SGD') return '$';
  return '$';
}function distributeDates(startDateStr, endDateStr, stopsCount) {
  if (!startDateStr || !endDateStr || !stopsCount || stopsCount <= 0) return [];

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const totalDays = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
  if (totalDays <= 0) return [];

  const base = Math.floor(totalDays / stopsCount);
  const extra = totalDays % stopsCount;

  const allocations = [];
  let cursor = new Date(start);

  for (let i = 0; i < stopsCount; i++) {
    const len = Math.max(1, base + (i < extra ? 1 : 0));
    const s = new Date(cursor);
    const e = new Date(cursor);
    e.setDate(e.getDate() + len - 1);

    allocations.push({
      start_date: s.toISOString().slice(0, 10),
      end_date: e.toISOString().slice(0, 10),
    });

    cursor.setDate(cursor.getDate() + len);
  }

  return allocations;
}
export default function TripsList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currencyTouched, setCurrencyTouched] = useState(false);

  const [mode, setMode] = useState('multi');

  const [stops, setStops] = useState([
    { city: '', other: '' },
    { city: '', other: '' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    country: 'España',
    start_date: '',
    end_date: '',
    description: '',
    cover_image: '',
    currency: 'EUR',
    currency_symbol: '€',
    language: 'Spanish',
    language_code: 'es-ES',
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date'),
  });

  const { data: allCities = [] } = useQuery({
    queryKey: ['allCities'],
    queryFn: () => base44.entities.City.list('order'),
    staleTime: 60000,
  });

  const tripCards = useMemo(() => {
    return trips.map((trip) => {
      const tripCities = allCities.filter((c) => c.trip_id === trip.id);
      return <TripCard key={trip.id} trip={trip} cities={tripCities} />;
    });
  }, [trips, allCities]);
  function applyCountry(country) {
    const preset = COUNTRY_PRESETS.find((p) => p.country === country) || null;

    setFormData((prev) => {
      const next = { ...prev, country };
      if (preset && !currencyTouched) {
        next.currency = preset.currency;
        next.currency_symbol = preset.symbol;
        next.language = preset.language;
        next.language_code = preset.languageCode;
      }
      return next;
    });

    setStops((prev) => prev.map((s) => ({ ...s, city: '', other: '' })));
  }

  function setCurrency(value) {
    setCurrencyTouched(true);
    setFormData((prev) => ({
      ...prev,
      currency: value,
      currency_symbol: currencySymbolFromCode(value),
    }));
  }

  function setStopCity(index, value) {
    setStops((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        if (value === OTHER_LABEL) return { ...s, city: OTHER_LABEL, other: '' };
        return { ...s, city: value, other: '' };
      })
    );
  }

  function setStopOther(index, value) {
    setStops((prev) => prev.map((s, i) => (i === index ? { ...s, other: value } : s)));
  }

  function addStop() {
    setStops((prev) => [...prev, { city: '', other: '' }]);
  }

  function removeStop(index) {
    setStops((prev) => prev.filter((_, i) => i !== index));
  }

  function setModeValue(value) {
    setMode(value);
    if (value === 'single') {
      setStops((prev) => [prev[0] || { city: '', other: '' }]);
    } else {
      setStops((prev) => (prev.length >= 2 ? prev : [...prev, { city: '', other: '' }]));
    }
  }

  function getStopLabel(s) {
    if (s.city === OTHER_LABEL) return (s.other || '').trim();
    return (s.city || '').trim();
  }

  function normalizeStopsForTrip() {
    const clean = stops.map(getStopLabel).map((v) => v.trim()).filter(Boolean);
    if (mode === 'single') return clean.slice(0, 1);
    return clean;
  }
``const createMutation = useMutation({
    mutationFn: async (data) => {
      const email = user?.email;
      const userId = user?.id;

      const tripCities = normalizeStopsForTrip();
      const destinationString = tripCities.length ? tripCities.join(' → ') : '';

      const roles = email ? { [email]: 'admin' } : {};
      const members = email ? [email] : [];

      const trip = await base44.entities.Trip.create({
        ...data,
        destination: destinationString,
        members,
        roles,
      });

      const endForSplit = data.end_date || data.start_date;
      const allocations = distributeDates(data.start_date, endForSplit, tripCities.length);

      for (let i = 0; i < tripCities.length; i++) {
        const dates = allocations[i] || { start_date: data.start_date, end_date: endForSplit };
        await base44.entities.City.create({
          trip_id: trip.id,
          name: tripCities[i],
          country: data.country,
          order: i,
          start_date: dates.start_date,
          end_date: dates.end_date,
        });
      }

      if (selectedTemplate?.packingItems?.length) {
        const packingPromises = selectedTemplate.packingItems.map((item) =>
          base44.entities.PackingItem.create({
            ...item,
            trip_id: trip.id,
            user_id: userId,
            packed: false,
          })
        );
        await Promise.all(packingPromises);
        toast({
          title: '¡Viaje creado! 🎉',
          description: `${selectedTemplate.packingItems.length} artículos añadidos a tu maleta`,
        });
      }

      return trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['allCities'] });

      setDialogOpen(false);
      setSelectedTemplate(null);
      setCurrencyTouched(false);
      setMode('multi');
      setStops([{ city: '', other: '' }, { city: '', other: '' }]);

      setFormData({
        name: '',
        country: 'España',
        start_date: '',
        end_date: '',
        description: '',
        cover_image: '',
        currency: 'EUR',
        currency_symbol: '€',
        language: 'Spanish',
        language_code: 'es-ES',
      });
    },
  });

  const cityOptions = TOP_CITIES_BY_COUNTRY[formData.country] || [];

  const canCreate = (() => {
    const tripCities = normalizeStopsForTrip();
    const datesOk = !formData.end_date || formData.end_date >= formData.start_date;
    return (
      formData.name.trim() &&
      formData.country.trim() &&
      formData.start_date &&
      datesOk &&
      tripCities.length > 0 &&
      !createMutation.isPending
    );
  })();
if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✈️</div>
          <p className="text-muted-foreground">Cargando viajes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-orange-700 px-6 py-10">
        <div className="max-w-6xl mx-auto flex items-end justify-between gap-4">
          <div>
            <h1 className="text-white text-4xl font-black tracking-tight">Kōdo</h1>
            <p className="text-white/90 text-base font-medium mt-0.5">Travel your way</p>
            <p className="text-white/60 text-sm mt-1">Tu próximo viaje empieza aquí</p>
          </div>

          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-white text-orange-700 hover:bg-orange-50 font-semibold px-5 shadow-sm flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Crear viaje
          </Button>
        </div>
      </div>

      <div className="bg-orange-50 mx-auto px-6 py-8 max-w-6xl">
        {trips.length === 0 ? (
          <div className="text-center py-20 bg-white border border-border rounded-2xl">
            <div className="text-5xl mb-4">✈️</div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Aún no tienes viajes</h2>
            <p className="text-muted-foreground text-sm mb-6">Crea tu primer viaje y empieza a planificar</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-orange-700 hover:bg-orange-800 text-white">
              <Plus className="w-4 h-4 mr-1.5" />
              Crear tu primer viaje
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">Tus viajes</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{tripCards}</div>
          </>
        )}
      </div>
<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-2xl">✈️ Nuevo Viaje</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre del viaje *</label>
              <Input
                placeholder="ej. Italia 2026"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">País *</label>
                <Select value={formData.country} onValueChange={applyCountry}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Modo</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={mode === 'single' ? 'default' : 'outline'}
                    className={mode === 'single' ? 'bg-orange-700 hover:bg-orange-800' : ''}
                    onClick={() => setModeValue('single')}
                  >
                    1 parada
                  </Button>
                  <Button
                    type="button"
                    variant={mode === 'multi' ? 'default' : 'outline'}
                    className={mode === 'multi' ? 'bg-orange-700 hover:bg-orange-800' : ''}
                    onClick={() => setModeValue('multi')}
                  >
                    Multi-ciudad
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Destino{mode === 'multi' ? 's' : ''} *</label>
                {mode === 'multi' && (
                  <Button type="button" variant="outline" onClick={addStop}>
                    + Añadir ciudad
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {stops.map((stop, idx) => (
                  <div key={idx} className="bg-white border border-border rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <Select value={stop.city} onValueChange={(v) => setStopCity(idx, v)}>
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder="Elige una ciudad..." />
                          </SelectTrigger>
                          <SelectContent>
                            {cityOptions.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                            <SelectItem value={OTHER_LABEL}>{OTHER_LABEL}</SelectItem>
                          </SelectContent>
                        </Select>

                        {stop.city === OTHER_LABEL && (
                          <Input
                            placeholder="Escribe la ciudad"
                            value={stop.other}
                            onChange={(e) => setStopOther(idx, e.target.value)}
                            className="bg-input border-border text-foreground mt-2"
                          />
                        )}
                      </div>

                      {mode === 'multi' && stops.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStop(idx)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Eliminar ciudad"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

<div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Moneda del viaje</label>
                <Select value={formData.currency} onValueChange={setCurrency}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Idioma detectado</label>
                <div className="bg-white border border-border rounded-md px-3 py-2 text-sm">
                  <div className="font-semibold">{formData.language}</div>
                  <div className="text-xs text-muted-foreground">{formData.language_code}</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha inicio *</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha fin</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData((p) => ({ ...p, end_date: e.target.value }))}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Descripción</label>
              <Textarea
                placeholder="Describe tu viaje..."
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Imagen de portada (URL)</label>
              {formData.cover_image && (
                <div className="mb-2 rounded-lg overflow-hidden h-28 bg-muted">
                  <img
                    src={formData.cover_image}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
              <Input
                placeholder="https://images.unsplash.com/..."
                value={formData.cover_image}
                onChange={(e) => setFormData((p) => ({ ...p, cover_image: e.target.value }))}
                className="bg-input border-border text-foreground"
              />
            </div>

<div className="pt-4 border-t border-border">
              <TripTemplates onSelect={setSelectedTemplate} />
              {selectedTemplate && (
                <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-sm text-primary flex items-center gap-2">
                    <span>{selectedTemplate.emoji}</span>
                    <span>Plantilla "{selectedTemplate.name}" seleccionada</span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>

              <Button
                type="button"
                onClick={() => createMutation.mutate(formData)}
                className="bg-orange-700 hover:bg-orange-800"
                disabled={!canCreate}
              >
                {createMutation.isPending ? 'Creando...' : 'Crear Viaje'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

