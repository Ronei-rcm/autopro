import { Request, Response } from 'express';
import { SupplierModel } from '../models/supplier.model';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';

export class SupplierController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const active = req.query.active !== undefined ? req.query.active === 'true' : undefined;

      const suppliers = await SupplierModel.findAll(search, active);
      res.json(suppliers);
    } catch (error) {
      console.error('List suppliers error:', error);
      res.status(500).json({ error: 'Erro ao listar fornecedores' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const supplier = await SupplierModel.findById(id);
      if (!supplier) {
        res.status(404).json({ error: 'Fornecedor não encontrado' });
        return;
      }

      res.json(supplier);
    } catch (error) {
      console.error('Get supplier error:', error);
      res.status(500).json({ error: 'Erro ao buscar fornecedor' });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const supplier = await SupplierModel.create(req.body);
      res.status(201).json(supplier);
    } catch (error: any) {
      console.error('Create supplier error:', error);
      if (error.code === '23505') {
        res.status(400).json({ error: 'CNPJ já cadastrado' });
      } else {
        res.status(500).json({ error: 'Erro ao criar fornecedor' });
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

      const existingSupplier = await SupplierModel.findById(id);
      if (!existingSupplier) {
        res.status(404).json({ error: 'Fornecedor não encontrado' });
        return;
      }

      const supplier = await SupplierModel.update(id, req.body);
      res.json(supplier);
    } catch (error: any) {
      console.error('Update supplier error:', error);
      if (error.code === '23505') {
        res.status(400).json({ error: 'CNPJ já cadastrado' });
      } else {
        res.status(500).json({ error: 'Erro ao atualizar fornecedor' });
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

      const deleted = await SupplierModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Fornecedor não encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete supplier error:', error);
      res.status(500).json({ error: 'Erro ao deletar fornecedor' });
    }
  }

  static async count(req: Request, res: Response): Promise<void> {
    try {
      const count = await SupplierModel.count();
      res.json({ count });
    } catch (error) {
      console.error('Count suppliers error:', error);
      res.status(500).json({ error: 'Erro ao contar fornecedores' });
    }
  }
}

// Validações
export const createSupplierValidation = [
  body('name').notEmpty().withMessage('Nome/Razão Social é obrigatório'),
  body('cnpj').optional().isLength({ min: 14, max: 18 }).withMessage('CNPJ inválido'),
  body('email').optional().isEmail().withMessage('Email inválido'),
];

export const updateSupplierValidation = [
  body('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
  body('cnpj').optional().isLength({ min: 14, max: 18 }).withMessage('CNPJ inválido'),
  body('email').optional().isEmail().withMessage('Email inválido'),
];

