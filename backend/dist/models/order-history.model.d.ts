export interface OrderHistory {
    id: number;
    order_id: number;
    field_changed: string;
    old_value?: string;
    new_value?: string;
    changed_by?: number;
    notes?: string;
    created_at: Date;
}
export declare class OrderHistoryModel {
    static create(history: Omit<OrderHistory, 'id' | 'created_at'>): Promise<OrderHistory>;
    static findByOrder(orderId: number): Promise<OrderHistory[]>;
}
//# sourceMappingURL=order-history.model.d.ts.map