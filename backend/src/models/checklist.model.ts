import pool from '../config/database';

export interface Checklist {
  id: number;
  name: string;
  description?: string;
  category?: string;
  active: boolean;
  created_by?: number;
  created_at: Date;
  updated_at: Date;
}

export interface ChecklistItem {
  id: number;
  checklist_id: number;
  description: string;
  item_type: 'check' | 'measure' | 'observation';
  required: boolean;
  sort_order: number;
  created_at: Date;
}

export interface ChecklistExecution {
  id: number;
  order_id: number;
  checklist_id: number;
  vehicle_id: number;
  mechanic_id?: number;
  executed_at: Date;
  notes?: string;
  created_at: Date;
  checklist_name?: string;
  mechanic_name?: string;
}

export interface ChecklistExecutionItem {
  id: number;
  execution_id: number;
  checklist_item_id: number;
  checked: boolean;
  value?: string;
  observation?: string;
  created_at: Date;
  item_description?: string;
  item_type?: string;
}

export class ChecklistModel {
  static async findAll(activeOnly: boolean = false): Promise<(Checklist & { items?: ChecklistItem[] })[]> {
    let query = `
      SELECT c.*
      FROM checklists c
      WHERE 1=1
    `;
    const params: any[] = [];

    if (activeOnly) {
      query += ` AND c.active = true`;
    }

    query += ` ORDER BY c.name ASC`;

    const result = await pool.query(query, params);
    const checklists = result.rows;

    // Buscar itens para cada checklist
    const checklistsWithItems = await Promise.all(
      checklists.map(async (checklist) => {
        const itemsResult = await pool.query(
          `SELECT * FROM checklist_items
           WHERE checklist_id = $1
           ORDER BY sort_order ASC, id ASC`,
          [checklist.id]
        );

        return {
          ...checklist,
          items: itemsResult.rows,
        };
      })
    );

    return checklistsWithItems;
  }

  static async findById(id: number, includeItems: boolean = true): Promise<(Checklist & { items?: ChecklistItem[] }) | null> {
    const result = await pool.query(
      'SELECT * FROM checklists WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const checklist = result.rows[0];

    if (includeItems) {
      const itemsResult = await pool.query(
        `SELECT * FROM checklist_items
         WHERE checklist_id = $1
         ORDER BY sort_order ASC, id ASC`,
        [id]
      );

      return {
        ...checklist,
        items: itemsResult.rows,
      };
    }

    return checklist;
  }

  static async create(
    data: Omit<Checklist, 'id' | 'created_at' | 'updated_at'>,
    items?: Omit<ChecklistItem, 'id' | 'checklist_id' | 'created_at'>[]
  ): Promise<Checklist & { items?: ChecklistItem[] }> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Criar checklist
      const checklistResult = await client.query(
        `INSERT INTO checklists (name, description, category, active, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [data.name, data.description || null, data.category || null, data.active !== undefined ? data.active : true, data.created_by || null]
      );

      const checklist = checklistResult.rows[0];

      // Criar itens se fornecidos
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          await client.query(
            `INSERT INTO checklist_items (checklist_id, description, item_type, required, sort_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [checklist.id, item.description, item.item_type || 'check', item.required || false, item.sort_order || i]
          );
        }
      }

      await client.query('COMMIT');

      // Retornar checklist com itens
      return this.findById(checklist.id) as Promise<Checklist & { items?: ChecklistItem[] }>;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async update(
    id: number,
    data: Partial<Omit<Checklist, 'id' | 'created_at' | 'updated_at'>>,
    items?: Omit<ChecklistItem, 'id' | 'checklist_id' | 'created_at'>[]
  ): Promise<Checklist & { items?: ChecklistItem[] }> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      const allowedFields = ['name', 'description', 'category', 'active'];

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
          `UPDATE checklists SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount}`,
          values
        );
      }

      // Se items foram fornecidos, substituir todos os itens
      if (items !== undefined) {
        // Deletar itens existentes
        await client.query('DELETE FROM checklist_items WHERE checklist_id = $1', [id]);

        // Criar novos itens
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          await client.query(
            `INSERT INTO checklist_items (checklist_id, description, item_type, required, sort_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, item.description, item.item_type || 'check', item.required || false, item.sort_order || i]
          );
        }
      }

      await client.query('COMMIT');

      return this.findById(id) as Promise<Checklist & { items?: ChecklistItem[] }>;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM checklists WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  // Métodos para execução de checklist
  static async createExecution(
    orderId: number,
    checklistId: number,
    vehicleId: number,
    mechanicId?: number,
    notes?: string,
    items?: Omit<ChecklistExecutionItem, 'id' | 'execution_id' | 'created_at'>[]
  ): Promise<ChecklistExecution & { items?: ChecklistExecutionItem[] }> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Criar execução
      const executionResult = await client.query(
        `INSERT INTO checklist_executions (order_id, checklist_id, vehicle_id, mechanic_id, notes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [orderId, checklistId, vehicleId, mechanicId || null, notes || null]
      );

      const execution = executionResult.rows[0];

      // Criar itens da execução se fornecidos
      if (items && items.length > 0) {
        for (const item of items) {
          await client.query(
            `INSERT INTO checklist_execution_items (execution_id, checklist_item_id, checked, value, observation)
             VALUES ($1, $2, $3, $4, $5)`,
            [execution.id, item.checklist_item_id, item.checked || false, item.value || null, item.observation || null]
          );
        }
      }

      await client.query('COMMIT');

      // Retornar execução com itens
      return this.findExecutionById(execution.id) as Promise<ChecklistExecution & { items?: ChecklistExecutionItem[] }>;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findExecutionById(id: number): Promise<(ChecklistExecution & { items?: ChecklistExecutionItem[] }) | null> {
    const result = await pool.query(
      `SELECT ce.*, c.name as checklist_name, u.name as mechanic_name
       FROM checklist_executions ce
       LEFT JOIN checklists c ON ce.checklist_id = c.id
       LEFT JOIN users u ON ce.mechanic_id = u.id
       WHERE ce.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const execution = result.rows[0];

    // Buscar itens da execução
    const itemsResult = await pool.query(
      `SELECT cei.*, ci.description as item_description, ci.item_type
       FROM checklist_execution_items cei
       INNER JOIN checklist_items ci ON cei.checklist_item_id = ci.id
       WHERE cei.execution_id = $1
       ORDER BY ci.sort_order ASC, cei.id ASC`,
      [id]
    );

    return {
      ...execution,
      items: itemsResult.rows,
    };
  }

  static async findExecutionsByOrder(orderId: number): Promise<(ChecklistExecution & { items?: ChecklistExecutionItem[] })[]> {
    const result = await pool.query(
      `SELECT ce.*, c.name as checklist_name, u.name as mechanic_name
       FROM checklist_executions ce
       LEFT JOIN checklists c ON ce.checklist_id = c.id
       LEFT JOIN users u ON ce.mechanic_id = u.id
       WHERE ce.order_id = $1
       ORDER BY ce.executed_at DESC`,
      [orderId]
    );

    const executions = result.rows;

    // Buscar itens para cada execução
    const executionsWithItems = await Promise.all(
      executions.map(async (execution) => {
        const itemsResult = await pool.query(
          `SELECT cei.*, ci.description as item_description, ci.item_type
           FROM checklist_execution_items cei
           INNER JOIN checklist_items ci ON cei.checklist_item_id = ci.id
           WHERE cei.execution_id = $1
           ORDER BY ci.sort_order ASC, cei.id ASC`,
          [execution.id]
        );

        return {
          ...execution,
          items: itemsResult.rows,
        };
      })
    );

    return executionsWithItems;
  }

  static async updateExecutionItem(
    executionId: number,
    checklistItemId: number,
    data: Partial<Omit<ChecklistExecutionItem, 'id' | 'execution_id' | 'checklist_item_id' | 'created_at'>>
  ): Promise<ChecklistExecutionItem | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const allowedFields = ['checked', 'value', 'observation'];

    allowedFields.forEach((field) => {
      if (data[field as keyof typeof data] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(data[field as keyof typeof data]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      // Retornar item atual se não há mudanças
      const currentResult = await pool.query(
        'SELECT * FROM checklist_execution_items WHERE execution_id = $1 AND checklist_item_id = $2',
        [executionId, checklistItemId]
      );
      return currentResult.rows[0] || null;
    }

    values.push(executionId, checklistItemId);
    const result = await pool.query(
      `UPDATE checklist_execution_items SET ${fields.join(', ')}
       WHERE execution_id = $${paramCount} AND checklist_item_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      // Se não existe, criar
      const insertResult = await pool.query(
        `INSERT INTO checklist_execution_items (execution_id, checklist_item_id, checked, value, observation)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [executionId, checklistItemId, data.checked || false, data.value || null, data.observation || null]
      );
      return insertResult.rows[0];
    }

    return result.rows[0];
  }
}
