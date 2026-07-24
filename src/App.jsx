import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import TripsList from './pages/TripsList';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/index.js';

const { Pages, Layout } = pagesConfig;
const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const [authUser, setAuthUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && !authError) {
      base44.auth.me().then((u) => { setAuthUser(u); setUserLoaded(true); }).catch(() => setUserLoaded(true));
    } else if (!isLoadingAuth) {
      setUserLoaded(true);
    }
  }, [isLoadingAuth, authError]);

  // Efecto secundario (navegar fuera de la app) movido a un useEffect en vez
  // de dispararse directamente en el cuerpo del render (ver el `if` de abajo
  // que comprueba authError.type === 'auth_required').
  useEffect(() => {
    if (authError?.type === 'auth_required') {
      navigateToLogin();
    }
  }, [authError, navigateToLogin]);

  // Migración silenciosa: mantener UserProfile.email en minúsculas y al día.
  useEffect(() => {
    if (!authUser?.id || !authUser?.email) return;
    const correctEmail = authUser.email.toLowerCase();
    base44.entities.UserProfile.filter({ user_id: authUser.id }).then(results => {
      const prof = results?.[0];
      // invites.js/NotificationBell/Invites.jsx siempre comparan y filtran
      // email en minúsculas — antes esto solo corregía perfiles SIN email
      // (`!prof.email`), pero un perfil que ya tuviera el email guardado con
      // mayúsculas (p. ej. backfileado antes de este fix, o si el proveedor
      // de auth lo cambia) se quedaba mal para siempre: la condición nunca
      // volvía a cumplirse. Se corrige cualquier desajuste, no solo el vacío.
      if (prof && prof.email !== correctEmail) {
        base44.entities.UserProfile.update(prof.id, { email: correctEmail }).catch(() => {});
      }
    }).catch(() => {});
  }, [authUser?.id, authUser?.email]);

  if (isLoadingPublicSettings || isLoadingAuth || !userLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // navigateToLogin() se dispara en el useEffect de arriba, no aquí:
      // llamarlo directamente en el cuerpo del render es un efecto
      // secundario durante el render (anti-patrón en React) que podía
      // dispararse más de una vez en renders intermedios antes de que el
      // navegador abandonara la página.
      return null;
    }
  }

  // Gate: Email not verified (VerifyEmail is in pagesConfig, but we intercept here for auth flow)
  if (authUser && authUser.is_verified === false) {
    const VerifyEmailPage = Pages['VerifyEmail'];
    return VerifyEmailPage ? <VerifyEmailPage /> : null;
  }

  return (
    <Routes>
      <Route path="/" element={<LayoutWrapper currentPageName="TripsList"><TripsList /></LayoutWrapper>} />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    if (i18n.isInitialized) {
      setI18nReady(true);
    } else {
      i18n.on('initialized', () => setI18nReady(true));
    }
  }, []);

  // El modo oscuro (useDarkMode, en components/hooks/useDarkMode.jsx) solo
  // aplica la clase "dark" al <html> mientras <DarkModeToggle> está montado,
  // y ese componente solo vive dentro de Settings.jsx. Resultado: activar
  // "Modo oscuro" ahí lo mostraba oscuro SOLO en esa pantalla — en cualquier
  // otra página (Home, Ruta, Gastos...) o tras recargar, la preferencia
  // guardada en localStorage nunca se leía, así que todo volvía a claro.
  // Aplicamos la preferencia guardada aquí, en el nodo raíz siempre montado,
  // para que se respete en toda la app desde el primer render.
  useEffect(() => {
    try {
      const stored = localStorage.getItem('darkMode');
      const isDark = stored ? JSON.parse(stored) : false;
      window.document.documentElement.classList.toggle('dark', !!isDark);
    } catch {
      // localStorage inaccesible (modo privado, etc.) — se queda en claro.
    }
  }, []);

  if (!i18nReady) return null;

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <NavigationTracker />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </I18nextProvider>
  )
}

export default App