import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  Project,
  DataModel,
  DataField,
  ModelField,
  Relationship,
  RLSPolicy,
  ModelNesting,
} from '../lib/types';

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  models: DataModel[];
  fields: DataField[];
  modelFields: ModelField[];
  relationships: Relationship[];
  rlsPolicies: RLSPolicy[];
  modelNestings: ModelNesting[];
  loading: boolean;
  setCurrentProject: (project: Project | null) => void;
  loadProject: (projectId: string) => Promise<void>;
  createProject: (name: string, description: string) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  createModel: (model: Omit<DataModel, 'id' | 'created_at' | 'updated_at'>) => Promise<DataModel>;
  updateModel: (modelId: string, updates: Partial<DataModel>) => Promise<void>;
  deleteModel: (modelId: string) => Promise<void>;
  createField: (field: Omit<DataField, 'id' | 'created_at' | 'updated_at'>) => Promise<DataField>;
  updateField: (fieldId: string, updates: Partial<DataField>) => Promise<void>;
  deleteField: (fieldId: string) => Promise<void>;
  addFieldToModel: (modelId: string, fieldId: string, config: Partial<ModelField>) => Promise<void>;
  updateModelField: (modelFieldId: string, updates: Partial<ModelField>) => Promise<void>;
  removeFieldFromModel: (modelFieldId: string) => Promise<void>;
  createRelationship: (relationship: Omit<Relationship, 'id' | 'created_at' | 'updated_at'>) => Promise<Relationship>;
  updateRelationship: (relationshipId: string, updates: Partial<Relationship>) => Promise<void>;
  deleteRelationship: (relationshipId: string) => Promise<void>;
  createRLSPolicy: (policy: Omit<RLSPolicy, 'id' | 'created_at' | 'updated_at'>) => Promise<RLSPolicy>;
  updateRLSPolicy: (policyId: string, updates: Partial<RLSPolicy>) => Promise<void>;
  deleteRLSPolicy: (policyId: string) => Promise<void>;
  nestModel: (parentId: string, childId: string, orderIndex: number) => Promise<void>;
  unnestModel: (nestingId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [models, setModels] = useState<DataModel[]>([]);
  const [fields, setFields] = useState<DataField[]>([]);
  const [modelFields, setModelFields] = useState<ModelField[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [rlsPolicies, setRlsPolicies] = useState<RLSPolicy[]>([]);
  const [modelNestings, setModelNestings] = useState<ModelNesting[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
    }
  }, [user]);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
  };

  const loadProject = async (projectId: string) => {
    setLoading(true);
    try {
      const [projectRes, modelsRes, fieldsRes, modelFieldsRes, relationshipsRes, rlsRes, nestingRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).maybeSingle(),
        supabase.from('data_models').select('*').eq('project_id', projectId),
        supabase.from('data_fields').select('*').eq('project_id', projectId),
        supabase.from('model_fields').select('*, field:data_fields(*)').in('model_id', []),
        supabase.from('relationships').select('*').eq('project_id', projectId),
        supabase.from('rls_policies').select('*'),
        supabase.from('model_nesting').select('*, child_model:data_models(*)'),
      ]);

      if (projectRes.data) setCurrentProject(projectRes.data);
      if (modelsRes.data) {
        setModels(modelsRes.data);
        const modelIds = modelsRes.data.map(m => m.id);

        const { data: mfData } = await supabase
          .from('model_fields')
          .select('*, field:data_fields(*)')
          .in('model_id', modelIds);
        if (mfData) setModelFields(mfData as ModelField[]);

        const { data: rlsData } = await supabase
          .from('rls_policies')
          .select('*')
          .in('model_id', modelIds);
        if (rlsData) setRlsPolicies(rlsData);

        const { data: nestingData } = await supabase
          .from('model_nesting')
          .select('*, child_model:data_models(*)')
          .in('parent_model_id', modelIds);
        if (nestingData) setModelNestings(nestingData as ModelNesting[]);
      }
      if (fieldsRes.data) setFields(fieldsRes.data);
      if (relationshipsRes.data) setRelationships(relationshipsRes.data);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (currentProject) {
      await loadProject(currentProject.id);
    }
  };

  const createProject = async (name: string, description: string): Promise<Project> => {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name, description, user_id: user!.id })
      .select()
      .single();

    if (error) throw error;
    await loadProjects();
    return data;
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    const { error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', projectId);

    if (error) throw error;
    await loadProjects();
    if (currentProject?.id === projectId) {
      await loadProject(projectId);
    }
  };

  const deleteProject = async (projectId: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) throw error;
    await loadProjects();
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
  };

  const createModel = async (model: Omit<DataModel, 'id' | 'created_at' | 'updated_at'>): Promise<DataModel> => {
    const { data, error } = await supabase.from('data_models').insert(model).select().single();
    if (error) throw error;
    await refreshData();
    return data;
  };

  const updateModel = async (modelId: string, updates: Partial<DataModel>) => {
    const { error } = await supabase
      .from('data_models')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', modelId);
    if (error) throw error;
    await refreshData();
  };

  const deleteModel = async (modelId: string) => {
    const { error } = await supabase.from('data_models').delete().eq('id', modelId);
    if (error) throw error;
    await refreshData();
  };

  const createField = async (field: Omit<DataField, 'id' | 'created_at' | 'updated_at'>): Promise<DataField> => {
    const { data, error } = await supabase.from('data_fields').insert(field).select().single();
    if (error) throw error;
    await refreshData();
    return data;
  };

  const updateField = async (fieldId: string, updates: Partial<DataField>) => {
    const { error } = await supabase
      .from('data_fields')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', fieldId);
    if (error) throw error;
    await refreshData();
  };

  const deleteField = async (fieldId: string) => {
    const { error } = await supabase.from('data_fields').delete().eq('id', fieldId);
    if (error) throw error;
    await refreshData();
  };

  const addFieldToModel = async (modelId: string, fieldId: string, config: Partial<ModelField>) => {
    const { data: existing } = await supabase
      .from('model_fields')
      .select('order_index')
      .eq('model_id', modelId)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();

    const orderIndex = existing ? existing.order_index + 1 : 0;

    const { error } = await supabase
      .from('model_fields')
      .insert({ model_id: modelId, field_id: fieldId, order_index: orderIndex, ...config });
    if (error) throw error;
    await refreshData();
  };

  const updateModelField = async (modelFieldId: string, updates: Partial<ModelField>) => {
    const { error } = await supabase.from('model_fields').update(updates).eq('id', modelFieldId);
    if (error) throw error;
    await refreshData();
  };

  const removeFieldFromModel = async (modelFieldId: string) => {
    const { error } = await supabase.from('model_fields').delete().eq('id', modelFieldId);
    if (error) throw error;
    await refreshData();
  };

  const createRelationship = async (relationship: Omit<Relationship, 'id' | 'created_at' | 'updated_at'>): Promise<Relationship> => {
    const { data, error } = await supabase.from('relationships').insert(relationship).select().single();
    if (error) throw error;
    await refreshData();
    return data;
  };

  const updateRelationship = async (relationshipId: string, updates: Partial<Relationship>) => {
    const { error } = await supabase
      .from('relationships')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', relationshipId);
    if (error) throw error;
    await refreshData();
  };

  const deleteRelationship = async (relationshipId: string) => {
    const { error } = await supabase.from('relationships').delete().eq('id', relationshipId);
    if (error) throw error;
    await refreshData();
  };

  const createRLSPolicy = async (policy: Omit<RLSPolicy, 'id' | 'created_at' | 'updated_at'>): Promise<RLSPolicy> => {
    const { data, error } = await supabase.from('rls_policies').insert(policy).select().single();
    if (error) throw error;
    await refreshData();
    return data;
  };

  const updateRLSPolicy = async (policyId: string, updates: Partial<RLSPolicy>) => {
    const { error } = await supabase
      .from('rls_policies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', policyId);
    if (error) throw error;
    await refreshData();
  };

  const deleteRLSPolicy = async (policyId: string) => {
    const { error } = await supabase.from('rls_policies').delete().eq('id', policyId);
    if (error) throw error;
    await refreshData();
  };

  const nestModel = async (parentId: string, childId: string, orderIndex: number) => {
    const { error } = await supabase
      .from('model_nesting')
      .insert({ parent_model_id: parentId, child_model_id: childId, order_index: orderIndex });
    if (error) throw error;
    await refreshData();
  };

  const unnestModel = async (nestingId: string) => {
    const { error } = await supabase.from('model_nesting').delete().eq('id', nestingId);
    if (error) throw error;
    await refreshData();
  };

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        projects,
        models,
        fields,
        modelFields,
        relationships,
        rlsPolicies,
        modelNestings,
        loading,
        setCurrentProject,
        loadProject,
        createProject,
        updateProject,
        deleteProject,
        createModel,
        updateModel,
        deleteModel,
        createField,
        updateField,
        deleteField,
        addFieldToModel,
        updateModelField,
        removeFieldFromModel,
        createRelationship,
        updateRelationship,
        deleteRelationship,
        createRLSPolicy,
        updateRLSPolicy,
        deleteRLSPolicy,
        nestModel,
        unnestModel,
        refreshData,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
