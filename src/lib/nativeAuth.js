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
  // app nativa. Volvemos a nuestra propia app y dejamos que
  // relayNativeLoginIfNeeded() (mas abajo) detecte el token guardado por
  // el SDK de base44 y salte al esquema personalizado desde JS.
  const returnUrl = `${appParams.appBaseUrl}/`;
    const loginUrl = `${appParams.appBaseUrl}/login?from_url=${encodeURIComponent(returnUrl)}`;
    try {
          await Browser.open({ url: loginUrl });
    } catch {}
}

// Se llama al arrancar la app (main.jsx), antes de montar React.
//
// Version anterior: solo se intentaba el salto al esquema personalizado si
// la URL de vuelta traia ?native_login=1 (marcador que anadiamos nosotros al
// from_url). Probado en build #7 y #8 en dispositivo real: la app se
// quedaba mostrando la web completa y funcional (login correcto, viajes
// visibles) dentro del navegador in-app -- eso solo puede pasar si esta
// funcion devolvia false y dejaba que main.jsx montara React con
// normalidad, lo que confirma que base44 NO conserva parametros de query
// personalizados al redirigir de vuelta tras el login (se queda solo con
// su propio access_token).
//
// Por eso ahora no dependemos de ningun marcador que tenga que sobrevivir
// el redirect de base44: si no estamos en la app nativa real (isNative()
// false, que es el caso tanto para el navegador in-app como para un
// navegador de verdad) y hay un access_token recien guardado por el SDK de
// base44 (app-params.js, importado arriba) en localStorage, asumimos que
// estamos en el navegador in-app tras un login y saltamos al esquema
// personalizado (com.kodotravel.app://auth-callback) -- iOS lo reconoce
// (registrado en Info.plist) y le pasa el control a la app nativa, que lo
// recoge en listenForLoginCallback.
//
// Por si el salto al esquema no lo recoge nadie (p.ej. porque esto se ha
// cargado en un navegador de verdad, no en el navegador in-app), onFallback
// se llama pasado un instante para montar la app igualmente -- sin esto nos
// arriesgamos a dejar una pantalla en blanco para siempre, peor que el bug
// que intentamos arreglar.
export function relayNativeLoginIfNeeded(onFallback) {
      if (typeof window === 'undefined') return false;
      if (isNative()) return false;
      const token = localStorage.getItem('base44_access_token');
      if (!token) return false;
      // Evita reintentar el salto en bucle si esta pagina se recarga dentro
    // del navegador in-app con el mismo token (p.ej. tras un salto fallido).
    const attemptedKey = 'kodo_native_relay_attempted_token';
      if (localStorage.getItem(attemptedKey) === token) return false;
      localStorage.setItem(attemptedKey, token);
      const callbackUrl = `${CALLBACK_URL}?access_token=${encodeURIComponent(token)}`;
      try {
                // Un enlace real + click() es mas fiable que window.location.href
          // para que Safari/SFSafariViewController reconozca el esquema
          // personalizado y le pase el control a la app nativa.
          const a = document.createElement('a');
                a.href = callbackUrl;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
      } catch {
                window.location.href = callbackUrl;
      }
      if (onFallback) {
                setTimeout(onFallback, 1200);
      }
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
