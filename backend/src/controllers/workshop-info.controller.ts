import { Request, Response } from 'express';
import { WorkshopInfoModel } from '../models/workshop-info.model';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';

export class WorkshopInfoController {
  static async get(req: Request, res: Response): Promise<void> {
    try {
      const info = await WorkshopInfoModel.find();
      if (!info) {
        // Criar registro padrão se não existir
        try {
          const defaultInfo = await WorkshopInfoModel.create({
            name: 'Oficina Mecânica',
            footer_text: 'Este documento foi gerado automaticamente pelo sistema de gestão.',
          });
          res.json(defaultInfo);
          return;
        } catch (createError: any) {
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
    } catch (error: any) {
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

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
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

      const updated = await WorkshopInfoModel.update(req.body);
      res.json(updated);
    } catch (error: any) {
      console.error('Update workshop info error:', error);
      res.status(500).json({ 
        error: 'Erro ao atualizar informações da oficina',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

// Validações
export const updateWorkshopInfoValidation = [
  body('name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Nome deve ter entre 1 e 255 caracteres'),
  body('trade_name').optional().trim().isLength({ max: 255 }).withMessage('Nome fantasia deve ter no máximo 255 caracteres'),
  body('cnpj').optional().custom((value) => {
    if (!value || value === '' || value === null) return true; // Opcional
    const cleanCNPJ = String(value).replace(/[^\d]/g, '');
    return cleanCNPJ.length === 14;
  }).withMessage('CNPJ inválido (deve ter 14 dígitos)'),
  body('email').optional().trim().custom((value) => {
    if (!value || value === '' || value === null) return true; // Opcional
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }).withMessage('Email inválido'),
  body('website').optional().trim().custom((value) => {
    if (!value || value === '' || value === null) return true; // Opcional
    try {
      // Aceitar URLs com ou sem protocolo
      const url = value.startsWith('http://') || value.startsWith('https://') 
        ? value 
        : `https://${value}`;
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }).withMessage('Website inválido (ex: www.exemplo.com ou https://www.exemplo.com)'),
  body('address_state').optional().trim().custom((value) => {
    if (!value || value === '' || value === null) return true; // Opcional
    return value.length === 2;
  }).withMessage('Estado deve ter exatamente 2 caracteres (UF)'),
  body('address_zipcode').optional().trim().custom((value) => {
    if (!value || value === '' || value === null) return true; // Opcional
    const cleanCEP = String(value).replace(/[^\d]/g, '');
    return cleanCEP.length === 8;
  }).withMessage('CEP inválido (deve ter 8 dígitos)'),
  body('phone').optional().trim(),
  body('state_registration').optional().trim(),
  body('municipal_registration').optional().trim(),
  body('address_street').optional().trim(),
  body('address_number').optional().trim(),
  body('address_complement').optional().trim(),
  body('address_neighborhood').optional().trim(),
  body('address_city').optional().trim(),
  body('logo_base64').optional(),
  body('notes').optional().trim(),
  body('terms_and_conditions').optional().trim(),
  body('footer_text').optional().trim(),
];
