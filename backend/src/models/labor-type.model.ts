import pool from '../config/database';

export interface LaborType {
  id: number;
  name: string;
  description?: string;
  price: number;
  estimated_hours?: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class LaborTypeModel {
  static async findAll(active?: boolean): Promise<LaborType[]> {
    let query = 'SELECT * FROM labor_types WHERE 1=1';
    const params: any[] = [];

    if (active !== undefined) {
      query += ' AND active = $1';
      params.push(active);
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id: number): Promise<LaborType | null> {
    const result = await pool.query('SELECT * FROM labor_types WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(data: Omit<LaborType, 'id' | 'created_at' | 'updated_at'>): Promise<LaborType> {
    const {
      name,
      description,
      price,
      estimated_hours,
      active = true,
    } = data;

    const result = await pool.query(
      `INSERT INTO labor_types (name, description, price, estimated_hours, active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, price, estimated_hours, active, created_at, updated_at`,
      [
        name,
        description || null,
        price,
        estimated_hours || null,
        active,
      ]
    );
    return result.rows[0];
  }

  static async update(
    id: number,
    data: Partial<Omit<LaborType, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<LaborType> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const allowedFields = ['name', 'description', 'price', 'estimated_hours', 'active'];

    allowedFields.forEach((field) => {
      if (data[field as keyof typeof data] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(data[field as keyof typeof data]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id) as Promise<LaborType>;
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE labor_types SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, name, description, price, estimated_hours, active, created_at, updated_at`,
      values
    );
    return result.rows[0];
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM labor_types WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

