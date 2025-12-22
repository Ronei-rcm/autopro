"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountReceivableModel = void 0;
const database_1 = __importDefault(require("../config/database"));
const installment_model_1 = require("./installment.model");
class AccountReceivableModel {
    static async findAll(status, clientId, startDate, endDate, orderId) {
        let query = `
      SELECT ar.id, ar.client_id, ar.order_id, ar.quote_id, ar.description, ar.due_date, ar.amount,
             ar.received_amount as paid_amount, ar.received_at as payment_date, ar.payment_method, ar.status, ar.notes,
             ar.created_at, ar.updated_at, c.name as client_name
      FROM accounts_receivable ar
      LEFT JOIN clients c ON ar.client_id = c.id
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 1;
        if (status) {
            query += ` AND ar.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }
        if (clientId) {
            query += ` AND ar.client_id = $${paramCount}`;
            params.push(clientId);
            paramCount++;
        }
        if (orderId) {
            query += ` AND ar.order_id = $${paramCount}`;
            params.push(orderId);
            paramCount++;
        }
        if (startDate) {
            query += ` AND ar.due_date >= $${paramCount}`;
            params.push(startDate);
            paramCount++;
        }
        if (endDate) {
            query += ` AND ar.due_date <= $${paramCount}`;
            params.push(endDate);
            paramCount++;
        }
        query += ' ORDER BY ar.due_date ASC';
        const result = await database_1.default.query(query, params);
        // Buscar parcelas para cada conta a receber
        const receivablesWithInstallments = await Promise.all(result.rows.map(async (receivable) => {
            const installments = await installment_model_1.InstallmentModel.findByReceivableId(receivable.id);
            return { ...receivable, installments };
        }));
        return receivablesWithInstallments;
    }
    static async findById(id) {
        const result = await database_1.default.query(`SELECT ar.id, ar.client_id, ar.order_id, ar.quote_id, ar.description, ar.due_date, ar.amount,
              ar.received_amount as paid_amount, ar.received_at as payment_date, ar.payment_method, ar.status, ar.notes,
              ar.created_at, ar.updated_at, c.name as client_name
       FROM accounts_receivable ar
       LEFT JOIN clients c ON ar.client_id = c.id
       WHERE ar.id = $1`, [id]);
        return result.rows[0] || null;
    }
    static async create(data) {
        const { order_id, client_id, description, due_date, amount, paid_amount = 0, payment_date, payment_method, status = 'open', notes, } = data;
        const result = await database_1.default.query(`INSERT INTO accounts_receivable (
        order_id, client_id, description, due_date, amount,
        received_amount, received_at, payment_method, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, order_id, client_id, description, due_date, amount,
                received_amount as paid_amount, received_at as payment_date, payment_method, status, notes,
                created_at, updated_at`, [
            order_id || null,
            client_id,
            description,
            due_date,
            amount,
            paid_amount,
            payment_date || null,
            payment_method || null,
            status,
            notes || null,
        ]);
        return result.rows[0];
    }
    static async update(id, data) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        const allowedFields = [
            'order_id',
            'client_id',
            'description',
            'due_date',
            'amount',
            'paid_amount',
            'payment_date',
            'payment_method',
            'status',
            'notes',
        ];
        // Mapear campos da interface para campos do banco
        const fieldMapping = {
            'paid_amount': 'received_amount',
            'payment_date': 'received_at',
        };
        allowedFields.forEach((field) => {
            if (data[field] !== undefined) {
                const dbField = fieldMapping[field] || field;
                fields.push(`${dbField} = $${paramCount}`);
                values.push(data[field]);
                paramCount++;
            }
        });
        if (fields.length === 0) {
            return this.findById(id);
        }
        values.push(id);
        const result = await database_1.default.query(`UPDATE accounts_receivable SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, order_id, client_id, description, due_date, amount,
                 received_amount as paid_amount, received_at as payment_date, payment_method, status, notes,
                 created_at, updated_at`, values);
        return result.rows[0];
    }
    static async delete(id) {
        const result = await database_1.default.query('DELETE FROM accounts_receivable WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
    static async getSummary() {
        const result = await database_1.default.query(`SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN amount - received_amount ELSE 0 END) as total_open,
        SUM(CASE WHEN status = 'overdue' THEN amount - received_amount ELSE 0 END) as total_overdue,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
        SUM(amount) as total_amount
       FROM accounts_receivable`);
        return result.rows[0];
    }
}
exports.AccountReceivableModel = AccountReceivableModel;
//# sourceMappingURL=account-receivable.model.js.map