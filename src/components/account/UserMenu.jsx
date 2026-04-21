import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { User, Settings, LogOut } from 'lucide-react';

export default function UserMenu({ user, profile }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initial = profile?.display_name?.[0]?.toUpperCase() || user?.full_name?.[0]?.toUpperCase() || '?';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full px-2 py-1 transition-colors border border-white/20"
        aria-label="Menú de usuario"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.display_name}
            className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center text-white text-xs font-bold">
            {initial}
          </div>
        )}
        {profile?.username && (
          <span className="text-white text-xs font-medium hidden sm:inline">@{profile.username}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 bg-white border border-border rounded-xl shadow-xl min-w-[180px] overflow-hidden">
          {profile && (
            <div className="px-3 py-2.5 border-b border-border">
              <p className="text-sm font-semibold text-foreground">{profile.display_name}</p>
              <p className="text-xs text-muted-foreground">@{profile.username}</p>
            </div>
          )}
          <Link to={createPageUrl('Profile')} onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-orange-50 transition-colors">
            <User className="w-4 h-4 text-muted-foreground" /> Perfil
          </Link>
          <Link to={createPageUrl('Settings')} onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-orange-50 transition-colors">
            <Settings className="w-4 h-4 text-muted-foreground" /> Ajustes
          </Link>
          <button onClick={() => base44.auth.logout()}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors border-t border-border">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}