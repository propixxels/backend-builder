import { useState } from 'react';
import { X, Database, Shield, Settings as SettingsIcon } from 'lucide-react';
import { DataModel } from '../../lib/types';
import { FieldsTab } from './FieldsTab';
import { ActionsTab } from './ActionsTab';
import { SecurityTab } from './SecurityTab';

interface ModelEditorProps {
  model: DataModel;
  onClose: () => void;
}

type Tab = 'fields' | 'actions' | 'security';

export function ModelEditor({ model, onClose }: ModelEditorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('fields');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{model.name}</h2>
            <p className="text-sm text-slate-600">Configure model structure and behavior</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="border-b border-slate-200 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('fields')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'fields'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-4 h-4" />
              Fields & Structure
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'actions'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              CRUD Actions
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'security'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              Security (RLS)
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'fields' && <FieldsTab model={model} />}
          {activeTab === 'actions' && <ActionsTab model={model} />}
          {activeTab === 'security' && <SecurityTab model={model} />}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
