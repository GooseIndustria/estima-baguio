import { openDB } from 'idb';
import { useState, useEffect, useCallback } from 'react';
import seedData from '../data/materials.json';

const DB_NAME = 'estima-baguio';
const DB_VERSION = 1;

// Initialize the database
async function initDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Materials store
            if (!db.objectStoreNames.contains('materials')) {
                const materialStore = db.createObjectStore('materials', { keyPath: 'id' });
                materialStore.createIndex('category', 'category');
                materialStore.createIndex('name', 'name');
            }

            // Categories store
            if (!db.objectStoreNames.contains('categories')) {
                db.createObjectStore('categories', { keyPath: 'id' });
            }

            // Estimates store (for saving estimate sessions)
            if (!db.objectStoreNames.contains('estimates')) {
                const estimateStore = db.createObjectStore('estimates', { keyPath: 'id' });
                estimateStore.createIndex('createdAt', 'createdAt');
            }
        },
    });
}

// Sync seed data - adds new materials, preserves user edits
async function seedDatabase(db) {
    const tx = db.transaction(['materials', 'categories'], 'readwrite');
    const materialsStore = tx.objectStore('materials');
    const categoriesStore = tx.objectStore('categories');

    // Always update categories
    for (const category of seedData.categories) {
        await categoriesStore.put(category);
    }

    // For materials: add if not exists, preserve if user has edited
    for (const material of seedData.materials) {
        const existing = await materialsStore.get(material.id);

        if (!existing) {
            // New material - add it
            await materialsStore.put(material);
        }
        // If exists, keep user's version (they may have updated prices)
    }

    await tx.done;
    console.log('Seed data synced');
}

// Hook for IndexedDB operations
export function useIndexedDB() {
    const [db, setDb] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        async function init() {
            try {
                const database = await initDB();
                await seedDatabase(database);

                if (mounted) {
                    setDb(database);
                    setIsReady(true);
                }
            } catch (err) {
                console.error('Failed to initialize database:', err);
                if (mounted) {
                    setError(err);
                }
            }
        }

        init();

        return () => {
            mounted = false;
        };
    }, []);

    // Get all materials
    const getAllMaterials = useCallback(async () => {
        if (!db) return [];
        return await db.getAll('materials');
    }, [db]);

    // Get materials by category
    const getMaterialsByCategory = useCallback(async (category) => {
        if (!db) return [];
        return await db.getAllFromIndex('materials', 'category', category);
    }, [db]);

    // Get all categories
    const getCategories = useCallback(async () => {
        if (!db) return [];
        return await db.getAll('categories');
    }, [db]);

    // Update a material's price
    const updateMaterialPrice = useCallback(async (materialId, prices, notes = null) => {
        if (!db) return null;

        const material = await db.get('materials', materialId);
        if (!material) return null;

        const updated = {
            ...material,
            prices,
            lastUpdated: new Date().toISOString().split('T')[0],
            ...(notes && { notes }),
        };

        await db.put('materials', updated);
        return updated;
    }, [db]);

    // Add a new material
    const addMaterial = useCallback(async (material) => {
        if (!db) return null;

        const newMaterial = {
            ...material,
            id: material.id || `custom-${Date.now()}`,
            lastUpdated: new Date().toISOString().split('T')[0],
        };

        await db.put('materials', newMaterial);
        return newMaterial;
    }, [db]);

    // Delete a material
    const deleteMaterial = useCallback(async (materialId) => {
        if (!db) return false;
        await db.delete('materials', materialId);
        return true;
    }, [db]);

    // Search materials by name
    const searchMaterials = useCallback(async (query) => {
        if (!db || !query) return [];

        const all = await db.getAll('materials');
        const lowerQuery = query.toLowerCase();

        return all.filter(m =>
            m.name.toLowerCase().includes(lowerQuery) ||
            m.category.toLowerCase().includes(lowerQuery) ||
            m.unit.toLowerCase().includes(lowerQuery)
        );
    }, [db]);

    return {
        isReady,
        error,
        getAllMaterials,
        getMaterialsByCategory,
        getCategories,
        updateMaterialPrice,
        addMaterial,
        deleteMaterial,
        searchMaterials,
    };
}

export default useIndexedDB;
