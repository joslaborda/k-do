import { Capacitor } from '@capacitor/core';

/**
 * pushNotifications — puente entre la sesión de Kōdo y OneSignal.
 *
 * Por qué External ID en vez de guardar el player_id en UserProfile:
 * OneSignal permite asociar cada instalación de la app a un "external_id"
 * propio (aquí, el user.id de base44) con OneSignal.login(). Para enviar un
 * push desde el backend basta con apuntar a ese external_id — no hace falta
 * guardar ni sincronizar ningún token de dispositivo en nuestras propias
 * entidades, ni preocuparse de qué pasa si el usuario reinstala la app o
 * tiene varios dispositivos (OneSignal reparte a todos los que tenga
 * asociados a ese external_id). Ver base44/functions/createNotification/entry.ts,
 * que es quien realmente dispara el envío.
 *
 * No-op total en web: esta misma base de código se sirve tal cual como PWA
 * en el navegador (ver App.jsx) y el plugin de OneSignal solo existe en el
 * shell nativo de Capacitor — sin el guard de Capacitor.isNativePlatform(),
 * cualquier llamada aquí rompería la versión web con un TypeError sobre
 * window.plugins.OneSignal, que no existe fuera de iOS/Android.
 */

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID;

let deviceReady = false;

function whenNativeReady(callback) {
  if (!Capacitor.isNativePlatform()) return;
  if (deviceReady) {
    callback();
    return;
  }
  // onesignal-cordova-plugin expone window.plugins.OneSignal a través del
  // puente de compatibilidad Cordova de Capacitor, que no está garantizado
  // disponible hasta el evento deviceready (a diferencia de los plugins
  // nativos de Capacitor, que sí están listos desde el primer render).
  document.addEventListener(
    'deviceready',
    () => {
      deviceReady = true;
      callback();
    },
    { once: true }
  );
}

function getOneSignal() {
  return typeof window !== 'undefined' ? window.plugins?.OneSignal : null;
}

/**
 * Se llama una vez al arrancar la app (ver main.jsx). Pide permiso de
 * notificaciones al SO — en iOS esto dispara el diálogo nativo del sistema,
 * así que no conviene llamarlo en mitad de otro flujo (p. ej. justo al
 * abrir un viaje) para no generar el prompt en un momento raro.
 */
export function initPushNotifications() {
  whenNativeReady(() => {
    const OneSignal = getOneSignal();
    if (!OneSignal || !ONESIGNAL_APP_ID) return;
    OneSignal.initialize(ONESIGNAL_APP_ID);
    OneSignal.Notifications.requestPermission(true);
  });
}

/**
 * Asocia esta instalación al usuario que acaba de autenticarse. Llamar tras
 * cada login exitoso (ver AuthContext.jsx / checkUserAuth).
 */
export function syncPushIdentity(userId) {
  if (!userId) return;
  whenNativeReady(() => {
    getOneSignal()?.login(String(userId));
  });
}

/**
 * Desvincula la instalación del usuario al cerrar sesión — imprescindible
 * en dispositivos compartidos (el ordenador o móvil de la familia en un
 * viaje conjunto): sin esto, el siguiente que inicie sesión en el mismo
 * teléfono seguiría recibiendo los push del usuario anterior.
 */
export function clearPushIdentity() {
  whenNativeReady(() => {
    getOneSignal()?.logout();
  });
}
