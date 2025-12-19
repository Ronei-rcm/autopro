import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.use(authenticate);

router.get('/overview', DashboardController.getOverview);

export default router;

