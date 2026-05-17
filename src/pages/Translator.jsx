import { createPageUrl } from '@/utils';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowRightLeft, Copy, Check, Volume2, Loader2, Mic, MicOff, AlertCircle, Camera } from 'lucide-react';
import { getCountryMeta } from '@/lib/countryConfig';
import { useTripContext } from '@/hooks/useTripContext';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';

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
  { code:'nl', bcp:'nl-NL', label:'Neerlandés', flag:'🇳🇱' },
  { code:'pl', bcp:'pl-PL', label:'Polaco',     flag:'🇵🇱' },
  { code:'hi', bcp:'hi-IN', label:'Hindi',      flag:'🇮🇳' },
  { code:'el', bcp:'el-GR', label:'Griego',     flag:'🇬🇷' },
  { code:'he', bcp:'he-IL', label:'Hebreo',     flag:'🇮🇱' },
  { code:'cs', bcp:'cs-CZ', label:'Checo',      flag:'🇨🇿' },
  { code:'hu', bcp:'hu-HU', label:'Húngaro',    flag:'🇭🇺' },
  { code:'sv', bcp:'sv-SE', label:'Sueco',      flag:'🇸🇪' },
  { code:'nb', bcp:'nb-NO', label:'Noruego',    flag:'🇳🇴' },
  { code:'da', bcp:'da-DK', label:'Danés',      flag:'🇩🇰' },
  { code:'fi', bcp:'fi-FI', label:'Finlandés',  flag:'🇫🇮' },
  { code:'ms', bcp:'ms-MY', label:'Malayo',     flag:'🇲🇾' },
  { code:'tl', bcp:'tl-PH', label:'Filipino',   flag:'🇵🇭' },
];

async function translateText(text, fromCode, toCode) {
  if (fromCode === toCode) return text;
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
  utt.lang = bcpLang; utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
}

function LangSelect({ value, onChange, label }) {
  return (
    <div className="flex-1">
      {label && <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{label}</p>}
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-11 border border-border rounded-xl px-3 text-sm bg-white outline-none focus:border-primary appearance-none">
        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
      </select>
    </div>
  );
}

function VoiceButton({ fromLang, toLang, isActive, onActivate, onResult, onError }) {
  const fromL = LANGUAGES.find(l => l.code === fromLang) || LANGUAGES[0];
  const toL   = LANGUAGES.find(l => l.code === toLang)   || LANGUAGES[1];
  const recognitionRef = useRef(null);

  const handlePress = () => {
    if (isActive && recognitionRef.current) {
      recognitionRef.current.stop(); recognitionRef.current = null; onActivate(false); return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { onError('Tu navegador no soporta el micrófono. Usa Chrome o Safari.'); return; }
    onError('');
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = fromL.bcp; recognition.continuous = false; recognition.interimResults = false;
    recognition.onstart = () => onActivate(true);
    recognition.onend = () => { recognitionRef.current = null; onActivate(false); };
    recognition.onerror = e => {
      recognitionRef.current = null; onActivate(false);
      if (e.error === 'not-allowed') onError('Permiso de micrófono denegado.');
      else if (e.error === 'no-speech') onError('No se detectó voz. Inténtalo de nuevo.');
      else if (e.error === 'aborted') return;
      else onError('Error al grabar. Inténtalo de nuevo.');
    };
    recognition.onresult = async e => {
      const text = e.results[0][0].transcript;
      try {
        if (fromLang === toLang) { onResult(text, text); }
        else {
          const translation = await translateText(text, fromL.code, toL.code);
          onResult(text, translation);
          if (translation) speakText(translation, toL.bcp);
        }
      } catch { onError('No se pudo traducir. Comprueba tu conexión.'); }
    };
    try { recognition.start(); }
    catch { recognitionRef.current = null; onActivate(false); onError('No se pudo iniciar el micrófono.'); }
  };

  return (
    <div onClick={handlePress}
      className={`rounded-2xl border-2 p-6 flex flex-col items-center gap-3 cursor-pointer transition-all select-none ${
        isActive ? 'bg-primary border-primary' : 'bg-white border-border hover:border-primary/40'
      }`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-white/20' : 'bg-orange-50'}`}>
        {isActive ? <MicOff className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-primary" />}
      </div>
      {isActive ? (
        <>
          <div className="flex items-end gap-1 h-5">
            {[4,7,10,7,4].map((h,i) => (
              <div key={i} className="w-1 bg-white rounded-full" style={{height:h+'px',animation:`pulse 0.6s ease-in-out ${i*0.1}s infinite alternate`}}/>
            ))}
          </div>
          <p className="text-xs text-white/80 font-medium">Toca para parar</p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground text-center">Pulsa y habla</p>
          <p className="text-xs text-muted-foreground">{fromL.flag} → {toL.flag}</p>
        </>
      )}
      <style>{`@keyframes pulse{from{opacity:.3}to{opacity:1}}`}</style>
    </div>
  );
}

function ResultCard({ original, translated, fromLang, toLang, onClear }) {
  const [copiedId, setCopiedId] = useState(null);
  const fromL = LANGUAGES.find(l => l.code === fromLang) || LANGUAGES[0];
  const toL   = LANGUAGES.find(l => l.code === toLang)   || LANGUAGES[1];
  const copy = (text, id) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(()=>setCopiedId(null),2000); };

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      {original && (
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs text-muted-foreground mb-1">{fromL.flag} Original</p>
          <p className="text-sm text-foreground">{original}</p>
        </div>
      )}
      {translated && (
        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">{toL.flag} Traducción</p>
          <p className="text-base font-medium text-foreground">{translated}</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => speakText(translated, toL.bcp)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border bg-secondary transition-colors">
              <Volume2 className="w-3.5 h-3.5" />Escuchar
            </button>
            <button onClick={() => copy(translated, 'trans')}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border bg-secondary transition-colors">
              {copiedId === 'trans' ? <><Check className="w-3.5 h-3.5 text-green-500" />Copiado</> : <><Copy className="w-3.5 h-3.5" />Copiar</>}
            </button>
            <button onClick={onClear}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border bg-secondary transition-colors ml-auto">
              <ArrowRightLeft className="w-3.5 h-3.5" />Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main content (shared between standalone + panel) ──────────────────────────
function TranslatorContent({ tripId, inPage = false }) {
  const { user } = useAuth();
  const { trip, activeCity } = useTripContext(tripId);
  const countryRaw = activeCity?.country || trip?.country || '';
  const meta = getCountryMeta(countryRaw);
  const tripLangCode = meta.languageCode?.split('-')[0] || 'en';
  const tripLang = LANGUAGES.find(l => l.code === tripLangCode) ? tripLangCode : 'en';

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: async () => { const r = await base44.entities.UserProfile.filter({ user_id: user.id }); return r[0] || null; },
    enabled: !!user?.id, staleTime: 60000,
  });
  const homeCountry = myProfile?.home_country || 'España';
  const homeMeta = getCountryMeta(homeCountry);
  const homeLangCode = homeMeta.languageCode?.split('-')[0] || 'es';
  const userLang = LANGUAGES.find(l => l.code === homeLangCode) ? homeLangCode : 'es';

  const [tab, setTab] = useState('hablada');
  const [fromLang, setFromLang] = useState(userLang);
  const [toLang, setToLang] = useState(tripLang);
  const [sameLanguageDismissed, setSameLanguageDismissed] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceResult, setVoiceResult] = useState({ original:'', translated:'' });
  const [voiceError, setVoiceError] = useState('');
  const [inputText, setInputText] = useState('');
  const [writeResult, setWriteResult] = useState({ original:'', translated:'' });
  const [isTranslating, setIsTranslating] = useState(false);
  const [writeError, setWriteError] = useState('');

  useEffect(() => { setToLang(tripLang); }, [tripLang]);
  useEffect(() => { setFromLang(userLang); }, [userLang]);

  const voiceSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const isSameLanguage = homeLangCode === tripLangCode;
  const showSameLanguageBanner = isSameLanguage && !sameLanguageDismissed;

  const handleSwap = () => {
    setFromLang(toLang); setToLang(fromLang);
    setVoiceResult({ original:'', translated:'' });
    setWriteResult({ original:'', translated:'' });
    setInputText('');
  };

  const handleWriteTranslate = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true); setWriteError(''); setWriteResult({ original:'', translated:'' });
    try {
      if (fromLang === toLang) { setWriteResult({ original: inputText, translated: inputText }); }
      else {
        const result = await translateText(inputText, fromLang, toLang);
        setWriteResult({ original: inputText, translated: result });
      }
    } catch { setWriteError('No se pudo traducir. Comprueba tu conexión.'); }
    finally { setIsTranslating(false); }
  };

  const fromL = LANGUAGES.find(l => l.code === fromLang) || LANGUAGES[0];
  const toL   = LANGUAGES.find(l => l.code === toLang)   || LANGUAGES[1];

  const LangRow = () => (
    <div className="flex items-end gap-2 bg-white rounded-2xl border border-border p-4">
      <LangSelect value={fromLang} onChange={v => { setFromLang(v); setVoiceResult({original:'',translated:''}); setWriteResult({original:'',translated:''}); }} label="De" />
      <button onClick={handleSwap} className="mb-0.5 p-2.5 rounded-xl border border-border bg-secondary hover:bg-orange-50 hover:border-primary/30 transition-colors flex-shrink-0">
        <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
      </button>
      <LangSelect value={toLang} onChange={v => { setToLang(v); setVoiceResult({original:'',translated:''}); setWriteResult({original:'',translated:''}); }} label="A" />
    </div>
  );

  return (
    <>
      {/* Same-language banner — no "abrir igualmente" button since translator is already open */}
      {showSameLanguageBanner && (
        <div className="mt-5 bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🤝</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">¡Enhorabuena, habláis el mismo idioma!</p>
              <p className="text-sm text-green-700 mt-1 leading-relaxed">
                En {meta.flag} <strong>{countryRaw}</strong> hablan <strong>{meta.languageLabel}</strong>, igual que tú.
                No necesitarás traductor para el día a día.
              </p>
            </div>
            <button onClick={() => setSameLanguageDismissed(true)}
              className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 hover:bg-green-200 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Tabs — 3 only, no Frases */}
      <div className={`flex border-b border-border ${inPage ? (showSameLanguageBanner ? 'mt-4' : '') : (showSameLanguageBanner ? 'mt-4' : 'mt-5')}`}>
        {[
          ['hablada', '🎙️', 'Hablada'],
          ['escrita',  '✍️', 'Escrita'],
          ['imagen',   '📷', 'Imagen'],
        ].map(([k, emoji, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 flex flex-col items-center py-2 pb-2.5 gap-0.5 border-b-2 transition-colors ${
              tab === k ? 'border-primary' : 'border-transparent'
            }`}>
            <span className="text-base leading-none">{emoji}</span>
            <span className={`text-xs font-medium leading-none ${tab === k ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
          </button>
        ))}
      </div>

      <div className="py-5 space-y-4">

        {/* ── HABLADA ───────────────────────────────────────────────────── */}
        {tab === 'hablada' && (
          <>
            <LangRow />
            {voiceSupported ? (
              <VoiceButton fromLang={fromLang} toLang={toLang} isActive={voiceActive}
                onActivate={v => setVoiceActive(v)}
                onResult={(original, translated) => { setVoiceError(''); setVoiceResult({ original, translated }); }}
                onError={setVoiceError} />
            ) : (
              <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">El micrófono no está disponible. Usa Chrome o Safari.</p>
              </div>
            )}
            {voiceError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{voiceError}</p>
              </div>
            )}
            {(voiceResult.original || voiceResult.translated) && (
              <ResultCard original={voiceResult.original} translated={voiceResult.translated}
                fromLang={fromLang} toLang={toLang}
                onClear={() => setVoiceResult({ original:'', translated:'' })} />
            )}
          </>
        )}

        {/* ── ESCRITA ───────────────────────────────────────────────────── */}
        {tab === 'escrita' && (
          <>
            <LangRow />
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="px-4 pt-3 pb-1">
                <p className="text-xs text-muted-foreground mb-1.5">{fromL.flag} {fromL.label}</p>
                <textarea
                  placeholder={`Escribe en ${fromL.label}...`}
                  value={inputText}
                  onChange={e => { setInputText(e.target.value); setWriteResult({ original:'', translated:'' }); setWriteError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleWriteTranslate(); } }}
                  rows={4}
                  className="w-full text-sm resize-none outline-none text-foreground bg-transparent"
                />
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-secondary/30">
                {inputText
                  ? <button onClick={() => { setInputText(''); setWriteResult({original:'',translated:''}); }} className="text-xs text-muted-foreground hover:text-foreground">Borrar</button>
                  : <span />}
                <div className="flex items-center gap-2">
                  <button onClick={() => speakText(inputText, fromL.bcp)} disabled={!inputText.trim()}
                    className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={handleWriteTranslate} disabled={!inputText.trim() || isTranslating}
                    className="h-8 px-4 rounded-full bg-primary text-white text-xs font-medium disabled:opacity-40 hover:bg-primary/90 flex items-center gap-1.5 transition-colors">
                    {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    Traducir
                  </button>
                </div>
              </div>
            </div>
            {writeError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{writeError}</p>
              </div>
            )}
            {(writeResult.original || writeResult.translated) && (
              <ResultCard original={writeResult.original} translated={writeResult.translated}
                fromLang={fromLang} toLang={toLang}
                onClear={() => setWriteResult({ original:'', translated:'' })} />
            )}
          </>
        )}

        {/* ── IMAGEN ────────────────────────────────────────────────────── */}
        {tab === 'imagen' && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-5">
              <Camera className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-base font-medium text-foreground mb-2">Traducción de imagen</p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-5">
              Apunta la cámara a un menú, cartel o texto y tradúcelo al instante.
            </p>
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-primary text-xs font-medium px-4 py-2 rounded-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Próximamente
            </div>
            <p className="text-xs text-muted-foreground mt-3 max-w-xs">
              Esta función requiere visión por IA. La añadiremos en una próxima actualización.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// Export for Utilities embed
export function TranslatorPanel({ tripId }) {
  return <TranslatorContent tripId={tripId} />;
}

// Standalone page
export default function Translator() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');
  const { trip, activeCity } = useTripContext(tripId);
  const countryRaw = activeCity?.country || trip?.country || '';
  const meta = getCountryMeta(countryRaw);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="bg-background min-h-screen">
      {/* Header — same pattern as Documents */}
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 pt-12 pb-0">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('Home') + '?trip_id=' + tripId}>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Inicio
              </button>
            </Link>
            {countryRaw && (
              <span className="text-sm text-muted-foreground">{meta.flag} {countryRaw}</span>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-4">Traductor</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-5 pb-24">
        <TranslatorContent tripId={tripId} inPage={true} />
      </div>
    </div>
  );
}
