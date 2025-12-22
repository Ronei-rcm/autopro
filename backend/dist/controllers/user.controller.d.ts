import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class UserController {
    static getAll(req: AuthRequest, res: Response): Promise<void>;
    static getById(req: AuthRequest, res: Response): Promise<void>;
    static create(req: AuthRequest, res: Response): Promise<void>;
    static update(req: AuthRequest, res: Response): Promise<void>;
    static delete(req: AuthRequest, res: Response): Promise<void>;
}
export declare const createUserValidation: import("express-validator").ValidationChain[];
export declare const updateUserValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=user.controller.d.ts.map