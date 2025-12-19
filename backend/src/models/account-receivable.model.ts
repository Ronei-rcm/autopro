import pool from '../config/database';
import { AccountReceivable } from '../types';

export class AccountReceivableModel {
  static async findAll(
    status?: string,
    clientId?: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    let query = `
      SELECT ar.*, c.name as client_name
      FROM accounts_receivable ar
      LEFT JOIN clients c ON ar.client_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      query += ` AND ar.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (clientId) {
      query += ` AND ar.client_id = $${paramCount}`;
      params.push(clientId);
      paramCount++;
    }

    if (startDate) {
      query += ` AND ar.due_date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND ar.due_date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    query += ' ORDER BY ar.due_date ASC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id: number): Promise<AccountReceivable | null> {
    const result = await pool.query(
      `SELECT ar.*, c.name as client_name
       FROM accounts_receivable ar
       LEFT JOIN clients c ON ar.client_id = c.id
       WHERE ar.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(data: Omit<AccountReceivable, 'id' | 'created_at' | 'updated_at'>): Promise<AccountReceivable> {
    const {
      order_id,
      client_id,
      description,
      due_date,
      amount,
      paid_amount = 0,
      payment_date,
      payment_method,
      status = 'open',
      notes,
    } = data;

    const result = await pool.query(
      `INSERT INTO accounts_receivable (
        order_id, client_id, description, due_date, amount,
        paid_amount, payment_date, payment_method, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, order_id, client_id, description, due_date, amount,
                paid_amount, payment_date, payment_method, status, notes,
                created_at, updated_at`,
      [
        order_id || null,
        client_id,
        description,
        due_date,
        amount,
        paid_amount,
        payment_date || null,
        payment_method || null,
        status,
        notes || null,
      ]
    );
    return result.rows[0];
  }

  static async update(
    id: number,
    data: Partial<Omit<AccountReceivable, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<AccountReceivable> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const allowedFields = [
      'order_id',
      'client_id',
      'description',
      'due_date',
      'amount',
      'paid_amount',
      'payment_date',
      'payment_method',
      'status',
      'notes',
    ];

    allowedFields.forEach((field) => {
      if (data[field as keyof typeof data] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(data[field as keyof typeof data]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id) as Promise<AccountReceivable>;
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE accounts_receivable SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, order_id, client_id, description, due_date, amount,
                 paid_amount, payment_date, payment_method, status, notes,
                 created_at, updated_at`,
      values
    );
    return result.rows[0];
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM accounts_receivable WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  static async getSummary(): Promise<any> {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN amount - paid_amount ELSE 0 END) as total_open,
        SUM(CASE WHEN status = 'overdue' THEN amount - paid_amount ELSE 0 END) as total_overdue,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
        SUM(amount) as total_amount
       FROM accounts_receivable`
    );
    return result.rows[0];
  }
}

