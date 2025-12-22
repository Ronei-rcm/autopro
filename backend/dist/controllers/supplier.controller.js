"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSupplierValidation = exports.createSupplierValidation = exports.SupplierController = void 0;
const supplier_model_1 = require("../models/supplier.model");
const express_validator_1 = require("express-validator");
class SupplierController {
    static async list(req, res) {
        try {
            const search = req.query.search;
            const active = req.query.active !== undefined ? req.query.active === 'true' : undefined;
            const suppliers = await supplier_model_1.SupplierModel.findAll(search, active);
            res.json(suppliers);
        }
        catch (error) {
            console.error('List suppliers error:', error);
            res.status(500).json({ error: 'Erro ao listar fornecedores' });
        }
    }
    static async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const supplier = await supplier_model_1.SupplierModel.findById(id);
            if (!supplier) {
                res.status(404).json({ error: 'Fornecedor não encontrado' });
                return;
            }
            res.json(supplier);
        }
        catch (error) {
            console.error('Get supplier error:', error);
            res.status(500).json({ error: 'Erro ao buscar fornecedor' });
        }
    }
    static async create(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const supplier = await supplier_model_1.SupplierModel.create(req.body);
            res.status(201).json(supplier);
        }
        catch (error) {
            console.error('Create supplier error:', error);
            if (error.code === '23505') {
                res.status(400).json({ error: 'CNPJ já cadastrado' });
            }
            else {
                res.status(500).json({ error: 'Erro ao criar fornecedor' });
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
            const existingSupplier = await supplier_model_1.SupplierModel.findById(id);
            if (!existingSupplier) {
                res.status(404).json({ error: 'Fornecedor não encontrado' });
                return;
            }
            const supplier = await supplier_model_1.SupplierModel.update(id, req.body);
            res.json(supplier);
        }
        catch (error) {
            console.error('Update supplier error:', error);
            if (error.code === '23505') {
                res.status(400).json({ error: 'CNPJ já cadastrado' });
            }
            else {
                res.status(500).json({ error: 'Erro ao atualizar fornecedor' });
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
            const deleted = await supplier_model_1.SupplierModel.delete(id);
            if (!deleted) {
                res.status(404).json({ error: 'Fornecedor não encontrado' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Delete supplier error:', error);
            res.status(500).json({ error: 'Erro ao deletar fornecedor' });
        }
    }
    static async count(req, res) {
        try {
            const count = await supplier_model_1.SupplierModel.count();
            res.json({ count });
        }
        catch (error) {
            console.error('Count suppliers error:', error);
            res.status(500).json({ error: 'Erro ao contar fornecedores' });
        }
    }
}
exports.SupplierController = SupplierController;
// Validações
exports.createSupplierValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Nome/Razão Social é obrigatório'),
    (0, express_validator_1.body)('cnpj').optional().isLength({ min: 14, max: 18 }).withMessage('CNPJ inválido'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Email inválido'),
];
exports.updateSupplierValidation = [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
    (0, express_validator_1.body)('cnpj').optional().isLength({ min: 14, max: 18 }).withMessage('CNPJ inválido'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Email inválido'),
];
//# sourceMappingURL=supplier.controller.js.map