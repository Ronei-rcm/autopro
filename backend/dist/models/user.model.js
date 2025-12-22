"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class UserModel {
    static async findByEmail(email) {
        const result = await database_1.default.query('SELECT id, email, name, profile, active, created_at, updated_at FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    }
    static async findByEmailWithPassword(email) {
        const result = await database_1.default.query('SELECT id, password_hash FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    }
    static async findById(id) {
        const result = await database_1.default.query('SELECT id, email, name, profile, active, created_at, updated_at FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    static async create(email, passwordHash, name, profile) {
        const result = await database_1.default.query(`INSERT INTO users (email, password_hash, name, profile)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, profile, active, created_at, updated_at`, [email, passwordHash, name, profile]);
        return result.rows[0];
    }
    static async update(id, data) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (data.name !== undefined) {
            fields.push(`name = $${paramCount++}`);
            values.push(data.name);
        }
        if (data.profile !== undefined) {
            fields.push(`profile = $${paramCount++}`);
            values.push(data.profile);
        }
        if (data.active !== undefined) {
            fields.push(`active = $${paramCount++}`);
            values.push(data.active);
        }
        if (fields.length === 0) {
            return this.findById(id);
        }
        values.push(id);
        const result = await database_1.default.query(`UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, email, name, profile, active, created_at, updated_at`, values);
        return result.rows[0];
    }
    static async findAll() {
        const result = await database_1.default.query('SELECT id, email, name, profile, active, created_at, updated_at FROM users ORDER BY name');
        return result.rows;
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=user.model.js.map