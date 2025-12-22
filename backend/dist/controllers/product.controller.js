"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustStockValidation = exports.updateProductValidation = exports.createProductValidation = exports.ProductController = void 0;
const product_model_1 = require("../models/product.model");
const inventory_movement_model_1 = require("../models/inventory-movement.model");
const express_validator_1 = require("express-validator");
class ProductController {
    static async list(req, res) {
        try {
            const search = req.query.search;
            const category = req.query.category;
            const lowStock = req.query.low_stock === 'true';
            const products = await product_model_1.ProductModel.findAll(search, category, lowStock);
            res.json(products);
        }
        catch (error) {
            console.error('List products error:', error);
            res.status(500).json({ error: 'Erro ao listar produtos' });
        }
    }
    static async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const product = await product_model_1.ProductModel.findById(id);
            if (!product) {
                res.status(404).json({ error: 'Produto não encontrado' });
                return;
            }
            res.json(product);
        }
        catch (error) {
            console.error('Get product error:', error);
            res.status(500).json({ error: 'Erro ao buscar produto' });
        }
    }
    static async create(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const product = await product_model_1.ProductModel.create(req.body);
            res.status(201).json(product);
        }
        catch (error) {
            console.error('Create product error:', error);
            if (error.code === '23505') {
                res.status(400).json({ error: 'Código já cadastrado' });
            }
            else {
                res.status(500).json({ error: 'Erro ao criar produto' });
            }
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
            const existingProduct = await product_model_1.ProductModel.findById(id);
            if (!existingProduct) {
                res.status(404).json({ error: 'Produto não encontrado' });
                return;
            }
            const product = await product_model_1.ProductModel.update(id, req.body);
            res.json(product);
        }
        catch (error) {
            console.error('Update product error:', error);
            if (error.code === '23505') {
                res.status(400).json({ error: 'Código já cadastrado' });
            }
            else {
                res.status(500).json({ error: 'Erro ao atualizar produto' });
            }
        }
    }
    static async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const deleted = await product_model_1.ProductModel.delete(id);
            if (!deleted) {
                res.status(404).json({ error: 'Produto não encontrado' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Delete product error:', error);
            res.status(500).json({ error: 'Erro ao deletar produto' });
        }
    }
    static async getLowStock(req, res) {
        try {
            const products = await product_model_1.ProductModel.getLowStock();
            res.json(products);
        }
        catch (error) {
            console.error('Get low stock error:', error);
            res.status(500).json({ error: 'Erro ao buscar produtos com estoque baixo' });
        }
    }
    static async getCategories(req, res) {
        try {
            const categories = await product_model_1.ProductModel.getCategories();
            res.json(categories);
        }
        catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({ error: 'Erro ao buscar categorias' });
        }
    }
    static async adjustStock(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const id = parseInt(req.params.id);
            const { quantity, type, notes } = req.body;
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const product = await product_model_1.ProductModel.findById(id);
            if (!product) {
                res.status(404).json({ error: 'Produto não encontrado' });
                return;
            }
            // Criar movimentação
            await inventory_movement_model_1.InventoryMovementModel.create({
                product_id: id,
                type: type || 'adjustment',
                quantity: Math.abs(quantity),
                notes: notes || 'Ajuste manual de estoque',
                created_by: req.userId,
            });
            // Atualizar quantidade (o trigger já faz isso, mas vamos garantir)
            const newQuantity = type === 'entry'
                ? product.current_quantity + Math.abs(quantity)
                : type === 'exit'
                    ? product.current_quantity - Math.abs(quantity)
                    : quantity;
            await product_model_1.ProductModel.update(id, { current_quantity: Math.max(0, newQuantity) });
            const updatedProduct = await product_model_1.ProductModel.findById(id);
            res.json(updatedProduct);
        }
        catch (error) {
            console.error('Adjust stock error:', error);
            res.status(500).json({ error: 'Erro ao ajustar estoque' });
        }
    }
}
exports.ProductController = ProductController;
// Validações
exports.createProductValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Nome é obrigatório'),
    (0, express_validator_1.body)('cost_price').isFloat({ min: 0 }).withMessage('Preço de custo deve ser positivo'),
    (0, express_validator_1.body)('sale_price').isFloat({ min: 0 }).withMessage('Preço de venda deve ser positivo'),
    (0, express_validator_1.body)('min_quantity').optional().isInt({ min: 0 }).withMessage('Quantidade mínima deve ser positiva'),
    (0, express_validator_1.body)('current_quantity').optional().isInt({ min: 0 }).withMessage('Quantidade atual deve ser positiva'),
];
exports.updateProductValidation = [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
    (0, express_validator_1.body)('cost_price').optional().isFloat({ min: 0 }).withMessage('Preço de custo deve ser positivo'),
    (0, express_validator_1.body)('sale_price').optional().isFloat({ min: 0 }).withMessage('Preço de venda deve ser positivo'),
    (0, express_validator_1.body)('min_quantity').optional().isInt({ min: 0 }).withMessage('Quantidade mínima deve ser positiva'),
    (0, express_validator_1.body)('current_quantity').optional().isInt({ min: 0 }).withMessage('Quantidade atual deve ser positiva'),
];
exports.adjustStockValidation = [
    (0, express_validator_1.body)('quantity').isFloat({ min: 0.01 }).withMessage('Quantidade deve ser positiva'),
    (0, express_validator_1.body)('type').optional().isIn(['entry', 'exit', 'adjustment']).withMessage('Tipo inválido'),
];
//# sourceMappingURL=product.controller.js.map