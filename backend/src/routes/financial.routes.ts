import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  FinancialController,
  createPayableValidation,
  createReceivableValidation,
  createCashFlowValidation,
} from '../controllers/financial.controller';

const router = Router();

router.use(authenticate);

// Dashboard
router.get('/dashboard', FinancialController.getDashboard);
router.put('/installments/:installmentId', FinancialController.updateInstallment);

// Contas a Pagar
router.get('/payables', FinancialController.listPayables);
router.get('/payables/:id', FinancialController.getPayableById);
router.post('/payables', createPayableValidation, FinancialController.createPayable);
router.put('/payables/:id', FinancialController.updatePayable);
router.delete('/payables/:id', FinancialController.deletePayable);

// Contas a Receber
router.get('/receivables', FinancialController.listReceivables);
router.get('/receivables/:id', FinancialController.getReceivableById);
router.post('/receivables', createReceivableValidation, FinancialController.createReceivable);
router.put('/receivables/:id', FinancialController.updateReceivable);
router.delete('/receivables/:id', FinancialController.deleteReceivable);

// Fluxo de Caixa
router.get('/cash-flow', FinancialController.listCashFlow);
router.post('/cash-flow', createCashFlowValidation, FinancialController.createCashFlow);

export default router;
