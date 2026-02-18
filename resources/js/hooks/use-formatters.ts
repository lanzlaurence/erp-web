// js/hooks/use-formatters.ts
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import { formatAmount, formatDate, formatTime, formatDateTime } from '@/lib/formatters';
import { getCurrency } from '@/lib/currencies';

export function useFormatters() {
    const { preferences } = usePage<SharedData>().props;
    const currency = getCurrency(preferences.currency ?? 'PHP');

    return {
        currency,
        formatAmount: (amount: number | null | undefined) =>
            formatAmount(amount, {
                decimals: preferences.decimal_places,
                symbol: currency.symbol,
            }),
        formatDecimal: (value: number): string =>
            value.toFixed(preferences.decimal_places),
        getDecimalPlaces: (): number =>
            preferences.decimal_places,
        formatDate: (date: string | null | undefined, format?: 'short' | 'long') =>
            formatDate(date, { format, timezone: preferences.timezone }),
        formatTime: (date: string | null | undefined, format?: '12h' | '24h') =>
            formatTime(date, { format, timezone: preferences.timezone }),
        formatDateTime: (date: string | null | undefined) =>
            formatDateTime(date, { timezone: preferences.timezone }),
    };
}
