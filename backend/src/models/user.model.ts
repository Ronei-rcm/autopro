import pool from '../config/database';
import { User, UserProfile } from '../types';

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await pool.query(
      'SELECT id, email, name, profile, active, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(
    email: string,
    passwordHash: string,
    name: string,
    profile: UserProfile
  ): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, profile)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, profile, active, created_at, updated_at`,
      [email, passwordHash, name, profile]
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<User>): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.profile !== undefined) {
      fields.push(`profile = $${paramCount++}`);
      values.push(data.profile);
    }
    if (data.active !== undefined) {
      fields.push(`active = $${paramCount++}`);
      values.push(data.active);
    }

    if (fields.length === 0) {
      return this.findById(id) as Promise<User>;
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, email, name, profile, active, created_at, updated_at`,
      values
    );
    return result.rows[0];
  }

  static async findAll(): Promise<User[]> {
    const result = await pool.query(
      'SELECT id, email, name, profile, active, created_at, updated_at FROM users ORDER BY name'
    );
    return result.rows;
  }
}

