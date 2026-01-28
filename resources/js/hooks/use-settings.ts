import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function usePreferences() {
    const { preferences } = usePage<SharedData>().props;

    const formatDecimal = (value: number): string => {
        return value.toFixed(preferences.decimal_places);
    };

    return {
        ...preferences,
        formatDecimal,
    };
}
