"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryMovementModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class InventoryMovementModel {
    static async create(data) {
        const { product_id, type, quantity, reference_type, reference_id, notes, created_by, } = data;
        const result = await database_1.default.query(`INSERT INTO inventory_movements (
        product_id, type, quantity, reference_type, reference_id, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, product_id, type, quantity, reference_type, reference_id, notes, created_at, created_by`, [
            product_id,
            type,
            quantity,
            reference_type || null,
            reference_id || null,
            notes || null,
            created_by || null,
        ]);
        return result.rows[0];
    }
    static async findByProduct(productId, limit) {
        let query = `
      SELECT im.*, u.name as created_by_name
      FROM inventory_movements im
      LEFT JOIN users u ON im.created_by = u.id
      WHERE im.product_id = $1
      ORDER BY im.created_at DESC
    `;
        const params = [productId];
        if (limit) {
            query += ` LIMIT $2`;
            params.push(limit);
        }
        const result = await database_1.default.query(query, params);
        return result.rows;
    }
    static async findAll(productId, type, limit) {
        let query = `
      SELECT im.*, p.name as product_name, u.name as created_by_name
      FROM inventory_movements im
      LEFT JOIN products p ON im.product_id = p.id
      LEFT JOIN users u ON im.created_by = u.id
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 1;
        if (productId) {
            query += ` AND im.product_id = $${paramCount}`;
            params.push(productId);
            paramCount++;
        }
        if (type) {
            query += ` AND im.type = $${paramCount}`;
            params.push(type);
            paramCount++;
        }
        query += ' ORDER BY im.created_at DESC';
        if (limit) {
            query += ` LIMIT $${paramCount}`;
            params.push(limit);
            paramCount++;
        }
        const result = await database_1.default.query(query, params);
        return result.rows;
    }
}
exports.InventoryMovementModel = InventoryMovementModel;
//# sourceMappingURL=inventory-movement.model.js.map