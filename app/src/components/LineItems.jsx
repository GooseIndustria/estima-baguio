import { useCallback } from 'react';
import { formatCurrency } from '../utils/calculations';
import { useEstimate } from '../context/EstimateContext';

export function LineItems() {
    const { lineItems, updateQuantity, removeItem, priceMode } = useEstimate();

    const handleIncrement = useCallback((itemId, currentQty) => {
        updateQuantity(itemId, currentQty + 1);
    }, [updateQuantity]);

    const handleDecrement = useCallback((itemId, currentQty) => {
        updateQuantity(itemId, currentQty - 1);
    }, [updateQuantity]);

    if (lineItems.length === 0) {
        return null;
    }

    return (
        <div className="line-items">
            <div className="section-header">
                <span className="section-title">Your Estimate</span>
                <span className="section-count">{lineItems.length} items</span>
            </div>

            {lineItems.map((item) => {
                const price = item.material.prices[priceMode];
                const subtotal = price * item.quantity;

                return (
                    <div key={item.id} className="line-item">
                        <div className="line-item-header">
                            <div>
                                <div className="line-item-name">{item.material.name}</div>
                                <div className="text-sm text-muted">
                                    {formatCurrency(price)} × {item.quantity} {item.material.unit}
                                </div>
                            </div>
                            <button
                                className="line-item-remove"
                                onClick={() => removeItem(item.id)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="line-item-controls">
                            <div className="quantity-controls">
                                <button
                                    className="quantity-btn"
                                    onClick={() => handleDecrement(item.id, item.quantity)}
                                >
                                    −
                                </button>
                                <span className="quantity-value">{item.quantity}</span>
                                <button
                                    className="quantity-btn"
                                    onClick={() => handleIncrement(item.id, item.quantity)}
                                >
                                    +
                                </button>
                            </div>
                            <div className="line-item-subtotal">
                                {formatCurrency(subtotal)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default LineItems;
