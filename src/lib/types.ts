export interface User {
  id: string;
  email: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  canvas_state: CanvasState;
  created_at: string;
  updated_at: string;
}

export interface CanvasState {
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  groups: VisualGroup[];
}

export interface VisualGroup {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
}

export interface DataModel {
  id: string;
  project_id: string;
  name: string;
  canvas_position: { x: number; y: number };
  crud_actions: CRUDActions;
  created_at: string;
  updated_at: string;
}

export interface CRUDActions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface DataField {
  id: string;
  project_id: string;
  name: string;
  data_type: DataType;
  is_reusable: boolean;
  created_at: string;
  updated_at: string;
}

export type DataType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'currency'
  | 'date'
  | 'time'
  | 'datetime'
  | 'boolean'
  | 'uuid'
  | 'url'
  | 'json';

export interface ModelField {
  id: string;
  model_id: string;
  field_id: string;
  order_index: number;
  is_required: boolean;
  is_unique: boolean;
  business_rules: BusinessRule[];
  created_at: string;
  field?: DataField;
}

export interface BusinessRule {
  type: 'min' | 'max' | 'pattern' | 'custom';
  value: string | number;
  message?: string;
}

export interface ModelNesting {
  id: string;
  parent_model_id: string;
  child_model_id: string;
  order_index: number;
  created_at: string;
  child_model?: DataModel;
}

export interface Relationship {
  id: string;
  project_id: string;
  source_model_id: string;
  target_model_id: string;
  cardinality: '1:1' | '1:M' | 'M:M';
  created_at: string;
  updated_at: string;
}

export interface RLSPolicy {
  id: string;
  model_id: string;
  operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  rule_description: string;
  condition: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ExportBlueprint {
  meta: {
    version: string;
    exported_at: string;
    project_name: string;
    project_description: string;
  };
  models: ExportModel[];
  relationships: ExportRelationship[];
}

export interface ExportModel {
  name: string;
  fields: ExportField[];
  nested_models: ExportNestedModel[];
  actions: CRUDActions;
  security_policies: ExportRLSPolicy[];
}

export interface ExportField {
  name: string;
  type: DataType;
  required: boolean;
  unique: boolean;
  validation_rules: BusinessRule[];
}

export interface ExportNestedModel {
  model_name: string;
  order: number;
}

export interface ExportRelationship {
  from: string;
  to: string;
  type: '1:1' | '1:M' | 'M:M';
}

export interface ExportRLSPolicy {
  operation: string;
  description: string;
  condition: Record<string, unknown>;
}
