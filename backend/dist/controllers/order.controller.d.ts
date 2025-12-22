import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class OrderController {
    static list(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static create(req: AuthRequest, res: Response): Promise<void>;
    static update(req: AuthRequest, res: Response): Promise<void>;
    static delete(req: AuthRequest, res: Response): Promise<void>;
    static addItem(req: AuthRequest, res: Response): Promise<void>;
    static updateItem(req: AuthRequest, res: Response): Promise<void>;
    static removeItem(req: AuthRequest, res: Response): Promise<void>;
    static updateDiscount(req: AuthRequest, res: Response): Promise<void>;
    static generateReceivable(req: AuthRequest, res: Response): Promise<void>;
    static getStatistics(req: Request, res: Response): Promise<void>;
    static quickAction(req: AuthRequest, res: Response): Promise<void>;
    static saveSignature(req: AuthRequest, res: Response): Promise<void>;
    static uploadFile(req: AuthRequest, res: Response): Promise<void>;
    static deleteFile(req: AuthRequest, res: Response): Promise<void>;
    static getFile(req: Request, res: Response): Promise<void>;
    static createWarranties(req: AuthRequest, res: Response): Promise<void>;
}
export declare const createOrderValidation: import("express-validator").ValidationChain[];
export declare const addItemValidation: import("express-validator").ValidationChain[];
export declare const updateItemValidation: import("express-validator").ValidationChain[];
export declare const saveSignatureValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=order.controller.d.ts.map