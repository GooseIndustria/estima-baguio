import './styles/index.css';
import './styles/components.css';

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
    <>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          {isInProject ? (
            <ProjectHeader />
          ) : (
            <h1 className="header-title">
              <span>📐</span> ESTIMA <span>- Baguio City Prices</span>
            </h1>
          )}
        </div>
      </header>

      {/* Render current page */}
      {currentPage === PAGES.PROJECTS && <ProjectsPage />}
      {currentPage === PAGES.MATERIALS && <MaterialSelectionPage />}
      {currentPage === PAGES.ESTIMATE && <EstimatePage />}
    </>
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
