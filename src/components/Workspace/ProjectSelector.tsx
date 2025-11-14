import { useState } from 'react';
import { FolderOpen, Plus, Trash2 } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';

export function ProjectSelector() {
  const { projects, currentProject, loadProject, createProject, deleteProject } = useProject();
  const [showCreate, setShowCreate] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const project = await createProject(projectName, projectDescription);
    await loadProject(project.id);
    setProjectName('');
    setProjectDescription('');
    setShowCreate(false);
  };

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (confirm('Delete this project? This cannot be undone.')) {
      await deleteProject(projectId);
    }
  };

  return (
    <div className="p-4 border-b border-slate-200">
      {currentProject ? (
        <div className="mb-4">
          <div className="text-xs text-slate-500 mb-1">Current Project</div>
          <div className="text-sm font-semibold text-slate-900">{currentProject.name}</div>
        </div>
      ) : (
        <div className="mb-4 text-center py-4">
          <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600">Select or create a project</p>
        </div>
      )}

      {!showCreate ? (
        <button
          onClick={() => setShowCreate(true)}
          className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      ) : (
        <div className="border border-slate-300 rounded-lg p-3 bg-white">
          <form onSubmit={handleCreate} className="space-y-2">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Project name"
              required
            />
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Description (optional)"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-3 py-1.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {projects.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-slate-500 mb-2">All Projects</div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => loadProject(project.id)}
                className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between group ${
                  currentProject?.id === project.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-900'
                }`}
              >
                <span className="text-sm font-medium truncate">{project.name}</span>
                <button
                  onClick={(e) => handleDelete(e, project.id)}
                  className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                    currentProject?.id === project.id
                      ? 'hover:bg-slate-800'
                      : 'hover:bg-slate-200'
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
