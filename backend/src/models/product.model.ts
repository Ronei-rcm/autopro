import pool from '../config/database';
import { Product } from '../types';

export class ProductModel {
  static async findAll(search?: string, category?: string, lowStock?: boolean): Promise<Product[]> {
    let query = `
      SELECT p.id, p.code, p.name, p.description, p.category, p.supplier_id,
             p.cost_price, p.sale_price, p.min_quantity, p.current_quantity,
             p.unit, p.active, p.created_at, p.updated_at,
             s.name as supplier_name
      FROM products p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (
        p.name ILIKE $${paramCount} OR 
        p.code ILIKE $${paramCount} OR
        p.description ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (category) {
      query += ` AND p.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (lowStock) {
      query += ` AND p.current_quantity <= p.min_quantity AND p.active = true`;
    }

    query += ' ORDER BY p.name ASC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id: number): Promise<Product | null> {
    const result = await pool.query(
      `SELECT p.id, p.code, p.name, p.description, p.category, p.supplier_id,
              p.cost_price, p.sale_price, p.min_quantity, p.current_quantity,
              p.unit, p.active, p.created_at, p.updated_at,
              s.name as supplier_name
       FROM products p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByCode(code: string): Promise<Product | null> {
    const result = await pool.query(
      'SELECT * FROM products WHERE code = $1',
      [code]
    );
    return result.rows[0] || null;
  }

  static async create(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const {
      code,
      name,
      description,
      category,
      supplier_id,
      cost_price,
      sale_price,
      min_quantity = 0,
      current_quantity = 0,
      unit = 'UN',
      active = true,
    } = data;

    const result = await pool.query(
      `INSERT INTO products (
        code, name, description, category, supplier_id,
        cost_price, sale_price, min_quantity, current_quantity, unit, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, code, name, description, category, supplier_id,
                cost_price, sale_price, min_quantity, current_quantity, unit, active, created_at, updated_at`,
      [
        code || null,
        name,
        description || null,
        category || null,
        supplier_id || null,
        cost_price,
        sale_price,
        min_quantity,
        current_quantity,
        unit,
        active,
      ]
    );
    return result.rows[0];
  }

  static async update(
    id: number,
    data: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Product> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const allowedFields = [
      'code',
      'name',
      'description',
      'category',
      'supplier_id',
      'cost_price',
      'sale_price',
      'min_quantity',
      'current_quantity',
      'unit',
      'active',
    ];

    allowedFields.forEach((field) => {
      if (data[field as keyof typeof data] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(data[field as keyof typeof data]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id) as Promise<Product>;
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, code, name, description, category, supplier_id,
                 cost_price, sale_price, min_quantity, current_quantity, unit, active, created_at, updated_at`,
      values
    );
    return result.rows[0];
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  static async getLowStock(): Promise<Product[]> {
    const result = await pool.query(
      `SELECT * FROM products 
       WHERE current_quantity <= min_quantity AND active = true
       ORDER BY (current_quantity - min_quantity) ASC`
    );
    return result.rows;
  }

  static async getCategories(): Promise<string[]> {
    const result = await pool.query(
      'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category'
    );
    return result.rows.map((row) => row.category);
  }
}

