import './index.css';
import { ProjectProvider } from './context/ProjectContext';
import { NavigationProvider, useNavigation, PAGES } from './context/NavigationContext';
import ProjectsPage from './pages/ProjectsPage';
import MaterialSelectionPage from './pages/MaterialSelectionPage';
import EstimatePage from './pages/EstimatePage';
import HomePage from './pages/HomePage';
import FeedbackPage from './pages/FeedbackPage';
import ProjectHeader from './components/ProjectHeader';

import { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';

function AppContent() {
  const { currentPage } = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => setIsLoading(false), 800); // Wait for fade out
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return (
    <div className={`transition-opacity duration-700 ease-in-out ${isLeaving ? 'opacity-0' : 'opacity-100'}`}>
      <LoadingScreen />
    </div>
  );

  const isInProject = currentPage === PAGES.MATERIALS || currentPage === PAGES.ESTIMATE;

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* Header */}
      {/* Header */}
      {isInProject && <ProjectHeader />}

      {!isInProject && currentPage !== PAGES.HOME && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center px-4 max-w-3xl mx-auto justify-between">
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" alt="Estima Logo" className="w-5 h-5" />
              <span className="font-bold text-lg">ESTIMA</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground font-medium">Baguio City Prices</span>
              {currentPage !== PAGES.FEEDBACK && (
                <button
                  onClick={() => navigateTo(PAGES.FEEDBACK)}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Feedback
                </button>
              )}
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
      </div>

      {currentPage !== PAGES.ESTIMATE && currentPage !== PAGES.HOME && (
        <footer className="py-6 text-center text-[10px] text-muted-foreground opacity-60">
          v1.1.0 · Developed by Goose Industria
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <ProjectProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </ProjectProvider>
  );
}

export default App;
