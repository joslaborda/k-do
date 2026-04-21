import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import VerifyEmail from './pages/VerifyEmail';
import CreateProfile from './pages/CreateProfile';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useUserProfile } from '@/hooks/useUserProfile';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user } = useAuth();
  const [authUser, setAuthUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const { profile, isLoading: profileLoading, refetch: refetchProfile } = useUserProfile(authUser?.id);

  useEffect(() => {
    if (!isLoadingAuth && !authError) {
      base44.auth.me().then((u) => { setAuthUser(u); setUserLoaded(true); }).catch(() => setUserLoaded(true));
    } else if (!isLoadingAuth) {
      setUserLoaded(true);
    }
  }, [isLoadingAuth, authError]);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth || !userLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  // Gate 1: Email not verified
  if (authUser && authUser.is_verified === false) {
    return <VerifyEmail />;
  }

  // Gate 2: No profile yet — force onboarding
  if (authUser && !profileLoading && profile === null) {
    return <CreateProfile user={authUser} onCreated={() => refetchProfile()} />;
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
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
      {/* New account pages — outside pagesConfig loop, no Layout nav */}
      <Route path="/Profile" element={<Profile />} />
      <Route path="/Settings" element={<Settings />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App