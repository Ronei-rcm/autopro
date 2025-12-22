export interface InventoryMovement {
    id: number;
    product_id: number;
    type: 'entry' | 'exit' | 'adjustment';
    quantity: number;
    reference_type?: string;
    reference_id?: number;
    notes?: string;
    created_at: Date;
    created_by?: number;
}
export declare class InventoryMovementModel {
    static create(data: Omit<InventoryMovement, 'id' | 'created_at'>): Promise<InventoryMovement>;
    static findByProduct(productId: number, limit?: number): Promise<InventoryMovement[]>;
    static findAll(productId?: number, type?: string, limit?: number): Promise<InventoryMovement[]>;
}
//# sourceMappingURL=inventory-movement.model.d.ts.map