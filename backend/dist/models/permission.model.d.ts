import { UserProfile } from '../types';
export interface Permission {
    id: number;
    module: string;
    action: string;
    description?: string;
    created_at: Date;
}
export interface ProfilePermission {
    id: number;
    profile: UserProfile;
    permission_id: number;
    granted: boolean;
    created_at: Date;
}
export interface PermissionWithGranted extends Permission {
    granted: boolean;
}
export declare class PermissionModel {
    static findAll(): Promise<Permission[]>;
    static findById(id: number): Promise<Permission | null>;
    static findByModuleAndAction(module: string, action: string): Promise<Permission | null>;
    static findByProfile(profile: UserProfile, includeHidden?: boolean): Promise<PermissionWithGranted[]>;
    static hasPermission(profile: UserProfile, module: string, action: string): Promise<boolean>;
    static updateProfilePermission(profile: UserProfile, permissionId: number, granted: boolean): Promise<void>;
    static updateProfilePermissions(profile: UserProfile, permissions: {
        permission_id: number;
        granted: boolean;
    }[]): Promise<void>;
    static findGroupedByModule(profile: UserProfile, includeHidden?: boolean): Promise<Record<string, PermissionWithGranted[]>>;
}
//# sourceMappingURL=permission.model.d.ts.map