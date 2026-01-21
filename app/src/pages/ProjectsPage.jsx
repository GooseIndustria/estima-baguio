import { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useProject } from '../context/ProjectContext';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { formatCurrency } from '../utils/calculations';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Folder, Clock } from 'lucide-react';

export function ProjectsPage() {
    const { navigateTo, PAGES } = useNavigation();
    const { loadProject, createNewProject } = useProject();
    const { isReady, getAllProjects, deleteProject } = useIndexedDB();

    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // Load all projects
    useEffect(() => {
        if (!isReady) return;

        async function fetchProjects() {
            const allProjects = await getAllProjects();
            setProjects(allProjects);
            setIsLoading(false);
        }

        fetchProjects();
    }, [isReady, getAllProjects]);

    const handleProjectClick = async (projectId) => {
        const success = await loadProject(projectId);
        if (success) {
            navigateTo(PAGES.MATERIALS);
        }
    };

    const handleNewProject = () => {
        setNewProjectName('');
        setShowNewProjectModal(true);
    };

    const handleCreateProject = () => {
        const name = newProjectName.trim() || 'New Project';
        createNewProject(name);
        setShowNewProjectModal(false);
        navigateTo(PAGES.MATERIALS);
    };

    const handleDeleteProject = async (e, projectId) => {
        e.stopPropagation();
        setDeleteConfirmId(projectId);
    };

    const confirmDelete = async () => {
        if (deleteConfirmId) {
            await deleteProject(deleteConfirmId);
            setProjects(projects.filter(p => p.id !== deleteConfirmId));
            setDeleteConfirmId(null);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calculateTotal = (lineItems, priceMode = 'typical') => {
        if (!lineItems || lineItems.length === 0) return 0;
        return lineItems.reduce((sum, item) => {
            return sum + (item.material.prices[priceMode] * item.quantity);
        }, 0);
    };

    if (isLoading) {
        return (
            <main className="container mx-auto p-4 max-w-3xl">
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Loading projects...</p>
                </div>
            </main>
        );
    }

    return (
        <>
            <main className="container mx-auto p-4 max-w-3xl pb-24">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">My Projects</h2>
                        <span className="text-muted-foreground text-sm">{projects.length} saved</span>
                    </div>
                </div>

                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-card/50 border-dashed">
                        <Folder className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">No projects yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Create your first project to start estimating
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {projects.map(project => (
                            <Card
                                key={project.id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleProjectClick(project.id)}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-base font-semibold">
                                        {project.name}
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={(e) => handleDeleteProject(e, project.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete project</span>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                            <span>{project.lineItems?.length || 0} items</span>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{formatDate(project.updatedAt)}</span>
                                            </div>
                                        </div>
                                        <div className="text-lg font-bold text-primary">
                                            {formatCurrency(calculateTotal(project.lineItems, project.priceMode))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* New Project FAB */}
            <Button
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
                size="icon"
                onClick={handleNewProject}
            >
                <Plus className="h-6 w-6" />
                <span className="sr-only">New Project</span>
            </Button>

            {/* New Project Modal */}
            <Dialog open={showNewProjectModal} onOpenChange={setShowNewProjectModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Project</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Kitchen Renovation"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewProjectModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateProject}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Project?</DialogTitle>
                        <CardDescription>
                            This will permanently delete this project and all its items.
                        </CardDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ProjectsPage;
