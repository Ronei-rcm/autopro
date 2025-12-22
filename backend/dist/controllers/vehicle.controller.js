"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVehicleValidation = exports.createVehicleValidation = exports.VehicleController = void 0;
const vehicle_model_1 = require("../models/vehicle.model");
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../config/database"));
class VehicleController {
    static async list(req, res) {
        try {
            const clientId = req.query.client_id ? parseInt(req.query.client_id) : undefined;
            const search = req.query.search;
            const vehicles = await vehicle_model_1.VehicleModel.findAll(clientId, search);
            res.json(vehicles);
        }
        catch (error) {
            console.error('List vehicles error:', error);
            res.status(500).json({ error: 'Erro ao listar veículos' });
        }
    }
    static async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const vehicle = await vehicle_model_1.VehicleModel.findById(id);
            if (!vehicle) {
                res.status(404).json({ error: 'Veículo não encontrado' });
                return;
            }
            res.json(vehicle);
        }
        catch (error) {
            console.error('Get vehicle error:', error);
            res.status(500).json({ error: 'Erro ao buscar veículo' });
        }
    }
    static async create(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const vehicle = await vehicle_model_1.VehicleModel.create(req.body);
            res.status(201).json(vehicle);
        }
        catch (error) {
            console.error('Create vehicle error:', error);
            if (error.code === '23505') {
                res.status(400).json({ error: 'Placa ou chassi já cadastrado' });
            }
            else if (error.code === '23503') {
                res.status(400).json({ error: 'Cliente não encontrado' });
            }
            else {
                res.status(500).json({ error: 'Erro ao criar veículo' });
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
            const existingVehicle = await vehicle_model_1.VehicleModel.findById(id);
            if (!existingVehicle) {
                res.status(404).json({ error: 'Veículo não encontrado' });
                return;
            }
            const vehicle = await vehicle_model_1.VehicleModel.update(id, req.body);
            res.json(vehicle);
        }
        catch (error) {
            console.error('Update vehicle error:', error);
            if (error.code === '23505') {
                res.status(400).json({ error: 'Placa ou chassi já cadastrado' });
            }
            else {
                res.status(500).json({ error: 'Erro ao atualizar veículo' });
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
            const deleted = await vehicle_model_1.VehicleModel.delete(id);
            if (!deleted) {
                res.status(404).json({ error: 'Veículo não encontrado' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Delete vehicle error:', error);
            res.status(500).json({ error: 'Erro ao deletar veículo' });
        }
    }
    static async getByClient(req, res) {
        try {
            const clientId = parseInt(req.params.clientId);
            if (isNaN(clientId)) {
                res.status(400).json({ error: 'ID do cliente inválido' });
                return;
            }
            const vehicles = await vehicle_model_1.VehicleModel.findByClient(clientId);
            res.json(vehicles);
        }
        catch (error) {
            console.error('Get vehicles by client error:', error);
            res.status(500).json({ error: 'Erro ao buscar veículos do cliente' });
        }
    }
    static async getHistory(req, res) {
        try {
            const vehicleId = parseInt(req.params.id);
            if (isNaN(vehicleId)) {
                res.status(400).json({ error: 'ID do veículo inválido' });
                return;
            }
            // Verificar se veículo existe
            const vehicle = await vehicle_model_1.VehicleModel.findById(vehicleId);
            if (!vehicle) {
                res.status(404).json({ error: 'Veículo não encontrado' });
                return;
            }
            // Todas as OS do veículo
            const ordersResult = await database_1.default.query(`SELECT o.id, o.order_number, o.status, o.total, o.subtotal, o.discount,
                o.started_at, o.finished_at, o.created_at,
                c.name as client_name,
                u.name as mechanic_name
         FROM orders o
         LEFT JOIN clients c ON o.client_id = c.id
         LEFT JOIN users u ON o.mechanic_id = u.id
         WHERE o.vehicle_id = $1
         ORDER BY o.created_at DESC`, [vehicleId]);
            // Itens das OS (produtos e serviços)
            const orders = ordersResult.rows;
            const ordersWithItems = await Promise.all(orders.map(async (order) => {
                const itemsResult = await database_1.default.query(`SELECT oi.id, oi.description, oi.quantity, oi.unit_price, oi.total_price,
                    oi.item_type, oi.product_id, oi.labor_id,
                    p.name as product_name, p.code as product_code,
                    lt.name as labor_name
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
             LEFT JOIN labor_types lt ON oi.labor_id = lt.id
             WHERE oi.order_id = $1
             ORDER BY oi.id`, [order.id]);
                return {
                    ...order,
                    items: itemsResult.rows,
                };
            }));
            // Garantias do veículo
            const warrantiesResult = await database_1.default.query(`SELECT w.id, w.description, w.start_date, w.end_date, w.status,
                w.warranty_period_days,
                o.order_number
         FROM warranties w
         INNER JOIN orders o ON w.order_id = o.id
         WHERE o.vehicle_id = $1
         ORDER BY w.start_date DESC`, [vehicleId]);
            // Estatísticas
            const statsResult = await database_1.default.query(`SELECT 
          COUNT(*) as total_orders,
          SUM(CASE WHEN status = 'finished' THEN total ELSE 0 END) as total_spent,
          MAX(CASE WHEN status = 'finished' THEN finished_at END) as last_service,
          MIN(created_at) as first_service
         FROM orders
         WHERE vehicle_id = $1`, [vehicleId]);
            const stats = statsResult.rows[0];
            res.json({
                vehicle: {
                    id: vehicle.id,
                    brand: vehicle.brand,
                    model: vehicle.model,
                    year: vehicle.year,
                    plate: vehicle.plate,
                    current_mileage: vehicle.mileage,
                },
                statistics: {
                    total_orders: parseInt(stats.total_orders || '0'),
                    total_spent: parseFloat(stats.total_spent || '0'),
                    last_service: stats.last_service || null,
                    first_service: stats.first_service || null,
                },
                orders: ordersWithItems,
                warranties: warrantiesResult.rows,
            });
        }
        catch (error) {
            console.error('Get vehicle history error:', error);
            res.status(500).json({ error: 'Erro ao buscar histórico do veículo' });
        }
    }
}
exports.VehicleController = VehicleController;
// Validações
exports.createVehicleValidation = [
    (0, express_validator_1.body)('client_id').isInt().withMessage('ID do cliente é obrigatório'),
    (0, express_validator_1.body)('brand').notEmpty().withMessage('Marca é obrigatória'),
    (0, express_validator_1.body)('model').notEmpty().withMessage('Modelo é obrigatório'),
    (0, express_validator_1.body)('year').optional().isInt({ min: 1900, max: 2100 }).withMessage('Ano inválido'),
    (0, express_validator_1.body)('mileage').optional().isInt({ min: 0 }).withMessage('Quilometragem deve ser positiva'),
];
exports.updateVehicleValidation = [
    (0, express_validator_1.body)('brand').optional().notEmpty().withMessage('Marca não pode ser vazia'),
    (0, express_validator_1.body)('model').optional().notEmpty().withMessage('Modelo não pode ser vazio'),
    (0, express_validator_1.body)('year').optional().isInt({ min: 1900, max: 2100 }).withMessage('Ano inválido'),
    (0, express_validator_1.body)('mileage').optional().isInt({ min: 0 }).withMessage('Quilometragem deve ser positiva'),
];
//# sourceMappingURL=vehicle.controller.js.map