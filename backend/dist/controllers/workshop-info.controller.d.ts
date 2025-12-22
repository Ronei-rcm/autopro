import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class WorkshopInfoController {
    static get(req: Request, res: Response): Promise<void>;
    static update(req: AuthRequest, res: Response): Promise<void>;
}
export declare const updateWorkshopInfoValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=workshop-info.controller.d.ts.map