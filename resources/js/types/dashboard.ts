export type DashboardMaterialRow = {
    id: number;
    code: string;
    sku: string | null;
    name: string;
    description: string | null;
    category: string | null;
    brand: string | null;
    uom: string | null;
    unit_cost: number;
    avg_unit_cost: number;
    unit_price: number;
    avg_unit_price: number;
    current_stock: number;
    total_stock_value: number;
    total_sold_value: number;
};

export type PurchaseHistoryItem = {
    po_id: number;
    po_code: string;
    vendor_id: number;
    vendor_code: string;
    vendor_name: string;
    order_date: string;
    discount_amount: number;
    unit_cost_after_discount: number;
    qty_ordered: number;
    uom: string | null;
    net_cost: number;
};

export type SalesHistoryItem = {
    so_id: number;
    so_code: string;
    customer_id: number;
    customer_code: string;
    customer_name: string;
    order_date: string;
    discount_amount: number;
    unit_price_after_discount: number;
    qty_ordered: number;
    uom: string | null;
    net_price: number;
};

export type StockByLocation = {
    location_id: number;
    location_name: string;
    quantity: number;
};

export type MaterialHistoryData = {
    material: DashboardMaterialRow;
    purchase_history: PurchaseHistoryItem[];
    sales_history: SalesHistoryItem[];
    stock_by_location: StockByLocation[];
};

export type DashboardData = {
    materials: DashboardMaterialRow[];
};

// ── Activity ───────────────────────────────────────────────────────────

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
