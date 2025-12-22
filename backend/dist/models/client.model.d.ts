import { Client } from '../types';
export declare class ClientModel {
    static findAll(search?: string, active?: boolean): Promise<Client[]>;
    static findById(id: number): Promise<Client | null>;
    static create(data: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client>;
    static update(id: number, data: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>): Promise<Client>;
    static delete(id: number): Promise<boolean>;
    static count(): Promise<number>;
}
//# sourceMappingURL=client.model.d.ts.map