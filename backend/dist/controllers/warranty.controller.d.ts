import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class WarrantyController {
    static list(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static create(req: AuthRequest, res: Response): Promise<void>;
    static update(req: AuthRequest, res: Response): Promise<void>;
    static delete(req: AuthRequest, res: Response): Promise<void>;
    static getExpiring(req: Request, res: Response): Promise<void>;
    static getSummary(req: Request, res: Response): Promise<void>;
}
export declare const createWarrantyValidation: import("express-validator").ValidationChain[];
export declare const updateWarrantyValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=warranty.controller.d.ts.map