import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NavigationContext = createContext(null);

export const PAGES = {
    PROJECTS: 'projects',
    MATERIALS: 'materials',
    ESTIMATE: 'estimate',
};

function getPageFromHash() {
    const hash = window.location.hash.replace('#', '');
    return Object.values(PAGES).includes(hash) ? hash : PAGES.PROJECTS;
}

export function NavigationProvider({ children }) {
    const [currentPage, setCurrentPage] = useState(getPageFromHash);

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentPage(getPageFromHash());
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const navigateTo = useCallback((page) => {
        window.location.hash = page;
    }, []);

    return (
        <NavigationContext.Provider value={{ currentPage, navigateTo, PAGES }}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
}

export default NavigationContext;
