import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class AuthController {
    static login(req: Request, res: Response): Promise<void>;
    static register(req: Request, res: Response): Promise<void>;
    static me(req: AuthRequest, res: Response): Promise<void>;
}
export declare const loginValidation: import("express-validator").ValidationChain[];
export declare const registerValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=auth.controller.d.ts.map