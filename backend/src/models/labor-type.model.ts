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
}

