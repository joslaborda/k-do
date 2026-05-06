import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Camera, Loader2, Globe, MapPin, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const COUNTRIES = [
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
  { name: 'Estados Unidos', flag: '🇺🇸', currency: 'USD' },
  { name: 'Brasil', flag: '🇧🇷', currency: 'BRL' },
  { name: 'Reino Unido', flag: '🇬🇧', currency: 'GBP' },
  { name: 'Francia', flag: '🇫🇷', currency: 'EUR' },
  { name: 'Alemania', flag: '🇩🇪', currency: 'EUR' },
  { name: 'Italia', flag: '🇮🇹', currency: 'EUR' },
  { name: 'Otro', flag: '🌍', currency: 'USD' },
];

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: async () => {
      const r = await base44.entities.UserProfile.filter({ user_id: user.id });
      return r[0] || null;
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        home_country: profile.home_country || 'España',
        home_currency: profile.home_currency || 'EUR',
        nationality: profile.nationality || 'España',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: data => base44.entities.UserProfile.update(profile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile', user?.id] });
      setEditing(false);
    },
  });

  if (isLoading) return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-orange-700" />
    </div>
  );

  const country = COUNTRIES.find(c => c.name === (form.home_country || profile?.home_country)) || COUNTRIES[0];

  return (
    <div className="min-h-screen bg-orange-50 pb-10">
      {/* Header */}
      <div className="bg-orange-700 pt-12 pb-20">
        <div className="max-w-lg mx-auto px-5 flex items-center justify-between">
          <Link to={createPageUrl('TripsList')}>
            <button className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />Mis viajes
            </button>
          </Link>
          <button onClick={() => setEditing(!editing)}
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium">
            <Settings className="w-4 h-4" />{editing ? 'Cancelar' : 'Editar'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-12">
        {/* Avatar + nombre */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-orange-100 border-4 border-white shadow flex items-center justify-center overflow-hidden">
                {(form.avatar_url || profile?.avatar_url) ? (
                  <img src={form.avatar_url || profile?.avatar_url} alt="avatar" className="w-full h-full object-cover" onError={e => e.currentTarget.style.display='none'}/>
                ) : (
                  <span className="text-2xl font-bold text-orange-700">
                    {(profile?.display_name || user?.full_name || '?')[0]?.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg text-foreground truncate">{profile?.display_name || user?.full_name}</p>
              {profile?.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
            </div>
          </div>

          {profile?.home_country && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{COUNTRIES.find(c => c.name === profile.home_country)?.flag} {profile.home_country}</span>
              <span className="text-muted-foreground">·</span>
              <Globe className="w-3.5 h-3.5" />
              <span>{profile.home_currency}</span>
            </div>
          )}
        </div>

        {/* Formulario de edición */}
        {editing && (
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5 mb-4 space-y-4">
            <p className="font-semibold text-sm text-foreground">Editar perfil</p>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nombre visible</label>
              <Input value={form.display_name} onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))} placeholder="Tu nombre" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">URL de avatar (opcional)</label>
              <Input value={form.avatar_url} onChange={e => setForm(p => ({ ...p, avatar_url: e.target.value }))} placeholder="https://..." />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">País de origen</label>
              <select value={form.home_country}
                onChange={e => {
                  const c = COUNTRIES.find(x => x.name === e.target.value) || COUNTRIES[0];
                  setForm(p => ({ ...p, home_country: c.name, home_currency: c.currency, nationality: c.name }));
                }}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-secondary outline-none focus:border-orange-400">
                {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
              </select>
            </div>

            <Button onClick={() => updateMutation.mutate(form)}
              disabled={updateMutation.isPending}
              className="w-full bg-orange-700 hover:bg-orange-800 text-white">
              {updateMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Guardando...</> : 'Guardar cambios'}
            </Button>
          </div>
        )}

        {/* Info de cuenta */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <p className="font-semibold text-sm text-foreground mb-3">Cuenta</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium text-foreground">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Username</span>
              <span className="text-sm font-medium text-foreground">@{profile?.username || '—'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">País de origen</span>
              <span className="text-sm font-medium text-foreground">
                {COUNTRIES.find(c => c.name === profile?.home_country)?.flag} {profile?.home_country || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Moneda base</span>
              <span className="text-sm font-medium text-foreground">{profile?.home_currency || '—'}</span>
            </div>
          </div>
          <button onClick={() => base44.auth.logout()}
            className="w-full mt-5 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
