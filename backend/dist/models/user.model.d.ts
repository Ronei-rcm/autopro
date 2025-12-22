import { User, UserProfile } from '../types';
export declare class UserModel {
    static findByEmail(email: string): Promise<User | null>;
    static findByEmailWithPassword(email: string): Promise<{
        id: number;
        password_hash: string;
    } | null>;
    static findById(id: number): Promise<User | null>;
    static create(email: string, passwordHash: string, name: string, profile: UserProfile): Promise<User>;
    static update(id: number, data: Partial<User>): Promise<User>;
    static findAll(): Promise<User[]>;
}
//# sourceMappingURL=user.model.d.ts.map