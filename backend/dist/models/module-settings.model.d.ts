export interface ModuleSettings {
    id: number;
    module: string;
    hidden: boolean;
    created_at: Date;
    updated_at: Date;
}
export declare class ModuleSettingsModel {
    static findAll(): Promise<ModuleSettings[]>;
    static tableExists(): Promise<boolean>;
    static findByModule(module: string): Promise<ModuleSettings | null>;
    static findHiddenModules(): Promise<string[]>;
    static findVisibleModules(): Promise<string[]>;
    static updateVisibility(module: string, hidden: boolean): Promise<void>;
    static updateMultipleVisibility(updates: Array<{
        module: string;
        hidden: boolean;
    }>): Promise<void>;
    static isHidden(module: string): Promise<boolean>;
}
//# sourceMappingURL=module-settings.model.d.ts.map