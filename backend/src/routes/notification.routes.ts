import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();

router.use(authenticate);

router.get('/', NotificationController.getMyNotifications);
router.put('/:id/read', NotificationController.markAsRead);
router.put('/read-all', NotificationController.markAllAsRead);
router.delete('/:id', NotificationController.delete);

export default router;

