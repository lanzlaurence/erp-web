export type * from './auth';
export type * from './modules';
export type * from './navigation';
export type * from './ui';

import type { Auth, Permission, Role, User } from './auth';
import type { Brand, Category, Charge, Customer, Destination, Material, Uom, Vendor } from './modules';

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
};

export type SharedData = {
    name: string;
    auth: Auth;
    preferences: Preference;
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
    };
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

export type DestinationData = {
    destinations: PaginatedData<Destination>;
};

export type ChargeData = {
    charges: PaginatedData<Charge>;
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
