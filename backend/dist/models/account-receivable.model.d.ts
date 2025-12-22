import { AccountReceivable } from '../types';
export declare class AccountReceivableModel {
    static findAll(status?: string, clientId?: number, startDate?: Date, endDate?: Date, orderId?: number): Promise<any[]>;
    static findById(id: number): Promise<AccountReceivable | null>;
    static create(data: Omit<AccountReceivable, 'id' | 'created_at' | 'updated_at'>): Promise<AccountReceivable>;
    static update(id: number, data: Partial<Omit<AccountReceivable, 'id' | 'created_at' | 'updated_at'>>): Promise<AccountReceivable>;
    static delete(id: number): Promise<boolean>;
    static getSummary(): Promise<any>;
}
//# sourceMappingURL=account-receivable.model.d.ts.map