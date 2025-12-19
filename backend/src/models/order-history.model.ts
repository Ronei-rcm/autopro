import pool from '../config/database';

export interface OrderHistory {
  id: number;
  order_id: number;
  field_changed: string;
  old_value?: string;
  new_value?: string;
  changed_by?: number;
  notes?: string;
  created_at: Date;
}

export class OrderHistoryModel {
  static async create(history: Omit<OrderHistory, 'id' | 'created_at'>): Promise<OrderHistory> {
    const result = await pool.query(
      `INSERT INTO order_history (
        order_id, field_changed, old_value, new_value, changed_by, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, order_id, field_changed, old_value, new_value, changed_by, notes, created_at`,
      [
        history.order_id,
        history.field_changed,
        history.old_value || null,
        history.new_value || null,
        history.changed_by || null,
        history.notes || null,
      ]
    );
    return result.rows[0];
  }

  static async findByOrder(orderId: number): Promise<OrderHistory[]> {
    const result = await pool.query(
      `SELECT oh.*, u.name as changed_by_name
       FROM order_history oh
       LEFT JOIN users u ON oh.changed_by = u.id
       WHERE oh.order_id = $1
       ORDER BY oh.created_at DESC`,
      [orderId]
    );
    return result.rows;
  }
}

