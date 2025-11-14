import { useState } from 'react';
import { Plus, Box, FileText } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { DataType } from '../../lib/types';
import { DATA_TYPES } from '../../lib/constants';

export function ProjectLibrary() {
  const { fields, models, createField, createModel, currentProject } = useProject();
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<DataType>('text');
  const [modelName, setModelName] = useState('');

  const reusableFields = fields.filter(f => f.is_reusable);

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !fieldName.trim()) return;

    await createField({
      project_id: currentProject.id,
      name: fieldName,
      data_type: fieldType,
      is_reusable: true,
    });

    setFieldName('');
    setFieldType('text');
    setShowFieldModal(false);
  };

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !modelName.trim()) return;

    await createModel({
      project_id: currentProject.id,
      name: modelName,
      canvas_position: { x: 100, y: 100 },
      crud_actions: { create: true, read: true, update: true, delete: true },
    });

    setModelName('');
    setShowModelModal(false);
  };

  const handleDragField = (e: React.DragEvent, fieldId: string) => {
    e.dataTransfer.setData('fieldId', fieldId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragModel = (e: React.DragEvent, modelId: string) => {
    e.dataTransfer.setData('modelId', modelId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="p-4 flex-1 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Fields
          </h3>
          <button
            onClick={() => setShowFieldModal(true)}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
            title="Create Field"
          >
            <Plus className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="space-y-1">
          {reusableFields.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">No fields yet</p>
          ) : (
            reusableFields.map((field) => (
              <div
                key={field.id}
                draggable
                onDragStart={(e) => handleDragField(e, field.id)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg cursor-move hover:border-slate-400 hover:shadow-sm transition-all"
              >
                <div className="text-sm font-medium text-slate-900">{field.name}</div>
                <div className="text-xs text-slate-500">
                  {DATA_TYPES.find(t => t.id === field.data_type)?.name}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Box className="w-4 h-4" />
            Models
          </h3>
          <button
            onClick={() => setShowModelModal(true)}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
            title="Create Model"
          >
            <Plus className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="space-y-1">
          {models.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">No models yet</p>
          ) : (
            models.map((model) => (
              <div
                key={model.id}
                draggable
                onDragStart={(e) => handleDragModel(e, model.id)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg cursor-move hover:border-slate-400 hover:shadow-sm transition-all"
              >
                <div className="text-sm font-medium text-slate-900">{model.name}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {showFieldModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Create Field</h3>
            <form onSubmit={handleCreateField}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Field Name
                </label>
                <input
                  type="text"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g., First Name"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data Type
                </label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as DataType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {DATA_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFieldModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Create Model</h3>
            <form onSubmit={handleCreateModel}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Model Name
                </label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g., Customer"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModelModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
