"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class AppointmentModel {
    static async findAll(startDate, endDate, status, clientId, mechanicId) {
        let query = `
      SELECT a.id, a.client_id, a.vehicle_id, a.mechanic_id,
             a.service_type, a.title, a.description,
             a.start_time, a.end_time, a.status,
             a.google_event_id, a.reminder_sent, a.notes,
             a.created_at, a.updated_at,
             c.name as client_name,
             v.brand, v.model, v.plate,
             u.name as mechanic_name
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN vehicles v ON a.vehicle_id = v.id
      LEFT JOIN users u ON a.mechanic_id = u.id
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 1;
        if (startDate) {
            query += ` AND a.start_time >= $${paramCount}`;
            params.push(startDate);
            paramCount++;
        }
        if (endDate) {
            query += ` AND a.start_time <= $${paramCount}`;
            params.push(endDate);
            paramCount++;
        }
        if (status) {
            query += ` AND a.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }
        if (clientId) {
            query += ` AND a.client_id = $${paramCount}`;
            params.push(clientId);
            paramCount++;
        }
        if (mechanicId) {
            query += ` AND a.mechanic_id = $${paramCount}`;
            params.push(mechanicId);
            paramCount++;
        }
        query += ' ORDER BY a.start_time ASC';
        const result = await database_1.default.query(query, params);
        return result.rows;
    }
    static async findById(id) {
        const result = await database_1.default.query(`SELECT a.*, c.name as client_name, v.brand, v.model, v.plate
       FROM appointments a
       LEFT JOIN clients c ON a.client_id = c.id
       LEFT JOIN vehicles v ON a.vehicle_id = v.id
       WHERE a.id = $1`, [id]);
        return result.rows[0] || null;
    }
    static async create(data) {
        const { client_id, vehicle_id, mechanic_id, service_type, title, description, start_time, end_time, status = 'scheduled', google_event_id, reminder_sent = false, notes, } = data;
        const result = await database_1.default.query(`INSERT INTO appointments (
        client_id, vehicle_id, mechanic_id, service_type, title, description,
        start_time, end_time, status, google_event_id, reminder_sent, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, client_id, vehicle_id, mechanic_id, service_type, title, description,
                start_time, end_time, status, google_event_id, reminder_sent, notes,
                created_at, updated_at`, [
            client_id,
            vehicle_id,
            mechanic_id || null,
            service_type || null,
            title,
            description || null,
            start_time,
            end_time,
            status,
            google_event_id || null,
            reminder_sent,
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
            'vehicle_id',
            'mechanic_id',
            'service_type',
            'title',
            'description',
            'start_time',
            'end_time',
            'status',
            'google_event_id',
            'reminder_sent',
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
        const result = await database_1.default.query(`UPDATE appointments SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, client_id, vehicle_id, mechanic_id, service_type, title, description,
                 start_time, end_time, status, google_event_id, reminder_sent, notes,
                 created_at, updated_at`, values);
        return result.rows[0];
    }
    static async delete(id) {
        const result = await database_1.default.query('DELETE FROM appointments WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
    static async getUpcoming(limit = 10) {
        const result = await database_1.default.query(`SELECT a.*, c.name as client_name, v.brand, v.model, v.plate, u.name as mechanic_name
       FROM appointments a
       LEFT JOIN clients c ON a.client_id = c.id
       LEFT JOIN vehicles v ON a.vehicle_id = v.id
       LEFT JOIN users u ON a.mechanic_id = u.id
       WHERE a.start_time >= CURRENT_TIMESTAMP
       AND a.status IN ('scheduled', 'confirmed')
       ORDER BY a.start_time ASC
       LIMIT $1`, [limit]);
        return result.rows;
    }
    static async getByDateRange(startDate, endDate) {
        return this.findAll(startDate, endDate);
    }
}
exports.AppointmentModel = AppointmentModel;
//# sourceMappingURL=appointment.model.js.map