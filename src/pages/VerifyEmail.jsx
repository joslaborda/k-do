import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Mail } from 'lucide-react';

export default function VerifyEmail() {
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState('');

  const handleCheck = async () => {
    setChecking(true);
    setMsg('');
    try {
      const u = await base44.auth.me();
      if (u?.is_verified) {
        window.location.reload();
      } else {
        setMsg('Tu email aún no está verificado. Revisa tu bandeja de entrada.');
      }
    } catch {
      setMsg('Error al verificar. Inténtalo de nuevo.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-border p-8 max-w-sm w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-orange-700" />
        </div>
        <h2 className="text-xl font-bold mb-2">Verifica tu email</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Te hemos enviado un correo de verificación. Ábrelo y confirma tu cuenta para continuar usando Kōdo.
        </p>
        {msg && (
          <p className="text-sm mb-4 text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">{msg}</p>
        )}
        <Button
          className="w-full bg-orange-700 hover:bg-orange-800 text-white"
          onClick={handleCheck}
          disabled={checking}
        >
          {checking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Comprobando...</> : 'Ya verifiqué ✓'}
        </Button>
        <button
          onClick={() => base44.auth.logout()}
          className="mt-4 text-xs text-muted-foreground hover:underline block mx-auto"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}