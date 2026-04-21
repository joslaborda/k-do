import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { normalizeUsername, validateUsername, checkUsernameAvailable } from '@/lib/username';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function UsernameField({ value, onChange, currentUserId, className = '' }) {
  const [status, setStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [errorMsg, setErrorMsg] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!value) { setStatus(null); setErrorMsg(''); return; }

    const validErr = validateUsername(value);
    if (validErr) {
      setStatus('invalid');
      setErrorMsg(validErr);
      return;
    }

    setStatus('checking');
    setErrorMsg('');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const available = await checkUsernameAvailable(value, currentUserId);
      setStatus(available ? 'available' : 'taken');
      if (!available) setErrorMsg('Username ya está en uso');
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [value, currentUserId]);

  const handleChange = (e) => {
    const normalized = normalizeUsername(e.target.value);
    onChange(normalized);
  };

  return (
    <div className={className}>
      <div className="relative flex items-center">
        <span className="absolute left-3 text-muted-foreground font-medium select-none">@</span>
        <Input
          value={value}
          onChange={handleChange}
          placeholder="minombre_viajero"
          className="pl-7 pr-10 font-mono lowercase"
          maxLength={30}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <div className="absolute right-3">
          {status === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {status === 'available' && <CheckCircle className="w-4 h-4 text-green-500" />}
          {(status === 'taken' || status === 'invalid') && <XCircle className="w-4 h-4 text-destructive" />}
        </div>
      </div>
      {status === 'available' && (
        <p className="text-xs text-green-600 mt-1">✅ Disponible</p>
      )}
      {(status === 'taken' || status === 'invalid') && errorMsg && (
        <p className="text-xs text-destructive mt-1">❌ {errorMsg}</p>
      )}
      {!value && (
        <p className="text-xs text-muted-foreground mt-1">Solo minúsculas (a-z), números y _ (sin puntos ni espacios)</p>
      )}
    </div>
  );
}