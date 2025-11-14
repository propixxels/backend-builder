import {
  ExportBlueprint,
  ExportModel,
  ExportField,
  ExportRelationship,
  ExportRLSPolicy,
  ExportNestedModel,
} from '../types';

interface ProjectContextData {
  currentProject: {
    id: string;
    name: string;
    description: string;
  } | null;
  models: Array<{
    id: string;
    name: string;
    crud_actions: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  }>;
  modelFields: Array<{
    id: string;
    model_id: string;
    field_id: string;
    order_index: number;
    is_required: boolean;
    is_unique: boolean;
    business_rules: Array<{
      type: string;
      value: string | number;
      message?: string;
    }>;
    field?: {
      name: string;
      data_type: string;
    };
  }>;
  modelNestings: Array<{
    id: string;
    parent_model_id: string;
    child_model_id: string;
    order_index: number;
    child_model?: {
      name: string;
    };
  }>;
  relationships: Array<{
    id: string;
    source_model_id: string;
    target_model_id: string;
    cardinality: '1:1' | '1:M' | 'M:M';
  }>;
  rlsPolicies: Array<{
    id: string;
    model_id: string;
    operation: string;
    rule_description: string;
    condition: Record<string, unknown>;
  }>;
}

export async function exportToJSON(context: ProjectContextData): Promise<ExportBlueprint> {
  if (!context.currentProject) {
    throw new Error('No project selected');
  }

  const models: ExportModel[] = context.models.map((model) => {
    const fields: ExportField[] = context.modelFields
      .filter((mf) => mf.model_id === model.id)
      .sort((a, b) => a.order_index - b.order_index)
      .map((mf) => ({
        name: mf.field?.name || 'Unknown',
        type: mf.field?.data_type as ExportField['type'],
        required: mf.is_required,
        unique: mf.is_unique,
        validation_rules: mf.business_rules,
      }));

    const nestedModels: ExportNestedModel[] = context.modelNestings
      .filter((mn) => mn.parent_model_id === model.id)
      .sort((a, b) => a.order_index - b.order_index)
      .map((mn) => ({
        model_name: mn.child_model?.name || 'Unknown',
        order: mn.order_index,
      }));

    const securityPolicies: ExportRLSPolicy[] = context.rlsPolicies
      .filter((policy) => policy.model_id === model.id)
      .map((policy) => ({
        operation: policy.operation,
        description: policy.rule_description,
        condition: policy.condition,
      }));

    return {
      name: model.name,
      fields,
      nested_models: nestedModels,
      actions: model.crud_actions,
      security_policies: securityPolicies,
    };
  });

  const relationships: ExportRelationship[] = context.relationships.map((rel) => {
    const sourceModel = context.models.find((m) => m.id === rel.source_model_id);
    const targetModel = context.models.find((m) => m.id === rel.target_model_id);

    return {
      from: sourceModel?.name || 'Unknown',
      to: targetModel?.name || 'Unknown',
      type: rel.cardinality,
    };
  });

  return {
    meta: {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      project_name: context.currentProject.name,
      project_description: context.currentProject.description,
    },
    models,
    relationships,
  };
}
