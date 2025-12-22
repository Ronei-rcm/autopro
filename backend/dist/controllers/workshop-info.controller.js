"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkshopInfoValidation = exports.WorkshopInfoController = void 0;
const workshop_info_model_1 = require("../models/workshop-info.model");
const express_validator_1 = require("express-validator");
class WorkshopInfoController {
    static async get(req, res) {
        try {
            const info = await workshop_info_model_1.WorkshopInfoModel.find();
            if (!info) {
                // Criar registro padrão se não existir
                try {
                    const defaultInfo = await workshop_info_model_1.WorkshopInfoModel.create({
                        name: 'Oficina Mecânica',
                        footer_text: 'Este documento foi gerado automaticamente pelo sistema de gestão.',
                    });
                    res.json(defaultInfo);
                    return;
                }
                catch (createError) {
                    console.error('Create workshop info error:', createError);
                    // Se falhar ao criar, pode ser que a tabela não exista
                    if (createError.code === '42P01' || createError.message?.includes('does not exist')) {
                        res.status(500).json({
                            error: 'Tabela workshop_info não existe. Execute a migration 008_add_workshop_info.sql',
                            details: createError.message
                        });
                        return;
                    }
                    throw createError;
                }
            }
            res.json(info);
        }
        catch (error) {
            console.error('Get workshop info error:', error);
            // Verificar se é erro de tabela não encontrada
            if (error.code === '42P01' || error.message?.includes('does not exist')) {
                res.status(500).json({
                    error: 'Tabela workshop_info não existe. Execute a migration 008_add_workshop_info.sql',
                    details: error.message
                });
                return;
            }
            res.status(500).json({
                error: 'Erro ao buscar informações da oficina',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    static async update(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map(err => ({
                    field: err.type === 'field' ? err.path : 'unknown',
                    message: err.msg
                }));
                res.status(400).json({
                    error: 'Erro de validação',
                    errors: errorMessages,
                    details: errors.array()
                });
                return;
            }
            const updated = await workshop_info_model_1.WorkshopInfoModel.update(req.body);
            res.json(updated);
        }
        catch (error) {
            console.error('Update workshop info error:', error);
            res.status(500).json({
                error: 'Erro ao atualizar informações da oficina',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}
exports.WorkshopInfoController = WorkshopInfoController;
// Validações
exports.updateWorkshopInfoValidation = [
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Nome deve ter entre 1 e 255 caracteres'),
    (0, express_validator_1.body)('trade_name').optional().trim().isLength({ max: 255 }).withMessage('Nome fantasia deve ter no máximo 255 caracteres'),
    (0, express_validator_1.body)('cnpj').optional().custom((value) => {
        if (!value || value === '' || value === null)
            return true; // Opcional
        const cleanCNPJ = String(value).replace(/[^\d]/g, '');
        return cleanCNPJ.length === 14;
    }).withMessage('CNPJ inválido (deve ter 14 dígitos)'),
    (0, express_validator_1.body)('email').optional().trim().custom((value) => {
        if (!value || value === '' || value === null)
            return true; // Opcional
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }).withMessage('Email inválido'),
    (0, express_validator_1.body)('website').optional().trim().custom((value) => {
        if (!value || value === '' || value === null)
            return true; // Opcional
        try {
            // Aceitar URLs com ou sem protocolo
            const url = value.startsWith('http://') || value.startsWith('https://')
                ? value
                : `https://${value}`;
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }).withMessage('Website inválido (ex: www.exemplo.com ou https://www.exemplo.com)'),
    (0, express_validator_1.body)('address_state').optional().trim().custom((value) => {
        if (!value || value === '' || value === null)
            return true; // Opcional
        return value.length === 2;
    }).withMessage('Estado deve ter exatamente 2 caracteres (UF)'),
    (0, express_validator_1.body)('address_zipcode').optional().trim().custom((value) => {
        if (!value || value === '' || value === null)
            return true; // Opcional
        const cleanCEP = String(value).replace(/[^\d]/g, '');
        return cleanCEP.length === 8;
    }).withMessage('CEP inválido (deve ter 8 dígitos)'),
    (0, express_validator_1.body)('phone').optional().trim(),
    (0, express_validator_1.body)('state_registration').optional().trim(),
    (0, express_validator_1.body)('municipal_registration').optional().trim(),
    (0, express_validator_1.body)('address_street').optional().trim(),
    (0, express_validator_1.body)('address_number').optional().trim(),
    (0, express_validator_1.body)('address_complement').optional().trim(),
    (0, express_validator_1.body)('address_neighborhood').optional().trim(),
    (0, express_validator_1.body)('address_city').optional().trim(),
    (0, express_validator_1.body)('logo_base64').optional(),
    (0, express_validator_1.body)('notes').optional().trim(),
    (0, express_validator_1.body)('terms_and_conditions').optional().trim(),
    (0, express_validator_1.body)('footer_text').optional().trim(),
];
//# sourceMappingURL=workshop-info.controller.js.map