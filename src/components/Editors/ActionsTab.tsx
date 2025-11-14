import { DataModel } from '../../lib/types';
import { useProject } from '../../contexts/ProjectContext';
import { Check } from 'lucide-react';

interface ActionsTabProps {
  model: DataModel;
}

export function ActionsTab({ model }: ActionsTabProps) {
  const { updateModel } = useProject();

  const handleToggle = async (action: keyof typeof model.crud_actions) => {
    await updateModel(model.id, {
      crud_actions: {
        ...model.crud_actions,
        [action]: !model.crud_actions[action],
      },
    });
  };

  const actions = [
    {
      key: 'create' as const,
      label: 'Create',
      description: 'Allow creating new records',
    },
    {
      key: 'read' as const,
      label: 'Read',
      description: 'Allow reading/querying records',
    },
    {
      key: 'update' as const,
      label: 'Update',
      description: 'Allow modifying existing records',
    },
    {
      key: 'delete' as const,
      label: 'Delete',
      description: 'Allow deleting records',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">CRUD Operations</h3>
        <p className="text-sm text-slate-600 mb-6">
          Define which operations are allowed for this data model. Disabled operations will not generate API endpoints.
        </p>
      </div>

      <div className="space-y-3">
        {actions.map((action) => (
          <div
            key={action.key}
            className="border border-slate-200 rounded-lg p-4 bg-white hover:border-slate-300 transition-colors"
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative flex items-center justify-center w-6 h-6 mt-0.5">
                <input
                  type="checkbox"
                  checked={model.crud_actions[action.key]}
                  onChange={() => handleToggle(action.key)}
                  className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900 flex items-center gap-2">
                  {action.label}
                  {model.crud_actions[action.key] && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Enabled
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-600 mt-1">{action.description}</div>
              </div>
            </label>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Export Impact</h4>
        <p className="text-sm text-blue-800">
          These settings will inform code generation tools which API endpoints and methods to create.
          Disabled operations will be omitted from the exported schema.
        </p>
      </div>
    </div>
  );
}
