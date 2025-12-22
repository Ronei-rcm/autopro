import { Response } from 'express';
import { NotificationModel } from '../models/notification.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class NotificationController {
  // Buscar notificações do usuário atual
  static async getMyNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const profile = req.userProfile as string;
      const userId = req.userId;
      const unreadOnly = req.query.unread_only === 'true';

      const notifications = await NotificationModel.findByProfile(profile, userId, unreadOnly);
      const unreadCount = await NotificationModel.countUnread(profile, userId);

      res.json({
        notifications,
        unreadCount,
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Erro ao buscar notificações' });
    }
  }

  // Marcar notificação como lida
  static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const notification = await NotificationModel.markAsRead(id);
      res.json(notification);
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: 'Erro ao marcar notificação como lida' });
    }
  }

  // Marcar todas como lidas
  static async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const profile = req.userProfile as string;
      const userId = req.userId;

      const count = await NotificationModel.markAllAsRead(profile, userId);
      res.json({ message: `${count} notificações marcadas como lidas`, count });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({ error: 'Erro ao marcar notificações como lidas' });
    }
  }

  // Deletar notificação
  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const deleted = await NotificationModel.delete(id);
      if (deleted) {
        res.json({ message: 'Notificação excluída com sucesso' });
      } else {
        res.status(404).json({ error: 'Notificação não encontrada' });
      }
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ error: 'Erro ao excluir notificação' });
    }
  }
}

