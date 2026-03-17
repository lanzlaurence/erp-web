// types/index.ts
export type * from './auth';
export type * from './masters';
export type * from './modules';
export type * from './navigation';
export type * from './ui';
export type * from './transactions';
export type * from './dashboard';

import type { Auth, Permission, Role, User } from './auth';
import type { Customer, Material, Vendor } from './masters';
import type { Brand, Category, Charge, Currency, Location, Uom } from './modules';
import type { PurchaseOrder, GoodsReceipt, Inventory, InventoryLog, SalesOrder, GoodsIssue } from './transactions';

export type FlashMessage = {
    success?: string;
    error?: string;
};

export type Preference = {
    app_name: string;
    app_logo: string;
    decimal_places: number;
    color_theme: string;
    timezone: string;
    currency: string;
    date_format: string;
    time_format: '12h' | '24h';
};

export type SharedData = {
    name: string;
    auth: Auth;
    preferences: Preference;
    currencies: Currency[];
    sidebarOpen: boolean;
    flash: FlashMessage;
    [key: string]: unknown;
};

// Generic pagination type
export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};

export type UserData = {
    users: User[];
};

export type RoleData = {
    roles: (Role & { permissions: Permission[] })[];
    permissions?: Permission[];
};

export type PreferenceData = {
    formData: {
        app_name: string;
        app_logo_url: string;
        decimal_places: string;
        color_theme: string;
        timezone: string;
        currency: string;
        date_format: string;
        time_format: string;
    };
    currencies: Currency[];
};

export type BrandData = {
    brands: Brand[];
};

export type CategoryData = {
    categories: Category[];
};

export type UomData = {
    uoms: Uom[];
};

export type LocationData = {
    locations: Location[];
};

export type ChargeData = {
    charges: Charge[];
};

export type CurrencyData = {
    currencies: Currency[];
};

export type MaterialData = {
    materials: Material[];
    brands?: Brand[];
    categories?: Category[];
    uoms?: Uom[];
};

export type VendorData = {
    vendors: Vendor[];
};

export type CustomerData = {
    customers: Customer[];
};

export type PurchaseOrderData = {
    purchaseOrders: PurchaseOrder[];
};

export type GoodsReceiptData = {
    goodsReceipts: GoodsReceipt[];
};

export type SalesOrderData = {
    salesOrders: SalesOrder[];
};

export type GoodsIssueData = {
    goodsIssues: GoodsIssue[];
};

export type PurchaseOrderShowData = {
    purchaseOrder: PurchaseOrder;
    vendors?: Vendor[];
    materials?: Material[];
    charges?: Charge[];
};

export type GoodsReceiptShowData = {
    goodsReceipt: GoodsReceipt;
    locations?: Location[];
};

export type SalesOrderShowData = {
    salesOrder: SalesOrder;
};

export type GoodsIssueShowData = {
    goodsIssue: GoodsIssue;
};

export type InventoryData = {
    inventories: Inventory[];
};

export type InventoryShowData = {
    inventory: Inventory;
    logs: InventoryLog[];
};
