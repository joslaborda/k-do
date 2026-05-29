import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import DarkModeToggle from '@/components/DarkModeToggle';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, Camera } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { normalizeUsername, validateUsername, checkUsernameAvailability } from '@/lib/username';
import { getCountryMeta } from '@/lib/countryConfig';

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
// Build full country list from countryConfig KNOWN_META
function buildCountryList() {
  const { KNOWN_META_KEYS } = (() => {
    try {
      // Get all country names from countryConfig via getCountryMeta
      // We inline the key list here for reliability
      return { KNOWN_META_KEYS: true };
    } catch { return { KNOWN_META_KEYS: false }; }
  })();
  return null; // replaced below
}

const COUNTRIES = [
  'España','México','Colombia','Argentina','Perú','Chile','Venezuela','Ecuador','Bolivia',
  'Paraguay','Uruguay','Costa Rica','Guatemala','Honduras','El Salvador','Nicaragua','Panamá',
  'Cuba','República Dominicana','Haití','Puerto Rico','Belice','Guyana','Surinam','Guyana Francesa',
  'Francia','Italia','Alemania','Portugal','Reino Unido','Países Bajos','Bélgica','Suiza',
  'Austria','Grecia','Turquía','Polonia','República Checa','Hungría','Rumanía','Bulgaria',
  'Croacia','Serbia','Eslovenia','Eslovaquia','Noruega','Suecia','Dinamarca','Finlandia',
  'Irlanda','Islandia','Estonia','Letonia','Lituania','Ucrania','Bielorrusia','Moldavia',
  'Albania','Bosnia','Kosovo','Montenegro','Macedonia','Liechtenstein','Andorra','Mónaco',
  'San Marino','Ciudad del Vaticano','Malta','Chipre','Luxemburgo','Gibraltar',
  'Japón','China','Corea del Sur','India','Tailandia','Vietnam','Indonesia','Filipinas',
  'Singapur','Malasia','Camboya','Myanmar','Laos','Nepal','Sri Lanka','Bangladesh',
  'Pakistán','Afganistán','Uzbekistán','Kazajistán','Kirguistán','Tayikistán','Turkmenistán',
  'Mongolia','Hong Kong','Macao','Taiwan',
  'Emiratos Árabes Unidos','Arabia Saudí','Qatar','Kuwait','Omán','Bahréin','Jordania',
  'Israel','Palestina','Líbano','Siria','Irak','Irán','Yemén',
  'Turquía','Azerbaiyán','Armenia','Georgia',
  'Marruecos','Egipto','Túnez','Argelia','Libia','Sudán','Etiopía','Kenia','Tanzania',
  'Uganda','Ruanda','Nigeria','Ghana','Senegal','Costa de Marfil','Camerún','Angola',
  'Mozambique','Zambia','Zimbabue','Botswana','Namibia','Sudáfrica','Madagascar','Mauricio',
  'Seychelles','Cabo Verde','Eritrea','Somalia','Yibuti','Malawi','Esuatini','Lesoto',
  'Gabón','Congo','República Democrática del Congo','República Centroafricana','Chad',
  'Malí','Burkina Faso','Níger','Guinea','Sierra Leona','Liberia','Guinea Ecuatorial',
  'Australia','Nueva Zelanda','Papúa Nueva Guinea','Fiyi','Samoa','Tonga','Vanuatu',
  'Islas Salomón','Micronesia','Palaos','Kiribati','Tuvalu','Nauru','Islas Marshall',
  'Polinesia Francesa','Nueva Caledonia','Guam','Islas Cook',
  'Canadá','Estados Unidos',
  'Saint-Martin','Sint Maarten','Martinica','Guadalupe','Aruba','Curazao','Bermudas',
  'Islas Caimán','Jamaica','Barbados','Trinidad y Tobago','Bahamas','Santa Lucía',
  'Antigua y Barbuda','Granada','Dominica','San Cristóbal y Nieves',
].map(function(n) {
  var name = String(n);
  var m = getCountryMeta(name) || {};
  return { name: name, flag: m.flag || '🌍', currency: m.currency || 'USD' };
}).sort(function(a, b) { return String(a.name).localeCompare(String(b.name), 'es'); });

const CURRENCIES = ['EUR','USD','MXN','COP','ARS','CLP','GBP','JPY','BRL','PEN','CHF','AUD','CAD'].map(name => {
  const meta = getCountryMeta(name);
  return { name, flag: meta.flag || '🌍', currency: meta.currency || 'USD' };
}).sort((a, b) => a.name.localeCompare(b.name, 'es'));

// ─────────────────────────────────────────────────────────────────────────────
// Toggle switch
// ─────────────────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-primary' : 'bg-border'}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? 'left-5' : 'left-1'}`} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Row components
// ─────────────────────────────────────────────────────────────────────────────
function SettingRow({ label, sublabel, right, onClick, isLast = false }) {
  const inner = (
    <div className={`flex items-center justify-between px-4 py-3.5 ${!isLast ? 'border-b border-border' : ''} ${onClick ? 'hover:bg-secondary/30 transition-colors cursor-pointer' : ''}`}
      onClick={onClick}>
      <div className="flex-1 min-w-0 mr-3">
        <p className="text-sm text-foreground">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      {right}
    </div>
  );
  return inner;
}

// ─────────────────────────────────────────────────────────────────────────────
// Password section
// ─────────────────────────────────────────────────────────────────────────────
function PasswordSection({ user }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSave = async () => {
    if (!current || !next || !repeat) { setMsg({ type:'error', text:'Rellena todos los campos' }); return; }
    if (next !== repeat) { setMsg({ type:'error', text:'Las contraseñas no coinciden' }); return; }
    if (next.length < 8) { setMsg({ type:'error', text:'Mínimo 8 caracteres' }); return; }
    setSaving(true);
    try {
      await base44.auth.changePassword({ currentPassword: current, newPassword: next });
      setMsg({ type:'ok', text:'Contraseña actualizada' });
      setCurrent(''); setNext(''); setRepeat('');
      setTimeout(() => { setOpen(false); setMsg(null); }, 1500);
    } catch {
      setMsg({ type:'error', text:'Contraseña actual incorrecta' });
    } finally { setSaving(false); }
  };

  if (!open) return (
    <SettingRow label="Cambiar contraseña" isLast
      right={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c4bfb9" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>}
      onClick={() => setOpen(true)} />
  );

  return (
    <div className="border-t border-border">
      <div className="px-4 py-3 space-y-3">
        {['Contraseña actual', 'Nueva contraseña', 'Repetir nueva'].map((label, i) => {
          const val = i === 0 ? current : i === 1 ? next : repeat;
          const setVal = i === 0 ? setCurrent : i === 1 ? setNext : setRepeat;
          return (
            <div key={label}>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <input type="password" value={val} onChange={e => setVal(e.target.value)} placeholder="••••••••"
                className="w-full h-10 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary" />
            </div>
          );
        })}
        {msg && <p className={`text-xs ${msg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>{msg.text}</p>}
        <div className="flex gap-2">
          <button onClick={() => setOpen(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm text-muted-foreground">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 bg-primary text-white rounded-full text-sm font-medium disabled:opacity-40">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete account confirmation
// ─────────────────────────────────────────────────────────────────────────────
function DeleteAccountRow() {
  const [confirm, setConfirm] = useState(false);
  if (!confirm) return (
    <SettingRow label={<span className="text-muted-foreground text-sm">Eliminar cuenta</span>} isLast onClick={() => setConfirm(true)} />
  );
  return (
    <div className="px-4 py-3 space-y-2">
      <p className="text-xs text-red-500">¿Seguro? Esta acción es permanente e irreversible.</p>
      <div className="flex gap-2">
        <button onClick={() => setConfirm(false)} className="flex-1 py-2 border border-border rounded-xl text-xs text-muted-foreground">Cancelar</button>
        <button onClick={() => base44.auth.logout()} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-medium">Sí, eliminar</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function Settings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername]       = useState('');
  const [homeCountry, setHomeCountry] = useState('España');
  const [homeCurrency, setHomeCurrency] = useState('EUR');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  // Notifications prefs (stored in profile)
  const [secondNationality, setSecondNationality] = useState('');
  const [secondNatQuery, setSecondNatQuery] = useState('');
  const [showSecondNatList, setShowSecondNatList] = useState(false);
  const [notifInvites,  setNotifInvites]  = useState(true);
  const [notifExpenses, setNotifExpenses] = useState(true);
  const [notifComments, setNotifComments] = useState(false);
  const [spotsPublic,   setSpotsPublic]   = useState(false);

  const avatarInputRef = useRef(null);

  const { data: profile } = useQuery({
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
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setHomeCountry(profile.home_country || 'España');
      setSecondNationality(profile.second_nationality || '');
      setHomeCurrency(profile.home_currency || 'EUR');
      setNotifInvites(profile.notif_invites !== false);
      setNotifExpenses(profile.notif_expenses !== false);
      setNotifComments(profile.notif_comments === true);
      setSpotsPublic(profile.spots_public_default === true);
    }
  }, [profile]);

  // Username availability check
  useEffect(() => {
    if (!username || username === profile?.username) { setUsernameAvailable(null); return; }
    const err = validateUsername(username);
    if (err) { setUsernameAvailable(false); return; }
    const t = setTimeout(async () => {
      const ok = await checkUsernameAvailability(username, user?.id);
      setUsernameAvailable(ok);
    }, 600);
    return () => clearTimeout(t);
  }, [username, profile?.username, user?.id]);

  const handleAvatarUpload = async (file) => {
    if (!file || !profile) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.UserProfile.update(profile.id, { avatar_url: file_url });
      queryClient.invalidateQueries({ queryKey: ['myProfile', user?.id] });
    } catch {}
  };

  const handleSave = async () => {
    if (!displayName.trim()) { setSaveMsg({ type:'error', text:'El nombre no puede estar vacío' }); return; }
    if (username && validateUsername(username)) { setSaveMsg({ type:'error', text: validateUsername(username) }); return; }
    if (usernameAvailable === false) { setSaveMsg({ type:'error', text:'Username no disponible' }); return; }
    setSaving(true);
    try {
      await base44.entities.UserProfile.update(profile.id, {
        display_name: displayName.trim(),
        username,
        username_normalized: username.toLowerCase(),
        home_country: homeCountry,
        second_nationality: secondNationality || null,
        home_currency: homeCurrency,
        notif_invites: notifInvites,
        notif_expenses: notifExpenses,
        notif_comments: notifComments,
        spots_public_default: spotsPublic,
      });
      queryClient.invalidateQueries({ queryKey: ['myProfile', user?.id] });
      setSaveMsg({ type:'ok', text:'Guardado ✓' });
      setTimeout(() => setSaveMsg(null), 2000);
    } catch {
      setSaveMsg({ type:'error', text:'Error al guardar' });
    } finally { setSaving(false); }
  };

  useEffect(() => { window.scrollTo(0, 0); }, []);

  if (!user || !profile) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  const countryMeta = getCountryMeta(homeCountry);

  return (
    <div className="bg-background min-h-screen">

      {/* ── Header ── */}
      <div className="bg-background sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 pt-12 pb-0">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('Profile')}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Perfil
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-4">Configuración</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-5 pb-24 space-y-5">

        {/* ── PERFIL ── */}
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Perfil</p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">

          {/* Avatar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-border flex items-center justify-center bg-primary text-white text-lg font-medium">
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover"/>
                  : displayName[0]?.toUpperCase() || '?'
                }
              </div>
              <button onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary border-2 border-white flex items-center justify-center">
                <Camera className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{displayName}</p>
              <button onClick={() => avatarInputRef.current?.click()}
                className="text-xs text-primary font-medium">Cambiar foto</button>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
          </div>

          {/* Name */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs text-muted-foreground mb-1.5">Nombre</p>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Tu nombre"
              className="w-full h-10 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary" />
          </div>

          {/* Username */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs text-muted-foreground mb-1.5">Usuario</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
              <input value={username} onChange={e => setUsername(normalizeUsername(e.target.value))} placeholder="tuusuario"
                className="w-full h-10 border border-border rounded-xl pl-7 pr-9 text-sm outline-none focus:border-primary bg-secondary" />
              {username && username !== profile.username && usernameAvailable !== null && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                  {usernameAvailable ? '✓' : '✗'}
                </span>
              )}
            </div>
          </div>

          {/* Save button */}
          <div className="px-4 py-3">
            {saveMsg && (
              <p className={`text-xs mb-2 ${saveMsg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>{saveMsg.text}</p>
            )}
            <button onClick={handleSave} disabled={saving}
              className="w-full py-2.5 bg-primary text-white rounded-full text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Guardar cambios'}
            </button>
          </div>
        </div>

        {/* ── APARIENCIA ── */}
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Apariencia</p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <div>
              <p className="text-sm font-medium text-foreground">Modo oscuro</p>
              <p className="text-xs text-muted-foreground mt-0.5">Se guarda automáticamente</p>
            </div>
            <DarkModeToggle />
          </div>
        </div>

        {/* ── PREFERENCIAS ── */}
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Preferencias</p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs text-muted-foreground mb-1.5">País de origen <span className="text-muted-foreground/60">· Embajadas y emergencias</span></p>
            <select value={homeCountry} onChange={e => {
              const c = COUNTRIES.find(x => x.name === e.target.value) || COUNTRIES[0];
              setHomeCountry(c.name); setHomeCurrency(c.currency);
            }} className="w-full h-10 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary appearance-none">
              {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
            </select>
          </div>
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs text-muted-foreground mb-1.5">Segunda nacionalidad <span className="text-muted-foreground/60">· Opcional</span></p>
            {/* Searchable second nationality */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar país..."
                value={showSecondNatList ? secondNatQuery : secondNationality || ''}
                onChange={e => { setSecondNatQuery(e.target.value); setShowSecondNatList(true); }}
                onFocus={() => { setSecondNatQuery(''); setShowSecondNatList(true); }}
                onBlur={() => setTimeout(() => setShowSecondNatList(false), 150)}
                className="w-full h-10 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary"
              />
              {secondNationality && !showSecondNatList && (
                <button onClick={() => { setSecondNationality(''); setSecondNatQuery(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
              {showSecondNatList && (
                <div className="absolute top-full left-0 right-0 z-50 bg-card border border-border rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                  <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
                    onMouseDown={() => { setSecondNationality(''); setSecondNatQuery(''); setShowSecondNatList(false); }}>
                    Sin segunda nacionalidad
                  </button>
                  {COUNTRIES.filter(c => {
                    const name = typeof c === 'string' ? c : c.name;
                    return !secondNatQuery || name.toLowerCase().includes(secondNatQuery.toLowerCase());
                  }).map(c => {
                    const name = typeof c === 'string' ? c : c.name;
                    const flag = typeof c === 'string' ? '' : (c.flag || '');
                    return (
                      <button key={name}
                        className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary flex items-center gap-2"
                        onMouseDown={() => { setSecondNationality(name); setSecondNatQuery(''); setShowSecondNatList(false); }}>
                        {flag && <span>{flag}</span>}{name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {secondNationality && (
              <p className="text-xs text-muted-foreground mt-1.5">En emergencias Kōdo mostrará también la embajada de {secondNationality}</p>
            )}
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1.5">Moneda base <span className="text-muted-foreground/60">· Gastos y conversiones</span></p>
            <select value={homeCurrency} onChange={e => setHomeCurrency(e.target.value)}
              className="w-full h-10 border border-border rounded-xl px-3 text-sm outline-none focus:border-primary bg-secondary appearance-none">
              {CURRENCIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* ── NOTIFICACIONES ── */}
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Notificaciones</p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <SettingRow
            label="Invitaciones a viajes"
            right={<Toggle value={notifInvites} onChange={setNotifInvites} />}
          />
          <SettingRow
            label="Gastos del grupo"
            sublabel="Cuando alguien añade un gasto"
            right={<Toggle value={notifExpenses} onChange={setNotifExpenses} />}
          />
          <SettingRow
            label="Comentarios en spots"
            right={<Toggle value={notifComments} onChange={setNotifComments} />}
            isLast
          />
        </div>

        {/* ── PRIVACIDAD ── */}
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Privacidad</p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <SettingRow
            label="Spots públicos por defecto"
            sublabel="Los spots que crees serán visibles para la comunidad"
            right={<Toggle value={spotsPublic} onChange={setSpotsPublic} />}
            isLast
          />
        </div>

        {/* ── CUENTA ── */}
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Cuenta</p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <SettingRow
            label="Email"
            right={<span className="text-xs text-muted-foreground">{user.email}</span>}
          />
          <PasswordSection user={user} />
          <div className="border-t border-border">
            <button onClick={() => base44.auth.logout()}
              className="w-full text-left px-4 py-3.5 text-sm text-red-500 font-medium hover:bg-red-50 transition-colors border-b border-border">
              Cerrar sesión
            </button>
            <DeleteAccountRow />
          </div>
        </div>

      </div>
    </div>
  );
}