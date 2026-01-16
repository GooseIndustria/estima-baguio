import './styles/index.css';
import './styles/components.css';

import { EstimateProvider } from './context/EstimateContext';
import { useMaterials } from './hooks/useMaterials';
import MaterialSearch from './components/MaterialSearch';
import MaterialList from './components/MaterialList';
import LineItems from './components/LineItems';
import EstimateSummary from './components/EstimateSummary';

function AppContent() {
  const {
    materials,
    categories,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useMaterials();

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">
            <span>📐</span> Estima <span>Baguio</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <MaterialSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <LineItems />

        <MaterialList
          materials={materials}
          isLoading={isLoading}
        />
      </main>

      {/* Summary Footer */}
      <EstimateSummary />
    </>
  );
}

function App() {
  return (
    <EstimateProvider>
      <AppContent />
    </EstimateProvider>
  );
}

export default App;
