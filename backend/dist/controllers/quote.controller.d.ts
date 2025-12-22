import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class QuoteController {
    static list(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static create(req: AuthRequest, res: Response): Promise<void>;
    static update(req: AuthRequest, res: Response): Promise<void>;
    static updateStatus(req: AuthRequest, res: Response): Promise<void>;
    static delete(req: AuthRequest, res: Response): Promise<void>;
    static convertToOrder(req: AuthRequest, res: Response): Promise<void>;
    static addItem(req: AuthRequest, res: Response): Promise<void>;
    static removeItem(req: AuthRequest, res: Response): Promise<void>;
}
export declare const createQuoteValidation: import("express-validator").ValidationChain[];
export declare const updateQuoteValidation: import("express-validator").ValidationChain[];
export declare const addItemValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=quote.controller.d.ts.map