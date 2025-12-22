"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWarrantyValidation = exports.createWarrantyValidation = exports.WarrantyController = void 0;
const warranty_model_1 = require("../models/warranty.model");
const order_model_1 = require("../models/order.model");
const express_validator_1 = require("express-validator");
class WarrantyController {
    static async list(req, res) {
        try {
            const status = req.query.status;
            const orderId = req.query.order_id ? parseInt(req.query.order_id) : undefined;
            const clientId = req.query.client_id ? parseInt(req.query.client_id) : undefined;
            const startDate = req.query.start_date ? new Date(req.query.start_date) : undefined;
            const endDate = req.query.end_date ? new Date(req.query.end_date) : undefined;
            const warranties = await warranty_model_1.WarrantyModel.findAll(status, orderId, clientId, startDate, endDate);
            // Atualizar status de garantias expiradas antes de retornar
            await warranty_model_1.WarrantyModel.updateExpiredStatuses();
            res.json(warranties);
        }
        catch (error) {
            console.error('List warranties error:', error);
            res.status(500).json({ error: 'Erro ao listar garantias' });
        }
    }
    static async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const warranty = await warranty_model_1.WarrantyModel.findById(id);
            if (!warranty) {
                res.status(404).json({ error: 'Garantia não encontrada' });
                return;
            }
            res.json(warranty);
        }
        catch (error) {
            console.error('Get warranty error:', error);
            res.status(500).json({ error: 'Erro ao buscar garantia' });
        }
    }
    static async create(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const { order_id, order_item_id, warranty_period_days, start_date } = req.body;
            // Verificar se a ordem existe
            const order = await order_model_1.OrderModel.findById(order_id);
            if (!order) {
                res.status(404).json({ error: 'Ordem de serviço não encontrada' });
                return;
            }
            // Calcular data de término
            const startDate = start_date ? new Date(start_date) : new Date();
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + warranty_period_days);
            const warranty = await warranty_model_1.WarrantyModel.create({
                ...req.body,
                start_date: startDate,
                end_date: endDate,
                status: 'active',
            });
            res.status(201).json(warranty);
        }
        catch (error) {
            console.error('Create warranty error:', error);
            res.status(500).json({ error: 'Erro ao criar garantia' });
        }
    }
    static async update(req, res) {
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
            const existingWarranty = await warranty_model_1.WarrantyModel.findById(id);
            if (!existingWarranty) {
                res.status(404).json({ error: 'Garantia não encontrada' });
                return;
            }
            // Se alterar período ou data inicial, recalcular data de término
            if (req.body.warranty_period_days || req.body.start_date) {
                const periodDays = req.body.warranty_period_days || existingWarranty.warranty_period_days;
                const startDate = req.body.start_date ? new Date(req.body.start_date) : new Date(existingWarranty.start_date);
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + periodDays);
                req.body.end_date = endDate;
            }
            const warranty = await warranty_model_1.WarrantyModel.update(id, req.body);
            if (!warranty) {
                res.status(404).json({ error: 'Garantia não encontrada' });
                return;
            }
            res.json(warranty);
        }
        catch (error) {
            console.error('Update warranty error:', error);
            res.status(500).json({ error: 'Erro ao atualizar garantia' });
        }
    }
    static async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const deleted = await warranty_model_1.WarrantyModel.delete(id);
            if (!deleted) {
                res.status(404).json({ error: 'Garantia não encontrada' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Delete warranty error:', error);
            res.status(500).json({ error: 'Erro ao deletar garantia' });
        }
    }
    static async getExpiring(req, res) {
        try {
            const days = req.query.days ? parseInt(req.query.days) : 30;
            const warranties = await warranty_model_1.WarrantyModel.getExpiringWarranties(days);
            res.json(warranties);
        }
        catch (error) {
            console.error('Get expiring warranties error:', error);
            res.status(500).json({ error: 'Erro ao buscar garantias próximas ao vencimento' });
        }
    }
    static async getSummary(req, res) {
        try {
            // Atualizar status de garantias expiradas antes de retornar resumo
            await warranty_model_1.WarrantyModel.updateExpiredStatuses();
            const summary = await warranty_model_1.WarrantyModel.getSummary();
            res.json(summary);
        }
        catch (error) {
            console.error('Get warranty summary error:', error);
            res.status(500).json({ error: 'Erro ao buscar resumo de garantias' });
        }
    }
}
exports.WarrantyController = WarrantyController;
// Validações
exports.createWarrantyValidation = [
    (0, express_validator_1.body)('order_id').isInt().withMessage('ID da ordem é obrigatório'),
    (0, express_validator_1.body)('order_item_id').isInt().withMessage('ID do item é obrigatório'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Descrição é obrigatória'),
    (0, express_validator_1.body)('warranty_period_days').isInt({ min: 1 }).withMessage('Período de garantia deve ser maior que zero'),
];
exports.updateWarrantyValidation = [
    (0, express_validator_1.body)('description').optional().notEmpty().withMessage('Descrição não pode ser vazia'),
    (0, express_validator_1.body)('warranty_period_days').optional().isInt({ min: 1 }).withMessage('Período de garantia deve ser maior que zero'),
    (0, express_validator_1.body)('status').optional().isIn(['active', 'expired', 'used', 'cancelled']).withMessage('Status inválido'),
];
//# sourceMappingURL=warranty.controller.js.map