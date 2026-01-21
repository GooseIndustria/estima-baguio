import { createContext, useContext, useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import { useIndexedDB } from '../hooks/useIndexedDB';

// Initial state
const initialState = {
    // Project metadata
    currentProjectId: null,
    currentProjectName: 'New Project',
    lastSavedAt: null,
    isSaving: false,

    // Estimate data
    lineItems: [],
    priceMode: 'typical', // 'low', 'typical', 'high'
};

// Action types
const ADD_ITEM = 'ADD_ITEM';
const REMOVE_ITEM = 'REMOVE_ITEM';
const UPDATE_QUANTITY = 'UPDATE_QUANTITY';
const SET_PRICE_MODE = 'SET_PRICE_MODE';
const CLEAR_PROJECT = 'CLEAR_PROJECT';
const LOAD_PROJECT = 'LOAD_PROJECT';
const SET_PROJECT_NAME = 'SET_PROJECT_NAME';
const SET_PROJECT_ID = 'SET_PROJECT_ID';
const SET_SAVING = 'SET_SAVING';
const SET_LAST_SAVED = 'SET_LAST_SAVED';

// Reducer
function projectReducer(state, action) {
    switch (action.type) {
        case ADD_ITEM: {
            const existingIndex = state.lineItems.findIndex(
                item => item.material.id === action.payload.material.id
            );

            if (existingIndex >= 0) {
                const newLineItems = [...state.lineItems];
                newLineItems[existingIndex] = {
                    ...newLineItems[existingIndex],
                    quantity: newLineItems[existingIndex].quantity + action.payload.quantity,
                };
                return { ...state, lineItems: newLineItems };
            }

            return {
                ...state,
                lineItems: [...state.lineItems, {
                    id: `${action.payload.material.id}-${Date.now()}`,
                    material: action.payload.material,
                    quantity: action.payload.quantity,
                }],
            };
        }

        case REMOVE_ITEM:
            return {
                ...state,
                lineItems: state.lineItems.filter(item => item.id !== action.payload),
            };

        case UPDATE_QUANTITY: {
            const newLineItems = state.lineItems.map(item =>
                item.id === action.payload.id
                    ? { ...item, quantity: Math.max(0, action.payload.quantity) }
                    : item
            ).filter(item => item.quantity > 0);

            return { ...state, lineItems: newLineItems };
        }

        case SET_PRICE_MODE:
            return { ...state, priceMode: action.payload };

        case CLEAR_PROJECT:
            return {
                ...initialState,
                currentProjectId: null,
                currentProjectName: 'New Project',
            };

        case LOAD_PROJECT:
            return {
                ...state,
                currentProjectId: action.payload.id,
                currentProjectName: action.payload.name,
                lineItems: action.payload.lineItems || [],
                priceMode: action.payload.priceMode || 'typical',
                lastSavedAt: action.payload.updatedAt,
            };

        case SET_PROJECT_NAME:
            return { ...state, currentProjectName: action.payload };

        case SET_PROJECT_ID:
            return { ...state, currentProjectId: action.payload };

        case SET_SAVING:
            return { ...state, isSaving: action.payload };

        case SET_LAST_SAVED:
            return { ...state, lastSavedAt: action.payload };

        default:
            return state;
    }
}

// Context
const ProjectContext = createContext(null);

// Provider component
export function ProjectProvider({ children }) {
    const [state, dispatch] = useReducer(projectReducer, initialState);
    const { isReady, saveProject, getProject, deleteProject, getLastProject } = useIndexedDB();

    // Debounce timer ref
    const saveTimeoutRef = useRef(null);
    const hasLoadedInitialProject = useRef(false);

    // Load last project on startup
    useEffect(() => {
        if (!isReady || hasLoadedInitialProject.current) return;

        async function loadLastProject() {
            const lastProject = await getLastProject();
            if (lastProject) {
                dispatch({ type: LOAD_PROJECT, payload: lastProject });
            }
            hasLoadedInitialProject.current = true;
        }

        loadLastProject();
    }, [isReady, getLastProject]);

    // Auto-save with debounce whenever state changes
    useEffect(() => {
        if (!isReady || !hasLoadedInitialProject.current) return;

        // Don't auto-save if no items and no project ID (empty new project)
        if (state.lineItems.length === 0 && !state.currentProjectId) return;

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Debounce save by 500ms
        saveTimeoutRef.current = setTimeout(async () => {
            dispatch({ type: SET_SAVING, payload: true });

            const projectData = {
                id: state.currentProjectId,
                name: state.currentProjectName,
                lineItems: state.lineItems,
                priceMode: state.priceMode,
            };

            const saved = await saveProject(projectData);

            if (saved) {
                // If this was a new project, update the ID
                if (!state.currentProjectId) {
                    dispatch({ type: SET_PROJECT_ID, payload: saved.id });
                }
                dispatch({ type: SET_LAST_SAVED, payload: saved.updatedAt });
            }

            dispatch({ type: SET_SAVING, payload: false });
        }, 500);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [isReady, state.lineItems, state.priceMode, state.currentProjectName, state.currentProjectId, saveProject]);

    // Actions
    const addItem = useCallback((material, quantity = 1) => {
        dispatch({ type: ADD_ITEM, payload: { material, quantity } });
    }, []);

    const removeItem = useCallback((itemId) => {
        dispatch({ type: REMOVE_ITEM, payload: itemId });
    }, []);

    const updateQuantity = useCallback((itemId, quantity) => {
        dispatch({ type: UPDATE_QUANTITY, payload: { id: itemId, quantity } });
    }, []);

    const setPriceMode = useCallback((mode) => {
        dispatch({ type: SET_PRICE_MODE, payload: mode });
    }, []);

    const setProjectName = useCallback((name) => {
        dispatch({ type: SET_PROJECT_NAME, payload: name });
    }, []);

    const clearProject = useCallback(async () => {
        // If there's a current project, delete it from DB
        if (state.currentProjectId) {
            await deleteProject(state.currentProjectId);
        }
        dispatch({ type: CLEAR_PROJECT });
    }, [state.currentProjectId, deleteProject]);

    const loadProject = useCallback(async (projectId) => {
        const project = await getProject(projectId);
        if (project) {
            dispatch({ type: LOAD_PROJECT, payload: project });
            return true;
        }
        return false;
    }, [getProject]);

    const createNewProject = useCallback((name = 'New Project') => {
        dispatch({ type: CLEAR_PROJECT });
        dispatch({ type: SET_PROJECT_NAME, payload: name });
    }, []);

    // Computed values
    const totals = useMemo(() => {
        const result = {
            low: 0,
            typical: 0,
            high: 0,
            itemCount: state.lineItems.length,
        };

        for (const item of state.lineItems) {
            result.low += item.material.prices.low * item.quantity;
            result.typical += item.material.prices.typical * item.quantity;
            result.high += item.material.prices.high * item.quantity;
        }

        return result;
    }, [state.lineItems]);

    const currentTotal = useMemo(() => {
        return totals[state.priceMode];
    }, [totals, state.priceMode]);

    const value = useMemo(() => ({
        // Project metadata
        currentProjectId: state.currentProjectId,
        currentProjectName: state.currentProjectName,
        lastSavedAt: state.lastSavedAt,
        isSaving: state.isSaving,

        // Estimate data
        lineItems: state.lineItems,
        priceMode: state.priceMode,
        totals,
        currentTotal,

        // Actions
        addItem,
        removeItem,
        updateQuantity,
        setPriceMode,
        setProjectName,
        clearProject,
        loadProject,
        createNewProject,
    }), [
        state,
        totals,
        currentTotal,
        addItem,
        removeItem,
        updateQuantity,
        setPriceMode,
        setProjectName,
        clearProject,
        loadProject,
        createNewProject,
    ]);

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
}

// Hook for consuming context
export function useProject() {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
}

// Backward compatibility - alias useEstimate to useProject
export const useEstimate = useProject;
export const EstimateProvider = ProjectProvider;

export default ProjectContext;
