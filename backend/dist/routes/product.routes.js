"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const product_controller_1 = require("../controllers/product.controller");
const inventory_movement_controller_1 = require("../controllers/inventory-movement.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Produtos
router.get('/', product_controller_1.ProductController.list);
router.get('/low-stock', product_controller_1.ProductController.getLowStock);
router.get('/categories', product_controller_1.ProductController.getCategories);
router.get('/:id', product_controller_1.ProductController.getById);
router.post('/', product_controller_1.createProductValidation, product_controller_1.ProductController.create);
router.put('/:id', product_controller_1.updateProductValidation, product_controller_1.ProductController.update);
router.delete('/:id', product_controller_1.ProductController.delete);
router.post('/:id/adjust-stock', product_controller_1.adjustStockValidation, product_controller_1.ProductController.adjustStock);
// Movimentações
router.get('/movements/list', inventory_movement_controller_1.InventoryMovementController.list);
router.get('/movements/product/:productId', inventory_movement_controller_1.InventoryMovementController.getByProduct);
exports.default = router;
//# sourceMappingURL=product.routes.js.map