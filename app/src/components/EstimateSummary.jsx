import { useState, useCallback } from 'react';
import { formatCurrency, generateEstimateText, copyToClipboard } from '../utils/calculations';
import { useEstimate } from '../context/EstimateContext';

export function EstimateSummary() {
    const { lineItems, totals, currentTotal, priceMode, setPriceMode, clearEstimate } = useEstimate();
    const [showToast, setShowToast] = useState(false);

    const handleCopy = useCallback(async () => {
        const text = generateEstimateText(lineItems, totals);
        const success = await copyToClipboard(text);

        if (success) {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        }
    }, [lineItems, totals]);

    // Always show summary so user sees running total at bottom
    // if (lineItems.length === 0) {
    //     return null;
    // }

    const isEmpty = lineItems.length === 0;

    return (
        <>
            <div className="summary-footer">
                <div className="summary-content">
                    {/* Price mode toggle */}
                    <div className="price-mode-toggle mb-4">
                        <button
                            className={`price-mode-btn low ${priceMode === 'low' ? 'active' : ''}`}
                            onClick={() => setPriceMode('low')}
                        >
                            Low
                        </button>
                        <button
                            className={`price-mode-btn typical ${priceMode === 'typical' ? 'active' : ''}`}
                            onClick={() => setPriceMode('typical')}
                        >
                            Typical
                        </button>
                        <button
                            className={`price-mode-btn high ${priceMode === 'high' ? 'active' : ''}`}
                            onClick={() => setPriceMode('high')}
                        >
                            High
                        </button>
                    </div>

                    {/* Total */}
                    <div className="summary-row">
                        <div>
                            <div className="summary-label">Total ({priceMode})</div>
                            <div className="summary-range">
                                Range: {formatCurrency(totals.low)} - {formatCurrency(totals.high)}
                            </div>
                        </div>
                        <div className="summary-total currency">
                            {formatCurrency(currentTotal)}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="summary-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={clearEstimate}
                            disabled={isEmpty}
                            style={{ opacity: isEmpty ? 0.5 : 1 }}
                        >
                            Clear
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleCopy}
                            disabled={isEmpty}
                            style={{ opacity: isEmpty ? 0.5 : 1 }}
                        >
                            📋 Copy Estimate
                        </button>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {showToast && (
                <div className="toast toast-success">
                    ✓ Copied to clipboard
                </div>
            )}
        </>
    );
}

export default EstimateSummary;
