import { useState, useCallback, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, generateEstimateText, copyToClipboard } from '../utils/calculations';
import { useProject } from '../context/ProjectContext';
import { useNavigation } from '../context/NavigationContext';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { FileText, Trash2, Copy, Check, Info } from 'lucide-react';
import { cn } from "@/lib/utils";

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
        const text = generateEstimateText(lineItems, totals, priceMode);
        const success = await copyToClipboard(text);

        if (success) {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        }
    }, [lineItems, totals, priceMode]);

    const handleExportPDF = useCallback(() => {
        // ... (Existing PDF logic kept as is for now, functionality preservation)
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
        doc.text('ESTIMA v1.1.0 | Developed by Goose Industria', textRightX, pageHeight - 15, { align: 'right' });

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
            doc.text('ESTIMA v1.1.0 | Developed by Goose Industria', textRightX, pageHeight - 15, { align: 'right' });
        }

        doc.save(`${currentProjectName.replace(/[^a-zA-Z0-9]/g, '-')}-estimate-${Date.now()}.pdf`);
    }, [lineItems, totals, currentTotal, priceMode, currentProjectName, allProjects]);

    const isEmpty = lineItems.length === 0;

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 pb-8 safe-bottom z-40 transition-all">
                <div className="container mx-auto max-w-3xl">
                    <div className="flex flex-col gap-4">
                        {/* Price mode toggle */}
                        <div className="flex bg-muted p-1 rounded-lg w-full">
                            {['low', 'typical', 'high'].map(mode => (
                                <button
                                    key={mode}
                                    className={cn(
                                        "flex-1 py-1 text-sm font-medium rounded-md transition-all capitalize",
                                        priceMode === mode
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                    onClick={() => setPriceMode(mode)}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Total Estimate ({priceMode})</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Info className="h-3 w-3" />
                                    Range: {formatCurrency(totals.low)} - {formatCurrency(totals.high)}
                                </div>
                            </div>
                            <div className="text-2xl font-bold tracking-tight text-primary">
                                {formatCurrency(currentTotal)}
                            </div>
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant="outline"
                                onClick={handleExportPDF}
                                disabled={isEmpty}
                                className="w-full"
                            >
                                <FileText className="mr-2 h-4 w-4" /> PDF
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowClearConfirm(true)}
                                disabled={isEmpty}
                                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Clear
                            </Button>
                            <Button
                                variant="default"
                                onClick={handleCopy}
                                disabled={isEmpty}
                                className="w-full"
                            >
                                <Copy className="mr-2 h-4 w-4" /> Copy
                            </Button>
                        </div>

                        <div className="text-center text-[10px] text-muted-foreground pt-1 opacity-60">
                            v1.1.0 · Developed by Goose Industria
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {showToast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
                        <Check className="h-4 w-4" /> Copied to clipboard
                    </div>
                </div>
            )}

            {/* Clear Confirmation Modal */}
            <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Project Items?</DialogTitle>
                        <DialogDescription>
                            This will permanently remove all items from "{currentProjectName}". This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                await clearProject();
                                setShowClearConfirm(false);
                                navigateTo(PAGES.PROJECTS);
                            }}
                        >
                            Clear All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default EstimateSummary;
