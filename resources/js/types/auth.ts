// resources/js/types/auth.ts
export type Permission = {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
};

export type Role = {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
};

export type User = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    password_changed_at: string | null;
    avatar?: string;
    force_password_change: boolean;
    is_active: boolean;
    is_locked: boolean;
    login_attempts: number;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    roles?: Role[];
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
