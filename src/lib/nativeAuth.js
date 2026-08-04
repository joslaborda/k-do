import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { appParams } from '@/lib/app-params';

const CALLBACK_URL = 'com.kaikodo.app://auth-callback';

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

// Construye a mano la URL de login social que el SDK de base44 generaría
// con auth.loginWithProvider(provider, fromUrl) (ver auth.js del SDK,
// metodo loginWithProvider) en vez de dejar que el SDK navegue el solo
// (hace window.location.href, que dentro de un WebView de Capacitor
// simplemente cargaria el flujo de OAuth de Google DENTRO de la propia
// app -- Google bloquea el login OAuth embebido en WebViews por politica,
// asi que en nativo hace falta abrirlo en un navegador in-app real, exacto
// igual que ya hacemos para el login por email/password en
// openNativeLogin() de arriba). El resultado final (redirect de vuelta a
// fromUrl con ?access_token=... en la query) es identico al flujo de
// email/password, asi que reutiliza el mismo relay
// (relayNativeLoginIfNeeded / listenForLoginCallback) sin ningun cambio.
export async function openProviderLogin(provider = 'google') {
    if (!isNative()) return;
    const returnUrl = `${appParams.appBaseUrl}/`;
    const providerPath = provider === 'google' ? '' : `/${provider}`;
    const loginUrl = `${appParams.appBaseUrl}/api/apps/auth${providerPath}/login?app_id=${appParams.appId}&from_url=${encodeURIComponent(returnUrl)}`;
    try {
        await Browser.open({ url: loginUrl });
    } catch {}
}

function buildCallbackUrl(token) {
    return `${CALLBACK_URL}?access_token=${encodeURIComponent(token)}`;
}

// Pantalla real con boton que el usuario toca para volver a la app.
//
// Build #8 (localStorage) y build #9 (sin marcador, salto automatico via
// location.href / click() sintetico) se probaron en dispositivo real y el
// resultado fue identico en los dos: la app se queda funcionando dentro del
// navegador in-app en vez de devolver el control a la app nativa. Un salto
// disparado por codigo (sin que el usuario haya tocado nada) es lo unico
// que cambiaba entre intentos, y en los dos casos fallo igual -- eso apunta
// a que iOS/Safari puede estar bloqueando el salto a un esquema
// personalizado (com.kaikodo.app://...) precisamente por no venir de un
// toque real del usuario (comportamiento conocido de Safari/
// SFSafariViewController para evitar redirecciones-spam). Por eso ahora,
// ademas de intentarlo automaticamente por si acaso, mostramos una pantalla
// con un boton real (ver showReturnToAppScreen) ademas del intento automatico.
function showReturnToAppScreen(token, onFallback) {
    const callbackUrl = buildCallbackUrl(token);
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;background:#faf7f2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:24px;text-align:center;';

const title = document.createElement('div');
    title.textContent = 'kōdo';
    title.style.cssText = 'font-size:30px;font-weight:600;color:#181818;letter-spacing:-0.02em;';

const msg = document.createElement('div');
    msg.textContent = 'Sesión iniciada. Toca el botón para volver a la app.';
    msg.style.cssText = 'font-size:15px;color:#555;max-width:280px;';

const btn = document.createElement('button');
    btn.textContent = 'Volver a la app';
    btn.style.cssText = 'background:#c1541f;color:#fff;border:none;border-radius:999px;padding:14px 30px;font-size:16px;font-weight:600;';

const debug = document.createElement('div');
    debug.style.cssText = 'position:fixed;bottom:8px;left:8px;right:8px;font-size:10px;color:#999;word-break:break-all;';
    debug.textContent = `debug: token=${token.slice(0, 10)}… native=${isNative()}`;

let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (onFallback) onFallback();
    };

btn.onclick = () => {
    window.location.href = callbackUrl;
    setTimeout(finish, 1500);
};

overlay.appendChild(title);
    overlay.appendChild(msg);
    overlay.appendChild(btn);
    overlay.appendChild(debug);
    document.body.appendChild(overlay);

// Red de seguridad: si el usuario no toca nada, montamos la app igual
// pasados unos segundos en vez de dejarla bloqueada para siempre.
setTimeout(finish, 15000);
}

// Se llama al arrancar la app (main.jsx), antes de montar React.
//
// Historial de intentos en dispositivo real, todos con el mismo sintoma
// final (la app se queda funcionando dentro del navegador in-app):
//  - build #7/#8: dependian de que sobreviviera un marcador propio
//    (?native_login=1) en el redirect de base44 -- no sobrevive.
//  - build #9: salto automatico (location.href y luego click() sintetico en
//    un <a>) nada mas detectar el token en localStorage, sin depender de
//    ningun marcador -- tampoco funciono.
// La automatizacion total (sin ningun toque del usuario) es el factor comun
// a los tres intentos fallidos, asi que esta version anade una pantalla con
// un boton real (ver showReturnToAppScreen) ademas del intento automatico.
export function relayNativeLoginIfNeeded(onFallback) {
    if (typeof window === 'undefined') return false;
    if (isNative()) return false;
    // El editor/vista previa de base44 carga la app dentro de un <iframe>
    // (id="preview-iframe"). El flujo de "toca para volver a la app" solo
    // tiene sentido cuando estamos en la pestaña de nivel superior tras
    // volver del navegador in-app de Capacitor -- un iframe nunca es ese
    // caso. Sin este guard, si quedaba un base44_access_token viejo en el
    // localStorage de ese origen (p. ej. por haber iniciado sesion alli
    // alguna vez durante pruebas), cada vez que se abria la vista previa
    // dentro del editor se montaba la pantalla de "Volver a la app" a
    // pantalla completa y se retrasaba el montaje de React hasta 15s -- y
    // como esa pantalla vive DENTRO del iframe, el editor de base44 (que
    // espera una señal de "listo" del iframe) se quedaba mostrando
    // "Cargando tu app..." indefinidamente por fuera, sin que el usuario
    // viera boton alguno que tocar.
    if (window.self !== window.top) return false;
    const token = localStorage.getItem('base44_access_token');
    if (!token) return false;
    // Intento automatico primero, por si en este dispositivo/version de iOS
// si funciona sin toque -- si no funciona, el usuario vera la pantalla
// con el boton igualmente.
try {
    window.location.href = buildCallbackUrl(token);
} catch {}
    showReturnToAppScreen(token, onFallback);
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
