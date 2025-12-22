export interface Supplier {
    id: number;
    name: string;
    cnpj?: string;
    contact_name?: string;
    phone?: string;
    email?: string;
    address_street?: string;
    address_number?: string;
    address_complement?: string;
    address_neighborhood?: string;
    address_city?: string;
    address_state?: string;
    address_zipcode?: string;
    notes?: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}
export declare class SupplierModel {
    static findAll(search?: string, active?: boolean): Promise<Supplier[]>;
    static findById(id: number): Promise<Supplier | null>;
    static create(data: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier>;
    static update(id: number, data: Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>): Promise<Supplier>;
    static delete(id: number): Promise<boolean>;
    static count(): Promise<number>;
}
//# sourceMappingURL=supplier.model.d.ts.map