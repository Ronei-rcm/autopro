"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const quote_controller_1 = require("../controllers/quote.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// CRUD de Orçamentos
router.get('/', quote_controller_1.QuoteController.list);
router.get('/:id', quote_controller_1.QuoteController.getById);
router.post('/', quote_controller_1.createQuoteValidation, quote_controller_1.QuoteController.create);
router.put('/:id', quote_controller_1.updateQuoteValidation, quote_controller_1.QuoteController.update);
router.delete('/:id', quote_controller_1.QuoteController.delete);
// Status
router.patch('/:id/status', quote_controller_1.QuoteController.updateStatus);
// Converter em OS
router.post('/:id/convert-to-order', quote_controller_1.QuoteController.convertToOrder);
// Itens
router.post('/:id/items', quote_controller_1.addItemValidation, quote_controller_1.QuoteController.addItem);
router.delete('/:id/items/:itemId', quote_controller_1.QuoteController.removeItem);
exports.default = router;
//# sourceMappingURL=quote.routes.js.map