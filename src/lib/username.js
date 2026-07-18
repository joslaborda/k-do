import { base44 } from '@/api/base44Client';

const USERNAME_REGEX = /^[a-z][a-z0-9_]{2,29}$/;

/** Convierte cualquier string a username válido (lowercase, elimina inválidos) */
export function normalizeUsername(input) {
  return input.toLowerCase().replace(/[^a-z0-9_]/g, '');
}

/**
 * Valida contra las reglas: minúsculas, empieza por letra, 3-30 chars.
 * Devuelve un CÓDIGO de error (no texto) para que cada pantalla lo traduzca
 * con t('profile.usernameErrors.<code>') — antes devolvía el mensaje en
 * español fijo y se mostraba tal cual también con la app en inglés.
 */
export function validateUsername(username) {
  if (!username) return 'empty';
  if (username.length < 3) return 'tooShort';
  if (username.length > 30) return 'tooLong';
  if (!/^[a-z]/.test(username)) return 'mustStartWithLetter';
  if (!USERNAME_REGEX.test(username)) return 'invalidChars';
  return null; // válido
}

/** Comprueba si el username_normalized está disponible (excluye al propio userId) */
export async function checkUsernameAvailability(usernameNormalized, currentUserId) {
  const existing = await base44.entities.UserProfile.filter({ username_normalized: usernameNormalized });
  const others = existing.filter(p => p.user_id !== currentUserId);
  return others.length === 0;
}