import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Languages, ArrowRightLeft, Copy, Check, Volume2, Loader2,
  ChevronDown, Search, RefreshCw, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getCountryMeta } from '@/lib/countryConfig';
import { useTripContext } from '@/hooks/useTripContext';

// ─── Fallback bilingüe (se muestra si LLM falla, con placeholders para target) ──
function buildFallback(targetLang) {
  return [
    {
      name: 'Básicas', icon: '👋',
      items: [
        { source: 'Hola', target: `Hola en ${targetLang}`, romanization: null },
        { source: 'Gracias', target: `Gracias en ${targetLang}`, romanization: null },
        { source: 'Por favor', target: `Por favor en ${targetLang}`, romanization: null },
        { source: 'Sí / No', target: `Sí/No en ${targetLang}`, romanization: null },
        { source: 'Perdón', target: `Perdón en ${targetLang}`, romanization: null },
        { source: 'No entiendo', target: `No entiendo en ${targetLang}`, romanization: null },
        { source: '¿Hablas español?', target: `¿Español? en ${targetLang}`, romanization: null },
        { source: '¿Cuánto cuesta?', target: `Precio en ${targetLang}`, romanization: null },
        { source: 'Ayuda', target: `Ayuda en ${targetLang}`, romanization: null },
        { source: 'Adiós', target: `Adiós en ${targetLang}`, romanization: null },
      ],
    },
    {
      name: 'Emergencias', icon: '🆘',
      items: [
        { source: 'Llama a la policía', target: `Policía en ${targetLang}`, romanization: null },
        { source: 'Necesito un médico', target: `Médico en ${targetLang}`, romanization: null },
        { source: '¿Dónde está el hospital?', target: `Hospital en ${targetLang}`, romanization: null },
      ],
    },
  ];
}

// ─── localStorage cache helpers ──────────────────────────────────────────────
const LS_PREFIX = 'kodo_phrasepack_';

function readCache(countryKey) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + countryKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.categories?.length > 0) return parsed;
  } catch {}
  return null;
}

function writeCache(countryKey, data) {
  try {
    localStorage.setItem(LS_PREFIX + countryKey, JSON.stringify(data));
  } catch {}
}

// ─── Fetch phrase pack from LLM ──────────────────────────────────────────────
async function fetchPhrasePack(country, targetLang, langCode) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Genera un pack de frases útiles para un viajero hispanohablante en ${country} (idioma: ${targetLang}, código: ${langCode}).
Incluye exactamente estas 5 categorías con el número de frases indicado:
- Básicas: 15 frases (saludos, cortesías, números, colores, días)
- Restaurante: 15 frases (pedir, alergias, cuenta, agua, carta, reserva)
- Direcciones: 10 frases (baño, estación, perdido, derecha, izquierda, hotel)
- Transporte: 10 frases (billete, metro, taxi, parada, andén, horario)
- Emergencias: 10 frases (ayuda, médico, policía, robo, pasaporte, farmacia)
Para cada frase: source (español), target (${targetLang}), romanization (transliteración si no usa alfabeto latino, sino null), notes (nota pronunciación, puede ser null).`,
    model: 'claude_sonnet_4_6',
    response_json_schema: {
      type: 'object',
      properties: {
        country: { type: 'string' },
        targetLanguageCode: { type: 'string' },
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    source: { type: 'string' },
                    target: { type: 'string' },
                    romanization: { type: ['string', 'null'] },
                    notes: { type: ['string', 'null'] },
                  },
                  required: ['source', 'target'],
                },
              },
            },
          },
        },
      },
    },
  });

  if (!result?.categories?.length) throw new Error('Empty response');
  return result;
}

// ─── Fetch extra phrases (cargar más) ────────────────────────────────────────
async function fetchMorePhrases(country, targetLang, existingCategories) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Genera 30 frases ADICIONALES para viajero hispanohablante en ${country} (${targetLang}).
NO repitas las frases ya existentes. Repártelas en estas categorías (puedes mezclar categorías):
- Compras: precio, talla, tarjeta, regateo, bolsa
- Hoteles: check-in, habitación, llave, wifi, desayuno
- Ocio: entrada, horario, visita, fotografia permitida, reserva
- Social: ¿De dónde eres?, te invito, salud (brindis), felicidades
Frases existentes a evitar: ${existingCategories.flatMap((c) => c.items.map((i) => i.source)).slice(0, 20).join(', ')}`,
    model: 'claude_sonnet_4_6',
    response_json_schema: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    source: { type: 'string' },
                    target: { type: 'string' },
                    romanization: { type: ['string', 'null'] },
                    notes: { type: ['string', 'null'] },
                  },
                  required: ['source', 'target'],
                },
              },
            },
          },
        },
      },
    },
  });
  return result?.categories || [];
}

// ─── CATEGORY ICONS ──────────────────────────────────────────────────────────
const CAT_ICONS = {
  'Básicas': '👋', 'Restaurante': '🍽️', 'Direcciones': '🗺️',
  'Transporte': '🚆', 'Emergencias': '🆘', 'Compras': '🛍️',
  'Hoteles': '🏨', 'Ocio': '🎭', 'Social': '🥂',
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function Translator() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');

  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [direction, setDirection] = useState('es-target');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({ Básicas: true, Restaurante: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);

  const queryClient = useQueryClient();
  const { trip, activeCity } = useTripContext(tripId);

  // Derive country/language from active context
  const countryRaw = activeCity?.country || trip?.country || '';
  const meta = getCountryMeta(activeCity?.country_code || countryRaw);
  const targetLang = meta.languageLabel || 'English';
  const targetLangCode = meta.languageCode || 'en';
  const targetFlag = meta.flag || '🌍';
  const isSameLang = targetLang === 'Spanish' || targetLang === 'Español';

  // Stable cache key
  const countryKey = activeCity?.country_code || countryRaw || 'unknown';

  // ─── useQuery with localStorage as initialData ───────────────────────────
  const {
    data: phrasePack,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['phrasePack', countryKey],
    queryFn: async () => {
      const pack = await fetchPhrasePack(countryRaw, targetLang, targetLangCode);
      writeCache(countryKey, pack);
      return pack;
    },
    initialData: () => readCache(countryKey) ?? undefined,
    staleTime: 30 * 24 * 60 * 60 * 1000, // 30 days
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!countryRaw && !isSameLang,
    retry: 1,
  });

  const categories = phrasePack?.categories || (isError ? buildFallback(targetLang) : []);

  // ─── Regenerar (force refresh) ───────────────────────────────────────────
  const handleRegenerate = useCallback(() => {
    try { localStorage.removeItem(LS_PREFIX + countryKey); } catch {}
    queryClient.invalidateQueries({ queryKey: ['phrasePack', countryKey] });
  }, [countryKey, queryClient]);

  // ─── Cargar más ──────────────────────────────────────────────────────────
  const handleLoadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const extra = await fetchMorePhrases(countryRaw, targetLang, categories);
    if (extra.length > 0) {
      // Merge: new categories extend existing ones or are appended
      const merged = [...categories];
      for (const newCat of extra) {
        const existing = merged.find((c) => c.name === newCat.name);
        if (existing) {
          existing.items = [...(existing.items || []), ...(newCat.items || [])];
        } else {
          merged.push(newCat);
        }
      }
      const updatedPack = { ...phrasePack, categories: merged };
      queryClient.setQueryData(['phrasePack', countryKey], updatedPack);
      writeCache(countryKey, updatedPack);
    }
    setLoadingMore(false);
  }, [loadingMore, countryRaw, targetLang, categories, phrasePack, countryKey, queryClient]);

  // ─── Translator ──────────────────────────────────────────────────────────
  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    const isToTarget = direction === 'es-target';
    const prompt = isToTarget
      ? `Traduce del español al ${targetLang}. Proporciona la traducción y si el idioma no usa alfabeto latino, añade la romanización. Texto: "${inputText}"`
      : `Traduce del ${targetLang} al español. Texto: "${inputText}"`;
    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setTranslatedText(result);
    setIsTranslating(false);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCategory = (name) => {
    setExpandedCategories((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLangCode;
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: (cat.items || []).filter(
        (p) =>
          p.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.target?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.romanization || '').toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items?.length > 0);

  const totalPhrases = categories.reduce((n, c) => n + (c.items?.length || 0), 0);
  const isLoading = isFetching && categories.length === 0;

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="bg-orange-700 pt-12 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-white text-4xl font-bold">Traductor {targetFlag}</h1>
          <p className="text-white/90 mt-2">
            {countryRaw
              ? `Español ↔ ${targetLang} · ${countryRaw}`
              : 'Traduce y aprende frases para tu viaje'}
          </p>
          {!tripId && (
            <p className="text-white/70 text-sm mt-1">⚠️ Abre desde un viaje para frases del país destino</p>
          )}
        </div>
      </div>

      <div className="bg-orange-50 mx-auto px-6 pt-6 pb-12 md:pb-6 max-w-5xl -mt-12">
        <Tabs defaultValue="phrases" className="space-y-6">
          <TabsList className="bg-white border border-border p-1">
            <TabsTrigger value="phrases" className="data-[state=active]:bg-orange-700 data-[state=active]:text-white">
              📖 Frases útiles
            </TabsTrigger>
            <TabsTrigger value="translator" className="data-[state=active]:bg-orange-700 data-[state=active]:text-white">
              🔄 Traductor
            </TabsTrigger>
          </TabsList>

          {/* ── FRASES ÚTILES ── */}
          <TabsContent value="phrases" className="space-y-4">
            {isSameLang ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>El idioma de {countryRaw} es español, no necesitas frases 😄</p>
              </div>
            ) : isLoading ? (
              <div className="text-center py-16 text-muted-foreground">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-orange-500" />
                <p className="text-lg font-medium">Cargando frases para {countryRaw}...</p>
                <p className="text-sm mt-1">La IA está preparando un pack de 60+ frases</p>
              </div>
            ) : (
              <>
                {/* Toolbar */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder={`Buscar en español o ${targetLang}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-11 bg-white border border-border"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={isFetching}
                    title="Regenerar frases"
                    className="flex-shrink-0"
                  >
                    {isFetching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline ml-1">Regenerar</span>
                  </Button>
                </div>

                {/* Stats */}
                <p className="text-xs text-muted-foreground">
                  {totalPhrases} frases · Español → {targetLang}
                  {isFetching && <span className="ml-2 text-orange-500">Actualizando...</span>}
                </p>

                {filteredCategories.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">No se encontraron frases</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredCategories.map((category) => (
                      <Collapsible
                        key={category.name}
                        open={expandedCategories[category.name] !== false}
                        onOpenChange={() => toggleCategory(category.name)}
                      >
                        <div className="border border-border rounded-2xl overflow-hidden shadow-sm">
                          <CollapsibleTrigger className="bg-orange-200 px-6 py-4 text-left w-full flex items-center justify-between hover:bg-orange-300/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{CAT_ICONS[category.name] || '💬'}</span>
                              <span className="text-orange-700 font-bold">{category.name}</span>
                              <span className="text-orange-600 text-xs">({category.items?.length})</span>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 text-orange-600 transition-transform duration-200 ${
                                expandedCategories[category.name] !== false ? 'rotate-180' : ''
                              }`}
                            />
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="divide-y divide-border/50">
                              {category.items.map((phrase, idx) => (
                                <div key={idx} className="bg-white px-5 py-4 hover:bg-orange-50/50 transition-colors group">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      {/* Español (source) */}
                                      <p className="text-sm text-muted-foreground leading-snug">{phrase.source}</p>
                                      {/* Idioma destino (target) */}
                                      <p className="text-lg font-bold mt-0.5 text-foreground leading-snug">{phrase.target}</p>
                                      {/* Romanización */}
                                      {phrase.romanization && (
                                        <p className="text-xs text-orange-600 italic mt-1 bg-orange-50 inline-block px-2 py-0.5 rounded">
                                          {phrase.romanization}
                                        </p>
                                      )}
                                      {/* Notas */}
                                      {phrase.notes && (
                                        <p className="text-xs text-muted-foreground mt-1">💡 {phrase.notes}</p>
                                      )}
                                    </div>
                                    <div className="flex-shrink-0 flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => speakText(phrase.target)}
                                        className="text-orange-500 hover:text-orange-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Escuchar"
                                      >
                                        <Volume2 className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => copyToClipboard(phrase.target, `${category.name}-${idx}`)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        {copiedId === `${category.name}-${idx}` ? (
                                          <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                          <Copy className="w-4 h-4 text-muted-foreground" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}

                    {/* Cargar más */}
                    {!searchQuery && (
                      <Button
                        variant="outline"
                        className="w-full h-12 border-dashed border-orange-300 text-orange-700 hover:bg-orange-50"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                      >
                        {loadingMore ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Cargando más frases...</>
                        ) : (
                          <><Plus className="w-4 h-4 mr-2" />Cargar +30 frases</>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* ── TRADUCTOR ── */}
          <TabsContent value="translator" className="space-y-6">
            {isSameLang ? (
              <div className="text-center py-12 text-muted-foreground">
                <Languages className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>El idioma de {countryRaw} es español 😄</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-semibold text-foreground">Entrada</span>
                      <span className="ml-auto text-xs bg-slate-100 px-2 py-1 rounded">
                        {direction === 'es-target' ? '🇪🇸 Español' : `${targetFlag} ${targetLang}`}
                      </span>
                    </div>
                    <Textarea
                      placeholder={direction === 'es-target' ? 'Escribe algo en español...' : `Escribe en ${targetLang}...`}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      rows={6}
                      className="border border-border"
                    />
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-semibold text-foreground">Traducción</span>
                      <span className="ml-auto text-xs bg-slate-100 px-2 py-1 rounded">
                        {direction === 'target-es' ? '🇪🇸 Español' : `${targetFlag} ${targetLang}`}
                      </span>
                    </div>
                    <div className="border border-border rounded-lg p-4 min-h-40 flex flex-col justify-between bg-white">
                      {translatedText ? (
                        <>
                          <div className="flex-1 whitespace-pre-wrap text-foreground text-sm">{translatedText}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(translatedText, 'translation')}
                            className="mt-3 self-end"
                          >
                            {copiedId === 'translation' ? (
                              <><Check className="w-4 h-4 mr-1 text-green-500" />Copiado</>
                            ) : (
                              <><Copy className="w-4 h-4 mr-1 text-stone-400" />Copiar</>
                            )}
                          </Button>
                        </>
                      ) : (
                        <p className="text-muted-foreground text-sm">Aquí aparecerá la traducción...</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 items-center justify-center">
                  <Button
                    onClick={handleTranslate}
                    disabled={!inputText.trim() || isTranslating}
                    className="flex-1 bg-orange-700 hover:bg-orange-800 text-white py-6 text-base"
                  >
                    {isTranslating ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traduciendo...</>
                    ) : (
                      <><Languages className="w-4 h-4 mr-2" />Traducir</>
                    )}
                  </Button>
                  <button
                    onClick={() => {
                      setDirection(direction === 'es-target' ? 'target-es' : 'es-target');
                      setInputText('');
                      setTranslatedText('');
                    }}
                    className="p-3 rounded-full border border-border hover:border-orange-400"
                    title="Intercambiar idiomas"
                  >
                    <ArrowRightLeft className="w-5 h-5 text-orange-700" />
                  </button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}