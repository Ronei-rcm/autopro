"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLaborTypeValidation = exports.createLaborTypeValidation = exports.LaborTypeController = void 0;
const labor_type_model_1 = require("../models/labor-type.model");
const express_validator_1 = require("express-validator");
class LaborTypeController {
    static async list(req, res) {
        try {
            const active = req.query.active !== undefined ? req.query.active === 'true' : undefined;
            const laborTypes = await labor_type_model_1.LaborTypeModel.findAll(active);
            res.json(laborTypes);
        }
        catch (error) {
            console.error('List labor types error:', error);
            res.status(500).json({ error: 'Erro ao listar tipos de mão de obra' });
        }
    }
    static async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const laborType = await labor_type_model_1.LaborTypeModel.findById(id);
            if (!laborType) {
                res.status(404).json({ error: 'Tipo de mão de obra não encontrado' });
                return;
            }
            res.json(laborType);
        }
        catch (error) {
            console.error('Get labor type error:', error);
            res.status(500).json({ error: 'Erro ao buscar tipo de mão de obra' });
        }
    }
    static async create(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const laborType = await labor_type_model_1.LaborTypeModel.create(req.body);
            res.status(201).json(laborType);
        }
        catch (error) {
            console.error('Create labor type error:', error);
            res.status(500).json({ error: 'Erro ao criar tipo de mão de obra' });
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
            const existingLaborType = await labor_type_model_1.LaborTypeModel.findById(id);
            if (!existingLaborType) {
                res.status(404).json({ error: 'Tipo de mão de obra não encontrado' });
                return;
            }
            const laborType = await labor_type_model_1.LaborTypeModel.update(id, req.body);
            res.json(laborType);
        }
        catch (error) {
            console.error('Update labor type error:', error);
            res.status(500).json({ error: 'Erro ao atualizar tipo de mão de obra' });
        }
    }
    static async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const deleted = await labor_type_model_1.LaborTypeModel.delete(id);
            if (!deleted) {
                res.status(404).json({ error: 'Tipo de mão de obra não encontrado' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Delete labor type error:', error);
            res.status(500).json({ error: 'Erro ao deletar tipo de mão de obra' });
        }
    }
}
exports.LaborTypeController = LaborTypeController;
// Validações
exports.createLaborTypeValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Nome é obrigatório'),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }).withMessage('Preço deve ser positivo'),
    (0, express_validator_1.body)('estimated_hours').optional().isFloat({ min: 0 }).withMessage('Horas estimadas devem ser positivas'),
];
exports.updateLaborTypeValidation = [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
    (0, express_validator_1.body)('price').optional().isFloat({ min: 0 }).withMessage('Preço deve ser positivo'),
    (0, express_validator_1.body)('estimated_hours').optional().isFloat({ min: 0 }).withMessage('Horas estimadas devem ser positivas'),
];
//# sourceMappingURL=labor-type.controller.js.map