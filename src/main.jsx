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

if (!relayNativeLoginIfNeeded()) {
    ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
}
