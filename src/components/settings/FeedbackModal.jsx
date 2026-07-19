import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bug, Lightbulb, MessageCircle, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { sendFeedback } from '@/lib/feedback';

const TYPES = [
  { key: 'bug', Icon: Bug },
  { key: 'suggestion', Icon: Lightbulb },
  { key: 'other', Icon: MessageCircle },
];

// Mismo patrón de bottom sheet + createPortal que InviteModal.jsx y el
// TripInviteModal de NotificationBell.jsx — sin portal, un modal fixed puede
// quedar atrapado dentro del contexto de apilamiento de algún ancestro y
// pintarse por debajo de la barra de navegación inferior (bug ya visto y
// arreglado en esos dos componentes).
export default function FeedbackModal({ open, onClose, userEmail = '', userName = '' }) {
  const { t } = useTranslation();
  const [type, setType] = useState('bug');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) { setType('bug'); setMessage(''); setError(''); setDone(false); }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!message.trim()) { setError(t('feedback.emptyError')); return; }
    setSending(true); setError('');
    try {
      await sendFeedback({ feedbackType: type, message, userEmail, userName });
      setDone(true);
      setTimeout(onClose, 1800);
    } catch (e) {
      setError(e?.message || t('feedback.sendError'));
    }
    setSending(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[250] flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-background rounded-t-3xl px-5 pt-4 pb-8 shadow-2xl flex flex-col"
        style={{ maxHeight: '88dvh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4 flex-shrink-0" />

        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <p className="text-base font-semibold text-foreground">{t('feedback.title')}</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center" aria-label={t('common.close')}>
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center py-10 gap-3">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <p className="text-base font-semibold text-foreground">{t('feedback.sent')}</p>
            <p className="text-sm text-muted-foreground text-center">{t('feedback.sentHint')}</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 space-y-4">
            <p className="text-sm text-muted-foreground">{t('feedback.subtitle')}</p>

            {/* Selector de tipo */}
            <div className="flex gap-2">
              {TYPES.map(({ key, Icon }) => {
                const isOn = type === key;
                return (
                  <button
                    key={key}
                    onClick={() => setType(key)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-colors
                      ${isOn ? 'bg-orange-50 border-primary text-primary' : 'bg-card border-border text-muted-foreground'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{t(`feedback.type.${key}`)}</span>
                  </button>
                );
              })}
            </div>

            {/* Mensaje */}
            <div>
              <textarea
                value={message}
                onChange={e => { setMessage(e.target.value); setError(''); }}
                placeholder={t('feedback.placeholder')}
                rows={5}
                className={`w-full rounded-2xl border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground bg-card outline-none focus:border-primary resize-none ${error ? 'border-red-300' : 'border-border'}`}
              />
              {error && <p className="text-xs text-red-600 mt-1.5 px-1">{error}</p>}
            </div>

            <p className="text-xs text-muted-foreground/70 px-1">
              {t('feedback.contactHint', { email: userEmail })}
            </p>

            <button
              onClick={handleSubmit}
              disabled={sending || !message.trim()}
              className="w-full h-12 rounded-full bg-primary text-white text-sm font-semibold disabled:opacity-40"
            >
              {sending ? t('feedback.sending') : t('feedback.send')}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
