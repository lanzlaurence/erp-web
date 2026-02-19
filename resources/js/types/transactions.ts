// types/transactions.ts
import type { Material, Destination } from './modules';
import type { User } from './auth';

export type Inventory = {
    id: number;
    material_id: number;
    destination_id: number;
    quantity: number | string;
    material?: Material;
    destination?: Destination;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

export type InventoryLog = {
    id: number;
    inventory_id: number;
    material_id: number;
    destination_id: number;
    user_id: number;
    type: 'initial' | 'adjustment' | 'transfer_in' | 'transfer_out' | 'purchase_receipt' | 'purchase_return' | 'sales_issue' | 'sales_return';
    quantity_before: number | string;
    quantity_change: number | string;
    quantity_after: number | string;
    transfer_to_destination_id: number | null;
    reference_id: number | null;
    reference_type: string | null;
    remarks: string | null;
    material?: Material;
    destination?: Destination;
    transfer_to_destination?: Destination;
    user?: User;
    created_at: string;
    updated_at: string;
};
