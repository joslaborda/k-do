import { createPageUrl } from '@/utils';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, ArrowRightLeft, Copy, Check, Volume2, Loader2,
  ChevronDown, Mic, MicOff, AlertCircle
} from 'lucide-react';
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
      recognitionRef.current = null; onActivate(false);
      if (e.error === 'not-allowed') onError('Permiso de micrófono denegado.');
      else if (e.error === 'no-speech') onError('No se detectó voz.');
      else if (e.error === 'aborted') return;
      else onError('Error al grabar. Inténtalo de nuevo.');
    };
    recognition.onresult = async (e) => {
      const text = e.results[0][0].transcript;
      try {
        const translation = await translateWithMyMemory(text, fromL.code, toL.code);
        onResult(text, translation);
        if (autoSpeak && translation) speakText(translation, toL.bcp);
      } catch { onError('No se pudo traducir. Comprueba tu conexión.'); }
    };
    try { recognition.start(); } catch {
      recognitionRef.current = null; onActivate(false);
      onError('No se pudo iniciar el micrófono.');
    }
  };

  return (
    <button onClick={handlePress}
      className={"flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all w-full " +
        (isActive ? "bg-primary border-primary" : "bg-white border-border hover:border-primary/30 hover:bg-accent")}>
      <div className={"w-14 h-14 rounded-full flex items-center justify-center " +
        (isActive ? "bg-white/20" : "bg-accent")}>
        {isActive ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-primary" />}
      </div>
      {isActive ? (
        <div className="flex items-end gap-1 h-5">
          {[4,7,10,7,4].map((h,i) => (
            <div key={i} className="w-1 bg-white rounded-full"
              style={{height: h+'px', animation: `pulse 0.6s ease-in-out ${i*0.1}s infinite alternate`}} />
          ))}
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{fromL.flag} → {toL.flag}</p>
        </>
      )}
      {isActive && <p className="text-xs text-white/80 font-medium">Toca para parar</p>}
      <style>{`@keyframes pulse{from{opacity:.3}to{opacity:1}}`}</style>
    </button>
  );
}

// ── Shared content component ──────────────────────────────────────────────────
function TranslatorContent({ tripId }) {
  const { trip, activeCity } = useTripContext(tripId);
  const countryRaw = activeCity?.country || trip?.country || '';
  const meta = getCountryMeta(countryRaw);
  const tripLangCode = meta.languageCode?.split('-')[0] || 'en';
  const tripLang = LANGUAGES.find(l => l.code === tripLangCode) ? tripLangCode : 'en';

  const [tab, setTab] = useState('traductor');
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
  const sameLanguage = fromLang === toLang;

  return (
    <>
      {/* Tabs — mismo sistema border-b-2 que Expenses, Utilities, Restaurants, etc. */}
      <div className="flex border-b border-border">
        {[
          ['traductor', '🔄 Traductor'],
          ['frases', `📖 Frases${totalPhrases > 0 ? ` (${totalPhrases})` : ''}`],
        ].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === k ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="py-5 space-y-4">

        {/* ── TAB TRADUCTOR ── */}
        {tab === 'traductor' && (
          <>
            {/* Aviso mismo idioma */}
            {sameLanguage && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-2xl">😄</span>
                <div>
                  <p className="text-sm font-semibold text-amber-800">¡Ya hablas ese idioma!</p>
                  <p className="text-xs text-amber-700 mt-0.5">Parece que origen y destino son el mismo. Cambia uno de los idiomas para traducir.</p>
                </div>
              </div>
            )}
            {/* Selector de idiomas */}
            <div className="bg-white rounded-2xl border border-border p-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">De</p>
                  <select value={fromLang} onChange={e => { setFromLang(e.target.value); setOriginal(''); setTranslated(''); }}
                    className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-secondary outline-none focus:border-primary">
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                  </select>
                </div>
                <button onClick={handleSwap}
                  className="mb-0.5 p-2.5 rounded-xl border border-border bg-secondary hover:bg-accent hover:border-primary/30 transition-colors flex-shrink-0">
                  <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">A</p>
                  <select value={toLang} onChange={e => { setToLang(e.target.value); setOriginal(''); setTranslated(''); }}
                    className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-secondary outline-none focus:border-primary">
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Micrófonos */}
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
              <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">El micrófono no está disponible. Usa Chrome o Safari.</p>
              </div>
            )}

            {/* Error de voz */}
            {voiceError && (
              <div className="bg-white rounded-2xl border border-red-200 p-4 flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{voiceError}</p>
              </div>
            )}

            {/* Resultado */}
            {(original || translated) && (
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                {original && (
                  <div className="p-4 border-b border-border">
                    <p className="text-xs text-muted-foreground mb-1">{fromL.flag} Original</p>
                    <p className="text-sm text-foreground">{original}</p>
                  </div>
                )}
                {translated && (
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{toL.flag} Traducción</p>
                    <p className="text-base font-semibold text-foreground">{translated}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => speakText(translated, toL.bcp)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border bg-secondary transition-colors">
                        <Volume2 className="w-3.5 h-3.5" />Escuchar
                      </button>
                      <button onClick={() => copyToClipboard(translated, 'translation')}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border bg-secondary transition-colors">
                        {copiedId === 'translation'
                          ? <><Check className="w-3.5 h-3.5 text-green-500" />Copiado</>
                          : <><Copy className="w-3.5 h-3.5" />Copiar</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Texto manual */}
            <div className="bg-white rounded-2xl border border-border p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">O escribe</p>
              <div className="relative">
                <textarea
                  placeholder={`Escribe en ${fromL.label}...`}
                  value={inputText}
                  onChange={e => { setInputText(e.target.value); setTranslated(''); setOriginal(''); }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTranslate(); } }}
                  rows={3}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm resize-none outline-none focus:border-primary bg-secondary pr-24"
                />
                <button
                  onClick={handleTranslate}
                  disabled={!inputText.trim() || isTranslating}
                  className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium disabled:opacity-40 hover:bg-primary/90 flex items-center gap-1 transition-colors">
                  {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Traducir
                </button>
              </div>
              {translateError && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{translateError}
                </p>
              )}
            </div>
          </>
        )}

        {/* ── TAB FRASES ── */}
        {tab === 'frases' && (
          <>
            {categories.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border text-center py-16 px-6">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-sm font-semibold text-foreground mb-1">Sin frases disponibles</p>
                <p className="text-xs text-muted-foreground">
                  No tenemos frases para <strong>{countryRaw || 'este destino'}</strong> todavía.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground px-1">
                  {totalPhrases} frases · Español → {meta.languageLabel || 'local'} {meta.flag}
                </p>
                {categories.map(category => (
                  <Collapsible
                    key={category.name}
                    open={expandedCategories[category.name] !== false}
                    onOpenChange={() => setExpandedCategories(p => ({ ...p, [category.name]: !p[category.name] }))}
                  >
                    <div className="bg-white rounded-2xl border border-border overflow-hidden">
                      <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 border-b border-border hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{CAT_ICONS[category.name] || '💬'}</span>
                          <span className="text-sm font-semibold text-foreground">{category.name}</span>
                          <span className="text-xs text-muted-foreground">{category.items?.length}</span>
                        </div>
                        <ChevronDown className={"w-4 h-4 text-muted-foreground transition-transform " + (expandedCategories[category.name] !== false ? 'rotate-180' : '')} />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div>
                          {category.items?.map((phrase, idx) => (
                            <div key={idx}
                              className={`flex items-start justify-between gap-3 px-4 py-3 group hover:bg-secondary/20 transition-colors ${idx > 0 ? 'border-t border-border' : ''}`}>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">{phrase.source}</p>
                                <p className="text-sm font-medium text-foreground mt-0.5">{phrase.target}</p>
                                {phrase.romanization && (
                                  <p className="text-xs text-primary italic mt-0.5">{phrase.romanization}</p>
                                )}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                                <button onClick={() => speakText(phrase.target, meta.languageCode || 'en')}
                                  className="w-7 h-7 rounded-lg border border-border bg-white flex items-center justify-center hover:bg-secondary/50 transition-colors">
                                  <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                                <button onClick={() => copyToClipboard(phrase.target, `${category.name}-${idx}`)}
                                  className="w-7 h-7 rounded-lg border border-border bg-white flex items-center justify-center hover:bg-secondary/50 transition-colors">
                                  {copiedId === `${category.name}-${idx}`
                                    ? <Check className="w-3.5 h-3.5 text-green-500" />
                                    : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ── Export for Utilities page ─────────────────────────────────────────────────
export function TranslatorPanel({ tripId }) {
  return <TranslatorContent tripId={tripId} />;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Translator() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');
  const { trip, activeCity } = useTripContext(tripId);
  const countryRaw = activeCity?.country || trip?.country || '';
  const meta = getCountryMeta(countryRaw);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="bg-background min-h-screen">

      {/* ── HEADER — mismo patrón que Home, Documents, Expenses, Restaurants, Utilities ── */}
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 pt-12 pb-0">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('Home') + '?trip_id=' + tripId}>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" />Inicio
              </button>
            </Link>
            {countryRaw && (
              <span className="text-sm text-muted-foreground">{meta.flag} {countryRaw}</span>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-4">Traductor</h1>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-3xl mx-auto px-5 pb-24">
        <TranslatorContent tripId={tripId} />
      </div>
    </div>
  );
}