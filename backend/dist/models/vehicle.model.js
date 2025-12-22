"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class VehicleModel {
    static async findAll(clientId, search) {
        let query = `
      SELECT v.id, v.client_id, v.brand, v.model, v.year, v.plate, v.chassis,
             v.color, v.mileage, v.notes, v.created_at, v.updated_at,
             COALESCE(c.cpf, c.cnpj) as client_cpf
      FROM vehicles v
      LEFT JOIN clients c ON v.client_id = c.id
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 1;
        if (clientId) {
            query += ` AND v.client_id = $${paramCount}`;
            params.push(clientId);
            paramCount++;
        }
        if (search) {
            query += ` AND (
        v.brand ILIKE $${paramCount} OR 
        v.model ILIKE $${paramCount} OR 
        v.plate ILIKE $${paramCount} OR
        v.chassis ILIKE $${paramCount} OR
        c.cpf ILIKE $${paramCount} OR
        c.cnpj ILIKE $${paramCount}
      )`;
            params.push(`%${search}%`);
            paramCount++;
        }
        query += ' ORDER BY v.brand, v.model ASC';
        const result = await database_1.default.query(query, params);
        return result.rows;
    }
    static async findById(id) {
        const result = await database_1.default.query(`SELECT v.id, v.client_id, v.brand, v.model, v.year, v.plate, v.chassis,
              v.color, v.mileage, v.notes, v.created_at, v.updated_at,
              COALESCE(c.cpf, c.cnpj) as client_cpf
       FROM vehicles v
       LEFT JOIN clients c ON v.client_id = c.id
       WHERE v.id = $1`, [id]);
        return result.rows[0] || null;
    }
    static async create(data) {
        const { client_id, brand, model, year, plate, chassis, color, mileage = 0, notes, } = data;
        const result = await database_1.default.query(`INSERT INTO vehicles (
        client_id, brand, model, year, plate, chassis, color, mileage, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, client_id, brand, model, year, plate, chassis, color, mileage, notes, created_at, updated_at`, [
            client_id,
            brand,
            model,
            year || null,
            plate || null,
            chassis || null,
            color || null,
            mileage,
            notes || null,
        ]);
        return result.rows[0];
    }
    static async update(id, data) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        const allowedFields = [
            'client_id',
            'brand',
            'model',
            'year',
            'plate',
            'chassis',
            'color',
            'mileage',
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
        const result = await database_1.default.query(`UPDATE vehicles SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, client_id, brand, model, year, plate, chassis, color, mileage, notes, created_at, updated_at`, values);
        return result.rows[0];
    }
    static async delete(id) {
        const result = await database_1.default.query('DELETE FROM vehicles WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
    static async findByClient(clientId) {
        const result = await database_1.default.query('SELECT * FROM vehicles WHERE client_id = $1 ORDER BY brand, model', [clientId]);
        return result.rows;
    }
}
exports.VehicleModel = VehicleModel;
//# sourceMappingURL=vehicle.model.js.map