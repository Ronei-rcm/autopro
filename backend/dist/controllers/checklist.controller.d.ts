import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class ChecklistController {
    static list(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static create(req: AuthRequest, res: Response): Promise<void>;
    static update(req: AuthRequest, res: Response): Promise<void>;
    static delete(req: AuthRequest, res: Response): Promise<void>;
    static createExecution(req: AuthRequest, res: Response): Promise<void>;
    static getExecutionById(req: Request, res: Response): Promise<void>;
    static getExecutionsByOrder(req: Request, res: Response): Promise<void>;
    static updateExecutionItem(req: AuthRequest, res: Response): Promise<void>;
}
export declare const createChecklistValidation: import("express-validator").ValidationChain[];
export declare const updateChecklistValidation: import("express-validator").ValidationChain[];
export declare const createExecutionValidation: import("express-validator").ValidationChain[];
export declare const updateExecutionItemValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=checklist.controller.d.ts.map