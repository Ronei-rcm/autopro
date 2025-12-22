import { Vehicle } from '../types';
export declare class VehicleModel {
    static findAll(clientId?: number, search?: string): Promise<Vehicle[]>;
    static findById(id: number): Promise<Vehicle | null>;
    static create(data: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>): Promise<Vehicle>;
    static update(id: number, data: Partial<Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>>): Promise<Vehicle>;
    static delete(id: number): Promise<boolean>;
    static findByClient(clientId: number): Promise<Vehicle[]>;
}
//# sourceMappingURL=vehicle.model.d.ts.map