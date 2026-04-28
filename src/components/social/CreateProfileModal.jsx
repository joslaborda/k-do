import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, XCircle, Globe, Info } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { normalizeUsername, validateUsername, checkUsernameAvailability } from '@/lib/username';

// Países hispanohablantes primero, luego resto del mundo
const COUNTRIES = [
  // Hispanohablantes
  { name: 'España', flag: '🇪🇸', currency: 'EUR' },
  { name: 'México', flag: '🇲🇽', currency: 'MXN' },
  { name: 'Colombia', flag: '🇨🇴', currency: 'COP' },
  { name: 'Argentina', flag: '🇦🇷', currency: 'ARS' },
  { name: 'Perú', flag: '🇵🇪', currency: 'PEN' },
  { name: 'Venezuela', flag: '🇻🇪', currency: 'VES' },
  { name: 'Chile', flag: '🇨🇱', currency: 'CLP' },
  { name: 'Ecuador', flag: '🇪🇨', currency: 'USD' },
  { name: 'Guatemala', flag: '🇬🇹', currency: 'GTQ' },
  { name: 'Cuba', flag: '🇨🇺', currency: 'CUP' },
  { name: 'Bolivia', flag: '🇧🇴', currency: 'BOB' },
  { name: 'República Dominicana', flag: '🇩🇴', currency: 'DOP' },
  { name: 'Honduras', flag: '🇭🇳', currency: 'HNL' },
  { name: 'Paraguay', flag: '🇵🇾', currency: 'PYG' },
  { name: 'El Salvador', flag: '🇸🇻', currency: 'USD' },
  { name: 'Nicaragua', flag: '🇳🇮', currency: 'NIO' },
  { name: 'Costa Rica', flag: '🇨🇷', currency: 'CRC' },
  { name: 'Panamá', flag: '🇵🇦', currency: 'USD' },
  { name: 'Uruguay', flag: '🇺🇾', currency: 'UYU' },
  { name: 'Puerto Rico', flag: '🇵🇷', currency: 'USD' },
  { name: 'Guinea Ecuatorial', flag: '🇬🇶', currency: 'XAF' },
  // Resto del mundo
  { name: 'Estados Unidos', flag: '🇺🇸', currency: 'USD' },
  { name: 'Brasil', flag: '🇧🇷', currency: 'BRL' },
  { name: 'Reino Unido', flag: '🇬🇧', currency: 'GBP' },
  { name: 'Francia', flag: '🇫🇷', currency: 'EUR' },
  { name: 'Alemania', flag: '🇩🇪', currency: 'EUR' },
  { name: 'Italia', flag: '🇮🇹', currency: 'EUR' },
  { name: 'Portugal', flag: '🇵🇹', currency: 'EUR' },
  { name: 'Japón', flag: '🇯🇵', currency: 'JPY' },
  { name: 'China', flag: '🇨🇳', currency: 'CNY' },
  { name: 'Otro', flag: '🌍', currency: 'USD' },
];

const STEPS = ['perfil', 'origen', 'listo'];

export default function CreateProfileModal({ user, open }) {
  const [step, setStep] = useState('perfil');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState(user?.full_name || '');
  const [homeCountry, setHomeCountry] = useState('España');
  const [homeCurrency, setHomeCurrency] = useState('EUR');
  const [nationality, setNationality] = useState('España');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [usernameError, setUsernameError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!username) { setAvailable(null); setUsernameError(''); return; }
    const err = validateUsername(username);
    if (err) { setUsernameError(err); setAvailable(null); return; }
    setUsernameError('');
    setChecking(true);
    const timer = setTimeout(async () => {
      const ok = await checkUsernameAvailability(username, user?.id);
      setAvailable(ok);
      setChecking(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [username, user?.id]);

  const handleCountrySelect = (country) => {
    setHomeCountry(country.name);
    setNationality(country.name);
    setHomeCurrency(country.currency);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const ok = await checkUsernameAvailability(username, user?.id);
      if (!ok) { setError('Username ya en uso, elige otro'); setSaving(false); setAvailable(false); return; }
      await base44.entities.UserProfile.create({
        user_id: user.id,
        username,
        username_normalized: username,
        display_name: displayName.trim(),
        home_country: homeCountry,
        home_currency: homeCurrency,
        nationality,
      });
      queryClient.invalidateQueries({ queryKey: ['myProfile', user.id] });
    } catch (e) {
      setError('Error al crear el perfil. Inténtalo de nuevo.');
      setSaving(false);
    }
  };

  const canGoNext = !validateUsername(username) && available === true && displayName.trim();

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-white border-border max-w-md" onInteractOutside={e => e.preventDefault()}>

        {/* Step indicator */}
        <div className="flex gap-2 mb-2">
          {STEPS.map((s, i) => (
            <div key={s} className={"h-1 flex-1 rounded-full transition-all " +
              (STEPS.indexOf(step) >= i ? 'bg-orange-700' : 'bg-border')} />
          ))}
        </div>

        {/* STEP 1: Perfil básico */}
        {step === 'perfil' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Bienvenido a Kōdo ✈️</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground -mt-2">Crea tu perfil para empezar a viajar.</p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-semibold block mb-1">Nombre visible *</label>
                <Input placeholder="Tu nombre" value={displayName} onChange={e => setDisplayName(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1">Username *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <Input className="pl-7 font-mono" placeholder="tunombre"
                    value={username} onChange={e => { setUsername(normalizeUsername(e.target.value)); setAvailable(null); }}
                    maxLength={30} autoCapitalize="none" autoCorrect="off" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checking && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                    {!checking && available === true && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {!checking && available === false && <XCircle className="w-4 h-4 text-destructive" />}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Solo letras, números y _ · 3-30 caracteres</p>
                {usernameError && <p className="text-xs text-destructive mt-0.5">{usernameError}</p>}
                {!checking && !usernameError && available === false && <p className="text-xs text-destructive mt-0.5">Username ya en uso</p>}
                {!checking && !usernameError && available === true && <p className="text-xs text-green-600 mt-0.5">¡Disponible!</p>}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button className="w-full bg-orange-700 hover:bg-orange-800 text-white font-semibold"
                disabled={!canGoNext} onClick={() => setStep('origen')}>
                Siguiente →
              </Button>
            </div>
          </>
        )}

        {/* STEP 2: País de origen */}
        {step === 'origen' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-black">¿De dónde eres? 🌍</DialogTitle>
            </DialogHeader>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex gap-2 -mt-1">
              <Info className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-800 leading-relaxed">
                Tu país de origen nos permite mostrarte los requisitos de visado correctos, tu moneda base para gastos y alertas de emergencia adaptadas. Puedes omitirlo pero algunas funciones no estarán disponibles.
              </p>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {COUNTRIES.map(country => (
                <button key={country.name} onClick={() => handleCountrySelect(country)}
                  className={"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left " +
                    (homeCountry === country.name
                      ? 'bg-orange-50 border-orange-400 text-orange-900'
                      : 'bg-white border-border hover:border-orange-200 text-foreground')}>
                  <span className="text-xl flex-shrink-0">{country.flag}</span>
                  <span className="flex-1 font-medium text-sm">{country.name}</span>
                  <span className="text-xs text-muted-foreground">{country.currency}</span>
                  {homeCountry === country.name && <CheckCircle2 className="w-4 h-4 text-orange-600 flex-shrink-0" />}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setStep('perfil')}>← Volver</Button>
              <Button className="flex-1 bg-orange-700 hover:bg-orange-800 text-white font-semibold"
                onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : 'Crear perfil'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
