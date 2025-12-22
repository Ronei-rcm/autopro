import { Appointment } from '../types';
export declare class AppointmentModel {
    static findAll(startDate?: Date, endDate?: Date, status?: string, clientId?: number, mechanicId?: number): Promise<any[]>;
    static findById(id: number): Promise<Appointment | null>;
    static create(data: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment>;
    static update(id: number, data: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>>): Promise<Appointment>;
    static delete(id: number): Promise<boolean>;
    static getUpcoming(limit?: number): Promise<any[]>;
    static getByDateRange(startDate: Date, endDate: Date): Promise<any[]>;
}
//# sourceMappingURL=appointment.model.d.ts.map