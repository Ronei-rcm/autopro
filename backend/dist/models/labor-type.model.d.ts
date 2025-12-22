export interface LaborType {
    id: number;
    name: string;
    description?: string;
    price: number;
    estimated_hours?: number;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}
export declare class LaborTypeModel {
    static findAll(active?: boolean): Promise<LaborType[]>;
    static findById(id: number): Promise<LaborType | null>;
    static create(data: Omit<LaborType, 'id' | 'created_at' | 'updated_at'>): Promise<LaborType>;
    static update(id: number, data: Partial<Omit<LaborType, 'id' | 'created_at' | 'updated_at'>>): Promise<LaborType>;
    static delete(id: number): Promise<boolean>;
}
//# sourceMappingURL=labor-type.model.d.ts.map