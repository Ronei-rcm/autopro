import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: number;
  profile: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload as object, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as string | number,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
};

