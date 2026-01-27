import './index.css';
import { ProjectProvider } from './context/ProjectContext';
import { NavigationProvider, useNavigation, PAGES } from './context/NavigationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProjectsPage from './pages/ProjectsPage';
import MaterialSelectionPage from './pages/MaterialSelectionPage';
import EstimatePage from './pages/EstimatePage';
import HomePage from './pages/HomePage';
import FeedbackPage from './pages/FeedbackPage';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, ProfilePage } from './pages/AuthPages';
import ProjectHeader from './components/ProjectHeader';

import React, { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { Download, User } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Custom Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("App Crash Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-900 text-white">
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm opacity-70 mb-4">{this.state.error?.message}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="text-black">
            Reload App
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { currentPage, navigateTo } = useNavigation();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const { isInstallable, promptInstall } = useInstallPrompt();

  console.log("App State:", { currentPage, authLoading, userHasSession: !!user, isLoading });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => setIsLoading(false), 800);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Redirect to login if accessing protected pages without auth
  useEffect(() => {
    if (authLoading) return;
    const protectedPages = [PAGES.PROJECTS, PAGES.MATERIALS, PAGES.ESTIMATE, PAGES.PROFILE, PAGES.RESET_PASSWORD];
    if (!user && protectedPages.includes(currentPage)) {
      console.log('Redirecting to login');
      navigateTo(PAGES.LOGIN);
    }
  }, [user, authLoading, currentPage, navigateTo]);

  if (isLoading || authLoading) return (
    <div className={`transition-opacity duration-700 ease-in-out ${isLeaving ? 'opacity-0' : 'opacity-100'}`}>
      <LoadingScreen />
    </div>
  );

  const isInProject = currentPage === PAGES.MATERIALS || currentPage === PAGES.ESTIMATE;
  const isAuthPage = [PAGES.LOGIN, PAGES.REGISTER, PAGES.FORGOT_PASSWORD].includes(currentPage);

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* Header */}
      {isInProject && <ProjectHeader />}

      {!isInProject && !isAuthPage && currentPage !== PAGES.HOME && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center px-4 max-w-3xl mx-auto justify-between">
            <button
              onClick={() => navigateTo(PAGES.HOME)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src="/favicon.svg" alt="Estima Logo" className="w-5 h-5" />
              <span className="font-bold text-lg">ESTIMA</span>
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground font-medium whitespace-nowrap hidden sm:inline">Baguio City Prices</span>
              <div className="flex items-center gap-2">
                {user ? (
                  <button
                    onClick={() => navigateTo(PAGES.PROFILE)}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <User className="w-5 h-5" />
                  </button>
                ) : (
                  <Button
                    onClick={() => navigateTo(PAGES.LOGIN)}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-slate-600 font-medium"
                  >
                    Log In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Render current page */}
      <div className="animate-in fade-in zoom-in duration-300">
        {currentPage === PAGES.HOME && <HomePage />}
        {currentPage === PAGES.PROJECTS && <ProjectsPage />}
        {currentPage === PAGES.MATERIALS && <MaterialSelectionPage />}
        {currentPage === PAGES.ESTIMATE && <EstimatePage />}
        {currentPage === PAGES.FEEDBACK && <FeedbackPage />}
        {currentPage === PAGES.LOGIN && <LoginPage />}
        {currentPage === PAGES.REGISTER && <RegisterPage />}
        {currentPage === PAGES.FORGOT_PASSWORD && <ForgotPasswordPage />}
        {currentPage === PAGES.RESET_PASSWORD && <ResetPasswordPage />}
        {currentPage === PAGES.PROFILE && <ProfilePage />}
      </div>

      {currentPage !== PAGES.ESTIMATE && currentPage !== PAGES.HOME && !isAuthPage && (
        <footer className="py-6 text-center space-y-4">
          {currentPage !== PAGES.FEEDBACK && (
            <button
              onClick={() => navigateTo(PAGES.FEEDBACK)}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Feedback
            </button>
          )}
          <div className="text-[10px] text-muted-foreground opacity-60">
            v1.1.0 · Developed by Goose Industria
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProjectProvider>
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </ProjectProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
