export interface WorkshopInfo {
    id: number;
    name: string;
    trade_name?: string | null;
    cnpj?: string | null;
    state_registration?: string | null;
    municipal_registration?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    address_street?: string | null;
    address_number?: string | null;
    address_complement?: string | null;
    address_neighborhood?: string | null;
    address_city?: string | null;
    address_state?: string | null;
    address_zipcode?: string | null;
    logo_path?: string | null;
    logo_base64?: string | null;
    notes?: string | null;
    terms_and_conditions?: string | null;
    footer_text?: string | null;
    created_at: Date | string;
    updated_at: Date | string;
}
export declare class WorkshopInfoModel {
    static ensureTableExists(): Promise<void>;
    static find(): Promise<WorkshopInfo | null>;
    static update(data: Partial<Omit<WorkshopInfo, 'id' | 'created_at' | 'updated_at'>>): Promise<WorkshopInfo>;
    static create(data: Partial<Omit<WorkshopInfo, 'id' | 'created_at' | 'updated_at'>>): Promise<WorkshopInfo>;
}
//# sourceMappingURL=workshop-info.model.d.ts.map