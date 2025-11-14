import { useState } from 'react';
import { FileJson, FileCode, Database, Check } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { exportToJSON } from '../../lib/exporters/jsonExporter';

interface ExportMenuProps {
  onClose: () => void;
}

export function ExportMenu({ onClose }: ExportMenuProps) {
  const project = useProject();
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExportJSON = async () => {
    setExporting(true);
    try {
      const json = await exportToJSON(project);
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.currentProject?.name || 'project'}-blueprint.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExported(true);
      setTimeout(() => {
        setExported(false);
        onClose();
      }, 1500);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Export Project</h3>
          <p className="text-xs text-slate-600 mt-1">
            Generate code-ready files from your visual blueprint
          </p>
        </div>

        <div className="p-2">
          <button
            onClick={handleExportJSON}
            disabled={exporting || exported}
            className="w-full px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors text-left flex items-start gap-3 disabled:opacity-50"
          >
            <div className="mt-0.5">
              {exported ? (
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <FileJson className="w-5 h-5 text-slate-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-slate-900 mb-1">
                JSON Blueprint
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Complete schema in JSON format. Feed directly to AI models or code generators.
              </p>
            </div>
          </button>

          <button
            disabled
            className="w-full px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors text-left flex items-start gap-3 opacity-50 cursor-not-allowed"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mt-0.5">
              <FileCode className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-slate-900 mb-1">
                TypeScript Types
                <span className="ml-2 text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Generate TypeScript interfaces and types from your models.
              </p>
            </div>
          </button>

          <button
            disabled
            className="w-full px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors text-left flex items-start gap-3 opacity-50 cursor-not-allowed"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mt-0.5">
              <Database className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-slate-900 mb-1">
                Prisma Schema
                <span className="ml-2 text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Export as a ready-to-use Prisma schema file.
              </p>
            </div>
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <p className="text-xs text-slate-600">
            More export formats are in development. The JSON blueprint is currently the most comprehensive format.
          </p>
        </div>
      </div>
    </>
  );
}
