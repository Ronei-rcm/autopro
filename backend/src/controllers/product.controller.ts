import { Request, Response } from 'express';
import { ProductModel } from '../models/product.model';
import { InventoryMovementModel } from '../models/inventory-movement.model';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';

export class ProductController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const category = req.query.category as string | undefined;
      const lowStock = req.query.low_stock === 'true';

      const products = await ProductModel.findAll(search, category, lowStock);
      res.json(products);
    } catch (error) {
      console.error('List products error:', error);
      res.status(500).json({ error: 'Erro ao listar produtos' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const product = await ProductModel.findById(id);
      if (!product) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      res.json(product);
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const product = await ProductModel.create(req.body);
      res.status(201).json(product);
    } catch (error: any) {
      console.error('Create product error:', error);
      if (error.code === '23505') {
        res.status(400).json({ error: 'Código já cadastrado' });
      } else {
        res.status(500).json({ error: 'Erro ao criar produto' });
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

      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      const product = await ProductModel.update(id, req.body);
      res.json(product);
    } catch (error: any) {
      console.error('Update product error:', error);
      if (error.code === '23505') {
        res.status(400).json({ error: 'Código já cadastrado' });
      } else {
        res.status(500).json({ error: 'Erro ao atualizar produto' });
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

      const deleted = await ProductModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ error: 'Erro ao deletar produto' });
    }
  }

  static async getLowStock(req: Request, res: Response): Promise<void> {
    try {
      const products = await ProductModel.getLowStock();
      res.json(products);
    } catch (error) {
      console.error('Get low stock error:', error);
      res.status(500).json({ error: 'Erro ao buscar produtos com estoque baixo' });
    }
  }

  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await ProductModel.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
  }

  static async adjustStock(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const id = parseInt(req.params.id);
      const { quantity, type, notes } = req.body;

      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const product = await ProductModel.findById(id);
      if (!product) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      // Criar movimentação
      await InventoryMovementModel.create({
        product_id: id,
        type: type || 'adjustment',
        quantity: Math.abs(quantity),
        notes: notes || 'Ajuste manual de estoque',
        created_by: req.userId,
      });

      // Atualizar quantidade (o trigger já faz isso, mas vamos garantir)
      const newQuantity =
        type === 'entry'
          ? product.current_quantity + Math.abs(quantity)
          : type === 'exit'
          ? product.current_quantity - Math.abs(quantity)
          : quantity;

      await ProductModel.update(id, { current_quantity: Math.max(0, newQuantity) });

      const updatedProduct = await ProductModel.findById(id);
      res.json(updatedProduct);
    } catch (error) {
      console.error('Adjust stock error:', error);
      res.status(500).json({ error: 'Erro ao ajustar estoque' });
    }
  }
}

// Validações
export const createProductValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('cost_price').isFloat({ min: 0 }).withMessage('Preço de custo deve ser positivo'),
  body('sale_price').isFloat({ min: 0 }).withMessage('Preço de venda deve ser positivo'),
  body('min_quantity').optional().isInt({ min: 0 }).withMessage('Quantidade mínima deve ser positiva'),
  body('current_quantity').optional().isInt({ min: 0 }).withMessage('Quantidade atual deve ser positiva'),
];

export const updateProductValidation = [
  body('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
  body('cost_price').optional().isFloat({ min: 0 }).withMessage('Preço de custo deve ser positivo'),
  body('sale_price').optional().isFloat({ min: 0 }).withMessage('Preço de venda deve ser positivo'),
  body('min_quantity').optional().isInt({ min: 0 }).withMessage('Quantidade mínima deve ser positiva'),
  body('current_quantity').optional().isInt({ min: 0 }).withMessage('Quantidade atual deve ser positiva'),
];

export const adjustStockValidation = [
  body('quantity').isFloat({ min: 0.01 }).withMessage('Quantidade deve ser positiva'),
  body('type').optional().isIn(['entry', 'exit', 'adjustment']).withMessage('Tipo inválido'),
];

