"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstallmentModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class InstallmentModel {
    static async ensureTableExists() {
        try {
            // Verificar se a tabela existe
            const checkTable = await database_1.default.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'installments'
        );
      `);
            if (!checkTable.rows[0].exists) {
                console.log('Tabela installments não existe. Criando automaticamente...');
                // Criar a tabela
                await database_1.default.query(`
          CREATE TABLE installments (
            id SERIAL PRIMARY KEY,
            account_receivable_id INTEGER NOT NULL REFERENCES accounts_receivable(id) ON DELETE CASCADE,
            installment_number INTEGER NOT NULL,
            due_date DATE NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            paid_amount DECIMAL(10,2) DEFAULT 0,
            paid_at TIMESTAMP,
            payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer')),
            status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'paid', 'overdue', 'cancelled')),
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT unique_installment_number UNIQUE (account_receivable_id, installment_number)
          );
        `);
                // Criar índices
                await database_1.default.query(`
          CREATE INDEX IF NOT EXISTS idx_installments_account_receivable_id ON installments(account_receivable_id);
          CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments(due_date);
          CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status);
        `);
                console.log('✅ Tabela installments criada automaticamente!');
            }
        }
        catch (error) {
            console.error('Erro ao criar tabela installments:', error);
            throw error;
        }
    }
    static async findByReceivableId(accountReceivableId) {
        // Garantir que a tabela existe antes de buscar
        await this.ensureTableExists();
        const result = await database_1.default.query(`SELECT * FROM installments 
       WHERE account_receivable_id = $1 
       ORDER BY installment_number ASC`, [accountReceivableId]);
        return result.rows;
    }
    static async findById(id) {
        // Garantir que a tabela existe antes de buscar
        await this.ensureTableExists();
        const result = await database_1.default.query('SELECT * FROM installments WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    static async create(data) {
        // Garantir que a tabela existe antes de criar
        await this.ensureTableExists();
        const result = await database_1.default.query(`INSERT INTO installments (
        account_receivable_id, installment_number, due_date, amount,
        paid_amount, paid_at, payment_method, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`, [
            data.account_receivable_id,
            data.installment_number,
            data.due_date,
            data.amount,
            data.paid_amount || 0,
            data.paid_at || null,
            data.payment_method || null,
            data.status || 'open',
            data.notes || null,
        ]);
        return result.rows[0];
    }
    static async createMany(installments) {
        const created = [];
        for (const installment of installments) {
            const createdInstallment = await this.create(installment);
            created.push(createdInstallment);
        }
        return created;
    }
    static async update(id, data) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        const allowedFields = ['due_date', 'amount', 'paid_amount', 'paid_at', 'payment_method', 'status', 'notes'];
        allowedFields.forEach((field) => {
            if (data[field] !== undefined) {
                fields.push(`${field} = $${paramCount}`);
                values.push(data[field]);
                paramCount++;
            }
        });
        if (fields.length === 0) {
            return this.findById(id);
        }
        values.push(id);
        const result = await database_1.default.query(`UPDATE installments SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`, values);
        return result.rows[0] || null;
    }
    static async delete(id) {
        const result = await database_1.default.query('DELETE FROM installments WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
    static async deleteByReceivableId(accountReceivableId) {
        const result = await database_1.default.query('DELETE FROM installments WHERE account_receivable_id = $1', [accountReceivableId]);
        return (result.rowCount ?? 0) > 0;
    }
    static async updateStatuses() {
        // Atualiza status para 'overdue' de parcelas em aberto com vencimento passado
        await database_1.default.query(`UPDATE installments 
       SET status = 'overdue', updated_at = CURRENT_TIMESTAMP
       WHERE status = 'open' 
       AND due_date < CURRENT_DATE
       AND paid_amount < amount`);
    }
    static async getSummaryByReceivableId(accountReceivableId) {
        const result = await database_1.default.query(`SELECT 
        COUNT(*) as total_installments,
        SUM(amount) as total_amount,
        SUM(paid_amount) as total_paid,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_count,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
       FROM installments
       WHERE account_receivable_id = $1`, [accountReceivableId]);
        return result.rows[0];
    }
}
exports.InstallmentModel = InstallmentModel;
//# sourceMappingURL=installment.model.js.map