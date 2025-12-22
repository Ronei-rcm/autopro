export interface OrderFile {
    id: number;
    order_id: number;
    file_name: string;
    file_path: string;
    file_type: 'photo' | 'document' | 'other';
    file_size?: number;
    description?: string;
    uploaded_by?: number;
    created_at: Date;
    uploaded_by_name?: string;
}
export declare class OrderFileModel {
    static ensureTableExists(): Promise<void>;
    static findByOrder(orderId: number): Promise<OrderFile[]>;
    static findById(id: number): Promise<OrderFile | null>;
    static create(data: Omit<OrderFile, 'id' | 'created_at'>): Promise<OrderFile>;
    static delete(id: number): Promise<boolean>;
    static updateDescription(id: number, description: string): Promise<OrderFile | null>;
}
//# sourceMappingURL=order-file.model.d.ts.map