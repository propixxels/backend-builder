import { Sidebar } from '../Sidebar/Sidebar';
import { Canvas } from '../Canvas/Canvas';
import { TopBar } from './TopBar';
import { ProjectSelector } from './ProjectSelector';
import { useProject } from '../../contexts/ProjectContext';

export function Workspace() {
  const { currentProject } = useProject();

  return (
    <div className="h-screen flex flex-col">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col overflow-hidden">
          <ProjectSelector />
          {currentProject && <Sidebar />}
        </div>
        <div className="flex-1 relative">
          {currentProject ? (
            <Canvas />
          ) : (
            <div className="h-full flex items-center justify-center bg-slate-100">
              <div className="text-center">
                <div className="text-6xl mb-4">🎨</div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Visual Backend Architect
                </h2>
                <p className="text-slate-600 max-w-md">
                  Design production-ready database schemas and business logic visually.
                  Create or select a project to get started.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
