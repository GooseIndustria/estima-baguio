import './index.css';
import { ProjectProvider } from './context/ProjectContext';
import { NavigationProvider, useNavigation, PAGES } from './context/NavigationContext';
import ProjectsPage from './pages/ProjectsPage';
import MaterialSelectionPage from './pages/MaterialSelectionPage';
import EstimatePage from './pages/EstimatePage';
import ProjectHeader from './components/ProjectHeader';

function AppContent() {
  const { currentPage } = useNavigation();

  const isInProject = currentPage === PAGES.MATERIALS || currentPage === PAGES.ESTIMATE;

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* Header */}
      {isInProject ? (
        <ProjectHeader />
      ) : (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center px-4 max-w-3xl mx-auto justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">ESTIMA</span>
            </div>
            <span className="text-sm text-muted-foreground font-medium">Baguio City Prices</span>
          </div>
        </header>
      )}

      {/* Render current page */}
      <div className="animate-in fade-in zoom-in duration-300">
        {currentPage === PAGES.PROJECTS && <ProjectsPage />}
        {currentPage === PAGES.MATERIALS && <MaterialSelectionPage />}
        {currentPage === PAGES.ESTIMATE && <EstimatePage />}
      </div>

      {currentPage !== PAGES.ESTIMATE && (
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
