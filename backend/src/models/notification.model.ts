import pool from '../config/database';

export interface Notification {
  id: number;
  user_id?: number | null;
  profile: string;
  type: string;
  title: string;
  message: string;
  reference_type?: string | null;
  reference_id?: number | null;
  action_url?: string | null;
  read: boolean;
  created_at: Date;
  read_at?: Date | null;
}

export class NotificationModel {
  // Criar notificação
  static async create(data: Omit<Notification, 'id' | 'created_at' | 'read_at'>): Promise<Notification> {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, profile, type, title, message, reference_type, reference_id, action_url, read)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.user_id || null,
        data.profile,
        data.type,
        data.title,
        data.message,
        data.reference_type || null,
        data.reference_id || null,
        data.action_url || null,
        data.read || false,
      ]
    );
    return result.rows[0];
  }

  // Buscar notificações por perfil (ou usuário específico)
  static async findByProfile(profile: string, userId?: number, unreadOnly: boolean = false): Promise<Notification[]> {
    let query = `
      SELECT * FROM notifications
      WHERE profile = $1
    `;
    const params: any[] = [profile];
    let paramCount = 2;

    if (userId) {
      query += ` AND (user_id IS NULL OR user_id = $${paramCount})`;
      params.push(userId);
      paramCount++;
    }

    if (unreadOnly) {
      query += ` AND read = false`;
    }

    query += ` ORDER BY created_at DESC LIMIT 50`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Marcar como lida
  static async markAsRead(id: number): Promise<Notification> {
    const result = await pool.query(
      `UPDATE notifications 
       SET read = true, read_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  // Marcar todas como lidas (por perfil ou usuário)
  static async markAllAsRead(profile: string, userId?: number): Promise<number> {
    let query = `
      UPDATE notifications 
      SET read = true, read_at = CURRENT_TIMESTAMP
      WHERE profile = $1 AND read = false
    `;
    const params: any[] = [profile];
    let paramCount = 2;

    if (userId) {
      query += ` AND (user_id IS NULL OR user_id = $${paramCount})`;
      params.push(userId);
    }

    const result = await pool.query(query, params);
    return result.rowCount || 0;
  }

  // Contar notificações não lidas
  static async countUnread(profile: string, userId?: number): Promise<number> {
    let query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE profile = $1 AND read = false
    `;
    const params: any[] = [profile];
    let paramCount = 2;

    if (userId) {
      query += ` AND (user_id IS NULL OR user_id = $${paramCount})`;
      params.push(userId);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0]?.count || '0');
  }

  // Deletar notificação
  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM notifications WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }
}

