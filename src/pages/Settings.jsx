import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function Settings() {
  const [user, setUser] = useState(null);
  const { toast } = useToast();

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

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">
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

        <p className="text-sm text-muted-foreground text-center">
          Para cambiar tu nombre o contraseña, contacta con el administrador de la app.
        </p>

        <Button variant="ghost" onClick={() => base44.auth.logout()}
          className="w-full text-destructive hover:bg-destructive/10">
          <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
        </Button>
      </div>
    </div>
  );
}