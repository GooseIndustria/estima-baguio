import { formatCurrency, formatRelativeDate } from '../utils/calculations';
import { useProject } from '../context/ProjectContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, MapPin, Clock, Search } from 'lucide-react';
import { cn } from "@/lib/utils";

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
            <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Loading materials...</p>
            </div>
        );
    }

    if (materials.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-card/50 border-dashed mt-4">
                <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium">No materials found</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search or category filter
                </p>
            </div>
        );
    }

    return (
        <div className="pb-24">
            <div className="flex items-center justify-between py-4">
                <span className="text-lg font-semibold">Materials</span>
                <span className="text-sm text-muted-foreground">{materials.length} items</span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                {materials.map((material) => {
                    const alreadyAdded = isInEstimate(material.id);
                    return (
                        <Card
                            key={material.id}
                            className={cn(
                                "cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm",
                                alreadyAdded ? "bg-primary/5 border-primary/20" : "bg-card"
                            )}
                            onClick={() => handleClick(material)}
                        >
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-base">{material.name}</span>
                                            {alreadyAdded && (
                                                <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                                                    <Check className="h-3 w-3" /> Added
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">per {material.unit}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-primary text-lg">
                                            {formatCurrency(material.prices.typical)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatCurrency(material.prices.low, { showSymbol: false })} - {formatCurrency(material.prices.high, { showSymbol: false })}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 pt-3 border-t">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>{material.sources[0]}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatRelativeDate(material.lastUpdated)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

export default MaterialList;
