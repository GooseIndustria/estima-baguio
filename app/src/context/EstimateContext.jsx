import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

// Initial state
const initialState = {
    lineItems: [],
    priceMode: 'typical', // 'low', 'typical', 'high'
};

// Action types
const ADD_ITEM = 'ADD_ITEM';
const REMOVE_ITEM = 'REMOVE_ITEM';
const UPDATE_QUANTITY = 'UPDATE_QUANTITY';
const SET_PRICE_MODE = 'SET_PRICE_MODE';
const CLEAR_ESTIMATE = 'CLEAR_ESTIMATE';

// Reducer
function estimateReducer(state, action) {
    switch (action.type) {
        case ADD_ITEM: {
            const existingIndex = state.lineItems.findIndex(
                item => item.material.id === action.payload.material.id
            );

            if (existingIndex >= 0) {
                // Update quantity of existing item
                const newLineItems = [...state.lineItems];
                newLineItems[existingIndex] = {
                    ...newLineItems[existingIndex],
                    quantity: newLineItems[existingIndex].quantity + action.payload.quantity,
                };
                return { ...state, lineItems: newLineItems };
            }

            // Add new item
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

        case CLEAR_ESTIMATE:
            return { ...state, lineItems: [] };

        default:
            return state;
    }
}

// Context
const EstimateContext = createContext(null);

// Provider component
export function EstimateProvider({ children }) {
    const [state, dispatch] = useReducer(estimateReducer, initialState);

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

    const clearEstimate = useCallback(() => {
        dispatch({ type: CLEAR_ESTIMATE });
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
        lineItems: state.lineItems,
        priceMode: state.priceMode,
        totals,
        currentTotal,
        addItem,
        removeItem,
        updateQuantity,
        setPriceMode,
        clearEstimate,
    }), [state, totals, currentTotal, addItem, removeItem, updateQuantity, setPriceMode, clearEstimate]);

    return (
        <EstimateContext.Provider value={value}>
            {children}
        </EstimateContext.Provider>
    );
}

// Hook for consuming context
export function useEstimate() {
    const context = useContext(EstimateContext);
    if (!context) {
        throw new Error('useEstimate must be used within an EstimateProvider');
    }
    return context;
}

export default EstimateContext;
