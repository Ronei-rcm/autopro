import { Order } from '../types';
export interface OrderItem {
    id: number;
    order_id: number;
    product_id?: number;
    labor_id?: number;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    item_type: 'product' | 'labor';
}
export declare class OrderModel {
    static findAll(status?: string, clientId?: number, mechanicId?: number, search?: string): Promise<any[]>;
    static findById(id: number): Promise<Order | null>;
    static updateSignature(id: number, signature: string, signedByName: string): Promise<boolean>;
    static create(data: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order>;
    static update(id: number, data: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>): Promise<Order>;
    static delete(id: number): Promise<boolean>;
    static generateOrderNumber(): Promise<string>;
    static getItems(orderId: number): Promise<OrderItem[]>;
    static addItem(item: Omit<OrderItem, 'id'>): Promise<OrderItem>;
    static removeItem(itemId: number): Promise<boolean>;
    static updateItem(itemId: number, data: Partial<Omit<OrderItem, 'id' | 'order_id'>>): Promise<OrderItem | null>;
    static getItemById(itemId: number): Promise<OrderItem | null>;
    static updateTotals(orderId: number): Promise<void>;
}
//# sourceMappingURL=order.model.d.ts.map