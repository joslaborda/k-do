import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function OfflineIndicator() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] px-4 py-3 flex items-center justify-center gap-2 shadow-lg transition-all duration-300 ${
        showReconnected
          ? 'bg-green-600 text-white'
          : 'bg-gray-900 text-white'
      }`}
    >
      {showReconnected ? (
        <>
          <Wifi className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">{t('offline.restored')}</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">{t('offline.offline')}</span>
        </>
      )}
    </div>
  );
}
