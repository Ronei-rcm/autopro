import pool from '../config/database';

export interface Installment {
  id: number;
  account_receivable_id: number;
  installment_number: number;
  due_date: Date | string;
  amount: number;
  paid_amount: number;
  paid_at?: Date | string | null;
  payment_method?: string | null;
  status: 'open' | 'paid' | 'overdue' | 'cancelled';
  notes?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export class InstallmentModel {
  static async findByReceivableId(accountReceivableId: number): Promise<Installment[]> {
    const result = await pool.query(
      `SELECT * FROM installments 
       WHERE account_receivable_id = $1 
       ORDER BY installment_number ASC`,
      [accountReceivableId]
    );
    return result.rows;
  }

  static async findById(id: number): Promise<Installment | null> {
    const result = await pool.query(
      'SELECT * FROM installments WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(data: Omit<Installment, 'id' | 'created_at' | 'updated_at'>): Promise<Installment> {
    const result = await pool.query(
      `INSERT INTO installments (
        account_receivable_id, installment_number, due_date, amount,
        paid_amount, paid_at, payment_method, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        data.account_receivable_id,
        data.installment_number,
        data.due_date,
        data.amount,
        data.paid_amount || 0,
        data.paid_at || null,
        data.payment_method || null,
        data.status || 'open',
        data.notes || null,
      ]
    );
    return result.rows[0];
  }

  static async createMany(installments: Omit<Installment, 'id' | 'created_at' | 'updated_at'>[]): Promise<Installment[]> {
    const created: Installment[] = [];
    
    for (const installment of installments) {
      const createdInstallment = await this.create(installment);
      created.push(createdInstallment);
    }
    
    return created;
  }

  static async update(
    id: number,
    data: Partial<Omit<Installment, 'id' | 'account_receivable_id' | 'installment_number' | 'created_at' | 'updated_at'>>
  ): Promise<Installment | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const allowedFields = ['due_date', 'amount', 'paid_amount', 'paid_at', 'payment_method', 'status', 'notes'];

    allowedFields.forEach((field) => {
      if (data[field as keyof typeof data] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(data[field as keyof typeof data]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE installments SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM installments WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  static async deleteByReceivableId(accountReceivableId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM installments WHERE account_receivable_id = $1',
      [accountReceivableId]
    );
    return result.rowCount > 0;
  }

  static async updateStatuses(): Promise<void> {
    // Atualiza status para 'overdue' de parcelas em aberto com vencimento passado
    await pool.query(
      `UPDATE installments 
       SET status = 'overdue', updated_at = CURRENT_TIMESTAMP
       WHERE status = 'open' 
       AND due_date < CURRENT_DATE
       AND paid_amount < amount`
    );
  }

  static async getSummaryByReceivableId(accountReceivableId: number): Promise<any> {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_installments,
        SUM(amount) as total_amount,
        SUM(paid_amount) as total_paid,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_count,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
       FROM installments
       WHERE account_receivable_id = $1`,
      [accountReceivableId]
    );
    return result.rows[0];
  }
}
