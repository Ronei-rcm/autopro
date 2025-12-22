"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarrantyModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class WarrantyModel {
    static async findAll(status, orderId, clientId, startDate, endDate) {
        let query = `
      SELECT w.*, 
             o.order_number, o.client_id, o.finished_at,
             oi.description as item_description,
             c.name as client_name
      FROM warranties w
      INNER JOIN orders o ON w.order_id = o.id
      INNER JOIN order_items oi ON w.order_item_id = oi.id
      LEFT JOIN clients c ON o.client_id = c.id
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 1;
        if (status) {
            query += ` AND w.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }
        if (orderId) {
            query += ` AND w.order_id = $${paramCount}`;
            params.push(orderId);
            paramCount++;
        }
        if (clientId) {
            query += ` AND o.client_id = $${paramCount}`;
            params.push(clientId);
            paramCount++;
        }
        if (startDate) {
            query += ` AND w.end_date >= $${paramCount}`;
            params.push(startDate);
            paramCount++;
        }
        if (endDate) {
            query += ` AND w.end_date <= $${paramCount}`;
            params.push(endDate);
            paramCount++;
        }
        query += ' ORDER BY w.end_date ASC';
        const result = await database_1.default.query(query, params);
        return result.rows;
    }
    static async findById(id) {
        const result = await database_1.default.query(`SELECT w.*, 
              o.order_number, o.client_id,
              oi.description as item_description
       FROM warranties w
       INNER JOIN orders o ON w.order_id = o.id
       INNER JOIN order_items oi ON w.order_item_id = oi.id
       WHERE w.id = $1`, [id]);
        return result.rows[0] || null;
    }
    static async findByOrderId(orderId) {
        const result = await database_1.default.query(`SELECT w.*, 
              oi.description as item_description
       FROM warranties w
       INNER JOIN order_items oi ON w.order_item_id = oi.id
       WHERE w.order_id = $1
       ORDER BY w.end_date ASC`, [orderId]);
        return result.rows;
    }
    static async create(data) {
        const result = await database_1.default.query(`INSERT INTO warranties (
        order_id, order_item_id, product_id, labor_id, description,
        warranty_period_days, start_date, end_date, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`, [
            data.order_id,
            data.order_item_id,
            data.product_id || null,
            data.labor_id || null,
            data.description,
            data.warranty_period_days,
            data.start_date,
            data.end_date,
            data.status || 'active',
            data.notes || null,
        ]);
        return result.rows[0];
    }
    static async update(id, data) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        const allowedFields = ['description', 'warranty_period_days', 'start_date', 'end_date', 'status', 'notes'];
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
        const result = await database_1.default.query(`UPDATE warranties SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`, values);
        return result.rows[0] || null;
    }
    static async delete(id) {
        const result = await database_1.default.query('DELETE FROM warranties WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
    static async updateExpiredStatuses() {
        // Atualiza status para 'expired' de garantias ativas com data de término passada
        await database_1.default.query(`UPDATE warranties 
       SET status = 'expired', updated_at = CURRENT_TIMESTAMP
       WHERE status = 'active' 
       AND end_date < CURRENT_DATE`);
    }
    static async getExpiringWarranties(days = 30) {
        const result = await database_1.default.query(`SELECT w.*, 
              o.order_number, o.client_id,
              oi.description as item_description,
              c.name as client_name
       FROM warranties w
       INNER JOIN orders o ON w.order_id = o.id
       INNER JOIN order_items oi ON w.order_item_id = oi.id
       LEFT JOIN clients c ON o.client_id = c.id
       WHERE w.status = 'active'
       AND w.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${days} days'
       ORDER BY w.end_date ASC`);
        return result.rows;
    }
    static async getSummary() {
        const result = await database_1.default.query(`SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_count,
        COUNT(CASE WHEN status = 'used' THEN 1 END) as used_count,
        COUNT(CASE WHEN status = 'active' AND end_date < CURRENT_DATE + INTERVAL '30 days' THEN 1 END) as expiring_soon_count
       FROM warranties`);
        return result.rows[0];
    }
}
exports.WarrantyModel = WarrantyModel;
//# sourceMappingURL=warranty.model.js.map