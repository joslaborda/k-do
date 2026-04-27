import { useState } from 'react';
import {
  Languages, ArrowRightLeft, Copy, Check, Volume2, Loader2,
  ChevronDown, Search, Mic, MicOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getCountryMeta } from '@/lib/countryConfig';
import { useTripContext } from '@/hooks/useTripContext';
import { getPhrasesForCountry } from '@/lib/phrasesDB';

const CAT_ICONS = {
  'Básicas':'👋','Restaurante':'🍽️','Direcciones':'🗺️',
  'Transporte':'🚆','Emergencias':'🆘','Compras':'🛍️',
  'Hoteles':'🏨','Ocio':'🎭','Social':'🥂',
};

const SPANISH_COUNTRIES = new Set([
  "España","México","Colombia","Argentina","Chile","Perú","Venezuela","Ecuador",
  "Bolivia","Paraguay","Uruguay","Costa Rica","Panamá","Guatemala","Honduras",
  "El Salvador","Nicaragua","Cuba","República Dominicana","Puerto Rico","Andorra"
]);

async function translateWithMyMemory(text, fromLang, toLang) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network error');
  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error(data.responseDetails || 'Error');
  return data.responseData.translatedText;
}

export function TranslatorPanel({ tripId }) {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState(null);
  const [direction, setDirection] = useState('es-target');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({ 'Básicas': true, 'Restaurante': true });
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const { trip, activeCity } = useTripContext(tripId);
  const countryRaw = activeCity?.country || trip?.country || '';
  const meta = getCountryMeta(countryRaw);
  const targetLang = meta.languageLabel || 'English';
  const targetLangCode = meta.languageCode || 'en';
  const targetFlag = meta.flag || '🌍';
  const isHispanic = SPANISH_COUNTRIES.has(countryRaw);

  const phrasePack = countryRaw ? getPhrasesForCountry(countryRaw) : null;
  const categories = phrasePack?.categories || [];

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = direction === 'es-target' ? 'es-ES' : (targetLangCode || 'en-US');
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInputText(transcript);
      // Auto-translate after voice input
      setTimeout(async () => {
        const from = direction === 'es-target' ? 'es' : (targetLangCode || 'en');
        const to = direction === 'es-target' ? (targetLangCode || 'en') : 'es';
        try {
          const result = await translateWithMyMemory(transcript, from, to);
          setTranslatedText(result);
          // Auto-speak the translation
          speakText(result, to === 'es' ? 'es-ES' : (targetLangCode || 'en-US'));
        } catch {}
      }, 300);
    };
    recognition.start();
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    setTranslateError(null);
    setTranslatedText('');
    try {
      const isToTarget = direction === 'es-target';
      const from = isToTarget ? 'es' : targetLangCode.split('-')[0];
      const to = isToTarget ? targetLangCode.split('-')[0] : 'es';
      const result = await translateWithMyMemory(inputText, from, to);
      setTranslatedText(result);
    } catch {
      setTranslateError('No se pudo traducir. Comprueba tu conexión e inténtalo de nuevo.');
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const speakText = (text, langCode) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode || targetLangCode;
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const toggleCategory = (name) => {
    setExpandedCategories(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const filteredCategories = categories
    .map(cat => ({
      ...cat,
      items: (cat.items || []).filter(p =>
        p.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.target?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.romanization || '').toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(cat => cat.items?.length > 0);

  const totalPhrases = categories.reduce((n, c) => n + (c.items?.length || 0), 0);

  if (isHispanic) {
    return (
      <div className="bg-white rounded-2xl border border-border p-10 text-center shadow-sm">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-foreground mb-2">¡Mismo idioma!</h2>
        <p className="text-muted-foreground">
          En {countryRaw} se habla español, no necesitas traductor.
        </p>
        <p className="text-sm text-muted-foreground mt-2">¡Disfruta el viaje!</p>
      </div>
    );
  }

  if (!countryRaw) {
    return (
      <div className="bg-white rounded-2xl border border-border p-10 text-center shadow-sm">
        <div className="text-5xl mb-4">🌍</div>
        <h2 className="text-xl font-bold text-foreground mb-2">Abre desde un viaje</h2>
        <p className="text-muted-foreground">
          Las frases y el traductor se adaptan al país destino de tu viaje.
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="phrases" className="space-y-6">
      <TabsList className="bg-white border border-border p-1">
        <TabsTrigger value="phrases" className="data-[state=active]:bg-orange-700 data-[state=active]:text-white">
          📖 Frases útiles{totalPhrases > 0 && <span className="ml-1.5 text-xs opacity-70">({totalPhrases})</span>}
        </TabsTrigger>
        <TabsTrigger value="translator" className="data-[state=active]:bg-orange-700 data-[state=active]:text-white">
          🔄 Traductor
        </TabsTrigger>
      </TabsList>

      <TabsContent value="phrases" className="space-y-4">
        {categories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-10 text-center shadow-sm">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-muted-foreground text-sm">
              No tenemos frases para <strong>{countryRaw}</strong> todavía. Usa el traductor libre.
            </p>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={`Buscar en español o ${targetLang}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-12 h-11 bg-white border border-border"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {totalPhrases} frases · Español → {targetLang} {targetFlag}
            </p>
            {filteredCategories.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Sin resultados para "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredCategories.map(category => (
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
                        <ChevronDown className={`w-5 h-5 text-orange-600 transition-transform duration-200 ${
                          expandedCategories[category.name] !== false ? 'rotate-180' : ''
                        }`} />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="divide-y divide-border/50">
                          {category.items.map((phrase, idx) => (
                            <div key={idx} className="bg-white px-5 py-4 hover:bg-orange-50/50 transition-colors group">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-muted-foreground leading-snug">{phrase.source}</p>
                                  <p className="text-lg font-bold mt-0.5 text-foreground leading-snug">{phrase.target}</p>
                                  {phrase.romanization && (
                                    <p className="text-xs text-orange-600 italic mt-1 bg-orange-50 inline-block px-2 py-0.5 rounded">
                                      {phrase.romanization}
                                    </p>
                                  )}
                                </div>
                                <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost" size="icon"
                                    onClick={() => speakText(phrase.target, targetLangCode)}
                                    className="text-orange-500 hover:text-orange-700"
                                    title="Escuchar pronunciación"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost" size="icon"
                                    onClick={() => copyToClipboard(phrase.target, `${category.name}-${idx}`)}
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

      <TabsContent value="translator" className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-foreground">Entrada</span>
              {voiceSupported && (
                <button onClick={startVoice} title="Hablar"
                  className={"ml-2 p-1.5 rounded-full transition-colors " + (isListening ? "bg-red-100 text-red-600 animate-pulse" : "hover:bg-orange-50 text-muted-foreground hover:text-orange-600")}>
                  {isListening ? <MicOff className="w-4 h-4"/> : <Mic className="w-4 h-4"/>}
                </button>
              )}
              <span className="ml-auto text-xs bg-slate-100 px-2 py-1 rounded">
                {direction === 'es-target' ? '🇪🇸 Español' : `${targetFlag} ${targetLang}`}
              </span>
            </div>
            <Textarea
              placeholder={direction === 'es-target' ? 'Escribe algo en español...' : `Escribe en ${targetLang}...`}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
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
                  <div className="flex gap-2 mt-3 self-end">
                    <Button variant="ghost" size="sm"
                      onClick={() => speakText(translatedText, direction === 'es-target' ? targetLangCode : 'es-ES')}>
                      <Volume2 className="w-4 h-4 mr-1 text-orange-500" />Escuchar
                    </Button>
                    <Button variant="ghost" size="sm"
                      onClick={() => copyToClipboard(translatedText, 'translation')}>
                      {copiedId === 'translation'
                        ? <><Check className="w-4 h-4 mr-1 text-green-500" />Copiado</>
                        : <><Copy className="w-4 h-4 mr-1 text-stone-400" />Copiar</>}
                    </Button>
                  </div>
                </>
              ) : translateError ? (
                <p className="text-destructive text-sm">{translateError}</p>
              ) : (
                <p className="text-muted-foreground text-sm">Aquí aparecerá la traducción...</p>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Traducción por{' '}
          <a href="https://mymemory.translated.net" target="_blank" rel="noopener noreferrer"
            className="underline hover:text-orange-700">MyMemory</a>
          {' '}· Gratis · Sin cuenta
        </p>

        <div className="flex gap-3 items-center justify-center">
          <Button
            onClick={handleTranslate}
            disabled={!inputText.trim() || isTranslating}
            className="flex-1 bg-orange-700 hover:bg-orange-800 text-white py-6 text-base"
          >
            {isTranslating
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traduciendo...</>
              : <><Languages className="w-4 h-4 mr-2" />Traducir</>}
          </Button>
          <button
            onClick={() => {
              setDirection(direction === 'es-target' ? 'target-es' : 'es-target');
              setInputText(''); setTranslatedText(''); setTranslateError(null);
            }}
            className="p-3 rounded-full border border-border hover:border-orange-400 transition-colors"
            title="Intercambiar idiomas"
          >
            <ArrowRightLeft className="w-5 h-5 text-orange-700" />
          </button>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default function Translator() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');
  const { trip, activeCity } = useTripContext(tripId);
  const countryRaw = activeCity?.country || trip?.country || '';
  const meta = getCountryMeta(countryRaw);

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="bg-orange-700 pt-12 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-white text-4xl font-bold">Traductor {meta.flag || '🌍'}</h1>
          <p className="text-white/90 mt-2">
            {countryRaw
              ? `Español ↔ ${meta.languageLabel || 'idioma local'} · ${countryRaw}`
              : 'Frases y traductor para tu viaje'}
          </p>
        </div>
      </div>
      <div className="bg-orange-50 mx-auto px-6 pt-6 pb-12 md:pb-6 max-w-5xl -mt-12">
        <TranslatorPanel tripId={tripId} />
      </div>
    </div>
  );
}