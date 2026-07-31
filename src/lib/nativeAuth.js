import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { appParams } from '@/lib/app-params';

const CALLBACK_URL = 'com.kodotravel.app://auth-callback';

export function isNative() {
  return Capacitor.isNativePlatform();
}

export async function openNativeLogin() {
  if (!isNative()) return;
  // from_url debe ser https del propio dominio: base44 ignora en silencio
      // un from_url con esquema personalizado y deja al usuario logueado
      // dentro del propio navegador in-app en vez de devolver el control a la
      // app nativa. Volvemos a nuestra propia app con ?native_login=1 —
      // relayNativeLoginIfNeeded() (más abajo) detecta ese parámetro nada más
      // cargar y salta al esquema personalizado desde JS, ya con el token.
      const returnUrl = `${appParams.appBaseUrl}/?native_login=1`;
  const loginUrl = `${appParams.appBaseUrl}/login?from_url=${encodeURIComponent(returnUrl)}`;
  try {
    await Browser.open({ url: loginUrl });
  } catch {}
}

// Se llama al arrancar la app (main.jsx), antes de montar React. Cuando el
// navegador in-app (Browser.open, ver openNativeLogin) vuelve a nuestra
// propia web tras el login con ?native_login=1&access_token=..., esta
// función intercepta y redirige de inmediato al esquema personalizado
// (com.kodotravel.app://auth-callback) — iOS reconoce ese esquema
// (registrado en Info.plist) y le pasa el control a la app nativa, que lo
// recoge en listenForLoginCallback. Sin esto, el usuario se quedaba
// logueado dentro del propio navegador in-app en vez de volver a la app.
export function relayNativeLoginIfNeeded() {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('native_login') !== '1') return false;
        // El SDK de base44 (app-params.js, importado arriba en este mismo
      // fichero) ya ha leido access_token de la URL y lo ha borrado con
      // removeFromUrl:true nada mas cargarse -- import { appParams } se
      // ejecuta antes de que esta funcion llegue a correr, asi que para
      // entonces ya no esta en location.search. base44 lo deja guardado en
      // localStorage['base44_access_token'] justo antes de borrarlo de la
      // URL, asi que lo leemos de ahi en vez de la URL.
      const token = localStorage.getItem('base44_access_token');
    if (!token) return false;
    window.location.href = `${CALLBACK_URL}?access_token=${encodeURIComponent(token)}`;
    return true;
}

export function listenForLoginCallback(onToken) {
  if (!isNative()) return () => {};
  const handlePromise = App.addListener('appUrlOpen', ({ url }) => {
    if (!url || !url.startsWith(CALLBACK_URL)) return;
    try {
      const parsed = new URL(url);
      const token = parsed.searchParams.get('access_token');
      if (token) {
        Browser.close().catch(() => {});
        onToken(token);
      }
    } catch {}
  });
  return () => {
    handlePromise.then(handle => handle.remove()).catch(() => {});
  };
}
