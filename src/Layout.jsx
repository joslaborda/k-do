import { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, MapPin, Calendar, UtensilsCrossed, Receipt, BookOpen, Package, Info } from 'lucide-react';
import QuickNotes from '@/components/QuickNotes';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import OfflineIndicator from '@/components/OfflineIndicator';
import DarkModeToggle from '@/components/DarkModeToggle';
import PWAInstaller from '@/components/PWAInstaller';
import SyncIndicator from '@/components/SyncIndicator';
import DailyReminder from '@/components/DailyReminder';

const navItems = [
  { name: 'Inicio', page: 'Home', icon: Home },
  { name: 'Ruta', page: 'Cities', icon: MapPin },
  { name: 'Docs', page: 'Calendar', icon: Calendar },
  { name: 'Yummy', page: 'Restaurants', icon: UtensilsCrossed },
  { name: 'Gastos', page: 'Expenses', icon: Receipt },
  { name: 'Diario', page: 'Diary', icon: BookOpen },
  { name: 'Útil', page: 'Utilities', icon: Info },
];

export default function Layout({ children, currentPageName }) {
  const quickNotesRef = useRef();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 transition-colors">
      <OfflineIndicator />
      <PWAInstaller />
      <SyncIndicator />
      <QuickNotes ref={quickNotesRef} />
      <KeyboardShortcuts onNewNote={() => quickNotesRef.current?.openNotes()} />
      <DarkModeToggle />
      <DailyReminder />
      {children}
      
      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 md:hidden z-50">
        <div className="flex items-center justify-around px-1 py-2 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page || 
              (item.page === 'Cities' && currentPageName === 'CityDetail');
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors flex-shrink-0 ${
                  isActive 
                    ? 'text-red-600' 
                    : 'text-stone-500'
                }`}
              >
                <item.icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-medium whitespace-nowrap">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Side Navigation - Desktop */}
      <nav className="fixed left-0 top-0 bottom-0 w-16 bg-white border-r border-stone-200 hidden md:flex flex-col items-center py-8 z-50">
        <div className="text-3xl mb-12">🌸</div>
        
        <div className="flex-1 flex flex-col items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page || 
              (item.page === 'Cities' && currentPageName === 'CityDetail');
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`group flex flex-col items-center gap-1 p-2.5 rounded-lg transition-all ${
                  isActive 
                    ? 'text-red-600' 
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Keyboard shortcuts hint */}
      <div className="hidden md:block fixed bottom-4 left-20 text-xs text-stone-400 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-sm border border-stone-200">
        <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-stone-600">Alt+N</kbd> Nueva nota
        {' • '}
        <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-stone-600">⌘K</kbd> Buscar
      </div>

      {/* Content padding for desktop nav */}
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
    </div>
  );
}