import { formatCurrency, formatRelativeDate } from '../utils/calculations';
import { useProject } from '../context/ProjectContext';

export function MaterialList({ materials, isLoading }) {
    const { addItem, lineItems } = useProject();

    // Check if a material is already in the estimate
    const isInEstimate = (materialId) => {
        return lineItems.some(item => item.material.id === materialId);
    };

    const handleClick = (material) => {
        // Only add if not already in estimate
        if (!isInEstimate(material.id)) {
            addItem(material, 1);
        }
    };

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

            {materials.map((material) => {
                const alreadyAdded = isInEstimate(material.id);
                return (
                    <div
                        key={material.id}
                        className={`material-item ${alreadyAdded ? 'added' : ''}`}
                        onClick={() => handleClick(material)}
                    >
                        <div className="material-header">
                            <div>
                                <div className="material-name">
                                    {material.name}
                                    {alreadyAdded && <span className="added-badge">✓ Added</span>}
                                </div>
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
                );
            })}
        </div>
    );
}

export default MaterialList;
