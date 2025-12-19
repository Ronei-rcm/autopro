import pool from '../config/database';
import { CashFlow } from '../types';

export class CashFlowModel {
  static async findAll(
    startDate?: Date,
    endDate?: Date,
    type?: string,
    category?: string
  ): Promise<any[]> {
    let query = `
      SELECT cf.*
      FROM cash_flow cf
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND cf.date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND cf.date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    if (type) {
      query += ` AND cf.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (category) {
      query += ` AND cf.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    query += ' ORDER BY cf.date DESC, cf.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id: number): Promise<CashFlow | null> {
    const result = await pool.query('SELECT * FROM cash_flow WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(data: Omit<CashFlow, 'id' | 'created_at' | 'updated_at'>): Promise<CashFlow> {
    const {
      type,
      category,
      description,
      amount,
      date,
      payment_method,
      reference_type,
      reference_id,
      notes,
      created_by,
    } = data;

    const result = await pool.query(
      `INSERT INTO cash_flow (
        type, category, description, amount, date, payment_method,
        reference_type, reference_id, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, type, category, description, amount, date, payment_method,
                reference_type, reference_id, notes, created_by, created_at, updated_at`,
      [
        type,
        category || null,
        description,
        amount,
        date,
        payment_method || null,
        reference_type || null,
        reference_id || null,
        notes || null,
        created_by || null,
      ]
    );
    return result.rows[0];
  }

  static async update(
    id: number,
    data: Partial<Omit<CashFlow, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<CashFlow> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const allowedFields = [
      'type',
      'category',
      'description',
      'amount',
      'date',
      'payment_method',
      'reference_type',
      'reference_id',
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
      return this.findById(id) as Promise<CashFlow>;
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE cash_flow SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, type, category, description, amount, date, payment_method,
                 reference_type, reference_id, notes, created_by, created_at, updated_at`,
      values
    );
    return result.rows[0];
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM cash_flow WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  static async getSummary(startDate?: Date, endDate?: Date): Promise<any> {
    let query = `
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance
      FROM cash_flow
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return result.rows[0];
  }
}

