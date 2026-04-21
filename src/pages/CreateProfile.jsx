import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import UsernameField from '@/components/account/UsernameField';
import { validateUsername } from '@/lib/username';
import { Globe } from 'lucide-react';

const COUNTRIES = [
  'España', 'México', 'Argentina', 'Colombia', 'Chile', 'Perú', 'Venezuela',
  'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay', 'Guatemala', 'Honduras',
  'El Salvador', 'Nicaragua', 'Costa Rica', 'Panamá', 'Cuba', 'República Dominicana',
  'Puerto Rico', 'Estados Unidos', 'Reino Unido', 'Francia', 'Alemania',
  'Italia', 'Portugal', 'Países Bajos', 'Bélgica', 'Suiza', 'Austria',
  'Japón', 'China', 'Corea del Sur', 'India', 'Australia', 'Canadá', 'Brasil', 'Otro'
];

export default function CreateProfile({ user, onCreated }) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState(user?.full_name || '');
  const [homeCountry, setHomeCountry] = useState('España');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const usernameError = username ? validateUsername(username) : 'required';
  const canSave = !usernameError && displayName.trim() && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const res = await base44.functions.invoke('reserveUsername', {
        username,
        display_name: displayName.trim(),
        home_country: homeCountry,
        default_spot_visibility: 'trip_members',
        default_doc_visibility: 'trip_members',
      });
      if (res.data?.error) {
        toast({ title: res.data.error, variant: 'destructive' });
      } else {
        toast({ title: '¡Perfil creado! 🎉' });
        onCreated(res.data.profile);
      }
    } catch (e) {
      toast({ title: e.message || 'Error al guardar', variant: 'destructive' });
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-border shadow-lg p-8 max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-3">🌸</div>
          <h1 className="text-2xl font-bold text-foreground">Crea tu perfil</h1>
          <p className="text-muted-foreground text-sm mt-1">Elige un username único para empezar</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Username *</label>
            <UsernameField
              value={username}
              onChange={setUsername}
              currentUserId={user?.id}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre visible *</label>
            <Input
              placeholder="Tu nombre o apodo"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              <Globe className="w-4 h-4 inline mr-1" /> País de origen
            </label>
            <select
              value={homeCountry}
              onChange={(e) => setHomeCountry(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full bg-orange-700 hover:bg-orange-800 text-white"
        >
          {saving ? 'Creando perfil…' : 'Crear perfil y entrar →'}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Podrás editar tu perfil en cualquier momento desde Ajustes.
        </p>
      </div>
    </div>
  );
}