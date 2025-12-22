"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addItemValidation = exports.updateQuoteValidation = exports.createQuoteValidation = exports.QuoteController = void 0;
const quote_model_1 = require("../models/quote.model");
const order_model_1 = require("../models/order.model");
const express_validator_1 = require("express-validator");
class QuoteController {
    static async list(req, res) {
        try {
            const status = req.query.status;
            const clientId = req.query.client_id ? parseInt(req.query.client_id) : undefined;
            const search = req.query.search;
            const quotes = await quote_model_1.QuoteModel.findAll(status, clientId, search);
            res.json(quotes);
        }
        catch (error) {
            console.error('List quotes error:', error);
            res.status(500).json({ error: 'Erro ao listar orçamentos' });
        }
    }
    static async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const quote = await quote_model_1.QuoteModel.findById(id);
            if (!quote) {
                res.status(404).json({ error: 'Orçamento não encontrado' });
                return;
            }
            res.json(quote);
        }
        catch (error) {
            console.error('Get quote error:', error);
            res.status(500).json({ error: 'Erro ao buscar orçamento' });
        }
    }
    static async create(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const { client_id, vehicle_id, status, discount, valid_until, notes, items } = req.body;
            if (!items || items.length === 0) {
                res.status(400).json({ error: 'Orçamento deve ter pelo menos um item' });
                return;
            }
            const quote = await quote_model_1.QuoteModel.create({
                client_id: parseInt(client_id),
                vehicle_id: parseInt(vehicle_id),
                user_id: req.userId,
                status: (status || 'open'),
                discount: parseFloat(discount) || 0,
                valid_until: valid_until ? new Date(valid_until) : null,
                notes: notes || null,
            }, items);
            res.status(201).json(quote);
        }
        catch (error) {
            console.error('Create quote error:', error);
            res.status(500).json({ error: 'Erro ao criar orçamento' });
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
            const existingQuote = await quote_model_1.QuoteModel.findById(id);
            if (!existingQuote) {
                res.status(404).json({ error: 'Orçamento não encontrado' });
                return;
            }
            // Não permitir editar orçamento convertido
            if (existingQuote.status === 'converted') {
                res.status(400).json({ error: 'Não é possível editar orçamento convertido' });
                return;
            }
            const { status, discount, valid_until, notes, items } = req.body;
            const updateData = {};
            if (status !== undefined)
                updateData.status = status;
            if (discount !== undefined)
                updateData.discount = discount;
            if (valid_until !== undefined)
                updateData.valid_until = valid_until;
            if (notes !== undefined)
                updateData.notes = notes;
            const quote = await quote_model_1.QuoteModel.update(id, updateData, items);
            res.json(quote);
        }
        catch (error) {
            console.error('Update quote error:', error);
            res.status(500).json({ error: 'Erro ao atualizar orçamento' });
        }
    }
    static async updateStatus(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const { status } = req.body;
            if (!['open', 'approved', 'rejected', 'converted'].includes(status)) {
                res.status(400).json({ error: 'Status inválido' });
                return;
            }
            const updated = await quote_model_1.QuoteModel.updateStatus(id, status);
            if (!updated) {
                res.status(404).json({ error: 'Orçamento não encontrado' });
                return;
            }
            res.json({ message: 'Status atualizado com sucesso' });
        }
        catch (error) {
            console.error('Update quote status error:', error);
            res.status(500).json({ error: 'Erro ao atualizar status do orçamento' });
        }
    }
    static async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const existingQuote = await quote_model_1.QuoteModel.findById(id);
            if (!existingQuote) {
                res.status(404).json({ error: 'Orçamento não encontrado' });
                return;
            }
            // Não permitir excluir orçamento convertido
            if (existingQuote.status === 'converted') {
                res.status(400).json({ error: 'Não é possível excluir orçamento convertido' });
                return;
            }
            const deleted = await quote_model_1.QuoteModel.delete(id);
            if (!deleted) {
                res.status(404).json({ error: 'Orçamento não encontrado' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Delete quote error:', error);
            res.status(500).json({ error: 'Erro ao deletar orçamento' });
        }
    }
    static async convertToOrder(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const quote = await quote_model_1.QuoteModel.findById(id);
            if (!quote) {
                res.status(404).json({ error: 'Orçamento não encontrado' });
                return;
            }
            if (quote.status === 'converted') {
                res.status(400).json({ error: 'Orçamento já foi convertido' });
                return;
            }
            if (!quote.items || quote.items.length === 0) {
                res.status(400).json({ error: 'Orçamento não possui itens' });
                return;
            }
            const { mechanic_id } = req.body;
            // Gerar número da ordem
            const orderNumber = await order_model_1.OrderModel.generateOrderNumber();
            // Criar ordem de serviço baseada no orçamento
            const orderData = {
                quote_id: quote.id,
                client_id: quote.client_id,
                vehicle_id: quote.vehicle_id,
                mechanic_id: mechanic_id || undefined,
                order_number: orderNumber,
                status: 'open',
                subtotal: quote.subtotal,
                discount: quote.discount,
                total: quote.total,
                technical_notes: quote.notes || undefined,
            };
            const order = await order_model_1.OrderModel.create(orderData);
            // Adicionar itens da ordem
            for (const item of quote.items) {
                await order_model_1.OrderModel.addItem({
                    order_id: order.id,
                    product_id: item.product_id || null,
                    labor_id: item.labor_id || null,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    total_price: item.total_price,
                    item_type: item.item_type,
                });
            }
            // Buscar ordem completa com itens
            const fullOrder = await order_model_1.OrderModel.findById(order.id);
            const orderItems = await order_model_1.OrderModel.getItems(order.id);
            // Atualizar status do orçamento para 'converted'
            await quote_model_1.QuoteModel.updateStatus(id, 'converted');
            res.status(201).json({ order: { ...fullOrder, items: orderItems }, message: 'Orçamento convertido em ordem de serviço com sucesso' });
        }
        catch (error) {
            console.error('Convert quote to order error:', error);
            res.status(500).json({ error: 'Erro ao converter orçamento em ordem de serviço' });
        }
    }
    static async addItem(req, res) {
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
            const quote = await quote_model_1.QuoteModel.findById(id);
            if (!quote) {
                res.status(404).json({ error: 'Orçamento não encontrado' });
                return;
            }
            if (quote.status === 'converted') {
                res.status(400).json({ error: 'Não é possível adicionar item a orçamento convertido' });
                return;
            }
            const { product_id, labor_id, description, quantity, unit_price, item_type } = req.body;
            if (item_type === 'product' && !product_id) {
                res.status(400).json({ error: 'product_id é obrigatório para item do tipo product' });
                return;
            }
            if (item_type === 'labor' && !labor_id) {
                res.status(400).json({ error: 'labor_id é obrigatório para item do tipo labor' });
                return;
            }
            const total_price = quantity * unit_price;
            const item = await quote_model_1.QuoteModel.addItem(id, {
                product_id: product_id || null,
                labor_id: labor_id || null,
                description,
                quantity,
                unit_price,
                total_price,
                item_type,
            });
            const updatedQuote = await quote_model_1.QuoteModel.findById(id);
            res.json({ item, quote: updatedQuote });
        }
        catch (error) {
            console.error('Add quote item error:', error);
            res.status(500).json({ error: 'Erro ao adicionar item ao orçamento' });
        }
    }
    static async removeItem(req, res) {
        try {
            const id = parseInt(req.params.id);
            const itemId = parseInt(req.params.itemId);
            if (isNaN(id) || isNaN(itemId)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const quote = await quote_model_1.QuoteModel.findById(id);
            if (!quote) {
                res.status(404).json({ error: 'Orçamento não encontrado' });
                return;
            }
            if (quote.status === 'converted') {
                res.status(400).json({ error: 'Não é possível remover item de orçamento convertido' });
                return;
            }
            const removed = await quote_model_1.QuoteModel.removeItem(itemId, id);
            if (!removed) {
                res.status(404).json({ error: 'Item não encontrado' });
                return;
            }
            const updatedQuote = await quote_model_1.QuoteModel.findById(id);
            res.json({ quote: updatedQuote, message: 'Item removido com sucesso' });
        }
        catch (error) {
            console.error('Remove quote item error:', error);
            res.status(500).json({ error: 'Erro ao remover item do orçamento' });
        }
    }
}
exports.QuoteController = QuoteController;
// Validações
exports.createQuoteValidation = [
    (0, express_validator_1.body)('client_id').isInt().withMessage('ID do cliente é obrigatório'),
    (0, express_validator_1.body)('vehicle_id').isInt().withMessage('ID do veículo é obrigatório'),
    (0, express_validator_1.body)('items').isArray({ min: 1 }).withMessage('Orçamento deve ter pelo menos um item'),
    (0, express_validator_1.body)('items.*.description').notEmpty().withMessage('Descrição do item é obrigatória'),
    (0, express_validator_1.body)('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantidade deve ser maior que zero'),
    (0, express_validator_1.body)('items.*.unit_price').isFloat({ min: 0 }).withMessage('Preço unitário deve ser maior ou igual a zero'),
    (0, express_validator_1.body)('items.*.item_type').isIn(['product', 'labor']).withMessage('Tipo de item inválido'),
    (0, express_validator_1.body)('items.*.product_id').if((0, express_validator_1.body)('items.*.item_type').equals('product')).notEmpty().withMessage('product_id é obrigatório para produto'),
    (0, express_validator_1.body)('items.*.labor_id').if((0, express_validator_1.body)('items.*.item_type').equals('labor')).notEmpty().withMessage('labor_id é obrigatório para serviço'),
    (0, express_validator_1.body)('discount').optional().isFloat({ min: 0 }).withMessage('Desconto deve ser maior ou igual a zero'),
    (0, express_validator_1.body)('status').optional().isIn(['open', 'approved', 'rejected']).withMessage('Status inválido'),
];
exports.updateQuoteValidation = [
    (0, express_validator_1.body)('status').optional().isIn(['open', 'approved', 'rejected']).withMessage('Status inválido'),
    (0, express_validator_1.body)('discount').optional().isFloat({ min: 0 }).withMessage('Desconto deve ser maior ou igual a zero'),
    (0, express_validator_1.body)('items').optional().isArray().withMessage('Items deve ser um array'),
];
exports.addItemValidation = [
    (0, express_validator_1.body)('description').notEmpty().withMessage('Descrição é obrigatória'),
    (0, express_validator_1.body)('quantity').isFloat({ min: 0.01 }).withMessage('Quantidade deve ser maior que zero'),
    (0, express_validator_1.body)('unit_price').isFloat({ min: 0 }).withMessage('Preço unitário deve ser maior ou igual a zero'),
    (0, express_validator_1.body)('item_type').isIn(['product', 'labor']).withMessage('Tipo de item inválido'),
    (0, express_validator_1.body)('product_id').if((0, express_validator_1.body)('item_type').equals('product')).notEmpty().withMessage('product_id é obrigatório para produto'),
    (0, express_validator_1.body)('labor_id').if((0, express_validator_1.body)('item_type').equals('labor')).notEmpty().withMessage('labor_id é obrigatório para serviço'),
];
//# sourceMappingURL=quote.controller.js.map