-- Script para criar a tabela workshop_info manualmente
-- Execute este script no banco de dados se a migration não foi executada

-- Tabela de informações da oficina
CREATE TABLE IF NOT EXISTS workshop_info (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  trade_name VARCHAR(255), -- Nome fantasia
  cnpj VARCHAR(18),
  state_registration VARCHAR(50), -- Inscrição estadual
  municipal_registration VARCHAR(50), -- Inscrição municipal
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  address_street VARCHAR(255),
  address_number VARCHAR(20),
  address_complement VARCHAR(100),
  address_neighborhood VARCHAR(100),
  address_city VARCHAR(100),
  address_state VARCHAR(2),
  address_zipcode VARCHAR(10),
  logo_path VARCHAR(500), -- Caminho do arquivo do logo
  logo_base64 TEXT, -- Logo em base64 para uso em PDFs
  notes TEXT, -- Observações gerais
  terms_and_conditions TEXT, -- Termos e condições padrão
  footer_text TEXT, -- Texto do rodapé para documentos
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_workshop_info CHECK (id = 1) -- Apenas um registro
);

-- Inserir registro padrão
INSERT INTO workshop_info (
  id, name, trade_name, cnpj, phone, email,
  address_street, address_city, address_state, address_zipcode,
  footer_text
) VALUES (
  1,
  'Oficina Mecânica',
  'Oficina Mecânica',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'Este documento foi gerado automaticamente pelo sistema de gestão.'
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Trigger para garantir apenas um registro
CREATE OR REPLACE FUNCTION enforce_single_workshop_info()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM workshop_info) > 1 THEN
    RAISE EXCEPTION 'Apenas um registro de informações da oficina é permitido';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_single_workshop_info ON workshop_info;
CREATE TRIGGER check_single_workshop_info
BEFORE INSERT ON workshop_info
FOR EACH ROW
EXECUTE FUNCTION enforce_single_workshop_info();

-- Comentários
COMMENT ON TABLE workshop_info IS 'Informações da oficina para uso em cabeçalhos de documentos';
COMMENT ON COLUMN workshop_info.logo_base64 IS 'Logo em base64 para uso direto em PDFs sem necessidade de arquivo';
COMMENT ON COLUMN workshop_info.footer_text IS 'Texto padrão para rodapé de documentos impressos';

-- Adicionar constraint UNIQUE no id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'workshop_info_id_key'
  ) THEN
    ALTER TABLE workshop_info ADD CONSTRAINT workshop_info_id_key UNIQUE (id);
  END IF;
END $$;
