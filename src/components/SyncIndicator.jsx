import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, CheckCircle, WifiOff, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SyncIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      
      // Invalidate all queries to fetch fresh data
      await queryClient.invalidateQueries();
      
      setIsSyncing(false);
      setLastSync(new Date());
      
      // Hide success message after 3 seconds
      setTimeout(() => setLastSync(null), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);

  // Check what's cached
  const queryCache = queryClient.getQueryCache();
  const cachedQueries = queryCache.getAll();
  const syncedEntities = cachedQueries
    .filter(q => q.state.data)
    .map(q => q.queryKey[0])
    .filter((v, i, a) => a.indexOf(v) === i);

  return (
    <AnimatePresence>
      {(!isOnline || isSyncing || lastSync) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 md:bottom-4 left-4 z-40 max-w-xs"
        >
          <div className="bg-white/95 dark:bg-muted/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border dark:border-border p-4">
            {!isOnline && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <WifiOff className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground dark:text-white text-sm">
                    Modo offline
                  </p>
                  <p className="text-xs text-foreground dark:text-muted-foreground mt-1">
                    Datos sincronizados: {syncedEntities.length} secciones
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {syncedEntities.slice(0, 4).map((entity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-secondary dark:bg-muted rounded-full text-xs text-foreground dark:text-muted-foreground"
                      >
                        {entity}
                      </span>
                    ))}
                    {syncedEntities.length > 4 && (
                      <span className="px-2 py-0.5 bg-secondary dark:bg-muted rounded-full text-xs text-foreground dark:text-muted-foreground">
                        +{syncedEntities.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isSyncing && (
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <p className="font-semibold text-foreground dark:text-white text-sm">
                    Sincronizando...
                  </p>
                  <p className="text-xs text-foreground dark:text-muted-foreground">
                    Actualizando datos
                  </p>
                </div>
              </div>
            )}

            {lastSync && !isSyncing && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground dark:text-white text-sm">
                    Sincronizado
                  </p>
                  <p className="text-xs text-foreground dark:text-muted-foreground">
                    Todos los datos actualizados
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}