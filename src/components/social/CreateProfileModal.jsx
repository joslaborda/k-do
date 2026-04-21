import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const USERNAME_REGEX = /^[a-z][a-z0-9_]{2,29}$/;

export default function CreateProfileModal({ user, open }) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState(user?.full_name || '');
  const [homeCountry, setHomeCountry] = useState('España');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null); // null | true | false
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const handleUsernameChange = async (val) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(clean);
    setAvailable(null);
    if (!USERNAME_REGEX.test(clean)) return;
    setChecking(true);
    const existing = await base44.entities.UserProfile.filter({ username_normalized: clean });
    setAvailable(existing.length === 0);
    setChecking(false);
  };

  const handleSave = async () => {
    if (!USERNAME_REGEX.test(username)) { setError('Username inválido'); return; }
    if (!available) { setError('Username no disponible'); return; }
    if (!displayName.trim()) { setError('Nombre es obligatorio'); return; }
    setSaving(true);
    // Double-check atomicity: filter again right before create
    const existing = await base44.entities.UserProfile.filter({ username_normalized: username });
    if (existing.length > 0) { setError('Username ya en uso, elige otro'); setSaving(false); setAvailable(false); return; }
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

  const usernameValid = USERNAME_REGEX.test(username);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-white border-border max-w-md" onInteractOutside={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Crea tu perfil ✈️</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">Elige tu @username para unirte a Kōdo Social.</p>

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
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {checking && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                {!checking && available === true && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {!checking && available === false && <XCircle className="w-4 h-4 text-destructive" />}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Solo letras minúsculas, números y _ · 3-30 caracteres · empieza por letra</p>
            {!checking && available === false && <p className="text-xs text-destructive mt-0.5">Este username ya está en uso</p>}
            {!checking && available === true && <p className="text-xs text-green-600 mt-0.5">¡Disponible!</p>}
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
            disabled={!usernameValid || available !== true || !displayName.trim() || saving}
            onClick={handleSave}
          >
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : 'Crear perfil'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}