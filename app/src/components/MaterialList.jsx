import { useCallback } from 'react';
import { formatCurrency, formatRelativeDate } from '../utils/calculations';
import { useEstimate } from '../context/EstimateContext';

export function MaterialList({ materials, isLoading }) {
    const { addItem } = useEstimate();

    const handleAddMaterial = useCallback((material) => {
        addItem(material, 1);
    }, [addItem]);

    if (isLoading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p className="mt-4">Loading materials...</p>
            </div>
        );
    }

    if (materials.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <p className="empty-state-text">No materials found</p>
                <p className="empty-state-hint">Try adjusting your search or category filter</p>
            </div>
        );
    }

    return (
        <div>
            <div className="section-header">
                <span className="section-title">Materials</span>
                <span className="section-count">{materials.length} items</span>
            </div>

            {materials.map((material) => (
                <div
                    key={material.id}
                    className="material-item"
                    onClick={() => handleAddMaterial(material)}
                >
                    <div className="material-header">
                        <div>
                            <div className="material-name">{material.name}</div>
                            <div className="material-unit">per {material.unit}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="material-price">
                                {formatCurrency(material.prices.typical)}
                            </div>
                            <div className="material-price-range">
                                {formatCurrency(material.prices.low, { showSymbol: false })} - {formatCurrency(material.prices.high, { showSymbol: false })}
                            </div>
                        </div>
                    </div>
                    <div className="material-meta">
                        <span>📍 {material.sources[0]}</span>
                        <span>🕐 {formatRelativeDate(material.lastUpdated)}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default MaterialList;
