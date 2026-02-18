import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, MapPin, Plane, UtensilsCrossed, Receipt } from 'lucide-react';

const navItems = [
  { name: 'Home', page: 'Home', icon: Home },
  { name: 'Cities', page: 'Cities', icon: MapPin },
  { name: 'Tickets', page: 'Tickets', icon: Plane },
  { name: 'Restaurants', page: 'Restaurants', icon: UtensilsCrossed },
  { name: 'Expenses', page: 'Expenses', icon: Receipt },
];

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
      
      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page || 
              (item.page === 'Cities' && currentPageName === 'CityDetail');
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                  isActive 
                    ? 'text-slate-900 bg-slate-100' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Side Navigation - Desktop */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-slate-200 hidden md:flex flex-col items-center py-6 z-50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center mb-8">
          <span className="text-white font-bold text-lg">🇯🇵</span>
        </div>
        
        <div className="flex-1 flex flex-col items-center gap-2">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page || 
              (item.page === 'Cities' && currentPageName === 'CityDetail');
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`group flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Content padding for desktop nav */}
      <style>{`
        @media (min-width: 768px) {
          .min-h-screen {
            margin-left: 80px;
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