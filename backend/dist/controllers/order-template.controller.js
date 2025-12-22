"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderTemplateValidation = exports.createOrderTemplateValidation = exports.OrderTemplateController = void 0;
const order_template_model_1 = require("../models/order-template.model");
const express_validator_1 = require("express-validator");
class OrderTemplateController {
    static async list(req, res) {
        try {
            const activeOnly = req.query.active_only === 'true';
            const templates = await order_template_model_1.OrderTemplateModel.findAll(activeOnly);
            res.json(templates);
        }
        catch (error) {
            console.error('List order templates error:', error);
            res.status(500).json({ error: 'Erro ao listar templates' });
        }
    }
    static async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const template = await order_template_model_1.OrderTemplateModel.findById(id);
            if (!template) {
                res.status(404).json({ error: 'Template não encontrado' });
                return;
            }
            res.json(template);
        }
        catch (error) {
            console.error('Get order template error:', error);
            res.status(500).json({ error: 'Erro ao buscar template' });
        }
    }
    static async create(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const { name, description, category, active, items } = req.body;
            const template = await order_template_model_1.OrderTemplateModel.create({
                name,
                description,
                category,
                active: active !== undefined ? active : true,
                created_by: req.userId,
            }, items);
            res.status(201).json(template);
        }
        catch (error) {
            console.error('Create order template error:', error);
            res.status(500).json({ error: 'Erro ao criar template' });
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
            const existingTemplate = await order_template_model_1.OrderTemplateModel.findById(id, false);
            if (!existingTemplate) {
                res.status(404).json({ error: 'Template não encontrado' });
                return;
            }
            const { name, description, category, active, items } = req.body;
            const updateData = {};
            if (name !== undefined)
                updateData.name = name;
            if (description !== undefined)
                updateData.description = description;
            if (category !== undefined)
                updateData.category = category;
            if (active !== undefined)
                updateData.active = active;
            const template = await order_template_model_1.OrderTemplateModel.update(id, updateData, items);
            res.json(template);
        }
        catch (error) {
            console.error('Update order template error:', error);
            res.status(500).json({ error: 'Erro ao atualizar template' });
        }
    }
    static async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const deleted = await order_template_model_1.OrderTemplateModel.delete(id);
            if (!deleted) {
                res.status(404).json({ error: 'Template não encontrado' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Delete order template error:', error);
            res.status(500).json({ error: 'Erro ao deletar template' });
        }
    }
}
exports.OrderTemplateController = OrderTemplateController;
// Validações
exports.createOrderTemplateValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Nome é obrigatório'),
    (0, express_validator_1.body)('items').optional().isArray().withMessage('Items deve ser um array'),
    (0, express_validator_1.body)('items.*.description').optional().notEmpty().withMessage('Descrição do item é obrigatória'),
    (0, express_validator_1.body)('items.*.quantity').optional().isFloat({ min: 0.01 }).withMessage('Quantidade deve ser positiva'),
    (0, express_validator_1.body)('items.*.unit_price').optional().isFloat({ min: 0 }).withMessage('Preço unitário deve ser positivo'),
    (0, express_validator_1.body)('items.*.item_type').optional().isIn(['product', 'labor']).withMessage('Tipo de item inválido'),
];
exports.updateOrderTemplateValidation = [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
    (0, express_validator_1.body)('items').optional().isArray().withMessage('Items deve ser um array'),
    (0, express_validator_1.body)('items.*.description').optional().notEmpty().withMessage('Descrição do item é obrigatória'),
    (0, express_validator_1.body)('items.*.quantity').optional().isFloat({ min: 0.01 }).withMessage('Quantidade deve ser positiva'),
    (0, express_validator_1.body)('items.*.unit_price').optional().isFloat({ min: 0 }).withMessage('Preço unitário deve ser positivo'),
    (0, express_validator_1.body)('items.*.item_type').optional().isIn(['product', 'labor']).withMessage('Tipo de item inválido'),
];
//# sourceMappingURL=order-template.controller.js.map