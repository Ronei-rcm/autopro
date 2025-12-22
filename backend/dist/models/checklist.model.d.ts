export interface Checklist {
    id: number;
    name: string;
    description?: string;
    category?: string;
    active: boolean;
    created_by?: number;
    created_at: Date;
    updated_at: Date;
}
export interface ChecklistItem {
    id: number;
    checklist_id: number;
    description: string;
    item_type: 'check' | 'measure' | 'observation';
    required: boolean;
    sort_order: number;
    created_at: Date;
}
export interface ChecklistExecution {
    id: number;
    order_id: number;
    checklist_id: number;
    vehicle_id: number;
    mechanic_id?: number;
    executed_at: Date;
    notes?: string;
    created_at: Date;
    checklist_name?: string;
    mechanic_name?: string;
}
export interface ChecklistExecutionItem {
    id: number;
    execution_id: number;
    checklist_item_id: number;
    checked: boolean;
    value?: string;
    observation?: string;
    created_at: Date;
    item_description?: string;
    item_type?: string;
}
export declare class ChecklistModel {
    static findAll(activeOnly?: boolean): Promise<(Checklist & {
        items?: ChecklistItem[];
    })[]>;
    static findById(id: number, includeItems?: boolean): Promise<(Checklist & {
        items?: ChecklistItem[];
    }) | null>;
    static create(data: Omit<Checklist, 'id' | 'created_at' | 'updated_at'>, items?: Omit<ChecklistItem, 'id' | 'checklist_id' | 'created_at'>[]): Promise<Checklist & {
        items?: ChecklistItem[];
    }>;
    static update(id: number, data: Partial<Omit<Checklist, 'id' | 'created_at' | 'updated_at'>>, items?: Omit<ChecklistItem, 'id' | 'checklist_id' | 'created_at'>[]): Promise<Checklist & {
        items?: ChecklistItem[];
    }>;
    static delete(id: number): Promise<boolean>;
    static createExecution(orderId: number, checklistId: number, vehicleId: number, mechanicId?: number, notes?: string, items?: Omit<ChecklistExecutionItem, 'id' | 'execution_id' | 'created_at'>[]): Promise<ChecklistExecution & {
        items?: ChecklistExecutionItem[];
    }>;
    static findExecutionById(id: number): Promise<(ChecklistExecution & {
        items?: ChecklistExecutionItem[];
    }) | null>;
    static findExecutionsByOrder(orderId: number): Promise<(ChecklistExecution & {
        items?: ChecklistExecutionItem[];
    })[]>;
    static updateExecutionItem(executionId: number, checklistItemId: number, data: Partial<Omit<ChecklistExecutionItem, 'id' | 'execution_id' | 'checklist_item_id' | 'created_at'>>): Promise<ChecklistExecutionItem | null>;
}
//# sourceMappingURL=checklist.model.d.ts.map