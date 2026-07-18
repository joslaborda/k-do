import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function VerifyEmail() {
  const { t } = useTranslation();
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
        setMsg(t('verifyEmail.notVerifiedYet'));
      }
    } catch {
      setMsg(t('verifyEmail.checkError'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card rounded-2xl border border-border p-8 max-w-sm w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-orange-50/60 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">{t('verifyEmail.title')}</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {t('verifyEmail.body')}
        </p>
        {msg && (
          <p className="text-sm mb-4 text-primary bg-secondary border border-border rounded-lg px-3 py-2">{msg}</p>
        )}
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white"
          onClick={handleCheck}
          disabled={checking}
        >
          {checking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('verifyEmail.checking')}</> : t('verifyEmail.alreadyVerified')}
        </Button>
        <button
          onClick={() => base44.auth.logout()}
          className="mt-4 text-xs text-muted-foreground hover:underline block mx-auto"
        >
          {t('verifyEmail.logout')}
        </button>
      </div>
    </div>
  );
}