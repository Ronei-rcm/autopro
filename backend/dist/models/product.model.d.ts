import { Product } from '../types';
export declare class ProductModel {
    static findAll(search?: string, category?: string, lowStock?: boolean): Promise<Product[]>;
    static findById(id: number): Promise<Product | null>;
    static findByCode(code: string): Promise<Product | null>;
    static create(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product>;
    static update(id: number, data: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product>;
    static delete(id: number): Promise<boolean>;
    static getLowStock(): Promise<Product[]>;
    static getCategories(): Promise<string[]>;
}
//# sourceMappingURL=product.model.d.ts.map