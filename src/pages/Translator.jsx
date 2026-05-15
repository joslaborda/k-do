import { createPageUrl } from '@/utils';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowRight, ArrowRightLeft, Copy, Check, Volume2, Mic, MicOff, Camera, X, Languages } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getCountryMeta } from '@/lib/countryConfig';
import { useTripContext } from '@/hooks/useTripContext';
import { getPhrasesForCountry } from '@/lib/phrasesDB';
import { Link } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const CAT_ICONS = {
  'Basicas':'👋','Básicas':'👋','Restaurante':'🍽️','Direcciones':'🗺️',
  'Transporte':'🚆','Emergencias':'🆘','Compras':'🛍️',
  'Hoteles':'🏨','Ocio':'🎭','Social':'🥂',
};

const LANGUAGES = [
  { code:'es', bcp:'es-ES', label:'Español',    flag:'🇪🇸' },
  { code:'en', bcp:'en-US', label:'Inglés',     flag:'🇬🇧' },
  { code:'ja', bcp:'ja-JP', label:'Japonés',    flag:'🇯🇵' },
  { code:'fr', bcp:'fr-FR', label:'Francés',    flag:'🇫🇷' },
  { code:'pt', bcp:'pt-BR', label:'Portugués',  flag:'🇧🇷' },
  { code:'de', bcp:'de-DE', label:'Alemán',     flag:'🇩🇪' },
  { code:'it', bcp:'it-IT', label:'Italiano',   flag:'🇮🇹' },
  { code:'zh', bcp:'zh-CN', label:'Chino',      flag:'🇨🇳' },
  { code:'ko', bcp:'ko-KR', label:'Coreano',    flag:'🇰🇷' },
  { code:'ar', bcp:'ar-SA', label:'Árabe',      flag:'🇸🇦' },
  { code:'th', bcp:'th-TH', label:'Tailandés',  flag:'🇹🇭' },
  { code:'vi', bcp:'vi-VN', label:'Vietnamita', flag:'🇻🇳' },
  { code:'id', bcp:'id-ID', label:'Indonesio',  flag:'🇮🇩' },
  { code:'tr', bcp:'tr-TR', label:'Turco',      flag:'🇹🇷' },
  { code:'ru', bcp:'ru-RU', label:'Ruso',       flag:'🇷🇺' },
  { code:'hi', bcp:'hi-IN', label:'Hindi',      flag:'🇮🇳' },
  { code:'el', bcp:'el-GR', label:'Griego',     flag:'🇬🇷' },
  { code:'nl', bcp:'nl-NL', label:'Neerlandés', flag:'🇳🇱' },
  { code:'pl', bcp:'pl-PL', label:'Polaco',     flag:'🇵🇱' },
  { code:'he', bcp:'he-IL', label:'Hebreo',     flag:'🇮🇱' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
async function translateWithMyMemory(text, fromCode, toCode) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromCode}|${toCode}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error('Network error');
  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error(data.responseDetails || 'Error de traducción');
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

function useCopyText() {
  const [copiedId, setCopiedId] = useState(null);
  const copy = (text, id) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  return { copiedId, copy };
}

// ─────────────────────────────────────────────────────────────────────────────
// Language selector pill
// ─────────────────────────────────────────────────────────────────────────────
function LangPicker({ value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const lang = LANGUAGES.find(l => l.code === value) || LANGUAGES[0];
  return (
    <div className="relative flex-1">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 border border-border rounded-xl bg-white hover:border-primary/40 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-lg">{lang.flag}</span>
          <span className="text-sm font-medium text-foreground">{lang.label}</span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-20 max-h-52 overflow-y-auto">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => { onChange(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-secondary/50 transition-colors text-left ${l.code === value ? 'text-primary font-medium' : 'text-foreground'}`}>
              <span className="text-base">{l.flag}</span>
              <span className="text-sm">{l.label}</span>
              {l.code === value && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-auto text-primary"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Hablada — voice input → translate → speak output
// ─────────────────────────────────────────────────────────────────────────────
function HabladaTab({ fromLang, toLang, onSwap }) {
  const [isListening, setIsListening] = useState(false);
  const [original, setOriginal] = useState('');
  const [translated, setTranslated] = useState('');
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const { copiedId, copy } = useCopyText();

  const fromL = LANGUAGES.find(l => l.code === fromLang) || LANGUAGES[0];
  const toL   = LANGUAGES.find(l => l.code === toLang)   || LANGUAGES[1];
  const voiceSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError('Tu navegador no soporta el micrófono. Usa Chrome o Safari.'); return; }
    setError(''); setOriginal(''); setTranslated('');
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = fromL.bcp;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = e => { setIsListening(false); if (e.error !== 'no-speech') setError('Error de micrófono: ' + e.error); };
    recognition.onresult = async e => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(' ').trim();
      if (!text) return;
      setOriginal(text);
      recognition.stop();
      setTranslating(true);
      try {
        const result = await translateWithMyMemory(text, fromLang, toLang);
        setTranslated(result);
        // Auto-speak the translation
        setTimeout(() => {
          setSpeaking(true);
          speakText(result, toL.bcp);
          setTimeout(() => setSpeaking(false), 3000);
        }, 300);
      } catch { setError('No se pudo traducir. Comprueba tu conexión.'); }
      finally { setTranslating(false); }
    };
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    setIsListening(false);
  };

  const speakTranslation = () => {
    if (!translated) return;
    setSpeaking(true);
    speakText(translated, toL.bcp);
    setTimeout(() => setSpeaking(false), 3000);
  };

  const reset = () => { setOriginal(''); setTranslated(''); setError(''); };

  return (
    <div className="space-y-5">
      {/* Big mic button */}
      <div className="flex flex-col items-center pt-4 pb-2">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-2 transition-all shadow-lg ${
            isListening
              ? 'bg-primary text-white shadow-primary/30'
              : 'bg-white border-2 border-border text-foreground hover:border-primary/40 hover:shadow-md'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-9 h-9 text-white" />
              <div className="flex items-end gap-1 h-4">
                {[4,8,12,8,4].map((h,i) => (
                  <div key={i} className="w-1 bg-white/80 rounded-full"
                    style={{ height:h+'px', animation:`pulse 0.6s ease-in-out ${i*0.1}s infinite alternate` }} />
                ))}
              </div>
            </>
          ) : (
            <>
              <Mic className="w-9 h-9 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Hablar</span>
            </>
          )}
        </button>
        <p className="text-sm text-muted-foreground mt-4">
          {isListening ? `Escuchando en ${fromL.label}...` : `Habla en ${fromL.flag} ${fromL.label}`}
        </p>
        {translating && <p className="text-xs text-muted-foreground mt-1">Traduciendo...</p>}
      </div>

      {/* Result cards */}
      {(original || translated) && (
        <div className="space-y-3">
          {/* Original */}
          {original && (
            <div className="bg-white rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <span>{fromL.flag}</span>{fromL.label}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => speakText(original, fromL.bcp)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => copy(original, 'orig')} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                    {copiedId === 'orig' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-base text-foreground leading-relaxed">{original}</p>
            </div>
          )}

          {/* Translation */}
          {translated && (
            <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-primary uppercase tracking-wide flex items-center gap-1.5">
                  <span>{toL.flag}</span>{toL.label}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={speakTranslation} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${speaking ? 'bg-primary text-white' : 'bg-white text-primary hover:bg-primary/10'}`}>
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => copy(translated, 'trans')} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
                    {copiedId === 'trans' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xl font-medium text-primary leading-relaxed">{translated}</p>
              {speaking && <p className="text-xs text-primary/60 mt-2">🔊 Reproduciendo...</p>}
            </div>
          )}

          <button onClick={reset} className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
            <X className="w-4 h-4" />Limpiar y volver a hablar
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-base flex-shrink-0">⚠️</span>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!voiceSupported && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-sm text-amber-800">El micrófono no está disponible en este navegador. Usa Chrome en Android o Safari en iPhone.</p>
        </div>
      )}

      <style>{`@keyframes pulse{from{opacity:.3}to{opacity:1}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Escrita — text input → translate
// ─────────────────────────────────────────────────────────────────────────────
function EscritaTab({ fromLang, toLang }) {
  const [inputText, setInputText] = useState('');
  const [original, setOriginal] = useState('');
  const [translated, setTranslated] = useState('');
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState('');
  const { copiedId, copy } = useCopyText();

  const fromL = LANGUAGES.find(l => l.code === fromLang) || LANGUAGES[0];
  const toL   = LANGUAGES.find(l => l.code === toLang)   || LANGUAGES[1];

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setTranslating(true); setError(''); setOriginal(''); setTranslated('');
    try {
      const result = await translateWithMyMemory(inputText, fromLang, toLang);
      setOriginal(inputText); setTranslated(result);
    } catch { setError('No se pudo traducir. Comprueba tu conexión.'); }
    finally { setTranslating(false); }
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center px-4 py-2.5 border-b border-border">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">{fromL.flag} {fromL.label}</span>
        </div>
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleTranslate(); }}
          placeholder={`Escribe en ${fromL.label}...`}
          className="w-full text-base text-foreground px-4 py-3 resize-none outline-none min-h-[100px] bg-transparent"
        />
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
          <button onClick={() => { setInputText(''); setOriginal(''); setTranslated(''); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Borrar</button>
          <div className="flex items-center gap-2">
            {inputText && <button onClick={() => speakText(inputText, fromL.bcp)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Volume2 className="w-4 h-4" /></button>}
            <button onClick={handleTranslate} disabled={!inputText.trim() || translating}
              className="px-4 py-1.5 bg-primary text-white text-sm rounded-xl font-medium disabled:opacity-40 transition-opacity">
              {translating ? 'Traduciendo...' : 'Traducir'}
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      {translated && (
        <div className="bg-orange-50 rounded-2xl border border-orange-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-orange-100">
            <span className="text-sm font-medium text-primary flex items-center gap-1.5">{toL.flag} {toL.label}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => speakText(translated, toL.bcp)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"><Volume2 className="w-4 h-4" /></button>
              <button onClick={() => copy(translated, 'esc')} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
                {copiedId === 'esc' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="px-4 py-3">
            <p className="text-xl font-medium text-primary leading-relaxed">{translated}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Imagen — "Próximamente"
// ─────────────────────────────────────────────────────────────────────────────
function ImagenTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-6">
        <Camera className="w-10 h-10 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium text-foreground mb-2">Traducción por imagen</p>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
        Próximamente podrás apuntar la cámara a un menú, una señal o cualquier texto y traducirlo al instante con IA.
      </p>
      <div className="mt-6 bg-orange-50 border border-orange-100 rounded-xl px-5 py-3.5 max-w-xs">
        <p className="text-xs text-primary font-medium">🔮 Coming soon</p>
        <p className="text-xs text-muted-foreground mt-0.5">Esta función requiere integración con IA de visión. La tenemos en el roadmap.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Phrasebook section (existing, preserved)
// ─────────────────────────────────────────────────────────────────────────────
function PhrasebookSection({ countryRaw, meta }) {
  const { copiedId, copy } = useCopyText();
  const [expandedCategories, setExpandedCategories] = useState({ 'Básicas': true, 'Restaurante': true });

  const phrasePack = countryRaw ? getPhrasesForCountry(countryRaw) : null;
  const categories = phrasePack?.categories || [];
  const totalPhrases = categories.reduce((n, c) => n + (c.items?.length || 0), 0);

  const toggleCat = (cat) => setExpandedCategories(p => ({ ...p, [cat]: !p[cat] }));

  if (!phrasePack) return (
    <div className="text-center py-10">
      <p className="text-4xl mb-4">📖</p>
      <p className="text-sm font-medium text-foreground mb-1">Sin frases disponibles</p>
      <p className="text-xs text-muted-foreground">No tenemos frases para <strong>{countryRaw||'este destino'}</strong> todavía.</p>
    </div>
  );

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-4">{totalPhrases} frases · Español → {meta.languageLabel||'local'} {meta.flag}</p>
      <div className="space-y-3">
        {categories.map(cat => (
          <Collapsible key={cat.name} open={!!expandedCategories[cat.name]} onOpenChange={() => toggleCat(cat.name)}>
            <CollapsibleTrigger className="w-full flex items-center justify-between bg-white border border-border rounded-xl px-4 py-3 hover:bg-secondary/30 transition-colors">
              <span className="flex items-center gap-2.5 font-medium text-sm text-foreground">
                <span>{CAT_ICONS[cat.name]||'🗣️'}</span>{cat.name}
                <span className="text-xs text-muted-foreground font-normal">({cat.items?.length||0})</span>
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-muted-foreground transition-transform ${expandedCategories[cat.name]?'rotate-180':''}`}><polyline points="6 9 12 15 18 9"/></svg>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-1 bg-white border border-border rounded-xl overflow-hidden">
                {(cat.items||[]).map((phrase, idx) => (
                  <div key={idx} className="flex items-start gap-3 px-4 py-3.5 border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground mb-0.5">{phrase.source}</p>
                      <p className="text-sm font-medium text-foreground">{phrase.target}</p>
                      {phrase.pronunciation && <p className="text-xs text-muted-foreground/70 italic mt-0.5">{phrase.pronunciation}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => speakText(phrase.target, meta.languageCode||'en')}
                        className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => copy(phrase.target, `phrase-${idx}`)}
                        className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                        {copiedId === `phrase-${idx}` ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Same-language banner — shown when user's home language = destination language
// ─────────────────────────────────────────────────────────────────────────────
function SameLanguageBanner({ destLang, destLabel, destFlag, onDismiss }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center mb-6">
      <div className="text-4xl mb-3">🤝</div>
      <p className="text-base font-medium text-foreground mb-1">¡Enhorabuena, habláis el mismo idioma!</p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        En {destFlag} {destLabel} hablan <strong>{destLabel}</strong>, igual que tú. No necesitarás traductor para el día a día.
      </p>
      <button onClick={onDismiss}
        className="text-sm text-green-700 font-medium border border-green-300 rounded-xl px-4 py-2 hover:bg-green-100 transition-colors">
        Abrir el traductor igualmente →
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main content
// ─────────────────────────────────────────────────────────────────────────────
function TranslatorContent({ tripId }) {
  const { user } = useAuth();
  const { trip, activeCity } = useTripContext(tripId);
  const countryRaw = activeCity?.country || trip?.country || '';
  const meta = getCountryMeta(countryRaw);
  const tripLangCode = meta.languageCode?.split('-')[0] || 'en';
  const tripLang = LANGUAGES.find(l => l.code === tripLangCode) ? tripLangCode : 'en';

  // Fetch user profile to detect home language
  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: async () => { const r = await base44.entities.UserProfile.filter({ user_id: user.id }); return r[0] || null; },
    enabled: !!user?.id, staleTime: 60000,
  });

  // User's home language code — default to 'es' if not set
  const userHomeLangCode = useMemo(() => {
    if (!myProfile?.home_country) return 'es';
    const homeMeta = getCountryMeta(myProfile.home_country);
    return homeMeta.languageCode?.split('-')[0] || 'es';
  }, [myProfile]);

  const [mainTab, setMainTab] = useState('hablada'); // hablada | escrita | imagen | frases
  const [fromLang, setFromLang] = useState('es');
  const [toLang, setToLang] = useState(tripLang);
  const [sameLanguageDismissed, setSameLanguageDismissed] = useState(false);

  useEffect(() => { setToLang(tripLang); }, [tripLang]);
  useEffect(() => { setFromLang(userHomeLangCode); }, [userHomeLangCode]);

  const handleSwap = () => { setFromLang(toLang); setToLang(fromLang); };

  // Same language detection: user's home lang === destination lang
  const isSameLanguage = userHomeLangCode === tripLang && !sameLanguageDismissed;
  const toL = LANGUAGES.find(l => l.code === toLang) || LANGUAGES[1];

  const phrasePack = countryRaw ? getPhrasesForCountry(countryRaw) : null;
  const totalPhrases = (phrasePack?.categories || []).reduce((n, c) => n + (c.items?.length || 0), 0);

  return (
    <div>
      {/* Same language banner */}
      {isSameLanguage && countryRaw && (
        <SameLanguageBanner
          destLang={tripLang}
          destLabel={meta.languageLabel || toL.label}
          destFlag={meta.flag || toL.flag}
          onDismiss={() => setSameLanguageDismissed(true)}
        />
      )}

      {/* Main tabs */}
      <div className="flex border-b border-border mb-5">
        {[
          ['hablada', '🎙️', 'Hablada'],
          ['escrita', '✍️', 'Escrita'],
          ['imagen', '📷', 'Imagen'],
          ['frases', '📖', `Frases${totalPhrases > 0 ? ` (${totalPhrases})` : ''}`],
        ].map(([k, emoji, label]) => (
          <button key={k} onClick={() => setMainTab(k)}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors flex flex-col items-center gap-0.5 ${
              mainTab === k ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}>
            <span className="text-base">{emoji}</span>
            <span className="text-xs leading-tight">{label.split('(')[0].trim()}</span>
          </button>
        ))}
      </div>

      {/* Language selector — shown for hablada, escrita, imagen */}
      {mainTab !== 'frases' && mainTab !== 'imagen' && (
        <div className="flex items-center gap-2 mb-5">
          <LangPicker value={fromLang} onChange={setFromLang} label="Desde" />
          <button onClick={handleSwap}
            className="w-10 h-10 rounded-xl border border-border bg-white flex items-center justify-center hover:border-primary/40 hover:bg-orange-50 transition-colors flex-shrink-0">
            <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <LangPicker value={toLang} onChange={setToLang} label="A" />
        </div>
      )}

      {/* Tab content */}
      {mainTab === 'hablada' && <HabladaTab fromLang={fromLang} toLang={toLang} onSwap={handleSwap} />}
      {mainTab === 'escrita' && <EscritaTab fromLang={fromLang} toLang={toLang} />}
      {mainTab === 'imagen' && <ImagenTab />}
      {mainTab === 'frases' && <PhrasebookSection countryRaw={countryRaw} meta={meta} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export for Utilities panel (embedded use)
// ─────────────────────────────────────────────────────────────────────────────
export function TranslatorPanel({ tripId }) {
  return <TranslatorContent tripId={tripId} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Translator() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');
  const { trip, activeCity } = useTripContext(tripId);
  const countryRaw = activeCity?.country || trip?.country || '';
  const meta = getCountryMeta(countryRaw);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Home') + '?trip_id=' + tripId}>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" />Inicio
              </button>
            </Link>
            {countryRaw && (
              <span className="text-sm text-muted-foreground">{meta.flag} {countryRaw}</span>
            )}
          </div>
          <h1 className="text-2xl font-medium text-foreground mt-4">Traductor</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-5 pb-24">
        <TranslatorContent tripId={tripId} />
      </div>
    </div>
  );
}
