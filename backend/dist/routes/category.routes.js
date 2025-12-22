"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const category_controller_1 = require("../controllers/category.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Categorias de Produtos
router.get('/products', category_controller_1.CategoryController.listProductCategories);
router.post('/products', category_controller_1.createCategoryValidation, category_controller_1.CategoryController.createProductCategory);
router.delete('/products/:name', category_controller_1.CategoryController.deleteProductCategory);
// Categorias de Despesas
router.get('/expenses', category_controller_1.CategoryController.listExpenseCategories);
router.post('/expenses', category_controller_1.createCategoryValidation, category_controller_1.CategoryController.createExpenseCategory);
router.delete('/expenses/:name', category_controller_1.CategoryController.deleteExpenseCategory);
exports.default = router;
//# sourceMappingURL=category.routes.js.map