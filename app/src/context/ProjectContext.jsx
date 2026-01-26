import { createContext, useContext, useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

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
    const { isReady, saveProject: saveLocal, getProject: getLocal, deleteProject: deleteLocal, getLastProject: getLastLocal } = useIndexedDB();
    const { user } = useAuth(); // Get authenticated user

    // Debounce timer ref
    const saveTimeoutRef = useRef(null);
    const hasLoadedInitialProject = useRef(false);

    // Load last project on startup
    useEffect(() => {
        // If not ready (for local) and no user (for cloud), wait.
        // But if user is logged in, we don't care about local DB ready state?
        // Actually, let's prioritize user cloud data if logged in.

        async function loadLastProject() {
            if (hasLoadedInitialProject.current) return;

            if (user) {
                // Load from Cloud
                const { data, error } = await supabase
                    .from('projects')
                    .select('*')
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .single();

                if (data) {
                    const project = {
                        id: data.id,
                        name: data.name,
                        lineItems: data.data?.lineItems || [],
                        priceMode: data.data?.priceMode || 'typical',
                        updatedAt: data.updated_at
                    };
                    dispatch({ type: LOAD_PROJECT, payload: project });
                }
                hasLoadedInitialProject.current = true;

            } else if (isReady) {
                // Load from Local
                const lastProject = await getLastLocal();
                if (lastProject) {
                    dispatch({ type: LOAD_PROJECT, payload: lastProject });
                }
                hasLoadedInitialProject.current = true;
            }
        }

        loadLastProject();
    }, [isReady, getLastLocal, user]);

    // Auto-save with debounce whenever state changes
    useEffect(() => {
        if (!hasLoadedInitialProject.current) return;
        if (!user && !isReady) return;

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
                id: state.currentProjectId, // Might be null for new project
                name: state.currentProjectName,
                lineItems: state.lineItems,
                priceMode: state.priceMode,
            };

            let savedId = state.currentProjectId;
            let savedAt = null;

            if (user) {
                // Save to Cloud
                const payload = {
                    id: state.currentProjectId || undefined, // undefined lets Postgres generate UUID? No, Supabase/files usually need ID. 
                    // Actually, if it's new, we don't send ID to let default gen_random_uuid work? 
                    // Or we generate one. 
                    // Let's rely on DB gen_random_uuid if ID is missing.
                    // Upsert requires ID to match.
                    user_id: user.id,
                    name: state.currentProjectName,
                    data: {
                        lineItems: state.lineItems,
                        priceMode: state.priceMode
                    },
                    updated_at: new Date().toISOString()
                };

                // If we have an ID, include it in payload to update
                if (state.currentProjectId) {
                    payload.id = state.currentProjectId;
                }

                // If using 'upsert' without ID, it will try to insert. 
                // However, without a primary key collision, it's just an insert.
                // We need to get the ID back.
                const { data, error } = await supabase
                    .from('projects')
                    .upsert(payload)
                    .select()
                    .single();

                if (data) {
                    savedId = data.id;
                    savedAt = data.updated_at;
                } else {
                    console.error("Save to Supabase failed", error);
                }

            } else {
                // Save to Local
                const saved = await saveLocal(projectData);
                if (saved) {
                    savedId = saved.id;
                    savedAt = saved.updatedAt;
                }
            }

            if (savedId) {
                // If this was a new project, update the ID
                if (!state.currentProjectId) {
                    dispatch({ type: SET_PROJECT_ID, payload: savedId });
                }
                dispatch({ type: SET_LAST_SAVED, payload: savedAt });
            }

            dispatch({ type: SET_SAVING, payload: false });
        }, 500);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [isReady, state.lineItems, state.priceMode, state.currentProjectName, state.currentProjectId, saveLocal, user]);

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
            if (user) {
                await supabase.from('projects').delete().eq('id', state.currentProjectId);
            } else {
                await deleteLocal(state.currentProjectId);
            }
        }
        dispatch({ type: CLEAR_PROJECT });
    }, [state.currentProjectId, deleteLocal, user]);

    const loadProject = useCallback(async (projectId) => {
        if (user) {
            const { data } = await supabase.from('projects').select('*').eq('id', projectId).single();
            if (data) {
                const project = {
                    id: data.id,
                    name: data.name,
                    lineItems: data.data?.lineItems || [],
                    priceMode: data.data?.priceMode || 'typical',
                    updatedAt: data.updated_at
                };
                dispatch({ type: LOAD_PROJECT, payload: project });
                return true;
            }
            return false;
        } else {
            const project = await getLocal(projectId);
            if (project) {
                dispatch({ type: LOAD_PROJECT, payload: project });
                return true;
            }
            return false;
        }
    }, [getLocal, user]);

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
