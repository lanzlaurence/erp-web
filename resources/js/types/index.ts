export type * from './auth';
export type * from './modules';
export type * from './navigation';
export type * from './ui';
export type * from './transactions';

import type { Auth, Permission, Role, User } from './auth';
import type { Brand, Category, Charge, Currency, Customer, Location, Material, Uom, Vendor } from './modules';
import type { PurchaseOrder, GoodsReceipt, Inventory, InventoryLog } from './transactions';

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
    users: PaginatedData<User>;
};

export type RoleData = {
    roles: PaginatedData<Role & { permissions: Permission[] }>;
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
    brands: PaginatedData<Brand>;
};

export type CategoryData = {
    categories: PaginatedData<Category>;
};

export type UomData = {
    uoms: PaginatedData<Uom>;
};

export type LocationData = {
    locations: PaginatedData<Location>;
};

export type ChargeData = {
    charges: PaginatedData<Charge>;
};

export type CurrencyData = {
    currencies: PaginatedData<Currency>;
};

export type MaterialData = {
    materials: PaginatedData<Material>;
    brands?: Brand[];
    categories?: Category[];
    uoms?: Uom[];
};

export type VendorData = {
    vendors: PaginatedData<Vendor>;
};

export type CustomerData = {
    customers: PaginatedData<Customer>;
};

export type PurchaseOrderData = {
    purchaseOrders: PaginatedData<PurchaseOrder>;
};

export type PurchaseOrderShowData = {
    purchaseOrder: PurchaseOrder;
    vendors?: Vendor[];
    materials?: Material[];
    charges?: Charge[];
};

export type GoodsReceiptData = {
    goodsReceipts: PaginatedData<GoodsReceipt>;
};

export type GoodsReceiptShowData = {
    goodsReceipt: GoodsReceipt;
    locations?: Location[];
};

export type InventoryData = {
    inventories: PaginatedData<Inventory>;
};

export type InventoryShowData = {
    inventory: Inventory;
    logs: PaginatedData<InventoryLog>;
};

export type InventoryLogData = {
    logs: PaginatedData<InventoryLog>;
};
