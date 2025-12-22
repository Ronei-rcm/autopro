"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentValidation = exports.createAppointmentValidation = exports.AppointmentController = void 0;
const appointment_model_1 = require("../models/appointment.model");
const express_validator_1 = require("express-validator");
class AppointmentController {
    static async list(req, res) {
        try {
            const startDate = req.query.start_date ? new Date(req.query.start_date) : undefined;
            const endDate = req.query.end_date ? new Date(req.query.end_date) : undefined;
            const status = req.query.status;
            const clientId = req.query.client_id ? parseInt(req.query.client_id) : undefined;
            const mechanicId = req.query.mechanic_id ? parseInt(req.query.mechanic_id) : undefined;
            const appointments = await appointment_model_1.AppointmentModel.findAll(startDate, endDate, status, clientId, mechanicId);
            res.json(appointments);
        }
        catch (error) {
            console.error('List appointments error:', error);
            res.status(500).json({ error: 'Erro ao listar agendamentos' });
        }
    }
    static async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const appointment = await appointment_model_1.AppointmentModel.findById(id);
            if (!appointment) {
                res.status(404).json({ error: 'Agendamento não encontrado' });
                return;
            }
            res.json(appointment);
        }
        catch (error) {
            console.error('Get appointment error:', error);
            res.status(500).json({ error: 'Erro ao buscar agendamento' });
        }
    }
    static async create(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            // Validar que end_time é depois de start_time
            const startTime = new Date(req.body.start_time);
            const endTime = new Date(req.body.end_time);
            if (endTime <= startTime) {
                res.status(400).json({ error: 'Data/hora de término deve ser posterior à data/hora de início' });
                return;
            }
            const appointment = await appointment_model_1.AppointmentModel.create(req.body);
            res.status(201).json(appointment);
        }
        catch (error) {
            console.error('Create appointment error:', error);
            if (error.code === '23505') {
                res.status(400).json({ error: 'Conflito de agendamento' });
            }
            else {
                res.status(500).json({ error: 'Erro ao criar agendamento' });
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
            const existingAppointment = await appointment_model_1.AppointmentModel.findById(id);
            if (!existingAppointment) {
                res.status(404).json({ error: 'Agendamento não encontrado' });
                return;
            }
            // Validar datas se fornecidas
            if (req.body.start_time && req.body.end_time) {
                const startTime = new Date(req.body.start_time);
                const endTime = new Date(req.body.end_time);
                if (endTime <= startTime) {
                    res.status(400).json({ error: 'Data/hora de término deve ser posterior à data/hora de início' });
                    return;
                }
            }
            const appointment = await appointment_model_1.AppointmentModel.update(id, req.body);
            res.json(appointment);
        }
        catch (error) {
            console.error('Update appointment error:', error);
            res.status(500).json({ error: 'Erro ao atualizar agendamento' });
        }
    }
    static async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const deleted = await appointment_model_1.AppointmentModel.delete(id);
            if (!deleted) {
                res.status(404).json({ error: 'Agendamento não encontrado' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Delete appointment error:', error);
            res.status(500).json({ error: 'Erro ao deletar agendamento' });
        }
    }
    static async getUpcoming(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const appointments = await appointment_model_1.AppointmentModel.getUpcoming(limit);
            res.json(appointments);
        }
        catch (error) {
            console.error('Get upcoming appointments error:', error);
            res.status(500).json({ error: 'Erro ao buscar próximos agendamentos' });
        }
    }
    static async quickAction(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { action } = req.body;
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const appointment = await appointment_model_1.AppointmentModel.findById(id);
            if (!appointment) {
                res.status(404).json({ error: 'Agendamento não encontrado' });
                return;
            }
            let newStatus = appointment.status;
            let updateData = {};
            switch (action) {
                case 'confirm':
                    newStatus = 'confirmed';
                    updateData = { status: newStatus };
                    break;
                case 'start':
                    newStatus = 'in_progress';
                    updateData = { status: newStatus };
                    break;
                case 'complete':
                    newStatus = 'completed';
                    updateData = { status: newStatus };
                    break;
                case 'cancel':
                    newStatus = 'cancelled';
                    updateData = { status: newStatus };
                    break;
                default:
                    res.status(400).json({ error: 'Ação inválida' });
                    return;
            }
            await appointment_model_1.AppointmentModel.update(id, updateData);
            const updatedAppointment = await appointment_model_1.AppointmentModel.findById(id);
            res.json(updatedAppointment);
        }
        catch (error) {
            console.error('Quick action error:', error);
            res.status(500).json({ error: 'Erro ao executar ação' });
        }
    }
}
exports.AppointmentController = AppointmentController;
// Validações
exports.createAppointmentValidation = [
    (0, express_validator_1.body)('client_id').isInt().withMessage('Cliente é obrigatório'),
    (0, express_validator_1.body)('vehicle_id').isInt().withMessage('Veículo é obrigatório'),
    (0, express_validator_1.body)('title').notEmpty().withMessage('Título é obrigatório'),
    (0, express_validator_1.body)('start_time').isISO8601().withMessage('Data/hora de início inválida'),
    (0, express_validator_1.body)('end_time').isISO8601().withMessage('Data/hora de término inválida'),
];
exports.updateAppointmentValidation = [
    (0, express_validator_1.body)('title').optional().notEmpty().withMessage('Título não pode ser vazio'),
    (0, express_validator_1.body)('start_time').optional().isISO8601().withMessage('Data/hora de início inválida'),
    (0, express_validator_1.body)('end_time').optional().isISO8601().withMessage('Data/hora de término inválida'),
];
//# sourceMappingURL=appointment.controller.js.map