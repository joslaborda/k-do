import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, MapPin, Plane, UtensilsCrossed, Receipt, BookOpen, Package, Info } from 'lucide-react';

const navItems = [
  { name: 'Inicio', page: 'Home', icon: Home },
  { name: 'Ruta', page: 'Cities', icon: MapPin },
  { name: 'Docs', page: 'Tickets', icon: Plane },
  { name: 'Yummy', page: 'Restaurants', icon: UtensilsCrossed },
  { name: 'Gastos', page: 'Expenses', icon: Receipt },
  { name: 'Diario', page: 'Diary', icon: BookOpen },
  { name: 'Maleta', page: 'Packing', icon: Package },
  { name: 'Útil', page: 'Utilities', icon: Info },
];

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-stone-50">
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