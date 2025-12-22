import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class ClientController {
    static list(req: Request, res: Response): Promise<void>;
    static getStatistics(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static create(req: AuthRequest, res: Response): Promise<void>;
    static update(req: AuthRequest, res: Response): Promise<void>;
    static delete(req: AuthRequest, res: Response): Promise<void>;
    static count(req: Request, res: Response): Promise<void>;
}
export declare const createClientValidation: import("express-validator").ValidationChain[];
export declare const updateClientValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=client.controller.d.ts.map