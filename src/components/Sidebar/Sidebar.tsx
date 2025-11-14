import { DataTypeToolbox } from './DataTypeToolbox';
import { ProjectLibrary } from './ProjectLibrary';

export function Sidebar() {
  return (
    <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-white">
        <h2 className="text-lg font-bold text-slate-900">Library</h2>
        <p className="text-xs text-slate-600 mt-1">Drag items to the canvas</p>
      </div>

      <DataTypeToolbox />
      <ProjectLibrary />
    </div>
  );
}
