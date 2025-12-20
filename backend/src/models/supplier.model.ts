import pool from '../config/database';

export interface Supplier {
  id: number;
  name: string;
  cnpj?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zipcode?: string;
  notes?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class SupplierModel {
  static async findAll(search?: string, active?: boolean): Promise<Supplier[]> {
    let query = `
      SELECT id, name, cnpj, contact_name, phone, email,
             address_street, address_number, address_complement,
             address_neighborhood, address_city, address_state, address_zipcode,
             notes, active, created_at, updated_at
      FROM suppliers
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (
        name ILIKE $${paramCount} OR 
        cnpj ILIKE $${paramCount} OR
        contact_name ILIKE $${paramCount} OR
        email ILIKE $${paramCount} OR 
        phone ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (active !== undefined) {
      query += ` AND active = $${paramCount}`;
      params.push(active);
      paramCount++;
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id: number): Promise<Supplier | null> {
    const result = await pool.query(
      `SELECT id, name, cnpj, contact_name, phone, email,
              address_street, address_number, address_complement,
              address_neighborhood, address_city, address_state, address_zipcode,
              notes, active, created_at, updated_at
       FROM suppliers WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(data: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const {
      name,
      cnpj,
      contact_name,
      phone,
      email,
      address_street,
      address_number,
      address_complement,
      address_neighborhood,
      address_city,
      address_state,
      address_zipcode,
      notes,
      active = true,
    } = data;

    const result = await pool.query(
      `INSERT INTO suppliers (
        name, cnpj, contact_name, phone, email,
        address_street, address_number, address_complement,
        address_neighborhood, address_city, address_state, address_zipcode,
        notes, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, name, cnpj, contact_name, phone, email,
                address_street, address_number, address_complement,
                address_neighborhood, address_city, address_state, address_zipcode,
                notes, active, created_at, updated_at`,
      [
        name,
        cnpj || null,
        contact_name || null,
        phone || null,
        email || null,
        address_street || null,
        address_number || null,
        address_complement || null,
        address_neighborhood || null,
        address_city || null,
        address_state || null,
        address_zipcode || null,
        notes || null,
        active,
      ]
    );
    return result.rows[0];
  }

  static async update(
    id: number,
    data: Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Supplier> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const allowedFields = [
      'name',
      'cnpj',
      'contact_name',
      'phone',
      'email',
      'address_street',
      'address_number',
      'address_complement',
      'address_neighborhood',
      'address_city',
      'address_state',
      'address_zipcode',
      'notes',
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
      return this.findById(id) as Promise<Supplier>;
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE suppliers SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, name, cnpj, contact_name, phone, email,
                 address_street, address_number, address_complement,
                 address_neighborhood, address_city, address_state, address_zipcode,
                 notes, active, created_at, updated_at`,
      values
    );
    return result.rows[0];
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM suppliers WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async count(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) as count FROM suppliers WHERE active = true');
    return parseInt(result.rows[0].count);
  }
}

