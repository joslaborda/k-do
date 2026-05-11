import { createPageUrl } from '@/utils';
import { useState, useEffect, useRef } from 'react';
import {
  Languages, ArrowRightLeft, Copy, Check, Volume2, Loader2,
  ChevronDown, Mic, MicOff, AlertCircle, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getCountryMeta } from '@/lib/countryConfig';
import { useTripContext } from '@/hooks/useTripContext';
import { getPhrasesForCountry } from '@/lib/phrasesDB';
import { Link } from 'react-router-dom';

const CAT_ICONS = {
  'Basicas':'👋','Básicas':'👋','Restaurante':'🍽️','Direcciones':'🗺️',
  'Transporte':'🚆','Emergencias':'🆘','Compras':'🛍️',
  'Hoteles':'🏨','Ocio':'🎭','Social':'🥂',
};

const LANGUAGES = [
  { code: 'es', bcp: 'es-ES', label: 'Español', flag: '🇪🇸' },
  { code: 'en', bcp: 'en-US', label: 'Inglés', flag: '🇬🇧' },
  { code: 'ja', bcp: 'ja-JP', label: 'Japonés', flag: '🇯🇵' },
  { code: 'fr', bcp: 'fr-FR', label: 'Francés', flag: '🇫🇷' },
  { code: 'pt', bcp: 'pt-BR', label: 'Portugués', flag: '🇧🇷' },
  { code: 'de', bcp: 'de-DE', label: 'Alemán', flag: '🇩🇪' },
  { code: 'it', bcp: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'zh', bcp: 'zh-CN', label: 'Chino', flag: '🇨🇳' },
  { code: 'ko', bcp: 'ko-KR', label: 'Coreano', flag: '🇰🇷' },
  { code: 'ar', bcp: 'ar-SA', label: 'Árabe', flag: '🇸🇦' },
  { code: 'th', bcp: 'th-TH', label: 'Tailandés', flag: '🇹🇭' },
  { code: 'vi', bcp: 'vi-VN', label: 'Vietnamita', flag: '🇻🇳' },
  { code: 'id', bcp: 'id-ID', label: 'Indonesio', flag: '🇮🇩' },
  { code: 'tr', bcp: 'tr-TR', label: 'Turco', flag: '🇹🇷' },
  { code: 'ru', bcp: 'ru-RU', label: 'Ruso', flag: '🇷🇺' },
  { code: 'nl', bcp: 'nl-NL', label: 'Neerlandés', flag: '🇳🇱' },
  { code: 'pl', bcp: 'pl-PL', label: 'Polaco', flag: '🇵🇱' },
  { code: 'hi', bcp: 'hi-IN', label: 'Hindi', flag: '🇮🇳' },
  { code: 'el', bcp: 'el-GR', label: 'Griego', flag: '🇬🇷' },
  { code: 'he', bcp: 'he-IL', label: 'Hebreo', flag: '🇮🇱' },
];

async function translateWithMyMemory(text, fromCode, toCode) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromCode}|${toCode}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error('Network error');
  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error(data.responseDetails || 'Error');
  return data.responseData.translatedText;
}

function speakText(text, bcpLang) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = bcpLang;
  utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
}

function LangSelector({ value, onChange, label }) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground mb-1.5 text-center">{label}</p>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-border rounded-xl px-2 py-2 text-sm bg-secondary outline-none focus:border-orange-400 text-center"
      >
        {LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
        ))}
      </select>
    </div>
  );
}

function VoiceButton({ label, fromLang, toLang, isActive, onActivate, onResult, onError, autoSpeak }) {
  const fromL = LANGUAGES.find(l => l.code === fromLang) || LANGUAGES[0];
  const toL   = LANGUAGES.find(l => l.code === toLang)   || LANGUAGES[1];
  const recognitionRef = useRef(null);

  const handlePress = () => {
    if (isActive && recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      onActivate(false);
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { onError('Tu navegador no soporta el micrófono. Usa Chrome o Safari.'); return; }

    onError('');
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = fromL.bcp;
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => onActivate(true);
    recognition.onend = () => { recognitionRef.current = null; onActivate(false); };
    recognition.onerror = (e) => {
      recognitionRef.current = null;
      onActivate(false);
      if (e.error === 'not-allowed') onError('Permiso de micrófono denegado.');
      else if (e.error === 'no-speech') onError('No se detectó voz. Habla más cerca del micrófono.');
      else if (e.error === 'aborted') return;
      else onError('Error al grabar. Inténtalo de nuevo.');
    };
    recognition.onresult = async (e) => {
      const text = e.results[0][0].transcript;
      try {
        const translation = await translateWithMyMemory(text, fromL.code, toL.code);
        onResult(text, translation);
        if (autoSpeak && translation) speakText(translation, toL.bcp);
      } catch {
        onError('No se pudo traducir. Comprueba tu conexión.');
      }
    };
    try { recognition.start(); } catch {
      recognitionRef.current = null;
      onActivate(false);
      onError('No se pudo iniciar el micrófono.');
    }
  };

  return (
    <button
      onClick={handlePress}
      className={"flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all w-full " +
        (isActive ? "bg-orange-700 border-orange-600" : "bg-white border-border hover:border-orange-300 hover:bg-orange-50")}
    >
      <div className={"w-16 h-16 rounded-full flex items-center justify-center transition-all " +
        (isActive ? "bg-white/20" : "bg-orange-100")}>
        {isActive ? <MicOff className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-orange-700" />}
      </div>
      {isActive ? (
        <div className="flex items-end gap-1 h-6">
          {[4,7,10,7,4].map((h,i) => (
            <div key={i} className="w-1.5 bg-white rounded-full"
              style={{height: h+'px', animation: `pulse 0.6s ease-in-out ${i*0.1}s infinite alternate`}} />
          ))}
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{fromL.flag} {fromL.label} → {toL.flag} {toL.label}</p>
        </>
      )}
      {isActive && <p className="text-xs text-white font-semibold">Toca para parar ⏹</p>}
      <style>{`@keyframes pulse{from{opacity:.3}to{opacity:1}}`}</style>
    </button>
  );
}

export function TranslatorPanel({ tripId }) {
  const { trip, activeCity } = useTripContext(tripId);
  const countryRaw = activeCity?.country || trip?.country || '';
  const meta = getCountryMeta(countryRaw);

  const tripLangCode = meta.languageCode?.split('-')[0] || 'en';
  const tripLang = LANGUAGES.find(l => l.code === tripLangCode) ? tripLangCode : 'en';

  const [fromLang, setFromLang] = useState('es');
  const [toLang, setToLang]     = useState(tripLang);
  const [activeBtn, setActiveBtn] = useState(null);
  const [original, setOriginal]   = useState('');
  const [translated, setTranslated] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [inputText, setInputText]   = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({ 'Básicas': true, 'Restaurante': true });

  useEffect(() => { setToLang(tripLang); }, [tripLang]);

  const voiceSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const phrasePack = countryRaw ? getPhrasesForCountry(countryRaw) : null;
  const categories = phrasePack?.categories || [];
  const totalPhrases = categories.reduce((n, c) => n + (c.items?.length || 0), 0);

  const handleVoiceResult = (text, translation) => {
    setVoiceError(''); setOriginal(text); setTranslated(translation); setInputText('');
  };

  const handleSwap = () => {
    setFromLang(toLang); setToLang(fromLang);
    setOriginal(''); setTranslated(''); setInputText(''); setTranslateError('');
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true); setTranslateError(''); setOriginal(''); setTranslated('');
    try {
      const result = await translateWithMyMemory(inputText, fromLang, toLang);
      setOriginal(inputText); setTranslated(result);
    } catch { setTranslateError('No se pudo traducir. Comprueba tu conexión.'); }
    finally { setIsTranslating(false); }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fromL = LANGUAGES.find(l => l.code === fromLang) || LANGUAGES[0];
  const toL   = LANGUAGES.find(l => l.code === toLang)   || LANGUAGES[1];

  return (
    <Tabs defaultValue="translator" className="space-y-4">
      <TabsList className="bg-white border border-border p-1 rounded-xl">
        <TabsTrigger value="translator" className="data-[state=active]:bg-orange-700 data-[state=active]:text-white rounded-lg">
          🔄 Traductor
        </TabsTrigger>
        <TabsTrigger value="phrases" className="data-[state=active]:bg-orange-700 data-[state=active]:text-white rounded-lg">
          📖 Frases{totalPhrases > 0 && <span className="ml-1.5 text-xs opacity-70">({totalPhrases})</span>}
        </TabsTrigger>
      </TabsList>

      {/* ── TAB TRADUCTOR ── */}
      <TabsContent value="translator" className="space-y-4 mt-0">
        <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-end gap-3">
            <LangSelector value={fromLang} onChange={setFromLang} label="De" />
            <button onClick={handleSwap}
              className="flex-shrink-0 mb-0.5 p-2 rounded-full border border-border hover:border-orange-400 hover:bg-orange-50 transition-colors">
              <ArrowRightLeft className="w-4 h-4 text-orange-700" />
            </button>
            <LangSelector value={toLang} onChange={setToLang} label="A" />
          </div>
        </div>

        {voiceSupported ? (
          <div className="grid grid-cols-2 gap-3">
            <VoiceButton label="Hablo yo" fromLang={fromLang} toLang={toLang}
              isActive={activeBtn === 'me'} onActivate={v => setActiveBtn(v ? 'me' : null)}
              onResult={handleVoiceResult} onError={setVoiceError} autoSpeak={true} />
            <VoiceButton label="Me hablan" fromLang={toLang} toLang={fromLang}
              isActive={activeBtn === 'them'} onActivate={v => setActiveBtn(v ? 'them' : null)}
              onResult={handleVoiceResult} onError={setVoiceError} autoSpeak={false} />
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">El micrófono no está disponible en este navegador. Usa Chrome o Safari.</p>
          </div>
        )}

        {/iphone|ipad|ipod/i.test(navigator.userAgent) && window.navigator.standalone && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-800">Para usar el micrófono, abre Kōdo en <strong>Safari</strong>.</p>
          </div>
        )}

        {voiceError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{voiceError}</p>
          </div>
        )}

        {(original || translated) && (
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            {original && (
              <div className="p-4 border-b border-border">
                <p className="text-xs text-muted-foreground mb-1">{fromL.flag} Original</p>
                <p className="text-sm text-foreground">{original}</p>
              </div>
            )}
            {translated && (
              <div className="p-4 bg-orange-50">
                <p className="text-xs text-muted-foreground mb-1">{toL.flag} Traducción</p>
                <p className="text-base font-semibold text-foreground">{translated}</p>
                <div className="flex gap-2 mt-3">
                  <Button variant="ghost" size="sm" onClick={() => speakText(translated, toL.bcp)}>
                    <Volume2 className="w-4 h-4 mr-1 text-orange-500" />Escuchar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(translated, 'translation')}>
                    {copiedId === 'translation'
                      ? <><Check className="w-4 h-4 mr-1 text-green-500" />Copiado</>
                      : <><Copy className="w-4 h-4 mr-1" />Copiar</>}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
          <p className="text-xs text-muted-foreground mb-2">O escribe:</p>
          <div className="relative">
            <Textarea
              placeholder={`Escribe en ${fromL.label}...`}
              value={inputText}
              onChange={e => { setInputText(e.target.value); setTranslated(''); setOriginal(''); }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTranslate(); } }}
              rows={3}
              className="border border-border resize-none pr-28"
            />
            <button
              onClick={handleTranslate}
              disabled={!inputText.trim() || isTranslating}
              className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-orange-700 text-white text-xs font-medium disabled:opacity-40 hover:bg-orange-800 flex items-center gap-1"
            >
              {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Traducir
            </button>
          </div>
          {translateError && (
            <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{translateError}
            </p>
          )}
        </div>
      </TabsContent>

      {/* ── TAB FRASES ── */}
      <TabsContent value="phrases" className="space-y-4 mt-0">
        {categories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-10 text-center shadow-sm">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-muted-foreground text-sm">
              No tenemos frases para <strong>{countryRaw || 'este destino'}</strong> todavía.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            <p className="text-xs text-muted-foreground">{totalPhrases} frases · Español → {meta.languageLabel || 'local'} {meta.flag}</p>
            {categories.map(category => (
              <Collapsible
                key={category.name}
                open={expandedCategories[category.name] !== false}
                onOpenChange={() => setExpandedCategories(p => ({ ...p, [category.name]: !p[category.name] }))}
              >
                <div className="border border-border rounded-2xl overflow-hidden shadow-sm">
                  <CollapsibleTrigger className="bg-orange-50 px-5 py-4 text-left w-full flex items-center justify-between hover:bg-orange-100/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{CAT_ICONS[category.name] || '💬'}</span>
                      <span className="text-orange-800 font-semibold">{category.name}</span>
                      <span className="text-orange-500 text-xs bg-orange-100 px-2 py-0.5 rounded-full">{category.items?.length}</span>
                    </div>
                    <ChevronDown className={"w-4 h-4 text-orange-600 transition-transform " + (expandedCategories[category.name] !== false ? 'rotate-180' : '')} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="divide-y divide-border/50">
                      {category.items?.map((phrase, idx) => (
                        <div key={idx} className="bg-white px-5 py-4 hover:bg-orange-50/50 group">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground">{phrase.source}</p>
                              <p className="text-sm font-semibold text-foreground mt-0.5">{phrase.target}</p>
                              {phrase.romanization && (
                                <p className="text-xs text-orange-500 italic mt-0.5">{phrase.romanization}</p>
                              )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => speakText(phrase.target, meta.languageCode || 'en')}>
                                <Volume2 className="w-3.5 h-3.5 text-orange-500" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(phrase.target, `${category.name}-${idx}`)}>
                                {copiedId === `${category.name}-${idx}`
                                  ? <Check className="w-3.5 h-3.5 text-green-500" />
                                  : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
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

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to={createPageUrl(`Home?trip_id=${tripId}`)}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Languages className="w-5 h-5 text-orange-700 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base font-bold text-foreground leading-tight">Traductor {meta.flag || '🌍'}</h1>
              {countryRaw && (
                <p className="text-xs text-muted-foreground truncate">{meta.languageLabel || 'idioma local'} · {countryRaw}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pt-5 pb-24">
        <TranslatorPanel tripId={tripId} />
      </div>
    </div>
  );
}