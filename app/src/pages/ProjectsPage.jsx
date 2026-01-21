import { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useProject } from '../context/ProjectContext';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { formatCurrency } from '../utils/calculations';

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
            <main className="main-content">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Loading projects...</p>
                </div>
            </main>
        );
    }

    return (
        <>
            <main className="main-content">
                <div className="section-header">
                    <h2 className="section-title">My Projects</h2>
                    <span className="section-count">{projects.length} saved</span>
                </div>

                {projects.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📁</div>
                        <div className="empty-state-text">No projects yet</div>
                        <div className="empty-state-hint">
                            Create your first project to start estimating
                        </div>
                    </div>
                ) : (
                    <div className="project-list">
                        {projects.map(project => (
                            <div
                                key={project.id}
                                className="project-card"
                                onClick={() => handleProjectClick(project.id)}
                            >
                                <div className="project-card-header">
                                    <h3 className="project-card-name">{project.name}</h3>
                                    <button
                                        className="project-card-delete"
                                        onClick={(e) => handleDeleteProject(e, project.id)}
                                        aria-label="Delete project"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <div className="project-card-meta">
                                    <span>{project.lineItems?.length || 0} items</span>
                                    <span>•</span>
                                    <span>{formatDate(project.updatedAt)}</span>
                                </div>
                                <div className="project-card-total">
                                    {formatCurrency(calculateTotal(project.lineItems, project.priceMode))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* New Project FAB */}
            <button
                className="floating-new-project-btn"
                onClick={handleNewProject}
            >
                <span className="new-project-icon">+</span>
                <span className="new-project-text">New Project</span>
            </button>

            {/* New Project Modal */}
            {showNewProjectModal && (
                <div className="modal-overlay" onClick={() => setShowNewProjectModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">New Project</h3>
                        <input
                            type="text"
                            className="input"
                            placeholder="Project name (e.g., Kitchen Renovation)"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowNewProjectModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateProject}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Delete Project?</h3>
                        <p className="modal-text">
                            This will permanently delete this project and all its items.
                        </p>
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setDeleteConfirmId(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={confirmDelete}
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

export default ProjectsPage;
