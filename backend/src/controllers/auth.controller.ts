import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { body, validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;

      // Buscar usuário com hash da senha
      const userWithPassword = await UserModel.findByEmailWithPassword(email);
      
      if (!userWithPassword) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }

      // Verificar se usuário está ativo
      const user = await UserModel.findById(userWithPassword.id);
      if (!user || !user.active) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }

      const passwordHash = userWithPassword.password_hash;

      const isValid = await comparePassword(password, passwordHash);

      if (!isValid) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }

      const token = generateToken({
        userId: user.id,
        profile: user.profile,
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profile: user.profile,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }

  static async register(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password, name, profile } = req.body;

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ error: 'Email já cadastrado' });
        return;
      }

      const passwordHash = await hashPassword(password);

      const user = await UserModel.create(email, passwordHash, name, profile);

      const token = generateToken({
        userId: user.id,
        profile: user.profile,
      });

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profile: user.profile,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  static async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }
      const user = await UserModel.findById(req.userId);
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }
      res.json(user);
    } catch (error) {
      console.error('Me error:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }
}

// Validações
export const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
];

export const registerValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('profile')
    .isIn(['admin', 'mechanic', 'financial', 'attendant'])
    .withMessage('Perfil inválido'),
];

