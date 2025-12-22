"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const financial_controller_1 = require("../controllers/financial.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Dashboard
router.get('/dashboard', financial_controller_1.FinancialController.getDashboard);
router.put('/installments/:installmentId', financial_controller_1.FinancialController.updateInstallment);
// Contas a Pagar
router.get('/payables', financial_controller_1.FinancialController.listPayables);
router.get('/payables/:id', financial_controller_1.FinancialController.getPayableById);
router.post('/payables', financial_controller_1.createPayableValidation, financial_controller_1.FinancialController.createPayable);
router.put('/payables/:id', financial_controller_1.FinancialController.updatePayable);
router.delete('/payables/:id', financial_controller_1.FinancialController.deletePayable);
// Contas a Receber
router.get('/receivables', financial_controller_1.FinancialController.listReceivables);
router.get('/receivables/:id', financial_controller_1.FinancialController.getReceivableById);
router.post('/receivables', financial_controller_1.createReceivableValidation, financial_controller_1.FinancialController.createReceivable);
router.put('/receivables/:id', financial_controller_1.FinancialController.updateReceivable);
router.delete('/receivables/:id', financial_controller_1.FinancialController.deleteReceivable);
// Fluxo de Caixa
router.get('/cash-flow', financial_controller_1.FinancialController.listCashFlow);
router.post('/cash-flow', financial_controller_1.createCashFlowValidation, financial_controller_1.FinancialController.createCashFlow);
exports.default = router;
//# sourceMappingURL=financial.routes.js.map