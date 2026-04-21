import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { MailCheck, RefreshCw } from 'lucide-react';

export default function VerifyEmail() {
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');

  const handleCheck = async () => {
    setChecking(true);
    setMessage('');
    try {
      const user = await base44.auth.me();
      if (user?.is_verified) {
        // Reload so AuthContext re-runs and routes properly
        window.location.reload();
      } else {
        setMessage('Tu email aún no está verificado. Revisa tu bandeja de entrada.');
      }
    } catch {
      setMessage('Error al verificar. Inténtalo de nuevo.');
    }
    setChecking(false);
  };

  const handleLogout = () => base44.auth.logout();

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-border shadow-lg p-8 max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
          <MailCheck className="w-8 h-8 text-orange-700" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Verifica tu email</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Hemos enviado un enlace de verificación a tu correo electrónico.
            Haz clic en el enlace y luego pulsa el botón de abajo.
          </p>
        </div>

        {message && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-700">
            {message}
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleCheck}
            disabled={checking}
            className="w-full bg-orange-700 hover:bg-orange-800 text-white"
          >
            {checking ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Comprobando...</>
            ) : (
              '✅ Ya verifiqué mi email'
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            ¿No recibiste el email? Revisa la carpeta de spam o contacta con soporte.
          </p>

          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}