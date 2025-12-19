import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  CategoryController,
  createCategoryValidation,
} from '../controllers/category.controller';

const router = Router();

router.use(authenticate);

// Categorias de Produtos
router.get('/products', CategoryController.listProductCategories);
router.post('/products', createCategoryValidation, CategoryController.createProductCategory);
router.delete('/products/:name', CategoryController.deleteProductCategory);

// Categorias de Despesas
router.get('/expenses', CategoryController.listExpenseCategories);
router.post('/expenses', createCategoryValidation, CategoryController.createExpenseCategory);
router.delete('/expenses/:name', CategoryController.deleteExpenseCategory);

export default router;

