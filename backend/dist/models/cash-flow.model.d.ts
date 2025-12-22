import { CashFlow } from '../types';
export declare class CashFlowModel {
    static findAll(startDate?: Date, endDate?: Date, type?: string, category?: string): Promise<any[]>;
    static findById(id: number): Promise<CashFlow | null>;
    static create(data: Omit<CashFlow, 'id' | 'created_at' | 'updated_at'>): Promise<CashFlow>;
    static update(id: number, data: Partial<Omit<CashFlow, 'id' | 'created_at' | 'updated_at'>>): Promise<CashFlow>;
    static delete(id: number): Promise<boolean>;
    static getSummary(startDate?: Date, endDate?: Date): Promise<any>;
}
//# sourceMappingURL=cash-flow.model.d.ts.map