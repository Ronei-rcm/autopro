import { AccountPayable } from '../types';
export declare class AccountPayableModel {
    static findAll(status?: string, supplierId?: number, startDate?: Date, endDate?: Date): Promise<any[]>;
    static findById(id: number): Promise<AccountPayable | null>;
    static create(data: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at'>): Promise<AccountPayable>;
    static update(id: number, data: Partial<Omit<AccountPayable, 'id' | 'created_at' | 'updated_at'>>): Promise<AccountPayable>;
    static delete(id: number): Promise<boolean>;
    static getSummary(): Promise<any>;
}
//# sourceMappingURL=account-payable.model.d.ts.map