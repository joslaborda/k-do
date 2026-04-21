import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Languages, ArrowRightLeft, Copy, Check, Volume2, Loader2, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getCountryMeta } from '@/lib/countryConfig';
import { useQuery } from '@tanstack/react-query';
function getCountryConfig(country) { const m = getCountryMeta(country); return { lang: m.languageLabel, langNative: m.languageLabel, locale: m.languageCode, flag: m.flag }; }
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Translator() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');

  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [direction, setDirection] = useState('es-target');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({ 'Básicas': true, 'Restaurante': true });
  const [searchQuery, setSearchQuery] = useState('');
  const [phraseCategories, setPhraseCategories] = useState([]);
  const [loadingPhrases, setLoadingPhrases] = useState(false);

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => base44.entities.Trip.get(tripId),
    enabled: !!tripId,
  });

  const country = trip?.country || '';
  const countryConfig = getCountryConfig(country);
  const targetLang = countryConfig.lang;
  const targetLangNative = countryConfig.langNative;
  const targetLocale = countryConfig.locale;
  const targetFlag = countryConfig.flag;
  // Si el idioma destino es español, no tiene mucho sentido el traductor
  const isSameLang = targetLang === 'Spanish';

  // Cargar frases útiles por IA según el país
  useEffect(() => {
    if (!country || isSameLang) return;
    const cacheKey = `phrases_${country}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try { setPhraseCategories(JSON.parse(cached)); return; } catch {}
    }
    setLoadingPhrases(true);
    const prompt = `
Genera un listado de frases útiles para un viajero hispanohablante que visita ${country}.
El idioma local es ${targetLang} (${targetLangNative}).

Crea exactamente estas categorías con sus frases:
- Básicas (10 frases: saludos, gracias, perdón, sí, no...)
- Restaurante (10 frases: pedir agua, cuenta, carta, vegetariano...)
- Direcciones (8 frases: dónde está el baño, estación, estoy perdido...)
- Transporte (6 frases: billetes, siguiente parada, trasbordos...)
- Compras (7 frases: precio, tarjeta, tallas, me lo llevo...)
- Emergencias (7 frases: ayuda, médico, policía, hospital, pasaporte...)

Para cada frase proporciona:
- spanish: la frase en español
- translation: la traducción al idioma local (${targetLang})
- romanization: la romanización o transliteración si el idioma no usa alfabeto latino (si ya usa alfabeto latino, deja vacío "")

Responde SOLO con JSON válido:
{
  "categories": [
    {
      "name": "Básicas",
      "icon": "👋",
      "phrases": [
        { "spanish": "...", "translation": "...", "romanization": "..." }
      ]
    }
  ]
}
`;
    base44.integrations.Core.InvokeLLM({
      prompt,
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
                icon: { type: 'string' },
                phrases: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      spanish: { type: 'string' },
                      translation: { type: 'string' },
                      romanization: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }).then((result) => {
      const cats = result.categories || [];
      setPhraseCategories(cats);
      sessionStorage.setItem(cacheKey, JSON.stringify(cats));
    }).catch(() => {}).finally(() => setLoadingPhrases(false));
  }, [country, isSameLang]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    const isToTarget = direction === 'es-target';
    const prompt = isToTarget
      ? `Traduce el siguiente texto del español al ${targetLang}. Proporciona:
1. La traducción en ${targetLang}
2. La romanización/transliteración si el idioma no usa alfabeto latino (omite si ya usa caracteres latinos)
3. Una nota de pronunciación útil si aplica

Texto: "${inputText}"

Responde en formato claro y fácil de leer.`
      : `Traduce el siguiente texto del ${targetLang} al español.

Texto: "${inputText}"

Si el texto está romanizado, también tradúcelo. Proporciona una traducción clara y natural en español.`;

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
    utterance.lang = targetLocale;
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  const filteredCategories = phraseCategories.map((cat) => ({
    ...cat,
    phrases: cat.phrases.filter((phrase) =>
      phrase.spanish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phrase.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (phrase.romanization || '').toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.phrases.length > 0);

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="bg-orange-700 pt-12 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-white text-4xl font-bold">Traductor {targetFlag}</h1>
          <p className="text-white/90 mt-2">
            {country
              ? `Traduce y aprende frases útiles para ${country}`
              : 'Traduce y aprende frases útiles para tu viaje'}
          </p>
          {!tripId && (
            <p className="text-white/70 text-sm mt-1">⚠️ Abre desde un viaje para ver frases del país de destino</p>
          )}
        </div>
      </div>

      <div className="bg-orange-50 mx-auto px-6 pt-6 pb-12 md:pb-6 max-w-5xl -mt-12">
        <Tabs defaultValue="translator" className="space-y-6">
          <TabsList className="bg-white border border-border p-1">
            <TabsTrigger value="phrases" className="data-[state=active]:bg-orange-700 data-[state=active]:text-white">
              📖 Frases útiles
            </TabsTrigger>
            <TabsTrigger value="translator" className="data-[state=active]:bg-orange-700 data-[state=active]:text-white">
              🔄 Traductor
            </TabsTrigger>
          </TabsList>

          {/* TRADUCTOR */}
          <TabsContent value="translator" className="space-y-6">
            {isSameLang ? (
              <div className="text-center py-12 text-muted-foreground">
                <Languages className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>El idioma de {country} es español, así que no necesitas traductor 😄</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Input */}
                  <div className="bg-white p-6 rounded-2xl border border-border shadow-xl">
                    <div className="mb-4">
                      <label className="text-sm font-semibold text-foreground mb-3 block">Entrada</label>
                      <div className="bg-slate-100 text-foreground px-3 py-2 text-xs font-medium rounded-lg inline-block border border-indigo-500/30">
                        {direction === 'es-target' ? '🇪🇸 Español' : `${targetFlag} ${targetLang}`}
                      </div>
                    </div>
                    <Textarea
                      placeholder={direction === 'es-target' ? 'Escribe algo en español...' : `Escribe en ${targetLang}...`}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      rows={6}
                      className="bg-white text-foreground border border-border"
                    />
                  </div>

                  {/* Output */}
                  <div className="bg-white p-6 rounded-2xl border border-border shadow-xl">
                    <div className="mb-4">
                      <label className="text-sm font-semibold text-foreground mb-3 block">Traducción</label>
                      <div className="bg-slate-100 text-foreground px-3 py-2 text-xs font-medium rounded-lg inline-block border border-red-500/30">
                        {direction === 'target-es' ? '🇪🇸 Español' : `${targetFlag} ${targetLang}`}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-border min-h-40 flex flex-col justify-between">
                      {translatedText ? (
                        <>
                          <div className="flex-1 whitespace-pre-wrap text-foreground">{translatedText}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(translatedText, 'translation')}
                            className="mt-3 self-end"
                          >
                            {copiedId === 'translation' ? (
                              <><Check className="w-4 h-4 mr-2 text-green-500" />Copiado</>
                            ) : (
                              <><Copy className="w-4 h-4 mr-2 text-stone-400" />Copiar</>
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
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base"
                  >
                    {isTranslating ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traduciendo...</>
                    ) : (
                      <><Languages className="w-4 h-4 mr-2" />Traducir</>
                    )}
                  </Button>
                  <button
                    onClick={() => setDirection(direction === 'es-target' ? 'target-es' : 'es-target')}
                    className="p-3 rounded-full border border-border hover:border-primary/50"
                    title="Intercambiar idiomas"
                  >
                    <ArrowRightLeft className="w-5 h-5 text-primary" />
                  </button>
                </div>
              </>
            )}
          </TabsContent>

          {/* FRASES ÚTILES */}
          <TabsContent value="phrases" className="space-y-6">
            {loadingPhrases ? (
              <div className="text-center py-16 text-muted-foreground">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-orange-500" />
                <p className="text-lg font-medium">Cargando frases para {country}...</p>
                <p className="text-sm mt-1">La IA está preparando las frases más útiles para tu viaje</p>
              </div>
            ) : isSameLang ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>El idioma de {country} es español, no necesitas frases 😄</p>
              </div>
            ) : phraseCategories.length === 0 && !loadingPhrases ? (
              <div className="text-center py-12 text-muted-foreground">
                <Languages className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>{tripId ? 'No se pudieron cargar las frases. Inténtalo de nuevo.' : 'Abre el traductor desde un viaje para ver las frases del país de destino.'}</p>
              </div>
            ) : (
              <>
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder={`Busca en español o en ${targetLang}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-white border border-border"
                  />
                </div>

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
                        open={expandedCategories[category.name]}
                        onOpenChange={() => toggleCategory(category.name)}
                      >
                        <div className="border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors shadow-lg">
                          <CollapsibleTrigger className="bg-orange-200 px-6 py-5 text-left w-full flex items-center justify-between hover:bg-orange-300/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <span className="text-3xl">{category.icon}</span>
                              <div>
                                <span className="text-orange-700 text-lg font-bold">{category.name}</span>
                                <span className="text-orange-700 ml-2 text-xs">({category.phrases.length} frases)</span>
                              </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${expandedCategories[category.name] ? 'rotate-180' : ''}`} />
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="border-t border-border/50 divide-y divide-border/50 bg-secondary/10">
                              {category.phrases.map((phrase, idx) => (
                                <div key={idx} className="bg-white p-5 hover:bg-secondary/30 transition-colors group">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-foreground font-semibold text-sm leading-tight">{phrase.spanish}</p>
                                      <p className="text-2xl font-bold mt-2 text-foreground tracking-tight">{phrase.translation}</p>
                                      {phrase.romanization && (
                                        <p className="text-xs text-muted-foreground mt-2 italic font-mono bg-secondary/50 inline-block px-2 py-1 rounded">{phrase.romanization}</p>
                                      )}
                                    </div>
                                    <div className="flex-shrink-0 flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => speakText(phrase.translation)}
                                        className="text-primary hover:text-primary/80"
                                        title="Escuchar pronunciación"
                                      >
                                        <Volume2 className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => copyToClipboard(phrase.translation, `${category.name}-${idx}`)}
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
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}