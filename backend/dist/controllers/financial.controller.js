"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCashFlowValidation = exports.createReceivableValidation = exports.createPayableValidation = exports.FinancialController = void 0;
const account_payable_model_1 = require("../models/account-payable.model");
const account_receivable_model_1 = require("../models/account-receivable.model");
const cash_flow_model_1 = require("../models/cash-flow.model");
const installment_model_1 = require("../models/installment.model");
const express_validator_1 = require("express-validator");
class FinancialController {
    // Contas a Pagar
    static async listPayables(req, res) {
        try {
            const status = req.query.status;
            const supplierId = req.query.supplier_id ? parseInt(req.query.supplier_id) : undefined;
            const startDate = req.query.start_date ? new Date(req.query.start_date) : undefined;
            const endDate = req.query.end_date ? new Date(req.query.end_date) : undefined;
            const payables = await account_payable_model_1.AccountPayableModel.findAll(status, supplierId, startDate, endDate);
            res.json(payables);
        }
        catch (error) {
            console.error('List payables error:', error);
            res.status(500).json({ error: 'Erro ao listar contas a pagar' });
        }
    }
    static async getPayableById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const payable = await account_payable_model_1.AccountPayableModel.findById(id);
            if (!payable) {
                res.status(404).json({ error: 'Conta a pagar não encontrada' });
                return;
            }
            res.json(payable);
        }
        catch (error) {
            console.error('Get payable error:', error);
            res.status(500).json({ error: 'Erro ao buscar conta a pagar' });
        }
    }
    static async createPayable(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const payable = await account_payable_model_1.AccountPayableModel.create(req.body);
            res.status(201).json(payable);
        }
        catch (error) {
            console.error('Create payable error:', error);
            res.status(500).json({ error: 'Erro ao criar conta a pagar' });
        }
    }
    static async updatePayable(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const existingPayable = await account_payable_model_1.AccountPayableModel.findById(id);
            if (!existingPayable) {
                res.status(404).json({ error: 'Conta a pagar não encontrada' });
                return;
            }
            // Se pagou totalmente, atualizar status
            if (req.body.paid_amount !== undefined) {
                const totalPaid = parseFloat(req.body.paid_amount);
                const totalAmount = parseFloat(existingPayable.amount);
                if (totalPaid >= totalAmount) {
                    req.body.status = 'paid';
                    req.body.paid_amount = totalAmount;
                    if (!req.body.payment_date) {
                        req.body.payment_date = new Date();
                    }
                }
                else if (totalPaid > 0) {
                    req.body.status = 'open';
                }
            }
            const payable = await account_payable_model_1.AccountPayableModel.update(id, req.body);
            res.json(payable);
        }
        catch (error) {
            console.error('Update payable error:', error);
            res.status(500).json({ error: 'Erro ao atualizar conta a pagar' });
        }
    }
    static async deletePayable(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const deleted = await account_payable_model_1.AccountPayableModel.delete(id);
            if (!deleted) {
                res.status(404).json({ error: 'Conta a pagar não encontrada' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Delete payable error:', error);
            res.status(500).json({ error: 'Erro ao deletar conta a pagar' });
        }
    }
    // Contas a Receber
    static async listReceivables(req, res) {
        try {
            const status = req.query.status;
            const clientId = req.query.client_id ? parseInt(req.query.client_id) : undefined;
            const orderId = req.query.order_id ? parseInt(req.query.order_id) : undefined;
            const startDate = req.query.start_date ? new Date(req.query.start_date) : undefined;
            const endDate = req.query.end_date ? new Date(req.query.end_date) : undefined;
            const receivables = await account_receivable_model_1.AccountReceivableModel.findAll(status, clientId, startDate, endDate, orderId);
            res.json(receivables);
        }
        catch (error) {
            console.error('List receivables error:', error);
            res.status(500).json({ error: 'Erro ao listar contas a receber' });
        }
    }
    static async getReceivableById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const receivable = await account_receivable_model_1.AccountReceivableModel.findById(id);
            if (!receivable) {
                res.status(404).json({ error: 'Conta a receber não encontrada' });
                return;
            }
            // Buscar parcelas relacionadas
            const installments = await installment_model_1.InstallmentModel.findByReceivableId(id);
            res.json({ ...receivable, installments });
        }
        catch (error) {
            console.error('Get receivable error:', error);
            res.status(500).json({ error: 'Erro ao buscar conta a receber' });
        }
    }
    static async createReceivable(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const { installments, ...receivableData } = req.body;
            // Criar conta a receber
            const receivable = await account_receivable_model_1.AccountReceivableModel.create(receivableData);
            // Se houver parcelas, criá-las
            if (installments && Array.isArray(installments) && installments.length > 0) {
                const installmentPromises = installments.map((inst, index) => installment_model_1.InstallmentModel.create({
                    account_receivable_id: receivable.id,
                    installment_number: index + 1,
                    due_date: inst.due_date,
                    amount: inst.amount,
                    paid_amount: 0,
                    status: 'open',
                    payment_method: inst.payment_method || null,
                    notes: inst.notes || null,
                }));
                await Promise.all(installmentPromises);
            }
            // Buscar conta com parcelas se houver
            const fullReceivable = await account_receivable_model_1.AccountReceivableModel.findById(receivable.id);
            if (fullReceivable) {
                const installmentList = await installment_model_1.InstallmentModel.findByReceivableId(receivable.id);
                res.status(201).json({ ...fullReceivable, installments: installmentList });
            }
            else {
                res.status(201).json(receivable);
            }
        }
        catch (error) {
            console.error('Create receivable error:', error);
            res.status(500).json({ error: 'Erro ao criar conta a receber' });
        }
    }
    static async updateReceivable(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const existingReceivable = await account_receivable_model_1.AccountReceivableModel.findById(id);
            if (!existingReceivable) {
                res.status(404).json({ error: 'Conta a receber não encontrada' });
                return;
            }
            // Se recebeu totalmente, atualizar status
            if (req.body.paid_amount !== undefined) {
                const totalPaid = parseFloat(req.body.paid_amount);
                const totalAmount = parseFloat(existingReceivable.amount);
                if (totalPaid >= totalAmount) {
                    req.body.status = 'paid';
                    req.body.paid_amount = totalAmount;
                    if (!req.body.payment_date) {
                        req.body.payment_date = new Date();
                    }
                }
                else if (totalPaid > 0) {
                    req.body.status = 'open';
                }
            }
            const receivable = await account_receivable_model_1.AccountReceivableModel.update(id, req.body);
            res.json(receivable);
        }
        catch (error) {
            console.error('Update receivable error:', error);
            res.status(500).json({ error: 'Erro ao atualizar conta a receber' });
        }
    }
    static async deleteReceivable(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const deleted = await account_receivable_model_1.AccountReceivableModel.delete(id);
            if (!deleted) {
                res.status(404).json({ error: 'Conta a receber não encontrada' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Delete receivable error:', error);
            res.status(500).json({ error: 'Erro ao deletar conta a receber' });
        }
    }
    // Fluxo de Caixa
    static async listCashFlow(req, res) {
        try {
            const startDate = req.query.start_date ? new Date(req.query.start_date) : undefined;
            const endDate = req.query.end_date ? new Date(req.query.end_date) : undefined;
            const type = req.query.type;
            const category = req.query.category;
            const cashFlow = await cash_flow_model_1.CashFlowModel.findAll(startDate, endDate, type, category);
            res.json(cashFlow);
        }
        catch (error) {
            console.error('List cash flow error:', error);
            res.status(500).json({ error: 'Erro ao listar fluxo de caixa' });
        }
    }
    static async createCashFlow(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const cashFlow = await cash_flow_model_1.CashFlowModel.create({
                ...req.body,
                created_by: req.userId,
            });
            res.status(201).json(cashFlow);
        }
        catch (error) {
            console.error('Create cash flow error:', error);
            res.status(500).json({ error: 'Erro ao criar movimento de caixa' });
        }
    }
    // Parcelas
    static async updateInstallment(req, res) {
        try {
            const installmentId = parseInt(req.params.installmentId);
            if (isNaN(installmentId)) {
                res.status(400).json({ error: 'ID da parcela inválido' });
                return;
            }
            const installment = await installment_model_1.InstallmentModel.findById(installmentId);
            if (!installment) {
                res.status(404).json({ error: 'Parcela não encontrada' });
                return;
            }
            const { paid_amount, payment_method, paid_at } = req.body;
            // Se está pagando a parcela
            if (paid_amount !== undefined) {
                const paidValue = parseFloat(paid_amount);
                const installmentAmount = parseFloat(installment.amount.toString());
                if (paidValue >= installmentAmount) {
                    // Parcela totalmente paga
                    const updated = await installment_model_1.InstallmentModel.update(installmentId, {
                        paid_amount: installmentAmount,
                        status: 'paid',
                        payment_method: payment_method || installment.payment_method,
                        paid_at: paid_at || new Date(),
                    });
                    // Atualizar status da conta a receber baseado nas parcelas
                    await this.updateReceivableStatus(installment.account_receivable_id);
                    res.json(updated);
                }
                else if (paidValue > 0) {
                    // Pagamento parcial
                    const updated = await installment_model_1.InstallmentModel.update(installmentId, {
                        paid_amount: paidValue,
                        payment_method: payment_method || installment.payment_method,
                        paid_at: paid_at || new Date(),
                        status: 'open',
                    });
                    res.json(updated);
                }
                else {
                    // Remover pagamento
                    const updated = await installment_model_1.InstallmentModel.update(installmentId, {
                        paid_amount: 0,
                        payment_method: null,
                        paid_at: null,
                        status: 'open',
                    });
                    await this.updateReceivableStatus(installment.account_receivable_id);
                    res.json(updated);
                }
            }
            else {
                // Outras atualizações (data de vencimento, notas, etc)
                const updated = await installment_model_1.InstallmentModel.update(installmentId, req.body);
                res.json(updated);
            }
        }
        catch (error) {
            console.error('Update installment error:', error);
            res.status(500).json({ error: 'Erro ao atualizar parcela' });
        }
    }
    static async updateReceivableStatus(accountReceivableId) {
        const summary = await installment_model_1.InstallmentModel.getSummaryByReceivableId(accountReceivableId);
        const totalAmount = parseFloat(summary.total_amount || '0');
        const totalPaid = parseFloat(summary.total_paid || '0');
        const paidCount = parseInt(summary.paid_count || '0');
        const totalInstallments = parseInt(summary.total_installments || '0');
        let status = 'open';
        if (paidCount === totalInstallments && totalPaid >= totalAmount) {
            status = 'paid';
        }
        else if (summary.overdue_count > 0) {
            status = 'overdue';
        }
        await account_receivable_model_1.AccountReceivableModel.update(accountReceivableId, {
            status,
            paid_amount: totalPaid,
            payment_date: status === 'paid' ? new Date() : undefined,
        });
    }
    // Dashboard e Relatórios
    static async getDashboard(req, res) {
        try {
            const payableSummary = await account_payable_model_1.AccountPayableModel.getSummary();
            const receivableSummary = await account_receivable_model_1.AccountReceivableModel.getSummary();
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);
            const cashFlowSummary = await cash_flow_model_1.CashFlowModel.getSummary(startOfMonth, endOfMonth);
            res.json({
                payables: payableSummary,
                receivables: receivableSummary,
                cashFlow: cashFlowSummary,
            });
        }
        catch (error) {
            console.error('Get dashboard error:', error);
            res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
        }
    }
}
exports.FinancialController = FinancialController;
// Validações
exports.createPayableValidation = [
    (0, express_validator_1.body)('description').notEmpty().withMessage('Descrição é obrigatória'),
    (0, express_validator_1.body)('due_date').isISO8601().withMessage('Data de vencimento inválida'),
    (0, express_validator_1.body)('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser positivo'),
];
exports.createReceivableValidation = [
    (0, express_validator_1.body)('client_id').isInt().withMessage('Cliente é obrigatório'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Descrição é obrigatória'),
    (0, express_validator_1.body)('due_date').isISO8601().withMessage('Data de vencimento inválida'),
    (0, express_validator_1.body)('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser positivo'),
];
exports.createCashFlowValidation = [
    (0, express_validator_1.body)('type').isIn(['income', 'expense']).withMessage('Tipo deve ser income ou expense'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Descrição é obrigatória'),
    (0, express_validator_1.body)('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser positivo'),
    (0, express_validator_1.body)('date').isISO8601().withMessage('Data inválida'),
];
//# sourceMappingURL=financial.controller.js.map