export interface Warranty {
    id: number;
    order_id: number;
    order_item_id: number;
    product_id?: number | null;
    labor_id?: number | null;
    description: string;
    warranty_period_days: number;
    start_date: Date | string;
    end_date: Date | string;
    status: 'active' | 'expired' | 'used' | 'cancelled';
    notes?: string | null;
    created_at: Date | string;
    updated_at: Date | string;
}
export declare class WarrantyModel {
    static findAll(status?: string, orderId?: number, clientId?: number, startDate?: Date, endDate?: Date): Promise<any[]>;
    static findById(id: number): Promise<Warranty | null>;
    static findByOrderId(orderId: number): Promise<Warranty[]>;
    static create(data: Omit<Warranty, 'id' | 'created_at' | 'updated_at'>): Promise<Warranty>;
    static update(id: number, data: Partial<Omit<Warranty, 'id' | 'order_id' | 'order_item_id' | 'created_at' | 'updated_at'>>): Promise<Warranty | null>;
    static delete(id: number): Promise<boolean>;
    static updateExpiredStatuses(): Promise<void>;
    static getExpiringWarranties(days?: number): Promise<any[]>;
    static getSummary(): Promise<any>;
}
//# sourceMappingURL=warranty.model.d.ts.map