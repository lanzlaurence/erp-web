// types/transactions.ts
import type { Customer, Material, Vendor } from './masters';
import type { Charge, Location } from './modules';
import type { User } from './auth';

// ── Purchase Order ────────────────────────────────────────────────────────────

export type PurchaseOrderStatus =
    | 'draft'
    | 'posted'
    | 'partially_received'
    | 'fully_received'
    | 'cancelled';

export type DiscountType = 'fixed' | 'percentage';
export type VatType      = 'exclusive' | 'inclusive';

export type PurchaseOrderItem = {
    id: number;
    purchase_order_id: number;
    material_id: number;
    line_number: number;
    qty_ordered: number | string;
    qty_received: number | string;
    unit_cost: number | string;
    discount_type: DiscountType | null;
    discount_amount: number | string;
    unit_cost_after_discount: number | string;
    net_price: number | string;
    is_vatable: boolean;
    vat_type: VatType | null;
    vat_rate: number | string;
    vat_price: number | string;
    gross_price: number | string;
    remarks: string | null;
    material?: Material;
    qty_remaining?: number;
    created_at: string;
    updated_at: string;
};

export type PurchaseOrderCharge = {
    id: number;
    purchase_order_id: number;
    charge_id: number;
    name: string;
    type: 'tax' | 'discount';
    value_type: 'percentage' | 'fixed';
    value: number | string;
    computed_amount: number | string;
    charge?: Charge;
};

export type PurchaseOrder = {
    id: number;
    code: string;
    vendor_id: number;
    user_id: number;
    status: PurchaseOrderStatus;
    order_date: string;
    delivery_date: string | null;
    reference_no: string | null;
    discount_type: DiscountType | null;
    discount_amount: number | string;
    total_before_discount: number | string;
    total_item_discount: number | string;
    total_net_price: number | string;
    total_vat: number | string;
    total_gross: number | string;
    total_charges: number | string;
    header_discount_total: number | string;
    grand_total: number | string;
    remarks: string | null;
    vendor?: Vendor;
    user?: User;
    items?: PurchaseOrderItem[];
    charges?: PurchaseOrderCharge[];

    goods_receipts?: GoodsReceipt[];
    logs?: TransactionLog[];
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

// ── Goods Receipt ─────────────────────────────────────────────────────────────

export type GoodsReceiptStatus =
    | 'pending'
    | 'completed'
    | 'cancelled';

export type GoodsReceiptItem = {
    id: number;
    goods_receipt_id: number;
    purchase_order_item_id: number;
    material_id: number;
    qty_ordered: number | string;
    qty_received: number | string;
    qty_to_receive: number | string;
    qty_remaining: number | string;
    unit_cost: number | string;
    serial_number: string | null;
    batch_number: string | null;
    remarks: string | null;
    material?: Material;
    purchase_order_item?: PurchaseOrderItem;
    created_at: string;
    updated_at: string;
};

export type GoodsReceipt = {
    id: number;
    code: string;
    purchase_order_id: number;
    user_id: number;
    location_id: number;
    status: GoodsReceiptStatus;
    gr_date: string;
    transaction_date: string;
    remarks: string | null;
    purchase_order?: PurchaseOrder;
    location?: Location;
    user?: User;
    items?: GoodsReceiptItem[];
    logs?: TransactionLog[];
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

// ── Sales Order ───────────────────────────────────────────────────────────────

export type SalesOrderStatus =
    | 'draft'
    | 'posted'
    | 'partially_shipped'
    | 'fully_shipped'
    | 'cancelled';

export type SalesOrderItem = {
    id: number;
    sales_order_id: number;
    material_id: number;
    line_number: number;
    qty_ordered: number | string;
    qty_shipped: number | string;
    unit_price: number | string;
    discount_type: DiscountType | null;
    discount_amount: number | string;
    unit_price_after_discount: number | string;
    net_price: number | string;
    is_vatable: boolean;
    vat_type: VatType | null;
    vat_rate: number | string;
    vat_price: number | string;
    gross_price: number | string;
    remarks: string | null;
    material?: Material;
    qty_remaining?: number;
    created_at: string;
    updated_at: string;
};

export type SalesOrderCharge = {
    id: number;
    sales_order_id: number;
    charge_id: number;
    name: string;
    type: 'tax' | 'discount';
    value_type: 'percentage' | 'fixed';
    value: number | string;
    computed_amount: number | string;
    charge?: Charge;
};

export type SalesOrder = {
    id: number;
    code: string;
    customer_id: number;
    user_id: number;
    status: SalesOrderStatus;
    order_date: string;
    delivery_date: string | null;
    reference_no: string | null;
    discount_type: DiscountType | null;
    discount_amount: number | string;
    total_before_discount: number | string;
    total_item_discount: number | string;
    total_net_price: number | string;
    total_vat: number | string;
    total_gross: number | string;
    total_charges: number | string;
    header_discount_total: number | string;
    grand_total: number | string;
    remarks: string | null;
    customer?: Customer;
    user?: User;
    items?: SalesOrderItem[];
    charges?: SalesOrderCharge[];
    goods_issues?: GoodsIssue[];
    logs?: TransactionLog[];
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

// ── Goods Issue ───────────────────────────────────────────────────────────────

export type GoodsIssueStatus =
    | 'pending'
    | 'completed'
    | 'cancelled';

export type GoodsIssueItem = {
    id: number;
    goods_issue_id: number;
    sales_order_item_id: number;
    material_id: number;
    qty_ordered: number | string;
    qty_shipped: number | string;
    qty_to_ship: number | string;
    qty_remaining: number | string;
    unit_price: number | string;
    serial_number: string | null;
    batch_number: string | null;
    remarks: string | null;
    material?: Material;
    sales_order_item?: SalesOrderItem;
    created_at: string;
    updated_at: string;
};

export type GoodsIssue = {
    id: number;
    code: string;
    sales_order_id: number;
    user_id: number;
    location_id: number;
    status: GoodsIssueStatus;
    gi_date: string;
    transaction_date: string;
    remarks: string | null;
    sales_order?: SalesOrder;
    location?: Location;
    user?: User;
    items?: GoodsIssueItem[];
    logs?: TransactionLog[];
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

// ── Transaction Log ───────────────────────────────────────────────────────────

export type TransactionLog = {
    id: number;
    user_id: number;
    action: string;
    from_status: string | null;
    to_status: string | null;
    remarks: string | null;
    loggable_id: number;
    loggable_type: string;
    loggable?: { id: number; code: string } | null;
    user?: User;
    created_at: string;
    updated_at: string;
};

// ── Inventory ──────────────────────────────────────────────────────────────────

export type Inventory = {
    id: number;
    code: string;
    material_id: number;
    location_id: number;
    quantity: number | string;
    material?: Material;
    location?: Location;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

// ── Inventory Log ───────────────────────────────────────────────────────────

export type InventoryLog = {
    id: number;
    movement_code: string;
    inventory_id: number;
    material_id: number;
    location_id: number;
    user_id: number;
    type: 'initial' | 'adjustment' | 'transfer_in' | 'transfer_out' | 'purchase_receipt' | 'purchase_return' | 'sales_issue' | 'sales_return';
    quantity_before: number | string;
    quantity_change: number | string;
    quantity_after: number | string;
    transfer_location_id: number | null;
    reference_id: number | null;
    reference_type: string | null;
    remarks: string | null;
    inventory?: Inventory;
    material?: Material;
    location?: Location;
    transfer_location?: Location;
    user?: User;
    created_at: string;
    updated_at: string;
};
