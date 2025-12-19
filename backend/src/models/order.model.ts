import pool from '../config/database';
import { Order } from '../types';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id?: number;
  labor_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type: 'product' | 'labor';
}

export class OrderModel {
  static async findAll(
    status?: string,
    clientId?: number,
    mechanicId?: number,
    search?: string
  ): Promise<any[]> {
    let query = `
      SELECT o.id, o.quote_id, o.client_id, o.vehicle_id, o.mechanic_id,
             o.order_number, o.status, o.subtotal, o.discount, o.total,
             o.started_at, o.finished_at, o.technical_notes,
             o.created_at, o.updated_at,
             c.name as client_name,
             v.brand, v.model, v.plate,
             u.name as mechanic_name
      FROM orders o
      LEFT JOIN clients c ON o.client_id = c.id
      LEFT JOIN vehicles v ON o.vehicle_id = v.id
      LEFT JOIN users u ON o.mechanic_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      query += ` AND o.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (clientId) {
      query += ` AND o.client_id = $${paramCount}`;
      params.push(clientId);
      paramCount++;
    }

    if (mechanicId) {
      query += ` AND o.mechanic_id = $${paramCount}`;
      params.push(mechanicId);
      paramCount++;
    }

    if (search) {
      query += ` AND (
        o.order_number ILIKE $${paramCount} OR
        c.name ILIKE $${paramCount} OR
        v.plate ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY o.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id: number): Promise<Order | null> {
    const result = await pool.query(
      `SELECT o.*, c.name as client_name, v.brand, v.model, v.plate
       FROM orders o
       LEFT JOIN clients c ON o.client_id = c.id
       LEFT JOIN vehicles v ON o.vehicle_id = v.id
       WHERE o.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(data: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const {
      quote_id,
      client_id,
      vehicle_id,
      mechanic_id,
      order_number,
      status = 'open',
      subtotal = 0,
      discount = 0,
      total = 0,
      started_at,
      finished_at,
      technical_notes,
    } = data;

    const result = await pool.query(
      `INSERT INTO orders (
        quote_id, client_id, vehicle_id, mechanic_id, order_number,
        status, subtotal, discount, total, started_at, finished_at, technical_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, quote_id, client_id, vehicle_id, mechanic_id, order_number,
                status, subtotal, discount, total, started_at, finished_at,
                technical_notes, created_at, updated_at`,
      [
        quote_id || null,
        client_id,
        vehicle_id,
        mechanic_id || null,
        order_number,
        status,
        subtotal,
        discount,
        total,
        started_at || null,
        finished_at || null,
        technical_notes || null,
      ]
    );
    return result.rows[0];
  }

  static async update(
    id: number,
    data: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Order> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const allowedFields = [
      'quote_id',
      'client_id',
      'vehicle_id',
      'mechanic_id',
      'status',
      'subtotal',
      'discount',
      'total',
      'started_at',
      'finished_at',
      'technical_notes',
    ];

    allowedFields.forEach((field) => {
      if (data[field as keyof typeof data] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(data[field as keyof typeof data]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id) as Promise<Order>;
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE orders SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, quote_id, client_id, vehicle_id, mechanic_id, order_number,
                 status, subtotal, discount, total, started_at, finished_at,
                 technical_notes, created_at, updated_at`,
      values
    );
    return result.rows[0];
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  static async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM orders WHERE order_number LIKE $1`,
      [`OS-${year}-%`]
    );
    const count = parseInt(result.rows[0].count) + 1;
    return `OS-${year}-${count.toString().padStart(5, '0')}`;
  }

  static async getItems(orderId: number): Promise<OrderItem[]> {
    const result = await pool.query(
      `SELECT oi.*, p.name as product_name, lt.name as labor_name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       LEFT JOIN labor_types lt ON oi.labor_id = lt.id
       WHERE oi.order_id = $1
       ORDER BY oi.id`,
      [orderId]
    );
    return result.rows;
  }

  static async addItem(item: Omit<OrderItem, 'id'>): Promise<OrderItem> {
    const result = await pool.query(
      `INSERT INTO order_items (
        order_id, product_id, labor_id, description, quantity, unit_price, total_price, item_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, order_id, product_id, labor_id, description, quantity, unit_price, total_price, item_type`,
      [
        item.order_id,
        item.product_id || null,
        item.labor_id || null,
        item.description,
        item.quantity,
        item.unit_price,
        item.total_price,
        item.item_type,
      ]
    );
    return result.rows[0];
  }

  static async removeItem(itemId: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM order_items WHERE id = $1', [itemId]);
    return result.rowCount > 0;
  }

  static async updateTotals(orderId: number): Promise<void> {
    const itemsResult = await pool.query(
      'SELECT SUM(total_price) as subtotal FROM order_items WHERE order_id = $1',
      [orderId]
    );
    const subtotal = parseFloat(itemsResult.rows[0].subtotal || '0');

    const orderResult = await pool.query(
      'SELECT discount FROM orders WHERE id = $1',
      [orderId]
    );
    const discount = parseFloat(orderResult.rows[0]?.discount || '0');
    const total = subtotal - discount;

    await pool.query(
      'UPDATE orders SET subtotal = $1, total = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [subtotal, total, orderId]
    );
  }
}

