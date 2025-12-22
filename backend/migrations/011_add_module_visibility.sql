-- Migration: Sistema de Ocultação de Módulos
-- Criado em: Dezembro 2025

-- Tabela para configurações de visibilidade de módulos
CREATE TABLE IF NOT EXISTS module_settings (
  id SERIAL PRIMARY KEY,
  module VARCHAR(50) NOT NULL UNIQUE,
  hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_module_settings_module ON module_settings(module);
CREATE INDEX IF NOT EXISTS idx_module_settings_hidden ON module_settings(hidden);

-- Inserir configurações padrão para todos os módulos existentes (todos visíveis por padrão)
INSERT INTO module_settings (module, hidden)
SELECT DISTINCT module, false
FROM permissions
ON CONFLICT (module) DO NOTHING;

-- Inserir dashboard se não existir em permissions (garantir que dashboard possa ser ocultado)
INSERT INTO module_settings (module, hidden)
VALUES ('dashboard', false)
ON CONFLICT (module) DO NOTHING;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_module_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_module_settings_updated_at
BEFORE UPDATE ON module_settings
FOR EACH ROW
EXECUTE FUNCTION update_module_settings_updated_at();

