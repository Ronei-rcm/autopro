"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClientValidation = exports.createClientValidation = exports.ClientController = void 0;
const client_model_1 = require("../models/client.model");
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../config/database"));
class ClientController {
    static async list(req, res) {
        try {
            const search = req.query.search;
            const active = req.query.active !== undefined ? req.query.active === 'true' : undefined;
            const clients = await client_model_1.ClientModel.findAll(search, active);
            res.json(clients);
        }
        catch (error) {
            console.error('List clients error:', error);
            res.status(500).json({ error: 'Erro ao listar clientes' });
        }
    }
    static async getStatistics(req, res) {
        try {
            const clientId = parseInt(req.params.id);
            if (isNaN(clientId)) {
                res.status(400).json({ error: 'ID do cliente inválido' });
                return;
            }
            // Verificar se cliente existe
            const client = await client_model_1.ClientModel.findById(clientId);
            if (!client) {
                res.status(404).json({ error: 'Cliente não encontrado' });
                return;
            }
            // Total de OS
            const ordersResult = await database_1.default.query(`SELECT COUNT(*) as total, 
                SUM(CASE WHEN status = 'finished' THEN total ELSE 0 END) as total_spent,
                MAX(CASE WHEN status = 'finished' THEN finished_at END) as last_visit
         FROM orders 
         WHERE client_id = $1`, [clientId]);
            const ordersData = ordersResult.rows[0];
            // OS recentes (últimas 5)
            const recentOrdersResult = await database_1.default.query(`SELECT o.id, o.order_number, o.status, o.total, o.finished_at,
                v.brand, v.model, v.plate
         FROM orders o
         LEFT JOIN vehicles v ON o.vehicle_id = v.id
         WHERE o.client_id = $1
         ORDER BY o.created_at DESC
         LIMIT 5`, [clientId]);
            // Garantias ativas
            const warrantiesResult = await database_1.default.query(`SELECT COUNT(*) as active_count
         FROM warranties w
         INNER JOIN orders o ON w.order_id = o.id
         WHERE o.client_id = $1 AND w.status = 'active'`, [clientId]);
            // Contas a receber pendentes
            const receivablesResult = await database_1.default.query(`SELECT COUNT(*) as pending_count,
                SUM(amount - received_amount) as pending_amount
         FROM accounts_receivable
         WHERE client_id = $1 AND status IN ('open', 'overdue')`, [clientId]);
            // Veículos do cliente
            const vehiclesResult = await database_1.default.query(`SELECT COUNT(*) as total_vehicles
         FROM vehicles
         WHERE client_id = $1`, [clientId]);
            res.json({
                total_orders: parseInt(ordersData.total || '0'),
                total_spent: parseFloat(ordersData.total_spent || '0'),
                last_visit: ordersData.last_visit || null,
                recent_orders: recentOrdersResult.rows,
                active_warranties: parseInt(warrantiesResult.rows[0]?.active_count || '0'),
                pending_receivables: {
                    count: parseInt(receivablesResult.rows[0]?.pending_count || '0'),
                    amount: parseFloat(receivablesResult.rows[0]?.pending_amount || '0'),
                },
                total_vehicles: parseInt(vehiclesResult.rows[0]?.total_vehicles || '0'),
            });
        }
        catch (error) {
            console.error('Get client statistics error:', error);
            res.status(500).json({ error: 'Erro ao buscar estatísticas do cliente' });
        }
    }
    static async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const client = await client_model_1.ClientModel.findById(id);
            if (!client) {
                res.status(404).json({ error: 'Cliente não encontrado' });
                return;
            }
            res.json(client);
        }
        catch (error) {
            console.error('Get client error:', error);
            res.status(500).json({ error: 'Erro ao buscar cliente' });
        }
    }
    static async create(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const client = await client_model_1.ClientModel.create(req.body);
            res.status(201).json(client);
        }
        catch (error) {
            console.error('Create client error:', error);
            if (error.code === '23505') {
                // Unique constraint violation
                res.status(400).json({ error: 'CPF ou CNPJ já cadastrado' });
            }
            else {
                res.status(500).json({ error: 'Erro ao criar cliente' });
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
            const existingClient = await client_model_1.ClientModel.findById(id);
            if (!existingClient) {
                res.status(404).json({ error: 'Cliente não encontrado' });
                return;
            }
            const client = await client_model_1.ClientModel.update(id, req.body);
            res.json(client);
        }
        catch (error) {
            console.error('Update client error:', error);
            if (error.code === '23505') {
                res.status(400).json({ error: 'CPF ou CNPJ já cadastrado' });
            }
            else {
                res.status(500).json({ error: 'Erro ao atualizar cliente' });
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
            const deleted = await client_model_1.ClientModel.delete(id);
            if (!deleted) {
                res.status(404).json({ error: 'Cliente não encontrado' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Delete client error:', error);
            res.status(500).json({ error: 'Erro ao deletar cliente' });
        }
    }
    static async count(req, res) {
        try {
            const count = await client_model_1.ClientModel.count();
            res.json({ count });
        }
        catch (error) {
            console.error('Count clients error:', error);
            res.status(500).json({ error: 'Erro ao contar clientes' });
        }
    }
}
exports.ClientController = ClientController;
// Validações
exports.createClientValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Nome é obrigatório'),
    (0, express_validator_1.body)('type').isIn(['PF', 'PJ']).withMessage('Tipo deve ser PF ou PJ'),
    (0, express_validator_1.body)('cpf')
        .if((0, express_validator_1.body)('type').equals('PF'))
        .notEmpty()
        .withMessage('CPF é obrigatório para pessoa física'),
    (0, express_validator_1.body)('cnpj')
        .if((0, express_validator_1.body)('type').equals('PJ'))
        .notEmpty()
        .withMessage('CNPJ é obrigatório para pessoa jurídica'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Email inválido'),
];
exports.updateClientValidation = [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
    (0, express_validator_1.body)('type').optional().isIn(['PF', 'PJ']).withMessage('Tipo deve ser PF ou PJ'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Email inválido'),
];
//# sourceMappingURL=client.controller.js.map