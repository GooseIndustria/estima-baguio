import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

    const handleExportPDF = useCallback(() => {
        const doc = new jsPDF();

        // Helper function to format currency for PDF with proper peso sign
        // Using Unicode escape for Philippine Peso sign to ensure proper rendering
        const formatPdfCurrency = (amount) => {
            const formatted = amount.toLocaleString('en-PH', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
            return `\u20B1${formatted}`; // ₱ Unicode: U+20B1
        };

        // Header
        doc.setFontSize(20);
        doc.text('ESTIMA - Baguio City Prices', 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Local Construction Pricing Intelligence', 14, 28);
        doc.text(`Date: ${new Date().toLocaleDateString('en-PH')}`, 14, 34);

        // Grid Design Element
        doc.setDrawColor(200);
        doc.line(14, 38, 196, 38);

        // Table Data
        const tableData = lineItems.map(item => [
            item.material.name,
            item.material.sources[0] || 'Various', // Just take first source for now
            `${item.quantity} ${item.material.unit}`,
            formatPdfCurrency(item.material.prices[priceMode]),
            formatPdfCurrency(item.material.prices[priceMode] * item.quantity)
        ]);

        // Page width is 210mm, we use 14mm left margin and 14mm right margin = 182mm content width
        const pageWidth = 210;
        const leftMargin = 14;
        const rightMargin = 14;
        const contentWidth = pageWidth - leftMargin - rightMargin; // 182mm

        autoTable(doc, {
            startY: 42,
            head: [['Material', 'Source', 'Quantity', 'Unit Price', 'Amount']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [240, 240, 240], textColor: [40, 40, 40], lineColor: [200, 200, 200] },
            styles: { fontSize: 9, font: 'helvetica', cellPadding: 3 },
            margin: { left: leftMargin, right: rightMargin },
            tableWidth: contentWidth,
            columnStyles: {
                0: { cellWidth: 50 }, // Material - fixed width
                1: { cellWidth: 40 }, // Source
                2: { cellWidth: 28 }, // Quantity
                3: { cellWidth: 32, halign: 'right' }, // Unit Price
                4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' } // Amount
            }
        });

        // Totals - position aligned with table right edge
        const finalY = doc.lastAutoTable.finalY + 10;
        const textRightX = pageWidth - rightMargin; // 196mm from left edge

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Total (${priceMode}): ${formatPdfCurrency(currentTotal)}`, textRightX, finalY, { align: 'right' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Range: ${formatPdfCurrency(totals.low)} - ${formatPdfCurrency(totals.high)}`, textRightX, finalY + 6, { align: 'right' });

        // Footer / Disclaimer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Estimates are based on Baguio City local market averages. Actual store prices may vary.', leftMargin, 280);
        doc.text('ESTIMA v1.0.0 | Developed by Goose Industria', textRightX, 280, { align: 'right' });

        doc.save(`estima-baguio-quote-${Date.now()}.pdf`);
    }, [lineItems, totals, currentTotal, priceMode]);

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
                            <div className="summary-label">Total Estimate ({priceMode})</div>
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
                            onClick={handleExportPDF}
                            disabled={isEmpty}
                            style={{ opacity: isEmpty ? 0.5 : 1 }}
                        >
                            📄 PDF
                        </button>
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
                            📋 Copy
                        </button>
                    </div>

                    {/* Branding */}
                    <div className="text-center mt-4 text-xs text-muted font-medium opacity-60">
                        v1.0.0 · Developed by Goose Industria
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
