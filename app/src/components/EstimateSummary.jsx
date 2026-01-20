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
        // Use landscape orientation for more horizontal space
        const doc = new jsPDF({ orientation: 'landscape' });

        // Helper function to format currency with PHP prefix (font-safe)
        const formatPdfCurrency = (amount) => {
            const formatted = amount.toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            return `PHP ${formatted}`;
        };

        // Page dimensions (landscape A4: 297mm x 210mm)
        const pageWidth = 297;
        const pageHeight = 210;
        const margin = 20;

        // Header
        doc.setFontSize(22);
        doc.setTextColor(0);
        doc.text('ESTIMA - Baguio City Prices', margin, 25);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text('Local Construction Pricing Intelligence', margin, 33);
        doc.text(`Date: ${new Date().toLocaleDateString('en-PH')}`, margin, 40);

        // Table Data
        const tableData = lineItems.map(item => [
            item.material.name,
            item.material.sources[0] || 'Various',
            `${item.quantity} ${item.material.unit}`,
            formatPdfCurrency(item.material.prices[priceMode]),
            formatPdfCurrency(item.material.prices[priceMode] * item.quantity)
        ]);

        autoTable(doc, {
            startY: 48,
            head: [['Material', 'Source', 'Quantity', 'Unit Price', 'Amount']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [66, 66, 66],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 10
            },
            bodyStyles: {
                fontSize: 10
            },
            styles: {
                cellPadding: 4,
                overflow: 'linebreak'
            },
            margin: { left: margin, right: margin },
            tableWidth: 'auto',
            columnStyles: {
                0: { cellWidth: 'auto' },  // Material - auto width
                1: { cellWidth: 'auto' },  // Source - auto width
                2: { cellWidth: 40 },      // Quantity
                3: { cellWidth: 45, halign: 'right' },  // Unit Price
                4: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }  // Amount
            }
        });

        // Totals section
        const finalY = doc.lastAutoTable.finalY + 15;
        const textRightX = pageWidth - margin;

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total (${priceMode}): ${formatPdfCurrency(currentTotal)}`, textRightX, finalY, { align: 'right' });

        doc.setFontSize(11);
        doc.setTextColor(80);
        doc.setFont('helvetica', 'normal');
        doc.text(`Range: ${formatPdfCurrency(totals.low)} - ${formatPdfCurrency(totals.high)}`, textRightX, finalY + 8, { align: 'right' });

        // Footer / Disclaimer
        doc.setFontSize(9);
        doc.setTextColor(130);
        doc.text('Estimates are based on Baguio City local market averages. Actual store prices may vary.', margin, pageHeight - 15);
        doc.text('ESTIMA v1.0.0 | Developed by Goose Industria', textRightX, pageHeight - 15, { align: 'right' });

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
