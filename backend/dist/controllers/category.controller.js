"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategoryValidation = exports.CategoryController = void 0;
const database_1 = __importDefault(require("../config/database"));
const express_validator_1 = require("express-validator");
class CategoryController {
    // Categorias de Produtos
    static async listProductCategories(req, res) {
        try {
            const result = await database_1.default.query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != \'\' ORDER BY category');
            const categories = result.rows.map((row) => row.category);
            res.json(categories);
        }
        catch (error) {
            console.error('List product categories error:', error);
            res.status(500).json({ error: 'Erro ao listar categorias de produtos' });
        }
    }
    static async createProductCategory(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const { name } = req.body;
            // Verificar se já existe
            const existing = await database_1.default.query('SELECT DISTINCT category FROM products WHERE category = $1', [name]);
            if (existing.rows.length > 0) {
                res.status(400).json({ error: 'Categoria já existe' });
                return;
            }
            res.status(201).json({ name, message: 'Categoria criada (será aplicada ao criar produtos com este nome)' });
        }
        catch (error) {
            console.error('Create product category error:', error);
            res.status(500).json({ error: 'Erro ao criar categoria' });
        }
    }
    static async deleteProductCategory(req, res) {
        try {
            const { name } = req.params;
            // Remover categoria de todos os produtos
            await database_1.default.query('UPDATE products SET category = NULL WHERE category = $1', [name]);
            res.status(204).send();
        }
        catch (error) {
            console.error('Delete product category error:', error);
            res.status(500).json({ error: 'Erro ao deletar categoria' });
        }
    }
    // Categorias de Despesas
    static async listExpenseCategories(req, res) {
        try {
            const result = await database_1.default.query('SELECT DISTINCT category FROM accounts_payable WHERE category IS NOT NULL AND category != \'\' ORDER BY category');
            const categories = result.rows.map((row) => row.category);
            res.json(categories);
        }
        catch (error) {
            console.error('List expense categories error:', error);
            res.status(500).json({ error: 'Erro ao listar categorias de despesas' });
        }
    }
    static async createExpenseCategory(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const { name } = req.body;
            // Verificar se já existe
            const existing = await database_1.default.query('SELECT DISTINCT category FROM accounts_payable WHERE category = $1', [name]);
            if (existing.rows.length > 0) {
                res.status(400).json({ error: 'Categoria já existe' });
                return;
            }
            res.status(201).json({ name, message: 'Categoria criada (será aplicada ao criar contas a pagar com este nome)' });
        }
        catch (error) {
            console.error('Create expense category error:', error);
            res.status(500).json({ error: 'Erro ao criar categoria' });
        }
    }
    static async deleteExpenseCategory(req, res) {
        try {
            const { name } = req.params;
            // Remover categoria de todas as contas a pagar
            await database_1.default.query('UPDATE accounts_payable SET category = NULL WHERE category = $1', [name]);
            res.status(204).send();
        }
        catch (error) {
            console.error('Delete expense category error:', error);
            res.status(500).json({ error: 'Erro ao deletar categoria' });
        }
    }
}
exports.CategoryController = CategoryController;
// Validações
exports.createCategoryValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Nome da categoria é obrigatório'),
];
//# sourceMappingURL=category.controller.js.map