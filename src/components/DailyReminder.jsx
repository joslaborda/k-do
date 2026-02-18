import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';

export default function DailyReminder() {
  const [permission, setPermission] = useState(Notification.permission);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isEnabled = localStorage.getItem('dailyReminderEnabled') === 'true';
    setEnabled(isEnabled);

    if (isEnabled && permission === 'granted') {
      scheduleDaily();
    }
  }, []);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      enableReminder();
    }
  };

  const enableReminder = () => {
    setEnabled(true);
    localStorage.setItem('dailyReminderEnabled', 'true');
    scheduleDaily();
    
    // Show confirmation
    new Notification('Recordatorio activado 📔', {
      body: 'Te recordaremos escribir en tu diario cada día a las 21:30',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    });
  };

  const disableReminder = () => {
    setEnabled(false);
    localStorage.setItem('dailyReminderEnabled', 'false');
  };

  const scheduleDaily = () => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Check if it's 21:30
      if (hours === 21 && minutes === 30) {
        const lastShown = localStorage.getItem('lastReminderShown');
        const today = now.toDateString();

        // Only show once per day
        if (lastShown !== today) {
          showReminder();
          localStorage.setItem('lastReminderShown', today);
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkTime, 60000);
    
    // Check immediately
    checkTime();

    return () => clearInterval(interval);
  };

  const showReminder = () => {
    if (permission === 'granted') {
      const notification = new Notification('Hora del diario 📔', {
        body: '¿Qué tal ha ido tu día? Escribe tu entrada del diario',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'daily-diary-reminder',
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = '/Diary';
        notification.close();
      };
    }
  };

  if (permission === 'denied') {
    return (
      <div className="fixed bottom-20 right-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4 max-w-xs shadow-lg md:bottom-6">
        <div className="flex items-start gap-3">
          <BellOff className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-medium text-red-900 text-sm">Notificaciones bloqueadas</p>
            <p className="text-xs text-red-700 mt-1">Actívalas en la configuración del navegador</p>
          </div>
        </div>
      </div>
    );
  }

  if (permission === 'default') {
    return (
      <div className="fixed bottom-20 right-6 bg-white border-2 border-stone-200 rounded-2xl p-4 max-w-xs shadow-lg md:bottom-6">
        <div className="flex items-start gap-3 mb-3">
          <Bell className="w-5 h-5 text-purple-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-stone-900 text-sm">Recordatorio diario</p>
            <p className="text-xs text-stone-600 mt-1">Te avisaremos cada día a las 21:30 para escribir tu diario</p>
          </div>
        </div>
        <Button
          onClick={requestPermission}
          className="w-full bg-purple-600 hover:bg-purple-700 text-sm"
          size="sm"
        >
          <Bell className="w-4 h-4 mr-2" />
          Activar recordatorio
        </Button>
      </div>
    );
  }

  if (enabled) {
    return (
      <div className="fixed bottom-20 right-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-4 max-w-xs shadow-lg md:bottom-6">
        <div className="flex items-start gap-3 mb-3">
          <Bell className="w-5 h-5 text-purple-600 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <p className="font-medium text-purple-900 text-sm">Recordatorio activo</p>
            <p className="text-xs text-purple-700 mt-1">21:30 todos los días 📔</p>
          </div>
        </div>
        <Button
          onClick={disableReminder}
          variant="outline"
          className="w-full border-purple-300 text-purple-700 hover:bg-purple-100 text-sm"
          size="sm"
        >
          <BellOff className="w-4 h-4 mr-2" />
          Desactivar
        </Button>
      </div>
    );
  }

  if (permission === 'granted' && !enabled) {
    return (
      <div className="fixed bottom-20 right-6 bg-white border-2 border-stone-200 rounded-2xl p-4 max-w-xs shadow-lg md:bottom-6">
        <div className="flex items-start gap-3 mb-3">
          <Bell className="w-5 h-5 text-stone-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-stone-900 text-sm">Recordatorio diario</p>
            <p className="text-xs text-stone-600 mt-1">Activa el recordatorio a las 21:30</p>
          </div>
        </div>
        <Button
          onClick={enableReminder}
          className="w-full bg-purple-600 hover:bg-purple-700 text-sm"
          size="sm"
        >
          <Bell className="w-4 h-4 mr-2" />
          Activar
        </Button>
      </div>
    );
  }

  return null;
}