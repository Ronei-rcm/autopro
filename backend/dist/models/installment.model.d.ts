export interface Installment {
    id: number;
    account_receivable_id: number;
    installment_number: number;
    due_date: Date | string;
    amount: number;
    paid_amount: number;
    paid_at?: Date | string | null;
    payment_method?: string | null;
    status: 'open' | 'paid' | 'overdue' | 'cancelled';
    notes?: string | null;
    created_at: Date | string;
    updated_at: Date | string;
}
export declare class InstallmentModel {
    static ensureTableExists(): Promise<void>;
    static findByReceivableId(accountReceivableId: number): Promise<Installment[]>;
    static findById(id: number): Promise<Installment | null>;
    static create(data: Omit<Installment, 'id' | 'created_at' | 'updated_at'>): Promise<Installment>;
    static createMany(installments: Omit<Installment, 'id' | 'created_at' | 'updated_at'>[]): Promise<Installment[]>;
    static update(id: number, data: Partial<Omit<Installment, 'id' | 'account_receivable_id' | 'installment_number' | 'created_at' | 'updated_at'>>): Promise<Installment | null>;
    static delete(id: number): Promise<boolean>;
    static deleteByReceivableId(accountReceivableId: number): Promise<boolean>;
    static updateStatuses(): Promise<void>;
    static getSummaryByReceivableId(accountReceivableId: number): Promise<any>;
}
//# sourceMappingURL=installment.model.d.ts.map