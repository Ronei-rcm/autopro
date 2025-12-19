import { Request, Response } from 'express';
import { ClientModel } from '../models/client.model';
import { body, validationResult, query } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';

export class ClientController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const active = req.query.active !== undefined ? req.query.active === 'true' : undefined;

      const clients = await ClientModel.findAll(search, active);
      res.json(clients);
    } catch (error) {
      console.error('List clients error:', error);
      res.status(500).json({ error: 'Erro ao listar clientes' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const client = await ClientModel.findById(id);
      if (!client) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }

      res.json(client);
    } catch (error) {
      console.error('Get client error:', error);
      res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const client = await ClientModel.create(req.body);
      res.status(201).json(client);
    } catch (error: any) {
      console.error('Create client error:', error);
      if (error.code === '23505') {
        // Unique constraint violation
        res.status(400).json({ error: 'CPF ou CNPJ já cadastrado' });
      } else {
        res.status(500).json({ error: 'Erro ao criar cliente' });
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

      const existingClient = await ClientModel.findById(id);
      if (!existingClient) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }

      const client = await ClientModel.update(id, req.body);
      res.json(client);
    } catch (error: any) {
      console.error('Update client error:', error);
      if (error.code === '23505') {
        res.status(400).json({ error: 'CPF ou CNPJ já cadastrado' });
      } else {
        res.status(500).json({ error: 'Erro ao atualizar cliente' });
      }
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const deleted = await ClientModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete client error:', error);
      res.status(500).json({ error: 'Erro ao deletar cliente' });
    }
  }

  static async count(req: Request, res: Response): Promise<void> {
    try {
      const count = await ClientModel.count();
      res.json({ count });
    } catch (error) {
      console.error('Count clients error:', error);
      res.status(500).json({ error: 'Erro ao contar clientes' });
    }
  }
}

// Validações
export const createClientValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('type').isIn(['PF', 'PJ']).withMessage('Tipo deve ser PF ou PJ'),
  body('cpf')
    .if(body('type').equals('PF'))
    .notEmpty()
    .withMessage('CPF é obrigatório para pessoa física'),
  body('cnpj')
    .if(body('type').equals('PJ'))
    .notEmpty()
    .withMessage('CNPJ é obrigatório para pessoa jurídica'),
  body('email').optional().isEmail().withMessage('Email inválido'),
];

export const updateClientValidation = [
  body('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
  body('type').optional().isIn(['PF', 'PJ']).withMessage('Tipo deve ser PF ou PJ'),
  body('email').optional().isEmail().withMessage('Email inválido'),
];

