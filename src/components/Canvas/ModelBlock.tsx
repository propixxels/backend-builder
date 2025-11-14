import { useState, useRef, useEffect } from 'react';
import { Box, Settings, Trash2, Plus } from 'lucide-react';
import { DataModel } from '../../lib/types';
import { useProject } from '../../contexts/ProjectContext';
import { ModelEditor } from '../Editors/ModelEditor';

interface ModelBlockProps {
  model: DataModel;
  isSelected: boolean;
  onSelect: () => void;
  isConnecting: boolean;
  onStartConnection: () => void;
  onEndConnection: () => void;
}

export function ModelBlock({
  model,
  isSelected,
  onSelect,
}: ModelBlockProps) {
  const { updateModel, deleteModel, modelFields } = useProject();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showEditor, setShowEditor] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);

  const fields = modelFields.filter(mf => mf.model_id === model.id);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - model.canvas_position.x,
      y: e.clientY - model.canvas_position.y,
    });
    onSelect();
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      if (blockRef.current) {
        blockRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
      }
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);

      if (blockRef.current) {
        const transform = blockRef.current.style.transform;
        const match = transform.match(/translate\((-?\d+\.?\d*)px,\s*(-?\d+\.?\d*)px\)/);
        if (match) {
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);
          updateModel(model.id, {
            canvas_position: { x, y },
          });
        }
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, model.id, updateModel]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete model "${model.name}"?`)) {
      await deleteModel(model.id);
    }
  };

  return (
    <>
      <div
        ref={blockRef}
        className={`absolute bg-white rounded-lg shadow-lg border-2 ${
          isSelected ? 'border-slate-900' : 'border-slate-300'
        } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} transition-shadow hover:shadow-xl`}
        style={{
          transform: `translate(${model.canvas_position.x}px, ${model.canvas_position.y}px)`,
          minWidth: '240px',
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="bg-slate-900 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4" />
            <span className="font-semibold">{model.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEditor(true);
              }}
              className="p-1 hover:bg-slate-800 rounded transition-colors"
              title="Edit Model"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-red-600 rounded transition-colors"
              title="Delete Model"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-3">
          {fields.length === 0 ? (
            <div className="text-sm text-slate-400 italic text-center py-2">
              No fields yet
            </div>
          ) : (
            <div className="space-y-2">
              {fields
                .sort((a, b) => a.order_index - b.order_index)
                .map((mf) => (
                  <div
                    key={mf.id}
                    className="text-sm px-2 py-1 bg-slate-50 rounded border border-slate-200"
                  >
                    <div className="font-medium text-slate-900">
                      {mf.field?.name}
                      {mf.is_required && <span className="text-red-500 ml-1">*</span>}
                      {mf.is_unique && <span className="text-blue-500 ml-1">unique</span>}
                    </div>
                    <div className="text-xs text-slate-500">{mf.field?.data_type}</div>
                  </div>
                ))}
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowEditor(true);
            }}
            className="w-full mt-3 px-3 py-1.5 border border-dashed border-slate-300 rounded text-sm text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
        </div>
      </div>

      {showEditor && (
        <ModelEditor model={model} onClose={() => setShowEditor(false)} />
      )}
    </>
  );
}
