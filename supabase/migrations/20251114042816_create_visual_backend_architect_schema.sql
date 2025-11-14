/*
  # Visual Backend Architect Database Schema

  ## Overview
  This migration creates the complete database schema for the Visual Backend Architect application,
  a visual IDE for designing backend architecture including data models, relationships, business logic,
  and security policies.

  ## New Tables

  ### 1. `projects`
  Stores user projects (workspaces for designing backend schemas)
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text) - Project name
  - `description` (text) - Optional project description
  - `canvas_state` (jsonb) - Stores canvas viewport and visual grouping boxes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `data_models`
  Stores custom data models (e.g., Customer, Order, Product)
  - `id` (uuid, primary key)
  - `project_id` (uuid, references projects)
  - `name` (text) - Model name (e.g., "Customer")
  - `canvas_position` (jsonb) - {x, y} coordinates on canvas
  - `crud_actions` (jsonb) - {create, read, update, delete} boolean flags
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `data_fields`
  Stores reusable data fields that can be added to models
  - `id` (uuid, primary key)
  - `project_id` (uuid, references projects)
  - `name` (text) - Field name (e.g., "First Name")
  - `data_type` (text) - Base type (text, email, number, etc.)
  - `is_reusable` (boolean) - True if in project library, false if model-specific
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `model_fields`
  Junction table linking fields to models with ordering and rules
  - `id` (uuid, primary key)
  - `model_id` (uuid, references data_models)
  - `field_id` (uuid, references data_fields)
  - `order_index` (integer) - Field position in model
  - `is_required` (boolean)
  - `is_unique` (boolean)
  - `business_rules` (jsonb) - Array of validation rules
  - `created_at` (timestamptz)

  ### 5. `model_nesting`
  Tracks when a model is nested inside another model
  - `id` (uuid, primary key)
  - `parent_model_id` (uuid, references data_models)
  - `child_model_id` (uuid, references data_models)
  - `order_index` (integer) - Position in parent model
  - `created_at` (timestamptz)

  ### 6. `relationships`
  Stores relationships between data models
  - `id` (uuid, primary key)
  - `project_id` (uuid, references projects)
  - `source_model_id` (uuid, references data_models)
  - `target_model_id` (uuid, references data_models)
  - `cardinality` (text) - "1:1", "1:M", or "M:M"
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. `rls_policies`
  Stores row-level security policies for models
  - `id` (uuid, primary key)
  - `model_id` (uuid, references data_models)
  - `operation` (text) - "CREATE", "READ", "UPDATE", "DELETE"
  - `rule_description` (text) - Plain English description
  - `condition` (jsonb) - Structured rule condition
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own projects and related data
  - Policies enforce authentication and ownership checks
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  canvas_state jsonb DEFAULT '{"viewport": {"x": 0, "y": 0, "zoom": 1}, "groups": []}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  canvas_position jsonb DEFAULT '{"x": 0, "y": 0}'::jsonb,
  crud_actions jsonb DEFAULT '{"create": true, "read": true, "update": true, "delete": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  data_type text NOT NULL,
  is_reusable boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS model_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES data_models(id) ON DELETE CASCADE,
  field_id uuid NOT NULL REFERENCES data_fields(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  is_required boolean DEFAULT false,
  is_unique boolean DEFAULT false,
  business_rules jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS model_nesting (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_model_id uuid NOT NULL REFERENCES data_models(id) ON DELETE CASCADE,
  child_model_id uuid NOT NULL REFERENCES data_models(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source_model_id uuid NOT NULL REFERENCES data_models(id) ON DELETE CASCADE,
  target_model_id uuid NOT NULL REFERENCES data_models(id) ON DELETE CASCADE,
  cardinality text NOT NULL DEFAULT '1:M',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rls_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES data_models(id) ON DELETE CASCADE,
  operation text NOT NULL,
  rule_description text DEFAULT '',
  condition jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_nesting ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE rls_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view models in own projects"
  ON data_models FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = data_models.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create models in own projects"
  ON data_models FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = data_models.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update models in own projects"
  ON data_models FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = data_models.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = data_models.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete models in own projects"
  ON data_models FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = data_models.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view fields in own projects"
  ON data_fields FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = data_fields.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create fields in own projects"
  ON data_fields FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = data_fields.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update fields in own projects"
  ON data_fields FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = data_fields.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = data_fields.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete fields in own projects"
  ON data_fields FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = data_fields.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view model_fields in own projects"
  ON model_fields FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM data_models
      JOIN projects ON projects.id = data_models.project_id
      WHERE data_models.id = model_fields.model_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create model_fields in own projects"
  ON model_fields FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM data_models
      JOIN projects ON projects.id = data_models.project_id
      WHERE data_models.id = model_fields.model_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update model_fields in own projects"
  ON model_fields FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM data_models
      JOIN projects ON projects.id = data_models.project_id
      WHERE data_models.id = model_fields.model_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM data_models
      JOIN projects ON projects.id = data_models.project_id
      WHERE data_models.id = model_fields.model_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete model_fields in own projects"
  ON model_fields FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM data_models
      JOIN projects ON projects.id = data_models.project_id
      WHERE data_models.id = model_fields.model_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view model_nesting in own projects"
  ON model_nesting FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM data_models
      JOIN projects ON projects.id = data_models.project_id
      WHERE data_models.id = model_nesting.parent_model_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create model_nesting in own projects"
  ON model_nesting FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM data_models
      JOIN projects ON projects.id = data_models.project_id
      WHERE data_models.id = model_nesting.parent_model_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update model_nesting in own projects"
  ON model_nesting FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM data_models
      JOIN projects ON projects.id = data_models.project_id
      WHERE data_models.id = model_nesting.parent_model_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM data_models
      JOIN projects ON projects.id = data_models.project_id
      WHERE data_models.id = model_nesting.parent_model_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete model_nesting in own projects"
  ON model_nesting FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM data_models
      JOIN projects ON projects.id = data_models.project_id
      WHERE data_models.id = model_nesting.parent_model_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view relationships in own projects"
  ON relationships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = relationships.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create relationships in own projects"
  ON relationships FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = relationships.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update relationships in own projects"
  ON relationships FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = relationships.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = relationships.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete relationships in own projects"
  ON relationships FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = relationships.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view rls_policies in own projects"
  ON rls_policies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM data_models
      JOIN projects ON projects.id = data_models.project_id
      WHERE data_models.id = rls_policies.model_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create rls_policies in own projects"
  ON rls_policies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM data_models
      JOIN projects ON projects.id = data_models.project_id
      WHERE data_models.id = rls_policies.model_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update rls_policies in own projects"
  ON rls_policies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM data_models
      JOIN projects ON projects.id = data_models.project_id
      WHERE data_models.id = rls_policies.model_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM data_models
      JOIN projects ON projects.id = data_models.project_id
      WHERE data_models.id = rls_policies.model_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete rls_policies in own projects"
  ON rls_policies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM data_models
      JOIN projects ON projects.id = data_models.project_id
      WHERE data_models.id = rls_policies.model_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_data_models_project_id ON data_models(project_id);
CREATE INDEX IF NOT EXISTS idx_data_fields_project_id ON data_fields(project_id);
CREATE INDEX IF NOT EXISTS idx_model_fields_model_id ON model_fields(model_id);
CREATE INDEX IF NOT EXISTS idx_model_fields_field_id ON model_fields(field_id);
CREATE INDEX IF NOT EXISTS idx_model_nesting_parent ON model_nesting(parent_model_id);
CREATE INDEX IF NOT EXISTS idx_model_nesting_child ON model_nesting(child_model_id);
CREATE INDEX IF NOT EXISTS idx_relationships_project_id ON relationships(project_id);
CREATE INDEX IF NOT EXISTS idx_relationships_source ON relationships(source_model_id);
CREATE INDEX IF NOT EXISTS idx_relationships_target ON relationships(target_model_id);
CREATE INDEX IF NOT EXISTS idx_rls_policies_model_id ON rls_policies(model_id);
