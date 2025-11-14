import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { DataModel, DataType } from '../../lib/types';
import { useProject } from '../../contexts/ProjectContext';
import { DATA_TYPES } from '../../lib/constants';

interface FieldsTabProps {
  model: DataModel;
}

export function FieldsTab({ model }: FieldsTabProps) {
  const {
    fields,
    modelFields,
    createField,
    addFieldToModel,
    updateModelField,
    removeFieldFromModel,
  } = useProject();
  const [showAddField, setShowAddField] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<DataType>('text');
  const [isRequired, setIsRequired] = useState(false);
  const [isUnique, setIsUnique] = useState(false);
  const [expandedField, setExpandedField] = useState<string | null>(null);

  const modelFieldsList = modelFields
    .filter(mf => mf.model_id === model.id)
    .sort((a, b) => a.order_index - b.order_index);

  const availableFields = fields.filter(f => f.is_reusable);

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim()) return;

    const newField = await createField({
      project_id: model.project_id,
      name: fieldName,
      data_type: fieldType,
      is_reusable: false,
    });

    await addFieldToModel(model.id, newField.id, {
      is_required: isRequired,
      is_unique: isUnique,
      business_rules: [],
    });

    setFieldName('');
    setFieldType('text');
    setIsRequired(false);
    setIsUnique(false);
    setShowAddField(false);
  };

  const handleAddExistingField = async (fieldId: string) => {
    await addFieldToModel(model.id, fieldId, {
      is_required: false,
      is_unique: false,
      business_rules: [],
    });
  };

  const handleRemoveField = async (modelFieldId: string) => {
    if (confirm('Remove this field from the model?')) {
      await removeFieldFromModel(modelFieldId);
    }
  };

  const handleToggleRequired = async (modelFieldId: string, currentValue: boolean) => {
    await updateModelField(modelFieldId, { is_required: !currentValue });
  };

  const handleToggleUnique = async (modelFieldId: string, currentValue: boolean) => {
    await updateModelField(modelFieldId, { is_unique: !currentValue });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Model Fields</h3>

        {modelFieldsList.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <p className="text-slate-600">No fields yet. Add your first field below.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {modelFieldsList.map((mf) => (
              <div
                key={mf.id}
                className="border border-slate-200 rounded-lg overflow-hidden"
              >
                <div className="p-4 bg-white flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{mf.field?.name}</span>
                      <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {DATA_TYPES.find(t => t.id === mf.field?.data_type)?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mf.is_required}
                          onChange={() => handleToggleRequired(mf.id, mf.is_required)}
                          className="rounded border-slate-300"
                        />
                        <span className="text-slate-700">Required</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mf.is_unique}
                          onChange={() => handleToggleUnique(mf.id, mf.is_unique)}
                          className="rounded border-slate-300"
                        />
                        <span className="text-slate-700">Unique</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedField(expandedField === mf.id ? null : mf.id)}
                      className="p-2 hover:bg-slate-100 rounded transition-colors"
                      title="Business Rules"
                    >
                      {expandedField === mf.id ? (
                        <ChevronUp className="w-4 h-4 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleRemoveField(mf.id)}
                      className="p-2 hover:bg-red-100 rounded transition-colors"
                      title="Remove Field"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {expandedField === mf.id && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">
                      Business Rules
                    </h4>
                    {mf.business_rules && mf.business_rules.length > 0 ? (
                      <div className="space-y-1">
                        {mf.business_rules.map((rule, idx) => (
                          <div key={idx} className="text-sm text-slate-600">
                            {rule.type}: {rule.value}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No rules defined</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {!showAddField ? (
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddField(true)}
            className="flex-1 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Field
          </button>

          {availableFields.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddExistingField(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                Add from Library
              </option>
              {availableFields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.name} ({DATA_TYPES.find(t => t.id === field.data_type)?.name})
                </option>
              ))}
            </select>
          )}
        </div>
      ) : (
        <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
          <h4 className="text-sm font-semibold mb-3">Create New Field</h4>
          <form onSubmit={handleCreateAndAdd} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Field Name
              </label>
              <input
                type="text"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="e.g., Email Address"
                required
              />
            </div>

            <div>
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

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span className="text-slate-700">Required</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUnique}
                  onChange={(e) => setIsUnique(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span className="text-slate-700">Unique</span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddField(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Add Field
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
