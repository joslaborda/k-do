import { base44 } from '@/api/base44Client';
import { getLanguage } from '@/i18n/index.js';

// Dirección donde José recibe el aviso de cada envío — buzón real
// (hello@kodotravel.app) creado aparte para esto, no relacionado con el
// remitente de las invitaciones (RESEND_FROM_ADDRESS), que es solo de
// salida y no admite respuestas.
const FEEDBACK_INBOX = 'hello@kodotravel.app';

const TYPE_LABEL = {
  bug: 'Bug',
  suggestion: 'Sugerencia',
  other: 'Otro',
};

/**
 * sendFeedback — guarda el mensaje en la entidad Feedback (así queda
 * consultable desde el panel de datos de base44 aunque el email falle o se
 * pierda en spam) y, además, manda un aviso por email a FEEDBACK_INBOX para
 * enterarse al momento.
 *
 * El email va con el SendEmail nativo de base44 (texto plano) — a
 * diferencia de las invitaciones, aquí no hace falta HTML ni Resend: es un
 * aviso interno para José, no algo que tenga que verse bonito para un
 * desconocido.
 */
export async function sendFeedback({ feedbackType, message, userEmail, userName }) {
  const trimmed = (message || '').trim();
  if (!trimmed) throw new Error('El mensaje no puede estar vacío');

  const record = await base44.entities.Feedback.create({
    feedback_type: feedbackType,
    message: trimmed,
    user_email: userEmail || '',
    user_name: userName || '',
    app_language: getLanguage(),
    status: 'new',
  });

  // El email es "best effort" — si falla (p. ej. el buzón hello@ aún no
  // está verificado del todo), el registro en Feedback ya se guardó, así
  // que no se pierde el mensaje del usuario por un fallo de envío.
  try {
    await base44.integrations.Core.SendEmail({
      to: FEEDBACK_INBOX,
      subject: `[Kōdo] ${TYPE_LABEL[feedbackType] || 'Feedback'} de ${userName || userEmail || 'usuario'}`,
      body: `Tipo: ${TYPE_LABEL[feedbackType] || feedbackType}
De: ${userName || '(sin nombre)'} <${userEmail || 'sin email'}>
Idioma app: ${getLanguage()}

Mensaje:
${trimmed}`,
    });
  } catch (e) {
    console.warn('[sendFeedback] Email de aviso no enviado (el registro sí se guardó):', e?.message);
  }

  return record;
}
