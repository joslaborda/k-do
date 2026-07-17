/**
 * uploadLimits.js — Límites de subida de archivos.
 *
 * Antes cada punto de subida hacía lo suyo: ChatTab validaba 20 MB, y el recibo de
 * un gasto, la foto de un spot y la galería no validaban nada. Con una foto de
 * móvil moderno (5–12 MB) suele funcionar, pero al elegir un vídeo desde la galería
 * el usuario se quedaba esperando una subida de cientos de MB sin saber por qué.
 */

/** Fotos: recibos, spots, galería del viaje. */
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;   // 15 MB

/** Adjuntos del chat: admite PDFs y documentos, por eso es más alto. */
export const MAX_FILE_BYTES = 20 * 1024 * 1024;    // 20 MB

/**
 * Comprueba un archivo antes de subirlo.
 * @returns {{ ok: true } | { ok: false, reason: 'size'|'type', maxMb: number }}
 */
export function checkUpload(file, { images = true } = {}) {
  if (!file) return { ok: false, reason: 'type', maxMb: 0 };
  const max = images ? MAX_IMAGE_BYTES : MAX_FILE_BYTES;
  if (images && file.type && !file.type.startsWith('image/')) {
    return { ok: false, reason: 'type', maxMb: Math.round(max / 1024 / 1024) };
  }
  if (file.size > max) {
    return { ok: false, reason: 'size', maxMb: Math.round(max / 1024 / 1024) };
  }
  return { ok: true };
}
