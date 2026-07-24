import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Nombre del evento global que se dispara cuando cualquier query/mutation
// falla con 401/403 (token caducado a mitad de sesión — habitual en un viaje
// largo con conexión intermitente). AuthContext.jsx escucha este evento para
// forzar logout + redirección al login; antes, si el token caducaba mientras
// la app seguía abierta, las peticiones fallaban en silencio y las pantallas
// se quedaban vacías o rotas sin ningún aviso. Se dispara como CustomEvent en
// vez de importar AuthContext directamente aquí para evitar un ciclo de
// imports (AuthContext.jsx ya importa este archivo).
export const AUTH_EXPIRED_EVENT = 'kodo:auth-expired';

function isAuthError(error) {
  const status = error?.status ?? error?.response?.status ?? error?.data?.status;
  return status === 401 || status === 403;
}

function handleQueryError(error) {
  if (isAuthError(error)) {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
  }
}

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      // Cache data for 24 hours — survives reloads offline
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 5, // 5 min before refetch
    },
  },
  queryCache: new QueryCache({ onError: handleQueryError }),
  mutationCache: new MutationCache({ onError: handleQueryError }),
});

// Persist cache to localStorage so data survives page reloads offline
export const QUERY_CACHE_LS_KEY = 'kodo-query-cache';

// Nota: createSyncStoragePersister NO impone ningún límite de tamaño real —
// el comentario anterior ("Max 4MB") era aspiracional, no una comprobación
// real. Si se supera la cuota del navegador (~5-10MB típico), el guardado
// falla en silencio (sin log ni aviso) y la app deja de actualizar su copia
// offline. throttleTime evita escribir en cada cambio, pero no evita el
// fallo por cuota.
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: QUERY_CACHE_LS_KEY,
  throttleTime: 2000,
});

// logout() en AuthContext.jsx llama a queryClientInstance.clear() para
// vaciar la caché en memoria, pero el guardado a localStorage está
// throttled (hasta 2s de retraso) — si la página navega fuera antes de que
// se dispare ese guardado diferido, el contenido anterior queda intacto en
// disco pese a haber "cerrado sesión". Este helper borra la clave de
// localStorage de forma síncrona, sin depender del throttle.
export function clearPersistedQueryCache() {
  try {
    window.localStorage.removeItem(QUERY_CACHE_LS_KEY);
  } catch {
    // localStorage inaccesible (modo privado, cuota, etc.) — nada que limpiar.
  }
}

persistQueryClient({
  queryClient: queryClientInstance,
  persister: localStoragePersister,
  // Keep cache for 24 hours
  maxAge: 1000 * 60 * 60 * 24,
  // Don't persist mutation state — only query data
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      // Persist all successful queries. Auth itself isn't a react-query
      // query in this app (see AuthContext.jsx), so there's no key to
      // exclude here — the real safeguard against leaking one user's
      // cached data (trips, expenses, messages...) into the next session
      // on a shared device is clearing the whole cache on logout, done in
      // AuthContext.logout().
      return query.state.status === 'success';
    },
  },
});
