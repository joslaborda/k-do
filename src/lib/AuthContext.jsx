import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';
import { queryClientInstance, clearPersistedQueryCache, AUTH_EXPIRED_EVENT } from '@/lib/query-client';
import { syncPushIdentity, clearPushIdentity } from '@/lib/pushNotifications';
import { isNative, openNativeLogin, listenForLoginCallback } from '@/lib/nativeAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    checkAppState();
  }, []);

  // Recibe la vuelta del login nativo (ver src/lib/nativeAuth.js): al llegar
  // el access_token via appUrlOpen, lo guardamos y volvemos a comprobar el
  // estado de auth para que se comporte igual que una carga inicial con token.
  useEffect(() => {
      return listenForLoginCallback((token) => {
            appParams.token = token;
            base44.auth.setToken(token);
            checkAppState();
      });
  }, []);

  // Antes la sesión solo se comprobaba una vez al cargar la app — sin esto,
  // si el token caducaba mientras la app seguía abierta (habitual en un
  // viaje largo, horas con la app abierta y conexión intermitente), las
  // peticiones empezaban a fallar con 401/403 pero el estado interno seguía
  // marcando al usuario como conectado: las pantallas se quedaban vacías o
  // rotas sin ningún aviso ni redirección al login. query-client.js dispara
  // este evento desde su QueryCache/MutationCache en cuanto detecta un
  // 401/403 en cualquier petición.
  useEffect(() => {
    const onAuthExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      queryClientInstance.clear();
      clearPersistedQueryCache();
      // Reutiliza el mismo gate que ya existe en App.jsx (AuthenticatedApp)
      // para authError.type === 'auth_required': ese render llama a
      // navigateToLogin() automáticamente.
      setAuthError({ type: 'auth_required', message: 'Session expired' });
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      // First, check app public settings (with token if available)
      // This will tell us if auth is required, user not registered, etc.
      const appClient = createAxiosClient({
        baseURL: `${(appParams.appBaseUrl || '')}/api/apps/public`,
        headers: {
          'X-App-Id': appParams.appId
        },
        token: appParams.token, // Include token if available
        interceptResponses: true
      });
      
      try {
        const publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
        setAppPublicSettings(publicSettings);
        
        // If we got the app public settings successfully, check if user is authenticated
        if (appParams.token) {
          await checkUserAuth();
        } else {
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
          setAuthError({ type: 'auth_required', message: 'Authentication required' });
        }
        setIsLoadingPublicSettings(false);
      } catch (appError) {
        console.error('App state check failed:', appError);
        
        // Handle app-level errors
        if (appError.status === 403 && appError.data?.extra_data?.reason) {
          const reason = appError.data.extra_data.reason;
          if (reason === 'auth_required') {
            // Mismo motivo que en checkUserAuth: este catch también es un
            // camino real de "token caducado" (falla ya en la comprobación
            // de public-settings, antes incluso de llegar a auth.me()) y
            // antes no limpiaba la caché de React Query.
            queryClientInstance.clear();
            clearPersistedQueryCache();
            setAuthError({
              type: 'auth_required',
              message: 'Authentication required'
            });
          } else if (reason === 'user_not_registered') {
            setAuthError({
              type: 'user_not_registered',
              message: 'User not registered for this app'
            });
          } else {
            setAuthError({
              type: reason,
              message: appError.message
            });
          }
        } else {
          setAuthError({
            type: 'unknown',
            message: appError.message || 'Failed to load app'
          });
        }
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred'
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      // Now check if the user is authenticated
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      // No-op fuera de la app nativa (Capacitor) — ver pushNotifications.js.
      // Asocia este dispositivo al usuario en OneSignal para que
      // createNotification (backend) pueda enviarle push dirigidos por
      // external_id sin que tengamos que guardar ningún token aquí.
      syncPushIdentity(currentUser.id);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);

      // If user auth fails, it might be an expired token
      if (error.status === 401 || error.status === 403) {
        // Antes solo se marcaba authError aquí — a diferencia de logout() y
        // del listener de AUTH_EXPIRED_EVENT, no se limpiaba la caché de
        // React Query ni la copia en localStorage. Este es justo el camino
        // más común de "token ya caducado" (se comprueba en cada carga de la
        // app, p. ej. al reabrirla tras horas de viaje sin usarla) — sin
        // limpiar aquí, un dispositivo compartido podía mostrar brevemente
        // la caché de la persona anterior al siguiente login, el mismo
        // problema que este fix decía haber cerrado en logout().
        queryClientInstance.clear();
        clearPersistedQueryCache();
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required'
        });
      } else {
        // Antes, un fallo SIN status 401/403 (típico de estar sin conexión —
        // muy plausible viajando, justo el escenario que motivó el fix de
        // arriba) no fijaba ningún authError: el estado quedaba idéntico al
        // de "sesión cerrada normal" (isAuthenticated: false, user: null,
        // authError: null), así que App.jsx renderizaba como si el usuario
        // simplemente no hubiera iniciado sesión, en vez de avisar de un
        // problema de red y ofrecer reintentar.
        setAuthError({
          type: 'network_error',
          message: error.message || 'Network error'
        });
      }
    }
  };

  const logout = useCallback((shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    // Desvincula el dispositivo en OneSignal — ver comentario en
    // pushNotifications.js sobre dispositivos compartidos entre miembros
    // del mismo viaje.
    clearPushIdentity();

    // Sin esto, la caché de react-query (viajes, gastos, mensajes, fotos...)
    // seguía en localStorage tras cerrar sesión y podía renderizarse
    // brevemente para la siguiente persona que iniciara sesión en el mismo
    // dispositivo, antes de que sus propias queries la sobrescribieran.
    queryClientInstance.clear();
    // El guardado a localStorage del persister está throttled (hasta 2s) —
    // sin este borrado síncrono, la redirección de abajo podía ganarle la
    // carrera al guardado diferido y dejar la caché anterior intacta en
    // disco pese a haber "cerrado sesión".
    clearPersistedQueryCache();

    if (isNative()) {
      // En nativo, base44.auth.logout() siempre navega (window.location.href =
      // .../auth/logout?from_url=...), lo que en el WebView de Capacitor dispara
      // el interstitial "Open this page in Kodo?" de iOS y deja la app colgada.
      // Como ya no dependemos de las paginas hospedadas de base44 para el login
      // (LoginScreen.jsx lo gestiona todo), en nativo basta con borrar el token
      // localmente -- sin navegacion -- y dejar que el cambio de estado de React
      // muestre LoginScreen.
      window.localStorage.removeItem('base44_access_token');
      window.localStorage.removeItem('token');
      // Sin esto, la app se queda con la ruleta de carga para siempre tras el
      // logout nativo: al no navegar (ver arriba), AuthenticatedApp (App.jsx)
      // seguía montando <Routes> con el usuario ya en null, y cualquier
      // pantalla con una query gateada por user?.id (enabled: !!user?.id) se
      // quedaba pendiente sin resolver jamas. Fijar authError a 'auth_required'
      // reutiliza el mismo gate que ya usa AUTH_EXPIRED_EVENT para montar
      // LoginScreen en vez de las rutas autenticadas.
      setAuthError({ type: 'auth_required', message: 'Logged out' });
    } else if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      base44.auth.logout(window.location.href);
    } else {
      // Just remove the token without redirect
      base44.auth.logout();
    }
  }, []);

  // useCallback: sin esto, navigateToLogin era una función nueva en cada
  // render de AuthProvider. App.jsx la usa como dependencia de un useEffect
  // que llama a redirectToLogin() — con una referencia inestable, cualquier
  // re-render del provider mientras authError.type siguiera siendo
  // 'auth_required' podía re-disparar la redirección, el mismo antipatrón
  // de "efecto que se repite en renders intermedios" que ese fix corregía.
  const navigateToLogin = useCallback(() => {
if (isNative()) {
        openNativeLogin();
} else {
        base44.auth.redirectToLogin();
}
}, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
