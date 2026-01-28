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

export type Destination = {
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

export type Material = {
    id: number;
    code: string;
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
    unit_cost: number | number;
    unit_price: number | number;
    status: 'active' | 'inactive';
    track_serial_number: boolean;
    track_batch_number: boolean;
    brand_id: number | null;
    category_id: number | null;
    uom_id: number | null;
    brand?: Brand;
    category?: Category;
    uom?: Uom;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

export type ContactPerson = {
    name: string;
    email: string;
    phone: string;
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
    credit_amount: number | number;
    status: 'active' | 'inactive';
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
    credit_amount: number | number;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};
