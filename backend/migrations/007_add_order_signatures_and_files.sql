-- Adicionar campo de assinatura na tabela orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS client_signature TEXT,
ADD COLUMN IF NOT EXISTS signature_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS signed_by_name VARCHAR(255);

-- Tabela de arquivos/fotos/documentos vinculados à OS
CREATE TABLE IF NOT EXISTS order_files (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- 'photo', 'document', 'other'
  file_size INTEGER, -- em bytes
  description TEXT,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_order_files_order_id ON order_files(order_id);
CREATE INDEX IF NOT EXISTS idx_order_files_file_type ON order_files(file_type);

-- Comentários
COMMENT ON COLUMN orders.client_signature IS 'Assinatura digital do cliente em base64';
COMMENT ON COLUMN orders.signature_date IS 'Data/hora da assinatura';
COMMENT ON COLUMN orders.signed_by_name IS 'Nome de quem assinou';
COMMENT ON TABLE order_files IS 'Arquivos, fotos e documentos vinculados à ordem de serviço';
