import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { normalizeUsername, validateUsername, checkUsernameAvailability } from '@/lib/username';

export default function CreateProfileModal({ user, open }) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState(user?.full_name || '');
  const [homeCountry, setHomeCountry] = useState('España');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null); // null | true | false
  const [usernameError, setUsernameError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  // Debounce availability check
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

  const handleUsernameChange = (val) => {
    setUsername(normalizeUsername(val));
    setAvailable(null);
  };

  const handleSave = async () => {
    const err = validateUsername(username);
    if (err) { setError(err); return; }
    if (!available) { setError('Username no disponible'); return; }
    if (!displayName.trim()) { setError('El nombre es obligatorio'); return; }
    setSaving(true);
    setError('');
    // Re-check before creating (avoid race condition)
    const ok = await checkUsernameAvailability(username, user?.id);
    if (!ok) { setError('Username ya en uso, elige otro'); setSaving(false); setAvailable(false); return; }
    await base44.entities.UserProfile.create({
      user_id: user.id,
      username,
      username_normalized: username,
      display_name: displayName.trim(),
      home_country: homeCountry,
    });
    queryClient.invalidateQueries({ queryKey: ['myProfile', user.id] });
    setSaving(false);
  };

  const canSave = !validateUsername(username) && available === true && displayName.trim() && !saving;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-white border-border max-w-md" onInteractOutside={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Crea tu perfil ✈️</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">Elige tu @username para unirte a Kōdo.</p>

        <div className="space-y-4 pt-2">
          {/* Username */}
          <div>
            <label className="text-sm font-semibold block mb-1">Username *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
              <Input
                className="pl-7 font-mono"
                placeholder="tunombre"
                value={username}
                onChange={e => handleUsernameChange(e.target.value)}
                maxLength={30}
                autoCapitalize="none"
                autoCorrect="off"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {checking && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                {!checking && available === true && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {!checking && available === false && <XCircle className="w-4 h-4 text-destructive" />}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Solo letras, números y _ · 3-30 caracteres · empieza por letra</p>
            {usernameError && <p className="text-xs text-destructive mt-0.5">{usernameError}</p>}
            {!checking && !usernameError && available === false && <p className="text-xs text-destructive mt-0.5">Este username ya está en uso</p>}
            {!checking && !usernameError && available === true && <p className="text-xs text-green-600 mt-0.5">¡Disponible!</p>}
          </div>

          {/* Display name */}
          <div>
            <label className="text-sm font-semibold block mb-1">Nombre visible *</label>
            <Input placeholder="Tu nombre" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          </div>

          {/* Home country */}
          <div>
            <label className="text-sm font-semibold block mb-1">País de origen</label>
            <Input placeholder="España" value={homeCountry} onChange={e => setHomeCountry(e.target.value)} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            className="w-full bg-orange-700 hover:bg-orange-800 text-white font-semibold"
            disabled={!canSave}
            onClick={handleSave}
          >
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : 'Crear perfil'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}