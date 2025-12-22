"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderHistoryModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class OrderHistoryModel {
    static async create(history) {
        const result = await database_1.default.query(`INSERT INTO order_history (
        order_id, field_changed, old_value, new_value, changed_by, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, order_id, field_changed, old_value, new_value, changed_by, notes, created_at`, [
            history.order_id,
            history.field_changed,
            history.old_value || null,
            history.new_value || null,
            history.changed_by || null,
            history.notes || null,
        ]);
        return result.rows[0];
    }
    static async findByOrder(orderId) {
        const result = await database_1.default.query(`SELECT oh.*, u.name as changed_by_name
       FROM order_history oh
       LEFT JOIN users u ON oh.changed_by = u.id
       WHERE oh.order_id = $1
       ORDER BY oh.created_at DESC`, [orderId]);
        return result.rows;
    }
}
exports.OrderHistoryModel = OrderHistoryModel;
//# sourceMappingURL=order-history.model.js.map