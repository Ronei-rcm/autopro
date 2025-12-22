import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class LaborTypeController {
    static list(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static create(req: AuthRequest, res: Response): Promise<void>;
    static update(req: AuthRequest, res: Response): Promise<void>;
    static delete(req: AuthRequest, res: Response): Promise<void>;
}
export declare const createLaborTypeValidation: import("express-validator").ValidationChain[];
export declare const updateLaborTypeValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=labor-type.controller.d.ts.map