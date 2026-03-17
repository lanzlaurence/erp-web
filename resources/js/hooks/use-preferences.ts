// js/hooks/use-preferences.ts
import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function usePreferences() {
    const { preferences } = usePage<SharedData>().props;

    const getAppName = (): string => preferences.app_name;
    const getAppLogo = (): string => preferences.app_logo;

    return {
        preferences,
        getAppName,
        getAppLogo,
    };
}
