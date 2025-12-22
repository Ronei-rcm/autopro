import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class AppointmentController {
    static list(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static create(req: AuthRequest, res: Response): Promise<void>;
    static update(req: AuthRequest, res: Response): Promise<void>;
    static delete(req: AuthRequest, res: Response): Promise<void>;
    static getUpcoming(req: Request, res: Response): Promise<void>;
    static quickAction(req: AuthRequest, res: Response): Promise<void>;
}
export declare const createAppointmentValidation: import("express-validator").ValidationChain[];
export declare const updateAppointmentValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=appointment.controller.d.ts.map