import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DataModel } from '../../lib/types';
import { useProject } from '../../contexts/ProjectContext';

interface SecurityTabProps {
  model: DataModel;
}

export function SecurityTab({ model }: SecurityTabProps) {
  const { rlsPolicies, createRLSPolicy, deleteRLSPolicy } = useProject();
  const [showAddPolicy, setShowAddPolicy] = useState(false);
  const [operation, setOperation] = useState<'CREATE' | 'READ' | 'UPDATE' | 'DELETE'>('READ');
  const [description, setDescription] = useState('');

  const modelPolicies = rlsPolicies.filter(p => p.model_id === model.id);

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    await createRLSPolicy({
      model_id: model.id,
      operation,
      rule_description: description,
      condition: {},
    });

    setDescription('');
    setOperation('READ');
    setShowAddPolicy(false);
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (confirm('Delete this security policy?')) {
      await deleteRLSPolicy(policyId);
    }
  };

  const operations = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const;
  const operationColors = {
    CREATE: 'bg-green-100 text-green-700 border-green-200',
    READ: 'bg-blue-100 text-blue-700 border-blue-200',
    UPDATE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    DELETE: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Row-Level Security Policies</h3>
        <p className="text-sm text-slate-600 mb-6">
          Define who can access what data. Policies are expressed in plain English and will be included in the export for implementation.
        </p>
      </div>

      {modelPolicies.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <p className="text-slate-600 mb-2">No security policies defined yet.</p>
          <p className="text-sm text-slate-500">
            Add policies to control data access based on user roles and ownership.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {operations.map((op) => {
            const policiesForOp = modelPolicies.filter(p => p.operation === op);
            if (policiesForOp.length === 0) return null;

            return (
              <div key={op} className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-700">{op} Policies</h4>
                {policiesForOp.map((policy) => (
                  <div
                    key={policy.id}
                    className={`border rounded-lg p-4 ${operationColors[op]}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold uppercase px-2 py-1 bg-white/50 rounded">
                            {policy.operation}
                          </span>
                        </div>
                        <p className="text-sm">{policy.rule_description}</p>
                      </div>
                      <button
                        onClick={() => handleDeletePolicy(policy.id)}
                        className="p-1.5 hover:bg-white/50 rounded transition-colors"
                        title="Delete Policy"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {!showAddPolicy ? (
        <button
          onClick={() => setShowAddPolicy(true)}
          className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Security Policy
        </button>
      ) : (
        <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
          <h4 className="text-sm font-semibold mb-3">Create Security Policy</h4>
          <form onSubmit={handleCreatePolicy} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Operation
              </label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value as typeof operation)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {operations.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Rule Description (Plain English)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[100px]"
                placeholder="e.g., A User can only READ a Record IF Record.userId is equal to the User.id"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Describe the rule in clear, simple language. This will be used to generate actual security policies.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddPolicy(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Add Policy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="text-sm font-semibold text-amber-900 mb-2">Important Note</h4>
        <p className="text-sm text-amber-800">
          Security policies defined here are descriptive and will be included in the export.
          They must be properly implemented in your backend to actually enforce access control.
        </p>
      </div>
    </div>
  );
}
