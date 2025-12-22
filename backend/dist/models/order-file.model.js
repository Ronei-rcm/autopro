"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderFileModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class OrderFileModel {
    static async ensureTableExists() {
        try {
            // Verificar se a tabela existe
            const checkTable = await database_1.default.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'order_files'
        );
      `);
            if (!checkTable.rows[0].exists) {
                console.log('Tabela order_files não existe. Criando automaticamente...');
                // Criar a tabela
                await database_1.default.query(`
          CREATE TABLE order_files (
            id SERIAL PRIMARY KEY,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            file_name VARCHAR(255) NOT NULL,
            file_path TEXT NOT NULL,
            file_type VARCHAR(50) NOT NULL,
            file_size INTEGER,
            description TEXT,
            uploaded_by INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
                // Criar índices
                await database_1.default.query(`
          CREATE INDEX IF NOT EXISTS idx_order_files_order_id ON order_files(order_id);
          CREATE INDEX IF NOT EXISTS idx_order_files_file_type ON order_files(file_type);
        `);
                console.log('✅ Tabela order_files criada automaticamente!');
            }
            else {
                // Verificar se o campo file_path precisa ser alterado para TEXT
                try {
                    const columnCheck = await database_1.default.query(`
            SELECT data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'order_files' AND column_name = 'file_path'
          `);
                    if (columnCheck.rows.length > 0) {
                        const columnInfo = columnCheck.rows[0];
                        // Se for VARCHAR com limite, alterar para TEXT
                        if (columnInfo.data_type === 'character varying' && columnInfo.character_maximum_length) {
                            console.log('Alterando file_path de VARCHAR para TEXT...');
                            await database_1.default.query(`ALTER TABLE order_files ALTER COLUMN file_path TYPE TEXT;`);
                            console.log('✅ Campo file_path alterado para TEXT!');
                        }
                    }
                }
                catch (alterError) {
                    // Se falhar, tentar alterar diretamente (pode ser que precise de permissões)
                    try {
                        await database_1.default.query(`ALTER TABLE order_files ALTER COLUMN file_path TYPE TEXT;`);
                        console.log('✅ Campo file_path alterado para TEXT (tentativa direta)!');
                    }
                    catch (directAlterError) {
                        console.warn('Não foi possível alterar file_path para TEXT automaticamente:', directAlterError.message);
                        console.warn('Execute manualmente: ALTER TABLE order_files ALTER COLUMN file_path TYPE TEXT;');
                    }
                }
            }
        }
        catch (error) {
            console.error('Erro ao criar tabela order_files:', error);
            throw error;
        }
    }
    static async findByOrder(orderId) {
        // Garantir que a tabela existe antes de buscar
        await this.ensureTableExists();
        const result = await database_1.default.query(`SELECT of.*, u.name as uploaded_by_name
       FROM order_files of
       LEFT JOIN users u ON of.uploaded_by = u.id
       WHERE of.order_id = $1
       ORDER BY of.created_at DESC`, [orderId]);
        return result.rows;
    }
    static async findById(id) {
        // Garantir que a tabela existe antes de buscar
        await this.ensureTableExists();
        const result = await database_1.default.query('SELECT * FROM order_files WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    static async create(data) {
        // Garantir que a tabela existe antes de criar
        await this.ensureTableExists();
        const result = await database_1.default.query(`INSERT INTO order_files (order_id, file_name, file_path, file_type, file_size, description, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`, [
            data.order_id,
            data.file_name,
            data.file_path,
            data.file_type,
            data.file_size || null,
            data.description || null,
            data.uploaded_by || null,
        ]);
        return result.rows[0];
    }
    static async delete(id) {
        const result = await database_1.default.query('DELETE FROM order_files WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
    static async updateDescription(id, description) {
        const result = await database_1.default.query('UPDATE order_files SET description = $1 WHERE id = $2 RETURNING *', [description, id]);
        return result.rows[0] || null;
    }
}
exports.OrderFileModel = OrderFileModel;
//# sourceMappingURL=order-file.model.js.map