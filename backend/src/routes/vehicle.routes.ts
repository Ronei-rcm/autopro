import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  VehicleController,
  createVehicleValidation,
  updateVehicleValidation,
} from '../controllers/vehicle.controller';

const router = Router();

router.use(authenticate);

router.get('/', VehicleController.list);
router.get('/client/:clientId', VehicleController.getByClient);
router.get('/:id/history', VehicleController.getHistory);
router.get('/:id', VehicleController.getById);
router.post('/', createVehicleValidation, VehicleController.create);
router.put('/:id', updateVehicleValidation, VehicleController.update);
router.delete('/:id', VehicleController.delete);

export default router;

