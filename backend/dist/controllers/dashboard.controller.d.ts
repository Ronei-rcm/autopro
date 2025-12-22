import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class DashboardController {
    static getOverview(_req: Request, res: Response): Promise<void>;
    static getProfileDashboard(req: AuthRequest, res: Response): Promise<void>;
    static getMechanicDashboard(req: AuthRequest, res: Response): Promise<void>;
    static getFinancialDashboard(_req: AuthRequest, res: Response): Promise<void>;
    static getAttendantDashboard(_req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=dashboard.controller.d.ts.map