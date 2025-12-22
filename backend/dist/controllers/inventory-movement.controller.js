"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryMovementController = void 0;
const inventory_movement_model_1 = require("../models/inventory-movement.model");
class InventoryMovementController {
    static async list(req, res) {
        try {
            const productId = req.query.product_id ? parseInt(req.query.product_id) : undefined;
            const type = req.query.type;
            const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
            const movements = await inventory_movement_model_1.InventoryMovementModel.findAll(productId, type, limit);
            res.json(movements);
        }
        catch (error) {
            console.error('List movements error:', error);
            res.status(500).json({ error: 'Erro ao listar movimentações' });
        }
    }
    static async getByProduct(req, res) {
        try {
            const productId = parseInt(req.params.productId);
            if (isNaN(productId)) {
                res.status(400).json({ error: 'ID do produto inválido' });
                return;
            }
            const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
            const movements = await inventory_movement_model_1.InventoryMovementModel.findByProduct(productId, limit);
            res.json(movements);
        }
        catch (error) {
            console.error('Get movements by product error:', error);
            res.status(500).json({ error: 'Erro ao buscar movimentações do produto' });
        }
    }
}
exports.InventoryMovementController = InventoryMovementController;
//# sourceMappingURL=inventory-movement.controller.js.map