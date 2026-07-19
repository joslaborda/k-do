import { base44 } from '@/api/base44Client';

/**
 * Cambia el rol de un miembro o lo expulsa del viaje. Corre en el backend
 * (base44/functions/manageTripMember), no aquí. Motivo: el rls de
 * Trip.update es a nivel de documento, no de campo — no puede exigir "solo
 * si eres admin" para tocar members/roles sin también bloquear a cualquier
 * miembro normal que solo quiere renombrar el viaje o salir de él. Antes esto
 * se hacía con Trip.update() directo desde el cliente, con permisos
 * normales: cualquier miembro (viewer incluido) podía llamarlo a mano y
 * auto-promocionarse a admin o expulsar a otros. La función valida ahí que
 * quien llama sea admin antes de tocar la membresía de otra persona.
 */
async function callManageTripMember(payload) {
  let result;
  try {
    result = await base44.functions.invoke('manageTripMember', payload);
  } catch (e) {
    const serverError = e?.response?.data?.error || e?.data?.error;
    const err = new Error(serverError || e?.message || 'No se pudo actualizar el viaje.');
    const code = e?.response?.data?.code || e?.data?.code;
    if (code) err.code = code;
    throw err;
  }
  const data = result?.data ?? result;
  if (data?.error) {
    const err = new Error(data.error);
    if (data.code) err.code = data.code;
    throw err;
  }
  return data.trip;
}

export async function removeTripMember(tripId, targetEmail) {
  return callManageTripMember({ tripId, targetEmail, action: 'remove' });
}

export async function setTripMemberRole(tripId, targetEmail, role) {
  return callManageTripMember({ tripId, targetEmail, action: 'setRole', role });
}
