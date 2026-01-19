import './styles/index.css';
import './styles/components.css';

import { EstimateProvider } from './context/EstimateContext';
import { NavigationProvider, useNavigation, PAGES } from './context/NavigationContext';
import MaterialSelectionPage from './pages/MaterialSelectionPage';
import EstimatePage from './pages/EstimatePage';

function AppContent() {
  const { currentPage } = useNavigation();

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">
            <span>📐</span> ESTIMA <span>- Baguio City Prices</span>
          </h1>
        </div>
      </header>

      {/* Render current page */}
      {currentPage === PAGES.MATERIALS && <MaterialSelectionPage />}
      {currentPage === PAGES.ESTIMATE && <EstimatePage />}
    </>
  );
}

function App() {
  return (
    <EstimateProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </EstimateProvider>
  );
}

export default App;
