import { base44 } from '@/api/base44Client';

/**
 * searchUserProfiles — envoltorio del cliente para la función backend del
 * mismo nombre. Sustituye a las llamadas directas base44.entities.UserProfile
 * .list()/.filter({}) contra perfiles de OTRA gente (UserProfile.read se
 * cerró en el rls — ver base44/entities/UserProfile.jsonc — porque exponía
 * email/nationality de todo el mundo a cualquier usuario logueado).
 *
 * - { userIds } / { emails }: para cuando quien llama YA conoce esos
 *   emails (p.ej. trip.members) — la respuesta incluye email.
 * - { usernameQuery, exact? } / sin argumentos (todos): descubrimiento
 *   abierto — la respuesta NUNCA incluye email ni nationality.
 *
 * La lectura del propio perfil (UserProfile.filter({user_id: user.id})) NO
 * pasa por aquí — sigue funcionando directo, el rls permite leer tu propio
 * registro completo sin restricción.
 */
export async function searchUserProfiles(params = {}) {
  try {
    const res = await base44.functions.invoke('searchUserProfiles', params);
    const data = res?.data ?? res;
    return Array.isArray(data?.profiles) ? data.profiles : [];
  } catch {
    return [];
  }
}
