import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, FileText, Compass, Receipt, MoreHorizontal, MapPin, Languages, Info, User, X , CalendarDays } from 'lucide-react';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import OfflineIndicator from '@/components/OfflineIndicator';
import SyncIndicator from '@/components/SyncIndicator';

// ── Nav principal del viaje — los 4 que más se usan ──────────────────────────
const mainNavItems = [
  { name: 'Inicio',  page: 'Home',      icon: Home     },
  { name: 'Docs',    page: 'Documents', icon: FileText  },
  { name: 'Spots',   page: 'Restaurants', icon: Compass },
  { name: 'Gastos',  page: 'Expenses',  icon: Receipt   },
];

// ── Drawer: el resto de páginas del viaje ─────────────────────────────────────
const drawerItems = [
  { name: 'Ruta',      page: 'Cities',     icon: MapPin,   sub: 'Ciudades e itinerario' },
  { name: 'Calendario',page: 'Calendar',   icon: CalendarDays, sub: 'Itinerario visual'  },
  { name: 'Traducir',  page: 'Translator', icon: Languages, sub: 'Voz, texto e imagen'  },
  { name: 'Utilidades',page: 'Utilities',  icon: Info,     sub: 'Embajadas, emergencias'},
];

// ── Nav global (fuera del viaje) ──────────────────────────────────────────────
const globalNavItems = [
  { name: 'Viajes', page: 'TripsList', icon: Home },
  { name: 'Perfil', page: 'Profile',   icon: User },
];

const pagesWithoutNav = ['MigrateData', 'TripsList', 'Explore', 'Profile'];
const globalPages     = ['Explore', 'Settings'];
const tripOnlyPages   = ['Home', 'Cities', 'CityDetail', 'Documents', 'Restaurants',
                         'Expenses', 'Utilities', 'Translator', 'Packing', 'Diary', 'Calendar'];

export default function Layout({ children, currentPageName }) {
  const getTripId = () => { const p = new URLSearchParams(window.location.search); return p.get('trip_id') || p.get('id') || null; };
  const [tripId, setTripId]       = useState(() => getTripId());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  const showNav     = !pagesWithoutNav.includes(currentPageName);
  const isGlobalPage = globalPages.includes(currentPageName);
  const isTripPage   = tripOnlyPages.includes(currentPageName);
  const showTripNav  = isTripPage && !!tripId;
  const showGlobalNav = isGlobalPage;

  // Active state — also highlight "Más" when a drawer page is active
  const isDrawerPageActive = drawerItems.some(d =>
    currentPageName === d.page || (d.page === 'Cities' && currentPageName === 'CityDetail')
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setDrawerOpen(false);
  }, [currentPageName]);

  useEffect(() => {
    setTripId(getTripId());
  }, [currentPageName]);

  // Close drawer on outside tap
  useEffect(() => {
    if (!drawerOpen) return;
    const handle = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [drawerOpen]);

  const tripUrl = (page) => createPageUrl(`${page}?trip_id=${tripId}`);

  return (
    <div className="min-h-screen bg-[#f8f6f3] text-foreground overflow-x-hidden">
      <OfflineIndicator />
      <SyncIndicator />
      <KeyboardShortcuts />
      {children}

      {/* ── Drawer overlay backdrop ─────────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Drawer panel ────────────────────────────────────────────────── */}
      {showNav && showTripNav && (
        <div
          ref={drawerRef}
          className={`fixed bottom-[76px] left-4 right-4 z-50 md:hidden transition-all duration-200 ${
            drawerOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Más herramientas</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            {drawerItems.map((item) => {
              const isActive = currentPageName === item.page ||
                (item.page === 'Cities' && currentPageName === 'CityDetail');
              return (
                <Link
                  key={item.page}
                  to={tripUrl(item.page)}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 transition-colors ${
                    isActive ? 'bg-primary/5' : 'hover:bg-secondary/40'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-primary/10' : 'bg-secondary'
                  }`}>
                    <item.icon
                      className={`w-4.5 h-4.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                      style={{ width: '18px', height: '18px' }}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Bottom Navigation Mobile — pill oscura flotante ──────────────── */}
      {showNav && (showTripNav || showGlobalNav) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
          <div className="mx-3 mb-3">
            <nav className="bg-white border border-[#e8e3dc] rounded-2xl px-1 flex items-center justify-around shadow-sm">
              {showTripNav && mainNavItems.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={tripUrl(item.page)}
                    className="flex flex-col items-center flex-1 pt-2 pb-1.5 gap-1"
                  >
                    <item.icon
                      className="w-5 h-5 flex-shrink-0 transition-colors"
                      style={{color: isActive ? '#c2410c' : '#a09890'}}
                      strokeWidth={isActive ? 2.5 : 1.75}
                    />
                    <span className="text-[9px] font-medium" style={{color: isActive ? '#c2410c' : '#a09890'}}>
                      {item.name}
                    </span>
                    <div style={{height:2.5,borderRadius:2,background:isActive?'#c2410c':'transparent',width:isActive?18:0,transition:'all 0.25s cubic-bezier(.4,0,.2,1)'}} />
                  </Link>
                );
              })}

              {/* Más button */}
              {showTripNav && (
                <button
                  onClick={() => setDrawerOpen(o => !o)}
                  className="flex flex-col items-center flex-1 pt-1.5 pb-2 gap-1"
                >
                  <div style={{height:3,borderRadius:2,background:(drawerOpen||isDrawerPageActive)?'#c2410c':'transparent',width:(drawerOpen||isDrawerPageActive)?20:0,transition:'all 0.25s cubic-bezier(.4,0,.2,1)'}} />
                  <MoreHorizontal
                    className="w-5 h-5 flex-shrink-0 transition-colors"
                    style={{color: (drawerOpen||isDrawerPageActive) ? '#1a1714' : '#a09890'}}
                    strokeWidth={1.75}
                  />
                  <span className="text-[9px] font-medium" style={{color: (drawerOpen||isDrawerPageActive) ? '#1a1714' : '#a09890'}}>
                    Más
                  </span>
                </button>
              )}

              {/* Global nav items (outside trip) */}
              {showGlobalNav && globalNavItems.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className="flex flex-col items-center flex-1 pt-2 pb-1.5 gap-1"
                  >
                    <item.icon
                      className="w-5 h-5 flex-shrink-0"
                      style={{color: isActive ? '#c2410c' : '#a09890'}}
                      strokeWidth={isActive ? 2.5 : 1.75}
                    />
                    <span className="text-[9px] font-medium" style={{color: isActive ? '#c2410c' : '#a09890'}}>
                      {item.name}
                    </span>
                    <div style={{height:2.5,borderRadius:2,background:isActive?'#c2410c':'transparent',width:isActive?18:0,transition:'all 0.25s cubic-bezier(.4,0,.2,1)'}} />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* ── Side Navigation Desktop ──────────────────────────────────────── */}
      {showNav && (showTripNav || showGlobalNav) && (
        <nav className="fixed left-0 top-0 bottom-0 w-16 bg-white border-r border-[#e8e3dc] hidden md:flex flex-col items-center py-8 z-50">
          <Link
            to={createPageUrl('TripsList')}
            className="text-2xl mb-8 hover:scale-110 transition-transform"
            title="Mis viajes"
          >
            🌸
          </Link>
          <div className="flex-1 flex flex-col items-center gap-1 w-full px-1.5">
            {(showTripNav ? mainNavItems : globalNavItems).map((item) => {
              const isActive = currentPageName === item.page ||
                (item.page === 'Cities' && currentPageName === 'CityDetail');
              const linkUrl = showTripNav ? tripUrl(item.page) : createPageUrl(item.page);
              return (
                <Link
                  key={item.page}
                  to={linkUrl}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-full ${
                    isActive ? 'bg-primary/10' : 'hover:bg-secondary/40'
                  }`}
                  style={{ '--tw-bg-opacity': 1 }}
                >
                  <item.icon
                    className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={`text-[9px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
            {/* Drawer items in desktop sidebar */}
            {showTripNav && (
              <>
                <div className="w-8 h-px bg-white/10 my-1" />
                {drawerItems.map((item) => {
                  const isActive = currentPageName === item.page ||
                    (item.page === 'Cities' && currentPageName === 'CityDetail');
                  return (
                    <Link
                      key={item.page}
                      to={tripUrl(item.page)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-full ${
                        isActive ? 'bg-primary/10' : 'hover:bg-secondary/40'
                      }`}
                    >
                      <item.icon
                        className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span className={`text-[9px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </>
            )}
          </div>
          {showTripNav && (
            <Link
              to={createPageUrl('Profile')}
              className="p-2 rounded-xl text-[#6b6460] hover:text-[#f8f6f3] hover:bg-white/10 transition-colors mt-4"
            >
              <User className="w-5 h-5" />
            </Link>
          )}
        </nav>
      )}

      {showNav && (showTripNav || showGlobalNav) && (
        <style>{`
          @media (min-width: 768px) { .min-h-screen { margin-left: 64px; } }
          @media (max-width: 767px) { .min-h-screen { padding-bottom: 88px; } }
        `}</style>
      )}
    </div>
  );
}
