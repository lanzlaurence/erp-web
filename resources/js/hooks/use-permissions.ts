// resources/js/hooks/use-permissions.ts
import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function usePermissions() {
    const { auth } = usePage<SharedData>().props;

    const hasPermission = (permission: string): boolean => {
        if (!auth.user?.roles) return false;

        return auth.user.roles.some((role) =>
            role.permissions?.some((p) => p.name === permission),
        );
    };

    const hasAnyPermission = (permissions: string[]): boolean => {
        return permissions.some((permission) => hasPermission(permission));
    };

    const hasAllPermissions = (permissions: string[]): boolean => {
        return permissions.every((permission) => hasPermission(permission));
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
}
