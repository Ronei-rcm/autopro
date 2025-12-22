"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountPayableModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class AccountPayableModel {
    static async findAll(status, supplierId, startDate, endDate) {
        let query = `
      SELECT ap.*, s.name as supplier_name
      FROM accounts_payable ap
      LEFT JOIN suppliers s ON ap.supplier_id = s.id
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 1;
        if (status) {
            query += ` AND ap.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }
        if (supplierId) {
            query += ` AND ap.supplier_id = $${paramCount}`;
            params.push(supplierId);
            paramCount++;
        }
        if (startDate) {
            query += ` AND ap.due_date >= $${paramCount}`;
            params.push(startDate);
            paramCount++;
        }
        if (endDate) {
            query += ` AND ap.due_date <= $${paramCount}`;
            params.push(endDate);
            paramCount++;
        }
        query += ' ORDER BY ap.due_date ASC';
        const result = await database_1.default.query(query, params);
        return result.rows;
    }
    static async findById(id) {
        const result = await database_1.default.query(`SELECT ap.*, s.name as supplier_name
       FROM accounts_payable ap
       LEFT JOIN suppliers s ON ap.supplier_id = s.id
       WHERE ap.id = $1`, [id]);
        return result.rows[0] || null;
    }
    static async create(data) {
        const { supplier_id, description, category, due_date, amount, paid_amount = 0, payment_date, payment_method, status = 'open', notes, } = data;
        const result = await database_1.default.query(`INSERT INTO accounts_payable (
        supplier_id, description, category, due_date, amount,
        paid_amount, payment_date, payment_method, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, supplier_id, description, category, due_date, amount,
                paid_amount, payment_date, payment_method, status, notes,
                created_at, updated_at`, [
            supplier_id || null,
            description,
            category || null,
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
            'supplier_id',
            'description',
            'category',
            'due_date',
            'amount',
            'paid_amount',
            'payment_date',
            'payment_method',
            'status',
            'notes',
        ];
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
        const result = await database_1.default.query(`UPDATE accounts_payable SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, supplier_id, description, category, due_date, amount,
                 paid_amount, payment_date, payment_method, status, notes,
                 created_at, updated_at`, values);
        return result.rows[0];
    }
    static async delete(id) {
        const result = await database_1.default.query('DELETE FROM accounts_payable WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
    static async getSummary() {
        const result = await database_1.default.query(`SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN amount - paid_amount ELSE 0 END) as total_open,
        SUM(CASE WHEN status = 'overdue' THEN amount - paid_amount ELSE 0 END) as total_overdue,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
        SUM(amount) as total_amount
       FROM accounts_payable`);
        return result.rows[0];
    }
}
exports.AccountPayableModel = AccountPayableModel;
//# sourceMappingURL=account-payable.model.js.map