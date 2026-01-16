import { useState, useEffect, useMemo, useCallback } from 'react';
import { useIndexedDB } from './useIndexedDB';

export function useMaterials() {
    const {
        isReady,
        getAllMaterials,
        getCategories,
        searchMaterials,
        updateMaterialPrice
    } = useIndexedDB();

    const [materials, setMaterials] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Load initial data
    useEffect(() => {
        if (!isReady) return;

        async function loadData() {
            setIsLoading(true);
            try {
                const [mats, cats] = await Promise.all([
                    getAllMaterials(),
                    getCategories()
                ]);
                setMaterials(mats);
                setCategories(cats);
            } catch (err) {
                console.error('Failed to load materials:', err);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, [isReady, getAllMaterials, getCategories]);

    // Filtered materials based on search and category
    const filteredMaterials = useMemo(() => {
        let result = materials;

        // Filter by category
        if (selectedCategory) {
            result = result.filter(m => m.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(m =>
                m.name.toLowerCase().includes(query) ||
                m.unit.toLowerCase().includes(query)
            );
        }

        return result;
    }, [materials, selectedCategory, searchQuery]);

    // Update price handler
    const handlePriceUpdate = useCallback(async (materialId, prices, notes) => {
        const updated = await updateMaterialPrice(materialId, prices, notes);
        if (updated) {
            setMaterials(prev =>
                prev.map(m => m.id === materialId ? updated : m)
            );
        }
        return updated;
    }, [updateMaterialPrice]);

    // Refresh materials from DB
    const refreshMaterials = useCallback(async () => {
        if (!isReady) return;
        const mats = await getAllMaterials();
        setMaterials(mats);
    }, [isReady, getAllMaterials]);

    return {
        materials: filteredMaterials,
        allMaterials: materials,
        categories,
        isLoading,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        updatePrice: handlePriceUpdate,
        refreshMaterials,
    };
}

export default useMaterials;
