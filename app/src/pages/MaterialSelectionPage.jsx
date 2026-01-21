import { useMaterials } from '../hooks/useMaterials';
import { useProject } from '../context/ProjectContext';
import { useNavigation } from '../context/NavigationContext';
import MaterialSearch from '../components/MaterialSearch';
import MaterialList from '../components/MaterialList';
import { Button } from "@/components/ui/button";
import { ClipboardList } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

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
            <main className="container mx-auto p-4 max-w-3xl">
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
                <div className="fixed bottom-6 right-6 z-40">
                    <Button
                        size="lg"
                        className="h-14 rounded-full shadow-lg gap-2 pl-4 pr-6"
                        onClick={() => navigateTo(PAGES.ESTIMATE)}
                    >
                        <div className="relative">
                            <ClipboardList className="h-6 w-6" />
                            <Badge
                                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-white text-primary border-none shadow-sm text-xs"
                            >
                                {itemCount}
                            </Badge>
                        </div>
                        <span className="font-semibold text-lg ml-1">View Estimate</span>
                    </Button>
                </div>
            )}
        </>
    );
}

export default MaterialSelectionPage;
