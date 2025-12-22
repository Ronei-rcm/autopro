-- Corrigir tamanho do campo file_path na tabela order_files
-- O campo VARCHAR(500) é muito pequeno para armazenar base64 de arquivos
-- Alterar para TEXT para suportar arquivos maiores

ALTER TABLE order_files 
ALTER COLUMN file_path TYPE TEXT;

-- Comentário
COMMENT ON COLUMN order_files.file_path IS 'Caminho do arquivo ou dados em base64 (TEXT para suportar arquivos maiores)';
