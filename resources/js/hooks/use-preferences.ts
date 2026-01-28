import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function usePreferences() {
    const { preferences } = usePage<SharedData>().props;

    /**
     * Format a number to the configured decimal places
     */
    const formatDecimal = (value: number): string => {
        return value.toFixed(preferences.decimal_places);
    };

    /**
     * Get app name
     */
    const getAppName = (): string => {
        return preferences.app_name;
    };

    /**
     * Get app logo URL
     */
    const getAppLogo = (): string => {
        return preferences.app_logo;
    };

    /**
     * Get decimal places setting
     */
    const getDecimalPlaces = (): number => {
        return preferences.decimal_places;
    };

    return {
        preferences,
        formatDecimal,
        getAppName,
        getAppLogo,
        getDecimalPlaces,
    };
}
