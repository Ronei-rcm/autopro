-- Migration: Sistema de Notificações
-- Criado em: Dezembro 2025

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  profile VARCHAR(50) NOT NULL CHECK (profile IN ('admin', 'mechanic', 'financial', 'attendant')),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  reference_type VARCHAR(50),
  reference_id INTEGER,
  action_url VARCHAR(255),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_profile ON notifications(profile);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_reference ON notifications(reference_type, reference_id);

-- Comentários
COMMENT ON TABLE notifications IS 'Sistema de notificações para usuários';
COMMENT ON COLUMN notifications.profile IS 'Perfil que deve receber a notificação (null = todos do perfil)';
COMMENT ON COLUMN notifications.type IS 'Tipo da notificação: order_finished, payment_due, etc';
COMMENT ON COLUMN notifications.reference_type IS 'Tipo da referência: order, receivable, etc';
COMMENT ON COLUMN notifications.reference_id IS 'ID da referência';
COMMENT ON COLUMN notifications.action_url IS 'URL para ação rápida (ex: /financeiro?order_id=123)';

