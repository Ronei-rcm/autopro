"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaborTypeModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class LaborTypeModel {
    static async findAll(active) {
        let query = 'SELECT * FROM labor_types WHERE 1=1';
        const params = [];
        if (active !== undefined) {
            query += ' AND active = $1';
            params.push(active);
        }
        query += ' ORDER BY name ASC';
        const result = await database_1.default.query(query, params);
        return result.rows;
    }
    static async findById(id) {
        const result = await database_1.default.query('SELECT * FROM labor_types WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    static async create(data) {
        const { name, description, price, estimated_hours, active = true, } = data;
        const result = await database_1.default.query(`INSERT INTO labor_types (name, description, price, estimated_hours, active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, price, estimated_hours, active, created_at, updated_at`, [
            name,
            description || null,
            price,
            estimated_hours || null,
            active,
        ]);
        return result.rows[0];
    }
    static async update(id, data) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        const allowedFields = ['name', 'description', 'price', 'estimated_hours', 'active'];
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
        const result = await database_1.default.query(`UPDATE labor_types SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, name, description, price, estimated_hours, active, created_at, updated_at`, values);
        return result.rows[0];
    }
    static async delete(id) {
        const result = await database_1.default.query('DELETE FROM labor_types WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
}
exports.LaborTypeModel = LaborTypeModel;
//# sourceMappingURL=labor-type.model.js.map