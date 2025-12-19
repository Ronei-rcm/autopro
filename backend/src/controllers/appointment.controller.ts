import { Request, Response } from 'express';
import { AppointmentModel } from '../models/appointment.model';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';

export class AppointmentController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const startDate = req.query.start_date ? new Date(req.query.start_date as string) : undefined;
      const endDate = req.query.end_date ? new Date(req.query.end_date as string) : undefined;
      const status = req.query.status as string | undefined;
      const clientId = req.query.client_id ? parseInt(req.query.client_id as string) : undefined;
      const mechanicId = req.query.mechanic_id ? parseInt(req.query.mechanic_id as string) : undefined;

      const appointments = await AppointmentModel.findAll(
        startDate,
        endDate,
        status,
        clientId,
        mechanicId
      );
      res.json(appointments);
    } catch (error) {
      console.error('List appointments error:', error);
      res.status(500).json({ error: 'Erro ao listar agendamentos' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const appointment = await AppointmentModel.findById(id);
      if (!appointment) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }

      res.json(appointment);
    } catch (error) {
      console.error('Get appointment error:', error);
      res.status(500).json({ error: 'Erro ao buscar agendamento' });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
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

      const appointment = await AppointmentModel.create(req.body);
      res.status(201).json(appointment);
    } catch (error: any) {
      console.error('Create appointment error:', error);
      if (error.code === '23505') {
        res.status(400).json({ error: 'Conflito de agendamento' });
      } else {
        res.status(500).json({ error: 'Erro ao criar agendamento' });
      }
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const existingAppointment = await AppointmentModel.findById(id);
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

      const appointment = await AppointmentModel.update(id, req.body);
      res.json(appointment);
    } catch (error: any) {
      console.error('Update appointment error:', error);
      res.status(500).json({ error: 'Erro ao atualizar agendamento' });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const deleted = await AppointmentModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete appointment error:', error);
      res.status(500).json({ error: 'Erro ao deletar agendamento' });
    }
  }

  static async getUpcoming(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const appointments = await AppointmentModel.getUpcoming(limit);
      res.json(appointments);
    } catch (error) {
      console.error('Get upcoming appointments error:', error);
      res.status(500).json({ error: 'Erro ao buscar próximos agendamentos' });
    }
  }

  static async quickAction(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { action } = req.body;

      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const appointment = await AppointmentModel.findById(id);
      if (!appointment) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }

      let newStatus = appointment.status;
      let updateData: any = {};

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

      await AppointmentModel.update(id, updateData);
      const updatedAppointment = await AppointmentModel.findById(id);
      res.json(updatedAppointment);
    } catch (error) {
      console.error('Quick action error:', error);
      res.status(500).json({ error: 'Erro ao executar ação' });
    }
  }
}

// Validações
export const createAppointmentValidation = [
  body('client_id').isInt().withMessage('Cliente é obrigatório'),
  body('vehicle_id').isInt().withMessage('Veículo é obrigatório'),
  body('title').notEmpty().withMessage('Título é obrigatório'),
  body('start_time').isISO8601().withMessage('Data/hora de início inválida'),
  body('end_time').isISO8601().withMessage('Data/hora de término inválida'),
];

export const updateAppointmentValidation = [
  body('title').optional().notEmpty().withMessage('Título não pode ser vazio'),
  body('start_time').optional().isISO8601().withMessage('Data/hora de início inválida'),
  body('end_time').optional().isISO8601().withMessage('Data/hora de término inválida'),
];

