export type InventoryLogRow = {
    id: number;
    movement_code: string;
    created_at: string;
    type: string;
    inventory_id: number | null;
    inventory_code: string | null;
    material_id: number | null;
    material_name: string | null;
    material_code: string | null;
    location_name: string | null;
    quantity_before: number;
    quantity_change: number;
    quantity_after: number;
    transfer_location_name: string | null;
    user_name: string | null;
    remarks: string | null;
};

export type TransactionLogRow = {
    id: number;
    created_at: string;
    user_name: string | null;
    loggable_type: string | null;
    loggable_id: number | null;
    loggable_code: string | null;
    action: string;
    from_status: string | null;
    to_status: string | null;
    remarks: string | null;
};

export type InventoryLogPageData = {
    logs: InventoryLogRow[];
};

export type TransactionLogPageData = {
    logs: TransactionLogRow[];
};
