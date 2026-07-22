import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 


export const isIframe = window.self !== window.top;

// UserProfile.email se guarda siempre en minúsculas (ver migración silenciosa
// en App.jsx), pero trip.members / expense.paid_by / invite.email etc. venían
// tal cual del proveedor de auth o de lo que se tecleara — con mayúsculas
// distintas según el caso. Comparar/buscar perfiles por email sin normalizar
// primero es lo que hacía que el propio creador de un viaje (su email nunca
// pasaba por la migración de UserProfile) apareciera con el email en crudo en
// vez de su nombre en los avatares del viaje. Un solo sitio para esta regla:
// cualquier comparación o lookup de email debe pasar por aquí primero.
export const normalizeEmail = (email) => (email || '').trim().toLowerCase();
