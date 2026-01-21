import { useState, useCallback, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, generateEstimateText, copyToClipboard } from '../utils/calculations';
import { useProject } from '../context/ProjectContext';
import { useNavigation } from '../context/NavigationContext';
import { useIndexedDB } from '../hooks/useIndexedDB';

export function EstimateSummary() {
    const { lineItems, totals, currentTotal, priceMode, setPriceMode, clearProject, currentProjectName } = useProject();
    const { navigateTo, PAGES } = useNavigation();
    const { isReady, getAllProjects } = useIndexedDB();
    const [showToast, setShowToast] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [allProjects, setAllProjects] = useState([]);

    // Fetch all projects for the PDF summary page
    useEffect(() => {
        if (!isReady) return;
        async function fetchProjects() {
            const projects = await getAllProjects();
            setAllProjects(projects);
        }
        fetchProjects();
    }, [isReady, getAllProjects]);

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

        // Helper function to calculate project total
        const calculateProjectTotal = (lineItems, priceMode = 'typical') => {
            if (!lineItems || lineItems.length === 0) return 0;
            return lineItems.reduce((sum, item) => {
                return sum + (item.material.prices[priceMode] * item.quantity);
            }, 0);
        };

        // Page dimensions (landscape A4: 297mm x 210mm)
        const pageWidth = 297;
        const pageHeight = 210;
        const margin = 20;

        // Header with Project Name
        doc.setFontSize(22);
        doc.setTextColor(0);
        doc.text('ESTIMA - Baguio City Prices', margin, 25);

        // Project Name
        doc.setFontSize(16);
        doc.setTextColor(50);
        doc.text(`Project: ${currentProjectName}`, margin, 35);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text('Local Construction Pricing Intelligence', margin, 43);
        doc.text(`Date: ${new Date().toLocaleDateString('en-PH')}`, margin, 50);

        // Table Data
        const tableData = lineItems.map(item => [
            item.material.name,
            item.material.sources[0] || 'Various',
            `${item.quantity} ${item.material.unit}`,
            formatPdfCurrency(item.material.prices[priceMode]),
            formatPdfCurrency(item.material.prices[priceMode] * item.quantity)
        ]);

        autoTable(doc, {
            startY: 58,
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

        // ==========================================
        // PAGE 2: All Saved Projects Summary
        // ==========================================
        if (allProjects.length > 0) {
            doc.addPage('landscape');

            // Header for Page 2
            doc.setFontSize(22);
            doc.setTextColor(0);
            doc.text('ESTIMA - All Saved Projects', margin, 25);

            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Total Projects: ${allProjects.length}`, margin, 35);
            doc.text(`Generated: ${new Date().toLocaleDateString('en-PH')}`, margin, 42);

            // Format date for display
            const formatDateForPdf = (timestamp) => {
                if (!timestamp) return 'N/A';
                const date = new Date(timestamp);
                return date.toLocaleDateString('en-PH', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });
            };

            // Table Data for all projects
            const projectsTableData = allProjects.map(project => [
                project.name,
                project.lineItems?.length || 0,
                formatPdfCurrency(calculateProjectTotal(project.lineItems, project.priceMode || 'typical')),
                formatDateForPdf(project.updatedAt),
            ]);

            autoTable(doc, {
                startY: 50,
                head: [['Project Name', 'Items', 'Estimated Total', 'Last Updated']],
                body: projectsTableData,
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
                    0: { cellWidth: 100 },  // Project Name
                    1: { cellWidth: 30, halign: 'center' },  // Items
                    2: { cellWidth: 60, halign: 'right' },  // Total
                    3: { cellWidth: 'auto' }  // Last Updated
                }
            });

            // Calculate grand total of all projects
            const grandTotal = allProjects.reduce((sum, project) => {
                return sum + calculateProjectTotal(project.lineItems, project.priceMode || 'typical');
            }, 0);

            const projectsFinalY = doc.lastAutoTable.finalY + 15;

            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.setFont('helvetica', 'bold');
            doc.text(`Grand Total (All Projects): ${formatPdfCurrency(grandTotal)}`, textRightX, projectsFinalY, { align: 'right' });

            // Footer for Page 2
            doc.setFontSize(9);
            doc.setTextColor(130);
            doc.setFont('helvetica', 'normal');
            doc.text('This page lists all saved projects in ESTIMA.', margin, pageHeight - 15);
            doc.text('ESTIMA v1.0.0 | Developed by Goose Industria', textRightX, pageHeight - 15, { align: 'right' });
        }

        doc.save(`${currentProjectName.replace(/[^a-zA-Z0-9]/g, '-')}-estimate-${Date.now()}.pdf`);
    }, [lineItems, totals, currentTotal, priceMode, currentProjectName, allProjects]);

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
                            onClick={() => setShowClearConfirm(true)}
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

            {/* Clear Confirmation Modal */}
            {showClearConfirm && (
                <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Delete Project?</h3>
                        <p className="modal-text">
                            This will permanently delete "{currentProjectName}" and all its items.
                        </p>
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowClearConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={async () => {
                                    await clearProject();
                                    setShowClearConfirm(false);
                                    navigateTo(PAGES.PROJECTS);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default EstimateSummary;

