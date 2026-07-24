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

// Convierte un importe escrito a mano (que puede venir en formato "1.234,56"
// o "1,234.56" o "1234.56") a un string parseable por parseFloat/Number.
// Antes se hacía con un simple `.replace(',', '.')`, que con "1.234,56"
// (formato español, mil doscientos treinta y cuatro con 56) producía
// "1.234.56" — parseFloat lo lee como 1.234, guardando el gasto ~1000 veces
// más pequeño sin ningún aviso. Regla: si aparecen coma Y punto, el símbolo
// que aparece MÁS TARDE en la cadena es el separador decimal y el otro se
// trata como separador de miles. Si solo aparece coma, se interpreta como
// decimal solo cuando hay 1-2 dígitos después (p.ej. "12,50"); si hay 3+
// dígitos después de la única coma, se asume separador de miles ("1,234").
// Simétricamente para un único punto con 3+ dígitos detrás ("1.234").
export function normalizeAmountInput(raw) {
  if (raw == null) return raw;
  let s = String(raw).replace(/[^0-9.,]/g, '');
  const hasComma = s.includes(',');
  const hasDot = s.includes('.');

  if (hasComma && hasDot) {
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    if (lastComma > lastDot) {
      // La coma es el decimal; los puntos anteriores son miles.
      return s.replace(/\./g, '').replace(',', '.');
    }
    // El punto es el decimal; las comas anteriores son miles.
    return s.replace(/,/g, '');
  }

  if (hasComma) {
    const parts = s.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      return s.replace(',', '.'); // "12,50" -> decimal
    }
    return s.replace(/,/g, ''); // "1,234" o "1,234,567" -> miles
  }

  if (hasDot) {
    const parts = s.split('.');
    if (parts.length > 2) {
      // Varios puntos: todos menos el último son separadores de miles.
      const last = parts.pop();
      return parts.join('') + '.' + last;
    }
    if (parts.length === 2 && parts[1].length > 2) {
      return parts.join(''); // "1.234" -> miles, sin parte decimal
    }
    return s; // "12.50" -> ya es decimal válido
  }

  return s;
}
