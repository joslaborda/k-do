import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowLeft, LogOut, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-muted-foreground">Cargando…</div>
      </div>
    );
  }

  const initials = user.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="bg-orange-700 px-6 py-8">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link to="/TripsList">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-1" /> Volver
            </Button>
          </Link>
          <Link to="/Settings">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="max-w-lg mx-auto mt-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold text-white mb-4 border-4 border-white/30">
            {initials}
          </div>
          <h1 className="text-2xl font-bold text-white">{user.full_name || 'Sin nombre'}</h1>
          <p className="text-white/70 text-sm mt-1">{user.email}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8 space-y-4">
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
            <span>{user.is_verified ? '✅ Sí' : '❌ No'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rol</span>
            <span className="font-medium capitalize">{user.role || 'user'}</span>
          </div>
        </div>

        <Link to="/Settings">
          <Button className="w-full bg-orange-700 hover:bg-orange-800">
            <Settings className="w-4 h-4 mr-2" /> Editar ajustes
          </Button>
        </Link>

        <Button variant="ghost" onClick={() => base44.auth.logout()}
          className="w-full text-destructive hover:bg-destructive/10">
          <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
        </Button>
      </div>
    </div>
  );
}