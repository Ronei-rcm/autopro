export interface Quote {
    id: number;
    client_id: number;
    vehicle_id: number;
    user_id: number;
    quote_number: string;
    status: 'open' | 'approved' | 'rejected' | 'converted';
    subtotal: number;
    discount: number;
    total: number;
    valid_until?: Date;
    notes?: string;
    created_at: Date;
    updated_at: Date;
    client_name?: string;
    vehicle_brand?: string;
    vehicle_model?: string;
    vehicle_plate?: string;
    user_name?: string;
}
export interface QuoteItem {
    id: number;
    quote_id: number;
    product_id?: number;
    labor_id?: number;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    item_type: 'product' | 'labor';
    product_name?: string;
    labor_name?: string;
}
export declare class QuoteModel {
    static findAll(status?: string, clientId?: number, search?: string): Promise<Quote[]>;
    static findById(id: number): Promise<(Quote & {
        items?: QuoteItem[];
    }) | null>;
    static generateQuoteNumber(): Promise<string>;
    static create(data: Omit<Quote, 'id' | 'quote_number' | 'created_at' | 'updated_at'>, items: Omit<QuoteItem, 'id' | 'quote_id'>[]): Promise<Quote & {
        items?: QuoteItem[];
    }>;
    static update(id: number, data: Partial<Omit<Quote, 'id' | 'quote_number' | 'created_at' | 'updated_at'>>, items?: Omit<QuoteItem, 'id' | 'quote_id'>[]): Promise<Quote & {
        items?: QuoteItem[];
    }>;
    static updateStatus(id: number, status: 'open' | 'approved' | 'rejected' | 'converted'): Promise<boolean>;
    static delete(id: number): Promise<boolean>;
    static addItem(quoteId: number, item: Omit<QuoteItem, 'id' | 'quote_id'>): Promise<QuoteItem>;
    static removeItem(itemId: number, quoteId: number): Promise<boolean>;
    static updateTotals(quoteId: number): Promise<void>;
}
//# sourceMappingURL=quote.model.d.ts.map