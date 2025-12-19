-- Migration: Schema inicial do sistema
-- Criado em: 2024

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  profile VARCHAR(50) NOT NULL CHECK (profile IN ('admin', 'mechanic', 'financial', 'attendant')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(2) NOT NULL CHECK (type IN ('PF', 'PJ')),
  cpf VARCHAR(14),
  cnpj VARCHAR(18),
  phone VARCHAR(20),
  email VARCHAR(255),
  address_street VARCHAR(255),
  address_number VARCHAR(20),
  address_complement VARCHAR(100),
  address_neighborhood VARCHAR(100),
  address_city VARCHAR(100),
  address_state VARCHAR(2),
  address_zipcode VARCHAR(10),
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_cpf_cnpj CHECK (
    (type = 'PF' AND cpf IS NOT NULL) OR
    (type = 'PJ' AND cnpj IS NOT NULL)
  )
);

-- Tabela de fornecedores
CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  contact_name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address_street VARCHAR(255),
  address_number VARCHAR(20),
  address_complement VARCHAR(100),
  address_neighborhood VARCHAR(100),
  address_city VARCHAR(100),
  address_state VARCHAR(2),
  address_zipcode VARCHAR(10),
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de veículos
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER,
  plate VARCHAR(10) UNIQUE,
  chassis VARCHAR(50),
  color VARCHAR(50),
  mileage INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  supplier_id INTEGER REFERENCES suppliers(id),
  cost_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2) NOT NULL,
  min_quantity INTEGER DEFAULT 0,
  current_quantity INTEGER DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'UN',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tipos de mão de obra
CREATE TABLE labor_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  estimated_hours DECIMAL(5,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de orçamentos
CREATE TABLE quotes (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'approved', 'rejected', 'converted')),
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  valid_until DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens do orçamento
CREATE TABLE quote_items (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  labor_id INTEGER REFERENCES labor_types(id),
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('product', 'labor')),
  CONSTRAINT check_item_reference CHECK (
    (item_type = 'product' AND product_id IS NOT NULL) OR
    (item_type = 'labor' AND labor_id IS NOT NULL)
  )
);

-- Tabela de ordens de serviço
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER REFERENCES quotes(id),
  client_id INTEGER NOT NULL REFERENCES clients(id),
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
  mechanic_id INTEGER REFERENCES users(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_parts', 'finished', 'cancelled')),
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  technical_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens da ordem de serviço
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  labor_id INTEGER REFERENCES labor_types(id),
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('product', 'labor')),
  CONSTRAINT check_order_item_reference CHECK (
    (item_type = 'product' AND product_id IS NOT NULL) OR
    (item_type = 'labor' AND labor_id IS NOT NULL)
  )
);

-- Tabela de contas a pagar
CREATE TABLE accounts_payable (
  id SERIAL PRIMARY KEY,
  supplier_id INTEGER REFERENCES suppliers(id),
  description VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'paid', 'overdue', 'cancelled')),
  paid_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de contas a receber
CREATE TABLE accounts_receivable (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  order_id INTEGER REFERENCES orders(id),
  quote_id INTEGER REFERENCES quotes(id),
  description VARCHAR(255) NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  received_amount DECIMAL(10,2) DEFAULT 0,
  payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'paid', 'overdue', 'cancelled')),
  received_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de fluxo de caixa
CREATE TABLE cash_flow (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  description VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  reference_id INTEGER,
  reference_type VARCHAR(50),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id)
);

-- Tabela de agendamentos
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
  mechanic_id INTEGER REFERENCES users(id),
  service_type VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  google_event_id VARCHAR(255),
  reminder_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de movimentações de estoque
CREATE TABLE inventory_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('entry', 'exit', 'adjustment')),
  quantity DECIMAL(10,2) NOT NULL,
  reference_type VARCHAR(50),
  reference_id INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id)
);

-- Índices para performance
CREATE INDEX idx_clients_cpf ON clients(cpf);
CREATE INDEX idx_clients_cnpj ON clients(cnpj);
CREATE INDEX idx_vehicles_client_id ON vehicles(client_id);
CREATE INDEX idx_vehicles_plate ON vehicles(plate);
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_supplier_id ON products(supplier_id);
CREATE INDEX idx_quotes_client_id ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_mechanic_id ON orders(mechanic_id);
CREATE INDEX idx_accounts_payable_due_date ON accounts_payable(due_date);
CREATE INDEX idx_accounts_payable_status ON accounts_payable(status);
CREATE INDEX idx_accounts_receivable_due_date ON accounts_receivable(due_date);
CREATE INDEX idx_accounts_receivable_status ON accounts_receivable(status);
CREATE INDEX idx_cash_flow_date ON cash_flow(date);
CREATE INDEX idx_cash_flow_type ON cash_flow(type);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar estoque
CREATE OR REPLACE FUNCTION update_product_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'entry' THEN
        UPDATE products SET current_quantity = current_quantity + NEW.quantity
        WHERE id = NEW.product_id;
    ELSIF NEW.type = 'exit' THEN
        UPDATE products SET current_quantity = current_quantity - NEW.quantity
        WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_on_movement
    AFTER INSERT ON inventory_movements
    FOR EACH ROW EXECUTE FUNCTION update_product_quantity();

