import { useState, useCallback } from 'react';

export function MaterialSearch({ searchQuery, setSearchQuery, categories, selectedCategory, setSelectedCategory }) {
    const handleClear = useCallback(() => {
        setSearchQuery('');
    }, [setSearchQuery]);

    const handleCategoryClick = useCallback((categoryId) => {
        setSelectedCategory(prev => prev === categoryId ? null : categoryId);
    }, [setSelectedCategory]);

    return (
        <div>
            {/* Search Input */}
            <div className="search-container">
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
