import pool from '../config/database';

export interface InventoryMovement {
  id: number;
  product_id: number;
  type: 'entry' | 'exit' | 'adjustment';
  quantity: number;
  reference_type?: string;
  reference_id?: number;
  notes?: string;
  created_at: Date;
  created_by?: number;
}

export class InventoryMovementModel {
  static async create(data: Omit<InventoryMovement, 'id' | 'created_at'>): Promise<InventoryMovement> {
    const {
      product_id,
      type,
      quantity,
      reference_type,
      reference_id,
      notes,
      created_by,
    } = data;

    const result = await pool.query(
      `INSERT INTO inventory_movements (
        product_id, type, quantity, reference_type, reference_id, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, product_id, type, quantity, reference_type, reference_id, notes, created_at, created_by`,
      [
        product_id,
        type,
        quantity,
        reference_type || null,
        reference_id || null,
        notes || null,
        created_by || null,
      ]
    );
    return result.rows[0];
  }

  static async findByProduct(productId: number, limit?: number): Promise<InventoryMovement[]> {
    let query = `
      SELECT im.*, u.name as created_by_name
      FROM inventory_movements im
      LEFT JOIN users u ON im.created_by = u.id
      WHERE im.product_id = $1
      ORDER BY im.created_at DESC
    `;
    const params: any[] = [productId];

    if (limit) {
      query += ` LIMIT $2`;
      params.push(limit);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findAll(productId?: number, type?: string, limit?: number): Promise<InventoryMovement[]> {
    let query = `
      SELECT im.*, p.name as product_name, u.name as created_by_name
      FROM inventory_movements im
      LEFT JOIN products p ON im.product_id = p.id
      LEFT JOIN users u ON im.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
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

    const result = await pool.query(query, params);
    return result.rows;
  }
}

