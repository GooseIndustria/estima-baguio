import { useState, useCallback } from 'react';

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

    return (
        <div>
            {/* Search and Filter Row */}
            <div className="flex gap-2 mb-4">
                {/* Search Input */}
                <div className="search-container flex-1 mb-0">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search materials..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoComplete="off"
                    />
                    {searchQuery && (
                        <button className="search-clear" onClick={handleClear}>
                            ✕
                        </button>
                    )}
                </div>

                {/* Source Filter Dropdown */}
                <div style={{ width: '140px' }}>
                    <select
                        className="h-full w-full px-3 border rounded-md bg-white text-sm"
                        value={selectedSource || ''}
                        onChange={(e) => setSelectedSource(e.target.value || null)}
                        style={{
                            height: '44px',
                            borderColor: 'var(--color-border)',
                            color: selectedSource ? 'var(--color-text-primary)' : 'var(--color-text-muted)'
                        }}
                    >
                        <option value="">All Sources</option>
                        {sources.map(source => (
                            <option key={source} value={source}>
                                {source}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Category Chips */}
            <div className="category-chips">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(cat.id)}
                    >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default MaterialSearch;
