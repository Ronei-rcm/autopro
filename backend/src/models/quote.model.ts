import pool from '../config/database';

export interface Quote {
  id: number;
  client_id: number;
  vehicle_id: number;
  user_id: number;
  quote_number: string;
  status: 'open' | 'approved' | 'rejected' | 'converted';
  subtotal: number;
  discount: number;
  total: number;
  valid_until?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  client_name?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_plate?: string;
  user_name?: string;
}

export interface QuoteItem {
  id: number;
  quote_id: number;
  product_id?: number;
  labor_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type: 'product' | 'labor';
  product_name?: string;
  labor_name?: string;
}

export class QuoteModel {
  static async findAll(
    status?: string,
    clientId?: number,
    search?: string
  ): Promise<Quote[]> {
    let query = `
      SELECT q.id, q.client_id, q.vehicle_id, q.user_id, q.quote_number,
             q.status, q.subtotal, q.discount, q.total, q.valid_until, q.notes,
             q.created_at, q.updated_at,
             c.name as client_name,
             v.brand as vehicle_brand, v.model as vehicle_model, v.plate as vehicle_plate,
             u.name as user_name
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      LEFT JOIN vehicles v ON q.vehicle_id = v.id
      LEFT JOIN users u ON q.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      query += ` AND q.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (clientId) {
      query += ` AND q.client_id = $${paramCount}`;
      params.push(clientId);
      paramCount++;
    }

    if (search) {
      query += ` AND (
        q.quote_number ILIKE $${paramCount} OR
        c.name ILIKE $${paramCount} OR
        v.plate ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY q.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id: number): Promise<(Quote & { items?: QuoteItem[] }) | null> {
    const result = await pool.query(
      `SELECT q.id, q.client_id, q.vehicle_id, q.user_id, q.quote_number,
              q.status, q.subtotal, q.discount, q.total, q.valid_until, q.notes,
              q.created_at, q.updated_at,
              c.name as client_name,
              v.brand as vehicle_brand, v.model as vehicle_model, v.plate as vehicle_plate,
              u.name as user_name
       FROM quotes q
       LEFT JOIN clients c ON q.client_id = c.id
       LEFT JOIN vehicles v ON q.vehicle_id = v.id
       LEFT JOIN users u ON q.user_id = u.id
       WHERE q.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const quote = result.rows[0];

    // Buscar itens do orçamento
    const itemsResult = await pool.query(
      `SELECT qi.id, qi.quote_id, qi.product_id, qi.labor_id, qi.description,
              qi.quantity, qi.unit_price, qi.total_price, qi.item_type,
              p.name as product_name,
              lt.name as labor_name
       FROM quote_items qi
       LEFT JOIN products p ON qi.product_id = p.id
       LEFT JOIN labor_types lt ON qi.labor_id = lt.id
       WHERE qi.quote_id = $1
       ORDER BY qi.id ASC`,
      [id]
    );

    return {
      ...quote,
      items: itemsResult.rows,
    };
  }

  static async generateQuoteNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM quotes WHERE quote_number LIKE $1`,
      [`ORC-${year}-%`]
    );

    const count = parseInt(result.rows[0].count) + 1;
    return `ORC-${year}-${String(count).padStart(5, '0')}`;
  }

  static async create(
    data: Omit<Quote, 'id' | 'quote_number' | 'created_at' | 'updated_at'>,
    items: Omit<QuoteItem, 'id' | 'quote_id'>[]
  ): Promise<Quote & { items?: QuoteItem[] }> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Gerar número do orçamento
      const quoteNumber = await this.generateQuoteNumber();

      // Calcular totais
      const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
      const total = subtotal - (data.discount || 0);

      // Criar orçamento
      const quoteResult = await client.query(
        `INSERT INTO quotes (client_id, vehicle_id, user_id, quote_number, status, subtotal, discount, total, valid_until, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          data.client_id,
          data.vehicle_id,
          data.user_id,
          quoteNumber,
          data.status || 'open',
          subtotal,
          data.discount || 0,
          total,
          data.valid_until || null,
          data.notes || null,
        ]
      );

      const quote = quoteResult.rows[0];

      // Criar itens
      for (const item of items) {
        await client.query(
          `INSERT INTO quote_items (quote_id, product_id, labor_id, description, quantity, unit_price, total_price, item_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            quote.id,
            item.product_id || null,
            item.labor_id || null,
            item.description,
            item.quantity,
            item.unit_price,
            item.total_price,
            item.item_type,
          ]
        );
      }

      await client.query('COMMIT');
      client.release();

      return this.findById(quote.id) as Promise<Quote & { items?: QuoteItem[] }>;
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      throw error;
    }
  }

  static async update(
    id: number,
    data: Partial<Omit<Quote, 'id' | 'quote_number' | 'created_at' | 'updated_at'>>,
    items?: Omit<QuoteItem, 'id' | 'quote_id'>[]
  ): Promise<Quote & { items?: QuoteItem[] }> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Se items foram fornecidos, recalcular totais
      if (items !== undefined) {
        const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
        const discount = data.discount !== undefined ? data.discount : 0;
        const total = subtotal - discount;

        data.subtotal = subtotal;
        data.total = total;
      } else if (data.discount !== undefined) {
        // Se apenas desconto mudou, recalcular total
        const currentQuote = await client.query('SELECT subtotal FROM quotes WHERE id = $1', [id]);
        if (currentQuote.rows.length > 0) {
          data.total = currentQuote.rows[0].subtotal - data.discount;
        }
      }

      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      const allowedFields = ['status', 'subtotal', 'discount', 'total', 'valid_until', 'notes'];

      allowedFields.forEach((field) => {
        if (data[field as keyof typeof data] !== undefined) {
          fields.push(`${field} = $${paramCount}`);
          values.push(data[field as keyof typeof data]);
          paramCount++;
        }
      });

      if (fields.length > 0) {
        values.push(id);
        await client.query(
          `UPDATE quotes SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount}`,
          values
        );
      }

      // Se items foram fornecidos, substituir todos os itens
      if (items !== undefined) {
        // Deletar itens existentes
        await client.query('DELETE FROM quote_items WHERE quote_id = $1', [id]);

        // Criar novos itens
        for (const item of items) {
          await client.query(
            `INSERT INTO quote_items (quote_id, product_id, labor_id, description, quantity, unit_price, total_price, item_type)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              id,
              item.product_id || null,
              item.labor_id || null,
              item.description,
              item.quantity,
              item.unit_price,
              item.total_price,
              item.item_type,
            ]
          );
        }
      }

      await client.query('COMMIT');
      client.release();

      return this.findById(id) as Promise<Quote & { items?: QuoteItem[] }>;
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      throw error;
    }
  }

  static async updateStatus(id: number, status: 'open' | 'approved' | 'rejected' | 'converted'): Promise<boolean> {
    const result = await pool.query(
      'UPDATE quotes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM quotes WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async addItem(
    quoteId: number,
    item: Omit<QuoteItem, 'id' | 'quote_id'>
  ): Promise<QuoteItem> {
    const result = await pool.query(
      `INSERT INTO quote_items (quote_id, product_id, labor_id, description, quantity, unit_price, total_price, item_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        quoteId,
        item.product_id || null,
        item.labor_id || null,
        item.description,
        item.quantity,
        item.unit_price,
        item.total_price,
        item.item_type,
      ]
    );

    // Atualizar totais do orçamento
    await this.updateTotals(quoteId);

    return result.rows[0];
  }

  static async removeItem(itemId: number, quoteId: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM quote_items WHERE id = $1 AND quote_id = $2', [itemId, quoteId]);
    
    if ((result.rowCount ?? 0) > 0) {
      // Atualizar totais do orçamento
      await this.updateTotals(quoteId);
      return true;
    }
    return false;
  }

  static async updateTotals(quoteId: number): Promise<void> {
    const itemsResult = await pool.query(
      'SELECT SUM(total_price) as subtotal FROM quote_items WHERE quote_id = $1',
      [quoteId]
    );

    const subtotal = parseFloat(itemsResult.rows[0].subtotal || '0');

    const quoteResult = await pool.query('SELECT discount FROM quotes WHERE id = $1', [quoteId]);
    const discount = parseFloat(quoteResult.rows[0]?.discount || '0');
    const total = subtotal - discount;

    await pool.query(
      'UPDATE quotes SET subtotal = $1, total = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [subtotal, total, quoteId]
    );
  }
}
