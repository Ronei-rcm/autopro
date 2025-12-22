import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class OrderTemplateController {
    static list(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static create(req: AuthRequest, res: Response): Promise<void>;
    static update(req: AuthRequest, res: Response): Promise<void>;
    static delete(req: AuthRequest, res: Response): Promise<void>;
}
export declare const createOrderTemplateValidation: import("express-validator").ValidationChain[];
export declare const updateOrderTemplateValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=order-template.controller.d.ts.map