import { LogOut, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProject } from '../../contexts/ProjectContext';
import { ExportMenu } from './ExportMenu';
import { useState } from 'react';

export function TopBar() {
  const { user, signOut } = useAuth();
  const { currentProject } = useProject();
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 p-2 rounded-lg">
            <div className="text-white font-bold text-sm">VBA</div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Visual Backend Architect</h1>
            <p className="text-xs text-slate-600">Design production-ready schemas</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {currentProject && (
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            {showExportMenu && (
              <ExportMenu onClose={() => setShowExportMenu(false)} />
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">{user?.email}</span>
          <button
            onClick={() => signOut()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
