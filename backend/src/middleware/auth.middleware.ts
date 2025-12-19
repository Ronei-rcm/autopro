import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  userId?: number;
  userProfile?: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const decoded = jwt.verify(token, env.jwtSecret) as {
      userId: number;
      profile: string;
    };

    req.userId = decoded.userId;
    req.userProfile = decoded.profile;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

export const authorize = (...allowedProfiles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userProfile) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    if (!allowedProfiles.includes(req.userProfile)) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    next();
  };
};

