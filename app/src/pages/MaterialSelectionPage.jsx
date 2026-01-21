import { useMaterials } from '../hooks/useMaterials';
import { useProject } from '../context/ProjectContext';
import { useNavigation } from '../context/NavigationContext';
import MaterialSearch from '../components/MaterialSearch';
import MaterialList from '../components/MaterialList';

export function MaterialSelectionPage() {
    const {
        materials,
        categories,
        sources,
        isLoading,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedSource,
        setSelectedSource,
    } = useMaterials();

    const { lineItems } = useProject();
    const { navigateTo, PAGES } = useNavigation();

    const itemCount = lineItems.length;

    return (
        <>
            <main className="main-content">
                <MaterialSearch
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    sources={sources}
                    selectedSource={selectedSource}
                    setSelectedSource={setSelectedSource}
                />

                <MaterialList
                    materials={materials}
                    isLoading={isLoading}
                />
            </main>

            {/* Floating button to view estimate */}
            {itemCount > 0 && (
                <button
                    className="floating-estimate-btn"
                    onClick={() => navigateTo(PAGES.ESTIMATE)}
                >
                    <span className="estimate-btn-icon">📋</span>
                    <span className="estimate-btn-text">View Estimate</span>
                    <span className="estimate-btn-count">{itemCount}</span>
                </button>
            )}
        </>
    );
}

export default MaterialSelectionPage;
