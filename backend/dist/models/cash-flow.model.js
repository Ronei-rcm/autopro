"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashFlowModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class CashFlowModel {
    static async findAll(startDate, endDate, type, category) {
        let query = `
      SELECT cf.*
      FROM cash_flow cf
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 1;
        if (startDate) {
            query += ` AND cf.date >= $${paramCount}`;
            params.push(startDate);
            paramCount++;
        }
        if (endDate) {
            query += ` AND cf.date <= $${paramCount}`;
            params.push(endDate);
            paramCount++;
        }
        if (type) {
            query += ` AND cf.type = $${paramCount}`;
            params.push(type);
            paramCount++;
        }
        if (category) {
            query += ` AND cf.category = $${paramCount}`;
            params.push(category);
            paramCount++;
        }
        query += ' ORDER BY cf.date DESC, cf.created_at DESC';
        const result = await database_1.default.query(query, params);
        return result.rows;
    }
    static async findById(id) {
        const result = await database_1.default.query('SELECT * FROM cash_flow WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    static async create(data) {
        const { type, category, description, amount, date, payment_method, reference_type, reference_id, notes, created_by, } = data;
        const result = await database_1.default.query(`INSERT INTO cash_flow (
        type, category, description, amount, date, payment_method,
        reference_type, reference_id, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, type, category, description, amount, date, payment_method,
                reference_type, reference_id, notes, created_by, created_at, updated_at`, [
            type,
            category || null,
            description,
            amount,
            date,
            payment_method || null,
            reference_type || null,
            reference_id || null,
            notes || null,
            created_by || null,
        ]);
        return result.rows[0];
    }
    static async update(id, data) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        const allowedFields = [
            'type',
            'category',
            'description',
            'amount',
            'date',
            'payment_method',
            'reference_type',
            'reference_id',
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
        const result = await database_1.default.query(`UPDATE cash_flow SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, type, category, description, amount, date, payment_method,
                 reference_type, reference_id, notes, created_by, created_at, updated_at`, values);
        return result.rows[0];
    }
    static async delete(id) {
        const result = await database_1.default.query('DELETE FROM cash_flow WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
    static async getSummary(startDate, endDate) {
        let query = `
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance
      FROM cash_flow
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 1;
        if (startDate) {
            query += ` AND date >= $${paramCount}`;
            params.push(startDate);
            paramCount++;
        }
        if (endDate) {
            query += ` AND date <= $${paramCount}`;
            params.push(endDate);
            paramCount++;
        }
        const result = await database_1.default.query(query, params);
        return result.rows[0];
    }
}
exports.CashFlowModel = CashFlowModel;
//# sourceMappingURL=cash-flow.model.js.map