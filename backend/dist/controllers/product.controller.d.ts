import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class ProductController {
    static list(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static create(req: AuthRequest, res: Response): Promise<void>;
    static update(req: AuthRequest, res: Response): Promise<void>;
    static delete(req: AuthRequest, res: Response): Promise<void>;
    static getLowStock(req: Request, res: Response): Promise<void>;
    static getCategories(req: Request, res: Response): Promise<void>;
    static adjustStock(req: AuthRequest, res: Response): Promise<void>;
}
export declare const createProductValidation: import("express-validator").ValidationChain[];
export declare const updateProductValidation: import("express-validator").ValidationChain[];
export declare const adjustStockValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=product.controller.d.ts.map