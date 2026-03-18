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
