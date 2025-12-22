import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class ModuleSettingsController {
    static getAll(req: AuthRequest, res: Response): Promise<void>;
    static getByModule(req: AuthRequest, res: Response): Promise<void>;
    static getHiddenModules(req: AuthRequest, res: Response): Promise<void>;
    static updateVisibility(req: AuthRequest, res: Response): Promise<void>;
    static updateMultipleVisibility(req: AuthRequest, res: Response): Promise<void>;
}
export declare const updateModuleVisibilityValidation: import("express-validator").ValidationChain[];
export declare const updateMultipleModuleVisibilityValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=module-settings.controller.d.ts.map