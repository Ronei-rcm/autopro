export interface OrderTemplate {
    id: number;
    name: string;
    description?: string;
    category?: string;
    active: boolean;
    created_by?: number;
    created_at: Date;
    updated_at: Date;
}
export interface OrderTemplateItem {
    id: number;
    template_id: number;
    product_id?: number;
    labor_id?: number;
    description: string;
    quantity: number;
    unit_price: number;
    item_type: 'product' | 'labor';
    sort_order: number;
    product_name?: string;
    product_code?: string;
    labor_name?: string;
}
export declare class OrderTemplateModel {
    static findAll(activeOnly?: boolean): Promise<(OrderTemplate & {
        items?: OrderTemplateItem[];
    })[]>;
    static findById(id: number, includeItems?: boolean): Promise<(OrderTemplate & {
        items?: OrderTemplateItem[];
    }) | null>;
    static create(data: Omit<OrderTemplate, 'id' | 'created_at' | 'updated_at'>, items?: Omit<OrderTemplateItem, 'id' | 'template_id'>[]): Promise<OrderTemplate & {
        items?: OrderTemplateItem[];
    }>;
    static update(id: number, data: Partial<Omit<OrderTemplate, 'id' | 'created_at' | 'updated_at'>>, items?: Omit<OrderTemplateItem, 'id' | 'template_id'>[]): Promise<OrderTemplate & {
        items?: OrderTemplateItem[];
    }>;
    static delete(id: number): Promise<boolean>;
}
//# sourceMappingURL=order-template.model.d.ts.map