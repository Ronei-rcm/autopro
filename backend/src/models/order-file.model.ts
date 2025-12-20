import pool from '../config/database';

export interface OrderFile {
  id: number;
  order_id: number;
  file_name: string;
  file_path: string;
  file_type: 'photo' | 'document' | 'other';
  file_size?: number;
  description?: string;
  uploaded_by?: number;
  created_at: Date;
  uploaded_by_name?: string;
}

export class OrderFileModel {
  static async findByOrder(orderId: number): Promise<OrderFile[]> {
    const result = await pool.query(
      `SELECT of.*, u.name as uploaded_by_name
       FROM order_files of
       LEFT JOIN users u ON of.uploaded_by = u.id
       WHERE of.order_id = $1
       ORDER BY of.created_at DESC`,
      [orderId]
    );
    return result.rows;
  }

  static async findById(id: number): Promise<OrderFile | null> {
    const result = await pool.query(
      'SELECT * FROM order_files WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(data: Omit<OrderFile, 'id' | 'created_at'>): Promise<OrderFile> {
    const result = await pool.query(
      `INSERT INTO order_files (order_id, file_name, file_path, file_type, file_size, description, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.order_id,
        data.file_name,
        data.file_path,
        data.file_type,
        data.file_size || null,
        data.description || null,
        data.uploaded_by || null,
      ]
    );
    return result.rows[0];
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM order_files WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async updateDescription(id: number, description: string): Promise<OrderFile | null> {
    const result = await pool.query(
      'UPDATE order_files SET description = $1 WHERE id = $2 RETURNING *',
      [description, id]
    );
    return result.rows[0] || null;
  }
}
