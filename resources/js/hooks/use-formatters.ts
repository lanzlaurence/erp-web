// js/hooks/use-formatters.ts
import { usePage } from '@inertiajs/react';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import type { SharedData } from '@/types';
import { formatAmount as _formatAmount, formatDate, formatTime, formatDateTime } from '@/lib/formatters';

export function useFormatters() {
    const { preferences, currencies } = usePage<SharedData>().props;
    const currency = (currencies as { code: string; name: string; symbol: string }[])
        ?.find((c) => c.code === (preferences.currency ?? 'PHP'))
        ?? { code: 'PHP', name: 'Philippine Peso', symbol: '₱' };

    const fmt = (amount: number | null | undefined) =>
        _formatAmount(Math.abs(amount ?? 0), {
            decimals: preferences.decimal_places,
            symbol: currency.symbol,
        });

    return {
        currency,
        formatAmount: (amount: number | null | undefined): ReactNode => {
            const num = amount ?? 0;
            if (num < 0) {
                return createElement('span', { className: 'text-red-600' }, `-${fmt(num)}`);
            }
            return fmt(num);
        },
        formatDecimal: (value: number): ReactNode => {
            const formatted = value.toFixed(preferences.decimal_places);
            if (value < 0) {
                return createElement('span', { className: 'text-red-600' }, formatted);
            }
            return formatted;
        },
        getDecimalPlaces: (): number =>
            preferences.decimal_places,
        formatDate: (date: string | null | undefined, format?: 'short' | 'long') =>
            formatDate(date, {
                format,
                date_format: preferences.date_format,
                timezone: preferences.timezone,
            }),
        formatTime: (date: string | null | undefined, format?: '12h' | '24h') =>
            formatTime(date, {
                format: format ?? preferences.time_format,
                timezone: preferences.timezone,
            }),
        formatDateTime: (date: string | null | undefined) =>
            formatDateTime(date, {
                date_format: preferences.date_format,
                timeFormat: preferences.time_format,
                timezone: preferences.timezone,
            }),
    };
}
