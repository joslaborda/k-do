import { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, MapPin, Calendar, UtensilsCrossed, Receipt, Package, Info, Languages, BookOpen } from 'lucide-react';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import OfflineIndicator from '@/components/OfflineIndicator';
import SyncIndicator from '@/components/SyncIndicator';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const navItems = [
  { name: 'Inicio', page: 'Home', icon: Home },
  { name: 'Ruta', page: 'Cities', icon: MapPin },
  { name: 'Docs', page: 'Calendar', icon: Calendar },
  { name: 'Yummy', page: 'Restaurants', icon: UtensilsCrossed },
  { name: 'Gastos', page: 'Expenses', icon: Receipt },
  { name: 'Útil', page: 'Utilities', icon: Info },
  { name: 'Diario', page: 'Diary', icon: BookOpen },
];

export default function Layout({ children, currentPageName }) {
  const [tripId, setTripId] = useState(null);

  // Obtener el viaje a Japón automáticamente
  const { data: trip } = useQuery({
    queryKey: ['japanTrip'],
    queryFn: async () => {
      const trips = await base44.entities.Trip.list();
      let japanTrip = trips.find(t => t.destination?.toLowerCase().includes('japón') || t.destination?.toLowerCase().includes('japan'));
      
      // Si no existe, crear el viaje a Japón
      if (!japanTrip) {
        japanTrip = await base44.entities.Trip.create({
          name: 'Japón 2026',
          destination: 'Tokio',
          country: 'Japón',
          start_date: '2026-03-04',
          end_date: '2026-03-19',
          description: 'Una aventura única de 16 días explorando la cultura, tradición y gastronomía japonesa',
          currency: 'JPY',
          members: [(await base44.auth.me()).email]
        });
      }
      return japanTrip;
    },
  });

  useEffect(() => {
    if (trip?.id) {
      setTripId(trip.id);
    }
  }, [trip]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <OfflineIndicator />
      <SyncIndicator />
      <KeyboardShortcuts />
      {children}
      
      {/* Bottom Navigation - Mobile */}
      {tripId && (
        <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border md:hidden z-50">
          <div className="flex items-center justify-around px-1 py-2 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page || 
                (item.page === 'Cities' && currentPageName === 'CityDetail');
              const linkUrl = createPageUrl(`${item.page}?trip_id=${tripId}`);
              return (
                <Link
                  key={item.page}
                  to={linkUrl}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors flex-shrink-0 ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9px] font-medium whitespace-nowrap">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Side Navigation - Desktop */}
      {tripId && (
        <nav className="fixed left-0 top-0 bottom-0 w-16 glass border-r border-border hidden md:flex flex-col items-center py-8 z-50">
          <Link to={createPageUrl(`Home?trip_id=${tripId}`)} className="text-3xl mb-12 hover:scale-110 transition-transform cursor-pointer" title="Inicio">
            🌸
          </Link>
          
          <div className="flex-1 flex flex-col items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page || 
                (item.page === 'Cities' && currentPageName === 'CityDetail');
              const linkUrl = createPageUrl(`${item.page}?trip_id=${tripId}`);
              return (
                <Link
                  key={item.page}
                  to={linkUrl}
                  className={`group flex flex-col items-center gap-1 p-2.5 rounded-lg transition-all ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9px] font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Keyboard shortcuts hint */}
      {tripId && (
        <div className="hidden md:block fixed bottom-4 left-20 text-xs text-muted-foreground glass px-3 py-2 rounded-lg shadow-sm border border-border">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-foreground">⌘K</kbd> Buscar
        </div>
      )}

      {/* Content padding for desktop nav */}
      {tripId && (
        <style>{`
          @media (min-width: 768px) {
            .min-h-screen {
              margin-left: 64px;
            }
          }
          @media (max-width: 767px) {
            .min-h-screen {
              padding-bottom: 80px;
            }
          }
        `}</style>
      )}
    </div>
  );
}