import { DATA_TYPES } from '../../lib/constants';

export function DataTypeToolbox() {
  const handleDragStart = (e: React.DragEvent, typeId: string) => {
    e.dataTransfer.setData('dataType', typeId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="p-4 border-b border-slate-200">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Data Types</h3>
      <div className="space-y-1">
        {DATA_TYPES.map((type) => (
          <div
            key={type.id}
            draggable
            onDragStart={(e) => handleDragStart(e, type.id)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg cursor-move hover:border-slate-400 hover:shadow-sm transition-all group"
          >
            <span className="text-lg flex-shrink-0 w-6 text-center">{type.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900">{type.name}</div>
              <div className="text-xs text-slate-500 truncate">{type.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
