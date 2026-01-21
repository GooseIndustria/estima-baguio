import { useCallback } from 'react';
import { formatCurrency } from '../utils/calculations';
import { useProject } from '../context/ProjectContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus } from 'lucide-react';

export function LineItems() {
    const { lineItems, updateQuantity, removeItem, priceMode } = useProject();

    const handleIncrement = useCallback((itemId, currentQty) => {
        updateQuantity(itemId, currentQty + 1);
    }, [updateQuantity]);

    const handleDecrement = useCallback((itemId, currentQty) => {
        updateQuantity(itemId, currentQty - 1);
    }, [updateQuantity]);

    const handleQuantityChange = useCallback((itemId, value) => {
        const newQty = parseInt(value, 10);
        if (!isNaN(newQty) && newQty >= 0) {
            updateQuantity(itemId, newQty);
        }
    }, [updateQuantity]);

    const handleQuantityBlur = useCallback((itemId, value) => {
        const newQty = parseInt(value, 10);
        if (isNaN(newQty) || newQty < 1) {
            updateQuantity(itemId, 1);
        }
    }, [updateQuantity]);

    if (lineItems.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4 pb-48"> {/* Padding for fixed summary footer */}
            <div className="flex items-center justify-between py-2">
                <span className="text-lg font-semibold">Your Estimate</span>
                <span className="text-sm text-muted-foreground">{lineItems.length} items</span>
            </div>

            <div className="grid gap-3">
                {lineItems.map((item) => {
                    const price = item.material.prices[priceMode];
                    const subtotal = price * item.quantity;

                    return (
                        <Card key={item.id} className="overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="pr-4">
                                        <div className="font-medium text-base mb-1">{item.material.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatCurrency(price)} × {item.quantity} {item.material.unit}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                        onClick={() => removeItem(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Remove item</span>
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center border rounded-md">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-none rounded-l-md hover:bg-muted"
                                            onClick={() => handleDecrement(item.id, item.quantity)}
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <Input
                                            type="number"
                                            className="h-9 w-12 border-0 text-center p-0 rounded-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                            onBlur={(e) => handleQuantityBlur(item.id, e.target.value)}
                                            min="1"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-none rounded-r-md hover:bg-muted"
                                            onClick={() => handleIncrement(item.id, item.quantity)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="font-bold text-lg text-primary">
                                        {formatCurrency(subtotal)}
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

export default LineItems;
