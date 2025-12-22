import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class FinancialController {
    static listPayables(req: Request, res: Response): Promise<void>;
    static getPayableById(req: Request, res: Response): Promise<void>;
    static createPayable(req: AuthRequest, res: Response): Promise<void>;
    static updatePayable(req: AuthRequest, res: Response): Promise<void>;
    static deletePayable(req: AuthRequest, res: Response): Promise<void>;
    static listReceivables(req: Request, res: Response): Promise<void>;
    static getReceivableById(req: Request, res: Response): Promise<void>;
    static createReceivable(req: AuthRequest, res: Response): Promise<void>;
    static updateReceivable(req: AuthRequest, res: Response): Promise<void>;
    static deleteReceivable(req: AuthRequest, res: Response): Promise<void>;
    static listCashFlow(req: Request, res: Response): Promise<void>;
    static createCashFlow(req: AuthRequest, res: Response): Promise<void>;
    static updateInstallment(req: AuthRequest, res: Response): Promise<void>;
    private static updateReceivableStatus;
    static getDashboard(req: Request, res: Response): Promise<void>;
}
export declare const createPayableValidation: import("express-validator").ValidationChain[];
export declare const createReceivableValidation: import("express-validator").ValidationChain[];
export declare const createCashFlowValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=financial.controller.d.ts.map