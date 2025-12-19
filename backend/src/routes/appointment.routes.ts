import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  AppointmentController,
  createAppointmentValidation,
  updateAppointmentValidation,
} from '../controllers/appointment.controller';

const router = Router();

router.use(authenticate);

router.get('/', AppointmentController.list);
router.get('/upcoming', AppointmentController.getUpcoming);
router.get('/:id', AppointmentController.getById);
router.post('/', createAppointmentValidation, AppointmentController.create);
router.put('/:id', updateAppointmentValidation, AppointmentController.update);
router.delete('/:id', AppointmentController.delete);
router.post('/:id/quick-action', AppointmentController.quickAction);

export default router;

