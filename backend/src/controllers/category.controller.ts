import { Request, Response } from 'express';
import pool from '../config/database';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';

export class CategoryController {
  // Categorias de Produtos
  static async listProductCategories(req: Request, res: Response): Promise<void> {
    try {
      const result = await pool.query(
        'SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != \'\' ORDER BY category'
      );
      const categories = result.rows.map((row) => row.category);
      res.json(categories);
    } catch (error) {
      console.error('List product categories error:', error);
      res.status(500).json({ error: 'Erro ao listar categorias de produtos' });
    }
  }

  static async createProductCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { name } = req.body;
      
      // Verificar se já existe
      const existing = await pool.query(
        'SELECT DISTINCT category FROM products WHERE category = $1',
        [name]
      );

      if (existing.rows.length > 0) {
        res.status(400).json({ error: 'Categoria já existe' });
        return;
      }

      res.status(201).json({ name, message: 'Categoria criada (será aplicada ao criar produtos com este nome)' });
    } catch (error) {
      console.error('Create product category error:', error);
      res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  }

  static async deleteProductCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      
      // Remover categoria de todos os produtos
      await pool.query(
        'UPDATE products SET category = NULL WHERE category = $1',
        [name]
      );

      res.status(204).send();
    } catch (error) {
      console.error('Delete product category error:', error);
      res.status(500).json({ error: 'Erro ao deletar categoria' });
    }
  }

  // Categorias de Despesas
  static async listExpenseCategories(req: Request, res: Response): Promise<void> {
    try {
      const result = await pool.query(
        'SELECT DISTINCT category FROM accounts_payable WHERE category IS NOT NULL AND category != \'\' ORDER BY category'
      );
      const categories = result.rows.map((row) => row.category);
      res.json(categories);
    } catch (error) {
      console.error('List expense categories error:', error);
      res.status(500).json({ error: 'Erro ao listar categorias de despesas' });
    }
  }

  static async createExpenseCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { name } = req.body;
      
      // Verificar se já existe
      const existing = await pool.query(
        'SELECT DISTINCT category FROM accounts_payable WHERE category = $1',
        [name]
      );

      if (existing.rows.length > 0) {
        res.status(400).json({ error: 'Categoria já existe' });
        return;
      }

      res.status(201).json({ name, message: 'Categoria criada (será aplicada ao criar contas a pagar com este nome)' });
    } catch (error) {
      console.error('Create expense category error:', error);
      res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  }

  static async deleteExpenseCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      
      // Remover categoria de todas as contas a pagar
      await pool.query(
        'UPDATE accounts_payable SET category = NULL WHERE category = $1',
        [name]
      );

      res.status(204).send();
    } catch (error) {
      console.error('Delete expense category error:', error);
      res.status(500).json({ error: 'Erro ao deletar categoria' });
    }
  }
}

// Validações
export const createCategoryValidation = [
  body('name').notEmpty().withMessage('Nome da categoria é obrigatório'),
];

