import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, LogOut, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import UsernameField from '@/components/account/UsernameField';
import { validateUsername } from '@/lib/username';

const COUNTRIES = [
  'España', 'México', 'Argentina', 'Colombia', 'Chile', 'Perú', 'Venezuela',
  'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay', 'Guatemala', 'Honduras',
  'El Salvador', 'Nicaragua', 'Costa Rica', 'Panamá', 'Cuba', 'República Dominicana',
  'Puerto Rico', 'Estados Unidos', 'Reino Unido', 'Francia', 'Alemania',
  'Italia', 'Portugal', 'Países Bajos', 'Bélgica', 'Suiza', 'Austria',
  'Japón', 'China', 'Corea del Sur', 'India', 'Australia', 'Canadá', 'Brasil', 'Otro'
];

const CURRENCY_OPTIONS = ['EUR', 'USD', 'GBP', 'JPY', 'MXN', 'ARS', 'BRL', 'CLP', 'COP', 'PEN'];

export default function Settings() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: profiles = [] } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: user.id }),
    enabled: !!user?.id,
    onSuccess: (data) => {
      if (data[0] && !form) {
        setForm({ ...data[0] });
      }
    }
  });

  const profile = profiles[0];

  useEffect(() => {
    if (profile && !form) setForm({ ...profile });
  }, [profile]);

  if (!form) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-muted-foreground">Cargando…</div>
      </div>
    );
  }

  const usernameError = form.username ? validateUsername(form.username) : 'required';
  const usernameChanged = form.username !== profile?.username;
  const canSave = !saving && form.display_name?.trim() &&
    (usernameChanged ? !usernameError : true);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await base44.functions.invoke('reserveUsername', {
        username: form.username,
        display_name: form.display_name,
        avatar_url: form.avatar_url,
        bio: form.bio,
        home_country: form.home_country,
        home_currency: form.home_currency,
        default_spot_visibility: form.default_spot_visibility,
        default_doc_visibility: form.default_doc_visibility,
      });
      if (res.data?.error) {
        toast({ title: res.data.error, variant: 'destructive' });
      } else {
        toast({ title: 'Ajustes guardados ✅' });
        queryClient.invalidateQueries({ queryKey: ['myProfile', user?.id] });
      }
    } catch (e) {
      toast({ title: e.message || 'Error al guardar', variant: 'destructive' });
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-orange-50 pb-12">
      <div className="bg-orange-700 px-6 py-6">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to={createPageUrl('Profile')}>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-1" /> Perfil
            </Button>
          </Link>
          <h1 className="text-white font-bold text-lg">Ajustes</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">

        {/* Account info (read-only) */}
        <div className="bg-white rounded-xl border border-border p-4 space-y-3">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Cuenta</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium text-foreground">{user?.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Verificado</span>
            <span>{user?.is_verified ? '✅ Verificado' : '❌ No verificado'}</span>
          </div>
        </div>

        {/* Profile */}
        <div className="bg-white rounded-xl border border-border p-4 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Perfil</h2>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Username</label>
            <UsernameField
              value={form.username}
              onChange={(v) => setForm((p) => ({ ...p, username: v }))}
              currentUserId={user?.id}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre visible *</label>
            <Input value={form.display_name || ''} onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))} />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Bio</label>
            <Textarea rows={2} value={form.bio || ''} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Cuéntanos algo sobre ti…" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Avatar (URL)</label>
            <Input value={form.avatar_url || ''} onChange={(e) => setForm((p) => ({ ...p, avatar_url: e.target.value }))}
              placeholder="https://…" />
            {form.avatar_url && (
              <img src={form.avatar_url} alt="avatar" className="w-12 h-12 rounded-full object-cover mt-2 border border-border" onError={(e) => e.currentTarget.style.display = 'none'} />
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl border border-border p-4 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Preferencias</h2>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">País de origen</label>
            <select value={form.home_country || 'España'} onChange={(e) => setForm((p) => ({ ...p, home_country: e.target.value }))}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Moneda preferida</label>
            <select value={form.home_currency || 'EUR'} onChange={(e) => setForm((p) => ({ ...p, home_currency: e.target.value }))}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              {CURRENCY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Visibilidad por defecto de Spots</label>
            <div className="flex gap-3">
              {[{ v: 'trip_members', l: '👥 Grupo' }, { v: 'personal', l: '🔒 Solo yo' }].map(({ v, l }) => (
                <button key={v} type="button"
                  onClick={() => setForm((p) => ({ ...p, default_spot_visibility: v }))}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${form.default_spot_visibility === v ? 'bg-orange-700 text-white border-orange-700' : 'bg-white text-foreground border-border hover:border-orange-300'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Visibilidad por defecto de Documentos</label>
            <div className="flex gap-3">
              {[{ v: 'trip_members', l: '👥 Grupo' }, { v: 'personal', l: '🔒 Solo yo' }].map(({ v, l }) => (
                <button key={v} type="button"
                  onClick={() => setForm((p) => ({ ...p, default_doc_visibility: v }))}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${form.default_doc_visibility === v ? 'bg-orange-700 text-white border-orange-700' : 'bg-white text-foreground border-border hover:border-orange-300'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={!canSave} className="w-full bg-orange-700 hover:bg-orange-800 text-white">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </Button>

        <Button variant="ghost" onClick={() => base44.auth.logout()}
          className="w-full text-destructive hover:bg-destructive/10">
          <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
        </Button>
      </div>
    </div>
  );
}