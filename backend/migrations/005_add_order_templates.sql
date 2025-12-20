-- Tabela de templates de ordem de serviço
CREATE TABLE IF NOT EXISTS order_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens do template
CREATE TABLE IF NOT EXISTS order_template_items (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES order_templates(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  labor_id INTEGER REFERENCES labor_types(id),
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('product', 'labor')),
  sort_order INTEGER DEFAULT 0,
  CONSTRAINT check_template_item_reference CHECK (
    (item_type = 'product' AND product_id IS NOT NULL) OR
    (item_type = 'labor' AND labor_id IS NOT NULL)
  )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_order_templates_active ON order_templates(active);
CREATE INDEX IF NOT EXISTS idx_order_templates_category ON order_templates(category);
CREATE INDEX IF NOT EXISTS idx_order_template_items_template_id ON order_template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_order_template_items_sort_order ON order_template_items(template_id, sort_order);
