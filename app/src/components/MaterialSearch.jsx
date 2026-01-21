import { useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, X } from 'lucide-react';
import { cn } from "@/lib/utils";

export function MaterialSearch({
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategory,
    setSelectedCategory,
    sources = [],
    selectedSource,
    setSelectedSource
}) {
    const handleClear = useCallback(() => {
        setSearchQuery('');
    }, [setSearchQuery]);

    const handleCategoryClick = useCallback((categoryId) => {
        setSelectedCategory(prev => prev === categoryId ? null : categoryId);
    }, [setSelectedCategory]);

    // Handle Select value change (Shadcn Select returns value directly)
    const handleSourceChange = (value) => {
        setSelectedSource(value === "all" ? null : value);
    };

    return (
        <div className="space-y-4">
            {/* Search and Filter Row */}
            <div className="flex flex-col md:flex-row gap-2">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search materials..."
                        className="pl-9 pr-8 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoComplete="off"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full w-9 hover:bg-transparent"
                            onClick={handleClear}
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                            <span className="sr-only">Clear search</span>
                        </Button>
                    )}
                </div>

                {/* Source Filter Dropdown */}
                <div className="w-full md:w-[140px] shrink-0">
                    <Select
                        value={selectedSource || "all"}
                        onValueChange={handleSourceChange}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sources</SelectItem>
                            {sources.map(source => (
                                <SelectItem key={source} value={source}>
                                    {source}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    return (
                        <Button
                            key={cat.id}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            className={cn(
                                "rounded-full h-8 px-3 font-normal",
                                isActive ? "hover:bg-primary/90" : "hover:bg-accent hover:text-accent-foreground"
                            )}
                            onClick={() => handleCategoryClick(cat.id)}
                        >
                            <span className="mr-2">{cat.icon}</span>
                            {cat.name}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}

export default MaterialSearch;
