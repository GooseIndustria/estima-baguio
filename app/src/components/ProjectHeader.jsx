import { useState, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import { useNavigation } from '../context/NavigationContext';

export function ProjectHeader() {
    const {
        currentProjectName,
        setProjectName,
        lastSavedAt,
        isSaving,
        lineItems
    } = useProject();
    const { navigateTo, PAGES } = useNavigation();

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');

    const handleStartEdit = useCallback(() => {
        setEditName(currentProjectName);
        setIsEditing(true);
    }, [currentProjectName]);

    const handleSave = useCallback(() => {
        const trimmed = editName.trim();
        if (trimmed) {
            setProjectName(trimmed);
        }
        setIsEditing(false);
    }, [editName, setProjectName]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    }, [handleSave]);

    const formatSavedTime = (timestamp) => {
        if (!timestamp) return '';

        const now = Date.now();
        const diff = now - timestamp;

        if (diff < 5000) return 'just now';
        if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;

        return new Date(timestamp).toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const hasItems = lineItems.length > 0;

    return (
        <div className="project-header">
            <div className="project-header-info">
                {isEditing ? (
                    <input
                        type="text"
                        className="project-header-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                ) : (
                    <button
                        className="project-header-name"
                        onClick={handleStartEdit}
                        title="Click to rename"
                    >
                        {currentProjectName}
                        <span className="project-header-edit-icon">✏️</span>
                    </button>
                )}

                {hasItems && (
                    <div className="project-header-status">
                        {isSaving ? (
                            <span className="save-indicator saving">Saving...</span>
                        ) : lastSavedAt ? (
                            <span className="save-indicator saved">
                                ✓ Saved {formatSavedTime(lastSavedAt)}
                            </span>
                        ) : null}
                    </div>
                )}
            </div>

            <button
                className="project-header-back"
                onClick={() => navigateTo(PAGES.PROJECTS)}
                aria-label="View all projects"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#64748b'
                }}
            >
                My Projects 📁
            </button>
        </div>
    );
}

export default ProjectHeader;
