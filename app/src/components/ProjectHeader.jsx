import { useState, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import { useNavigation } from '../context/NavigationContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Pencil,
    Folder,
    CheckCircle2,
    Loader2
} from 'lucide-react';

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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full px-4 gap-4 md:gap-0">
            <div className="flex items-center gap-4 flex-1 w-full md:w-auto justify-between md:justify-start">
                {isEditing ? (
                    <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="max-w-[300px] h-9 font-medium"
                    />
                ) : (
                    <Button
                        variant="ghost"
                        onClick={handleStartEdit}
                        title="Click to rename"
                        className="pl-0 text-lg font-semibold h-auto hover:bg-transparent hover:text-primary gap-2"
                    >
                        {currentProjectName}
                        <Pencil className="h-4 w-4 text-muted-foreground opacity-50" />
                    </Button>
                )}

                {hasItems && (
                    <div className="flex items-center text-xs text-muted-foreground gap-1.5 animate-in fade-in-0 duration-300">
                        {isSaving ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : lastSavedAt ? (
                            <>
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                <span>Saved {formatSavedTime(lastSavedAt)}</span>
                            </>
                        ) : null}
                    </div>
                )}
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo(PAGES.PROJECTS)}
                className="gap-2 text-muted-foreground hover:text-foreground"
            >
                <span>My Projects</span>
                <Folder className="h-4 w-4" />
            </Button>
        </div>
    );
}

export default ProjectHeader;
