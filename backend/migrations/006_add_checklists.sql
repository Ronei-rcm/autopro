-- Tabela de checklists (padrões de verificação para veículos)
CREATE TABLE IF NOT EXISTS checklists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens do checklist
CREATE TABLE IF NOT EXISTS checklist_items (
  id SERIAL PRIMARY KEY,
  checklist_id INTEGER NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  item_type VARCHAR(20) DEFAULT 'check' CHECK (item_type IN ('check', 'measure', 'observation')),
  required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de execuções de checklist (vinculada à OS)
CREATE TABLE IF NOT EXISTS checklist_executions (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  checklist_id INTEGER NOT NULL REFERENCES checklists(id),
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
  mechanic_id INTEGER REFERENCES users(id),
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de respostas dos itens do checklist (na execução)
CREATE TABLE IF NOT EXISTS checklist_execution_items (
  id SERIAL PRIMARY KEY,
  execution_id INTEGER NOT NULL REFERENCES checklist_executions(id) ON DELETE CASCADE,
  checklist_item_id INTEGER NOT NULL REFERENCES checklist_items(id),
  checked BOOLEAN DEFAULT false,
  value VARCHAR(255),
  observation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_checklists_active ON checklists(active);
CREATE INDEX IF NOT EXISTS idx_checklists_category ON checklists(category);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_sort_order ON checklist_items(checklist_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_checklist_executions_order_id ON checklist_executions(order_id);
CREATE INDEX IF NOT EXISTS idx_checklist_executions_vehicle_id ON checklist_executions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_checklist_execution_items_execution_id ON checklist_execution_items(execution_id);
