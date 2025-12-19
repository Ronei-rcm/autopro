import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { ReportController } from '../controllers/report.controller';

const router = Router();

router.use(authenticate);

router.get('/overview', ReportController.overview);
router.get('/financial', ReportController.financial);
router.get('/sales', ReportController.sales);
router.get('/inventory', ReportController.inventory);
router.get('/clients', ReportController.clients);

export default router;
