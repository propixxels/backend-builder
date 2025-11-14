import { useState } from 'react';
import { Link } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';

export function RelationshipConnector() {
  const { models, currentProject, createRelationship } = useProject();
  const [sourceModelId, setSourceModelId] = useState('');
  const [targetModelId, setTargetModelId] = useState('');
  const [cardinality, setCardinality] = useState<'1:1' | '1:M' | 'M:M'>('1:M');
  const [showDialog, setShowDialog] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !sourceModelId || !targetModelId) return;

    await createRelationship({
      project_id: currentProject.id,
      source_model_id: sourceModelId,
      target_model_id: targetModelId,
      cardinality,
    });

    setSourceModelId('');
    setTargetModelId('');
    setCardinality('1:M');
    setShowDialog(false);
  };

  if (models.length < 2) return null;

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="absolute top-6 right-6 bg-white px-4 py-2 rounded-lg shadow-lg border border-slate-200 hover:shadow-xl transition-shadow flex items-center gap-2 text-sm font-medium text-slate-900"
      >
        <Link className="w-4 h-4" />
        Add Relationship
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Create Relationship</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  From Model
                </label>
                <select
                  value={sourceModelId}
                  onChange={(e) => setSourceModelId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                >
                  <option value="">Select source model</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  To Model
                </label>
                <select
                  value={targetModelId}
                  onChange={(e) => setTargetModelId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                >
                  <option value="">Select target model</option>
                  {models
                    .filter((m) => m.id !== sourceModelId)
                    .map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Relationship Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1:1', '1:M', 'M:M'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCardinality(type)}
                      className={`px-4 py-2 rounded-lg border-2 font-semibold transition-colors ${
                        cardinality === type
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  1:1 = One-to-One, 1:M = One-to-Many, M:M = Many-to-Many
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
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
    </>
  );
}
