"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class SupplierModel {
    static async findAll(search, active) {
        let query = `
      SELECT id, name, cnpj, contact_name, phone, email,
             address_street, address_number, address_complement,
             address_neighborhood, address_city, address_state, address_zipcode,
             notes, active, created_at, updated_at
      FROM suppliers
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 1;
        if (search) {
            query += ` AND (
        name ILIKE $${paramCount} OR 
        cnpj ILIKE $${paramCount} OR
        contact_name ILIKE $${paramCount} OR
        email ILIKE $${paramCount} OR 
        phone ILIKE $${paramCount}
      )`;
            params.push(`%${search}%`);
            paramCount++;
        }
        if (active !== undefined) {
            query += ` AND active = $${paramCount}`;
            params.push(active);
            paramCount++;
        }
        query += ' ORDER BY name ASC';
        const result = await database_1.default.query(query, params);
        return result.rows;
    }
    static async findById(id) {
        const result = await database_1.default.query(`SELECT id, name, cnpj, contact_name, phone, email,
              address_street, address_number, address_complement,
              address_neighborhood, address_city, address_state, address_zipcode,
              notes, active, created_at, updated_at
       FROM suppliers WHERE id = $1`, [id]);
        return result.rows[0] || null;
    }
    static async create(data) {
        const { name, cnpj, contact_name, phone, email, address_street, address_number, address_complement, address_neighborhood, address_city, address_state, address_zipcode, notes, active = true, } = data;
        const result = await database_1.default.query(`INSERT INTO suppliers (
        name, cnpj, contact_name, phone, email,
        address_street, address_number, address_complement,
        address_neighborhood, address_city, address_state, address_zipcode,
        notes, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, name, cnpj, contact_name, phone, email,
                address_street, address_number, address_complement,
                address_neighborhood, address_city, address_state, address_zipcode,
                notes, active, created_at, updated_at`, [
            name,
            cnpj || null,
            contact_name || null,
            phone || null,
            email || null,
            address_street || null,
            address_number || null,
            address_complement || null,
            address_neighborhood || null,
            address_city || null,
            address_state || null,
            address_zipcode || null,
            notes || null,
            active,
        ]);
        return result.rows[0];
    }
    static async update(id, data) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        const allowedFields = [
            'name',
            'cnpj',
            'contact_name',
            'phone',
            'email',
            'address_street',
            'address_number',
            'address_complement',
            'address_neighborhood',
            'address_city',
            'address_state',
            'address_zipcode',
            'notes',
            'active',
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
        const result = await database_1.default.query(`UPDATE suppliers SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, name, cnpj, contact_name, phone, email,
                 address_street, address_number, address_complement,
                 address_neighborhood, address_city, address_state, address_zipcode,
                 notes, active, created_at, updated_at`, values);
        return result.rows[0];
    }
    static async delete(id) {
        const result = await database_1.default.query('DELETE FROM suppliers WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
    static async count() {
        const result = await database_1.default.query('SELECT COUNT(*) as count FROM suppliers WHERE active = true');
        return parseInt(result.rows[0].count);
    }
}
exports.SupplierModel = SupplierModel;
//# sourceMappingURL=supplier.model.js.map