// js/hooks/use-formatters.ts
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import { formatAmount, formatDate, formatTime, formatDateTime } from '@/lib/formatters';

export function useFormatters() {
    const { preferences } = usePage<SharedData>().props;

    return {
        formatAmount: (amount: number | null | undefined, prefix?: string) =>
            formatAmount(amount, {
                decimals: preferences.decimal_places,
                prefix,
            }),
        formatDate: (date: string | null | undefined, format?: 'short' | 'long') =>
            formatDate(date, {
                format,
                timezone: preferences.timezone,
            }),
        formatTime: (date: string | null | undefined, format?: '12h' | '24h') =>
            formatTime(date, {
                format,
                timezone: preferences.timezone,
            }),
        formatDateTime: (date: string | null | undefined) =>
            formatDateTime(date, {
                timezone: preferences.timezone,
            }),
    };
}
