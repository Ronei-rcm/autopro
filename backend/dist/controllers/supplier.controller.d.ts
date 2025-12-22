import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class SupplierController {
    static list(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static create(req: AuthRequest, res: Response): Promise<void>;
    static update(req: AuthRequest, res: Response): Promise<void>;
    static delete(req: AuthRequest, res: Response): Promise<void>;
    static count(req: Request, res: Response): Promise<void>;
}
export declare const createSupplierValidation: import("express-validator").ValidationChain[];
export declare const updateSupplierValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=supplier.controller.d.ts.map