import { base44 } from '@/api/base44Client';

/** Strip to only allowed chars then lowercase */
export function normalizeUsername(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');
}

/** Returns error string or null if valid */
export function validateUsername(input) {
  if (!input) return 'El username no puede estar vacío';
  if (input.length < 3) return 'Mínimo 3 caracteres';
  if (input.length > 30) return 'Máximo 30 caracteres';
  if (!/^[a-z]/.test(input)) return 'Debe empezar por letra (a-z)';
  if (input.startsWith('_') || input.endsWith('_')) return 'No puede empezar ni terminar con _';
  if (/__/.test(input)) return 'No se permiten dos _ consecutivos';
  if (!/^[a-z][a-z0-9_]{2,29}$/.test(input)) return 'Solo minúsculas (a-z), números y guion bajo (_)';
  return null;
}

/** Check if username_normalized is taken by another user */
export async function checkUsernameAvailable(usernameNormalized, currentUserId) {
  if (!usernameNormalized) return false;
  const results = await base44.entities.UserProfile.filter({
    username_normalized: usernameNormalized,
  });
  // Available if no results, or all results belong to current user
  return results.every((p) => p.user_id === currentUserId);
}