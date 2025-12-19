import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  ProductController,
  createProductValidation,
  updateProductValidation,
  adjustStockValidation,
} from '../controllers/product.controller';
import { InventoryMovementController } from '../controllers/inventory-movement.controller';

const router = Router();

router.use(authenticate);

// Produtos
router.get('/', ProductController.list);
router.get('/low-stock', ProductController.getLowStock);
router.get('/categories', ProductController.getCategories);
router.get('/:id', ProductController.getById);
router.post('/', createProductValidation, ProductController.create);
router.put('/:id', updateProductValidation, ProductController.update);
router.delete('/:id', ProductController.delete);
router.post('/:id/adjust-stock', adjustStockValidation, ProductController.adjustStock);

// Movimentações
router.get('/movements/list', InventoryMovementController.list);
router.get('/movements/product/:productId', InventoryMovementController.getByProduct);

export default router;

