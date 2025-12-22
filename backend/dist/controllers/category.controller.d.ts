import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class CategoryController {
    static listProductCategories(req: Request, res: Response): Promise<void>;
    static createProductCategory(req: AuthRequest, res: Response): Promise<void>;
    static deleteProductCategory(req: AuthRequest, res: Response): Promise<void>;
    static listExpenseCategories(req: Request, res: Response): Promise<void>;
    static createExpenseCategory(req: AuthRequest, res: Response): Promise<void>;
    static deleteExpenseCategory(req: AuthRequest, res: Response): Promise<void>;
}
export declare const createCategoryValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=category.controller.d.ts.map