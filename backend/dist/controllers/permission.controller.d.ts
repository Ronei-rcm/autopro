import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class PermissionController {
    static getAll(req: AuthRequest, res: Response): Promise<void>;
    static getByProfile(req: AuthRequest, res: Response): Promise<void>;
    static getGroupedByModule(req: AuthRequest, res: Response): Promise<void>;
    static updateProfilePermissions(req: AuthRequest, res: Response): Promise<void>;
    static checkPermission(req: AuthRequest, res: Response): Promise<void>;
    static checkBatchPermissions(req: AuthRequest, res: Response): Promise<void>;
}
export declare const updateProfilePermissionsValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=permission.controller.d.ts.map