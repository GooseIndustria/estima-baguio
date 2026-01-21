// Format number as Philippine Peso
export function formatCurrency(amount, options = {}) {
    const {
        showSymbol = true,
        decimals = 0,
        compact = false
    } = options;

    if (compact && amount >= 1000) {
        const formatted = (amount / 1000).toFixed(1).replace(/\.0$/, '');
        return showSymbol ? `₱${formatted}K` : `${formatted}K`;
    }

    const formatted = amount.toLocaleString('en-PH', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    return showSymbol ? `₱${formatted}` : formatted;
}

// Format price range
export function formatPriceRange(prices) {
    return `₱${prices.low.toLocaleString()} - ₱${prices.high.toLocaleString()}`;
}

// Calculate line item subtotal
export function calculateSubtotal(price, quantity) {
    return price * quantity;
}

// Calculate estimate summary
export function calculateEstimateSummary(lineItems) {
    const summary = {
        low: 0,
        typical: 0,
        high: 0,
        itemCount: lineItems.length,
        materialCount: 0,
    };

    for (const item of lineItems) {
        summary.low += item.material.prices.low * item.quantity;
        summary.typical += item.material.prices.typical * item.quantity;
        summary.high += item.material.prices.high * item.quantity;
        summary.materialCount += item.quantity;
    }

    return summary;
}

// Generate estimate text for sharing
export function generateEstimateText(lineItems, totals, priceMode = 'typical') {
    if (lineItems.length === 0) {
        return 'No items in estimate.';
    }

    let text = '📋 ESTIMA BAGUIO - Material Estimate\n';
    text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    for (const item of lineItems) {
        const price = item.material.prices[priceMode];
        const subtotal = price * item.quantity;
        text += `• ${item.material.name}\n`;
        text += `  ${item.quantity} ${item.material.unit} × ₱${price.toLocaleString()} = ₱${subtotal.toLocaleString()}\n\n`;
    }

    text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    text += `TOTAL (${priceMode}): ₱${totals[priceMode].toLocaleString()}\n`;
    text += `Range: ₱${totals.low.toLocaleString()} - ₱${totals.high.toLocaleString()}\n`;
    text += '\n📍 Prices based on Baguio City market';

    return text;
}

// Copy text to clipboard
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}

// Format date relative to now
export function formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}
