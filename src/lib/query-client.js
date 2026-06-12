import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

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
});

// Persist cache to localStorage so data survives page reloads offline
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'kodo-query-cache',
  // Max 4MB to stay safe within localStorage limits
  throttleTime: 2000,
});

persistQueryClient({
  queryClient: queryClientInstance,
  persister: localStoragePersister,
  // Keep cache for 24 hours
  maxAge: 1000 * 60 * 60 * 24,
  // Don't persist mutation state — only query data
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      // Persist all successful queries except auth-related ones
      return query.state.status === 'success';
    },
  },
});
