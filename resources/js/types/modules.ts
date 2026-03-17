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
