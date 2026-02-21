// types/modules.ts
export type Brand = {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

export type Category = {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

export type Uom = {
    id: number;
    acronym: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

export type Location = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

export type Charge = {
    id: number;
    name: string;
    description: string | null;
    type: 'tax' | 'discount';
    value_type: 'percentage' | 'fixed';
    value: string | number;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

export type Currency = {
    id: number;
    code: string;
    name: string;
    symbol: string;
    is_active: boolean;
    exchange_rate: number | string;
    created_at: string;
    updated_at: string;
};

export type ContactPerson = {
    name: string;
    email: string;
    phone: string;
};

export type EntityLogChange = {
    field: string;
    old: string;
    new: string;
};

export type EntityLog = {
    id: number;
    action: 'created' | 'updated' | 'deleted';
    changes: EntityLogChange[] | null;
    remarks: string | null;
    user?: { id: number; name: string };
    created_at: string;
};

export type Material = {
    id: number;
    code: string;
    sku: string | null;
    name: string;
    description: string | null;
    weight: number | null;
    length: number | null;
    width: number | null;
    height: number | null;
    volume: number | null;
    min_stock_level: number;
    max_stock_level: number;
    reorder_level: number;
    unit_cost: string | number;
    unit_price: string | number;
    avg_unit_cost: string | number;
    avg_unit_price: string | number;
    status: 'active' | 'inactive';
    track_serial_number: boolean;
    track_batch_number: boolean;
    brand_id: number | null;
    category_id: number | null;
    uom_id: number | null;
    brand?: Brand;
    category?: Category;
    uom?: Uom;
    logs?: EntityLog[];
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

export type Vendor = {
    id: number;
    code: string;
    name: string;
    country: string | null;
    state_province: string | null;
    city: string | null;
    suburb_barangay: string | null;
    postal_code: string | null;
    address_line_1: string | null;
    address_line_2: string | null;
    payment_terms: string | null;
    contact_persons: ContactPerson[] | null;
    credit_amount: string | number;
    status: 'active' | 'inactive';
    logs?: EntityLog[];
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

export type Customer = {
    id: number;
    code: string;
    name: string;
    country: string | null;
    state_province: string | null;
    city: string | null;
    suburb_barangay: string | null;
    postal_code: string | null;
    address_line_1: string | null;
    address_line_2: string | null;
    payment_terms: string | null;
    contact_persons: ContactPerson[] | null;
    credit_amount: string | number;
    status: 'active' | 'inactive';
    logs?: EntityLog[];
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};
