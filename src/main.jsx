import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import '@/i18n/index.js' // Initialize i18n before anything renders
import { initPushNotifications } from '@/lib/pushNotifications'
import { relayNativeLoginIfNeeded } from '@/lib/nativeAuth'

// No-op en web (PWA en navegador) — solo pide permiso y arranca OneSignal
// dentro del shell nativo de Capacitor. Ver src/lib/pushNotifications.js.
initPushNotifications()

function mountApp() {
    ReactDOM.createRoot(document.getElementById('root')).render(
        <App />
        )
}

// relayNativeLoginIfNeeded() intenta saltar al esquema personalizado desde
// el navegador in-app tras el login (ver src/lib/nativeAuth.js). Si lo
// consigue, no montamos React aqui — pero le pasamos mountApp como red de
// seguridad para que, si el salto no lo recoge nadie, la app se monte
// igualmente pasado un instante en vez de quedarse en blanco para siempre.
if (!relayNativeLoginIfNeeded(mountApp)) {
    mountApp()
}
