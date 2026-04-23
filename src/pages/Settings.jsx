import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowLeft, LogOut, Save, Loader2, CheckCircle2, XCircle, Camera, Eye, EyeOff, ImagePlus, Link as LinkIcon, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { normalizeUsername, validateUsername, checkUsernameAvailability } from '@/lib/username';

// ── Password section ──────────────────────────────────────────────────────────
function PasswordSection({ user }) {
  const { toast } = useToast();
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [repeatPw, setRepeatPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [saving, setSaving] = useState(false);

  const newPwError = newPw && newPw.length < 8 ? 'Mínimo 8 caracteres' : '';
  const repeatError = repeatPw && newPw !== repeatPw ? 'Las contraseñas no coinciden' : '';
  const canSave = currentPw && newPw.length >= 8 && newPw === repeatPw && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await base44.auth.changePassword({ userId: user.id, currentPassword: currentPw, newPassword: newPw });
      toast({ title: 'Contraseña actualizada ✓', description: 'Tu contraseña ha sido cambiada correctamente.' });
      setCurrentPw(''); setNewPw(''); setRepeatPw('');
    } catch (e) {
      toast({ title: 'Error', description: e?.message || 'Contraseña actual incorrecta.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  function PwInput({ value, onChange, show, setShow, placeholder }) {
    return (
      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setShow(!show)}
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border p-4 space-y-3">
      <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Contraseña</h2>
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Contraseña actual</label>
        <PwInput value={currentPw} onChange={setCurrentPw} show={showCurrent} setShow={setShowCurrent} placeholder="Contraseña actual" />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Nueva contraseña</label>
        <PwInput value={newPw} onChange={setNewPw} show={showNew} setShow={setShowNew} placeholder="Mínimo 8 caracteres" />
        {newPwError && <p className="text-xs text-destructive">{newPwError}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Repetir nueva contraseña</label>
        <PwInput value={repeatPw} onChange={setRepeatPw} show={showRepeat} setShow={setShowRepeat} placeholder="Repetir contraseña" />
        {repeatError && <p className="text-xs text-destructive">{repeatError}</p>}
      </div>
      <Button
        className="w-full bg-orange-700 hover:bg-orange-800 text-white"
        onClick={handleSave}
        disabled={!canSave}
      >
        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : <><Save className="w-4 h-4 mr-2" />Guardar contraseña</>}
      </Button>
    </div>
  );
}

// ── Profile section ───────────────────────────────────────────────────────────
function ProfileSection({ user, profile, onUpdated }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef();
  const coverRef = useRef();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [homeCountry, setHomeCountry] = useState(profile?.home_country || 'España');
  const [username, setUsername] = useState(profile?.username || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [instagram, setInstagram] = useState(profile?.instagram || '');
  const [travelStyle, setTravelStyle] = useState(profile?.travel_style || '');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [usernameError, setUsernameError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);

  // Debounce username check
  useEffect(() => {
    if (!username) { setAvailable(null); setUsernameError(''); return; }
    if (username === profile?.username) { setAvailable(true); setUsernameError(''); return; }
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
  }, [username, user?.id, profile?.username]);

  const handleUsernameChange = (val) => {
    setUsername(normalizeUsername(val));
    setAvailable(null);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.UserProfile.update(profile.id, { avatar_url: file_url });
      queryClient.invalidateQueries({ queryKey: ['myProfile', user.id] });
      toast({ title: 'Avatar actualizado ✓' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo subir la imagen.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploadingCover(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.UserProfile.update(profile.id, { cover_image_url: file_url });
      queryClient.invalidateQueries({ queryKey: ['myProfile', user.id] });
      toast({ title: 'Portada actualizada ✓' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo subir la imagen.', variant: 'destructive' });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    const err = validateUsername(username);
    if (err) { toast({ title: 'Username inválido', description: err, variant: 'destructive' }); return; }
    if (available === false) { toast({ title: 'Username no disponible', variant: 'destructive' }); return; }
    if (!displayName.trim()) { toast({ title: 'El nombre no puede estar vacío', variant: 'destructive' }); return; }
    // Re-check before save
    if (username !== profile?.username) {
      const ok = await checkUsernameAvailability(username, user?.id);
      if (!ok) { toast({ title: 'Username ya en uso', variant: 'destructive' }); return; }
    }
    setSaving(true);
    try {
      await base44.entities.UserProfile.update(profile.id, {
        username,
        username_normalized: username,
        display_name: displayName.trim(),
        bio,
        home_country: homeCountry,
        website: website.trim(),
        instagram: instagram.trim().replace('@', ''),
        travel_style: travelStyle || null,
      });
      queryClient.invalidateQueries({ queryKey: ['myProfile', user.id] });
      toast({ title: 'Perfil guardado ✓' });
      if (onUpdated) onUpdated();
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border p-4 space-y-4">
      <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Perfil</h2>

      {/* Cover image */}
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Foto de portada</label>
        <div
          className="relative h-24 rounded-xl overflow-hidden border border-dashed border-border bg-orange-50 cursor-pointer hover:bg-orange-100 transition-colors"
          onClick={() => coverRef.current?.click()}
        >
          {profile?.cover_image_url ? (
            <img src={profile.cover_image_url} className="w-full h-full object-cover" alt="portada" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
              <ImagePlus className="w-5 h-5" />
              <span className="text-xs">Añadir portada</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploadingCover ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Camera className="w-5 h-5 text-white" />}
          </div>
        </div>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} className="w-16 h-16 rounded-full object-cover border-2 border-border" alt="avatar" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-700 border-2 border-border">
              {profile?.display_name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-700 hover:bg-orange-800 rounded-full flex items-center justify-center border-2 border-white"
          >
            {uploading ? <Loader2 className="w-3 h-3 animate-spin text-white" /> : <Camera className="w-3 h-3 text-white" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="text-sm font-semibold">{profile?.display_name}</p>
          <p className="text-xs text-muted-foreground font-mono">@{profile?.username}</p>
        </div>
      </div>

      {/* Username */}
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Username</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
          <Input
            className="pl-7 font-mono"
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
        {usernameError && <p className="text-xs text-destructive mt-0.5">{usernameError}</p>}
        {!checking && !usernameError && available === false && <p className="text-xs text-destructive mt-0.5">Username no disponible</p>}
      </div>

      {/* Display name */}
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Nombre visible</label>
        <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Tu nombre" />
      </div>

      {/* Bio */}
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Bio <span className="text-muted-foreground font-normal">({bio.length}/300)</span></label>
        <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Cuéntanos algo sobre ti, tu estilo de viaje, tus destinos favoritos..." maxLength={300} rows={3} />
      </div>

      {/* Country */}
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">País de origen</label>
        <Input value={homeCountry} onChange={e => setHomeCountry(e.target.value)} placeholder="España" />
      </div>

      {/* Travel style */}
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Estilo de viaje</label>
        <Select value={travelStyle} onValueChange={setTravelStyle}>
          <SelectTrigger><SelectValue placeholder="¿Cómo viajas?" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mochilero">🎒 Mochilero</SelectItem>
            <SelectItem value="confort">🏨 Confort</SelectItem>
            <SelectItem value="lujo">✨ Lujo</SelectItem>
            <SelectItem value="aventura">🏔️ Aventura</SelectItem>
            <SelectItem value="cultural">🏛️ Cultural</SelectItem>
            <SelectItem value="gastronómico">🍽️ Gastronómico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Website */}
      <div>
        <label className="text-xs font-medium text-foreground mb-1 flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Web / Blog</label>
        <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://tublog.com" type="url" />
      </div>

      {/* Instagram */}
      <div>
        <label className="text-xs font-medium text-foreground mb-1 flex items-center gap-1"><Instagram className="w-3 h-3" /> Instagram</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
          <Input className="pl-7" value={instagram} onChange={e => setInstagram(e.target.value.replace('@', ''))} placeholder="tuusuario" />
        </div>
      </div>

      <Button
        className="w-full bg-orange-700 hover:bg-orange-800 text-white"
        onClick={handleSave}
        disabled={saving || available === false || !!usernameError}
      >
        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : <><Save className="w-4 h-4 mr-2" />Guardar perfil</>}
      </Button>
    </div>
  );
}

// ── Main Settings ─────────────────────────────────────────────────────────────
export default function Settings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();


  const { data: profile } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: async () => {
      const results = await base44.entities.UserProfile.filter({ user_id: user.id });
      return results[0] || null;
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 pb-12">
      <div className="bg-orange-700 px-6 py-6">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to="/Profile">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-1" /> Perfil
            </Button>
          </Link>
          <h1 className="text-white font-bold text-lg">Ajustes</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-5">
        {/* Account info (read-only) */}
        <div className="bg-white rounded-xl border border-border p-4 space-y-3">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Cuenta</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Nombre</span>
            <span className="font-medium">{user.full_name || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Verificado</span>
            <span>{user.is_verified ? '✅ Verificado' : '❌ No verificado'}</span>
          </div>
        </div>

        {/* Profile section */}
        {profile && (
          <ProfileSection
            user={user}
            profile={profile}
            onUpdated={() => queryClient.invalidateQueries({ queryKey: ['myProfile', user.id] })}
          />
        )}

        {/* Password section */}
        <PasswordSection user={user} />

        <Button
          variant="ghost"
          onClick={() => base44.auth.logout()}
          className="w-full text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
        </Button>
      </div>
    </div>
  );
}