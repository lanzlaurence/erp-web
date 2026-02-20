// js/lib/formatters.ts

// Amount & Currency
export function formatAmount(
    amount: number | null | undefined,
    options?: {
        decimals?: number;
        symbol?: string;
    }
): string {
    if (amount === null || amount === undefined) return '0.00';

    const decimals = options?.decimals ?? 2;
    const symbol = options?.symbol ? `${options.symbol} ` : '';

    return (
        symbol +
        amount.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        })
    );
}

// Date
export function formatDate(
    dateString: string | null | undefined,
    options?: {
        format?: 'short' | 'long';
        date_format?: string;
        timezone?: string;
    }
): string {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const tz = options?.timezone ?? 'UTC';

    // Use explicit date_format if provided
    if (options?.date_format) {
        const d = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).formatToParts(date);

        const parts: Record<string, string> = {};
        d.forEach(({ type, value }) => (parts[type] = value));

        const monthShort = date.toLocaleDateString('en-US', { timeZone: tz, month: 'short' });
        const monthLong = date.toLocaleDateString('en-US', { timeZone: tz, month: 'long' });

        return options.date_format
            .replace('YYYY', parts.year)
            .replace('MMMM', monthLong)
            .replace('MMM', monthShort)
            .replace('MM', parts.month)
            .replace('DD', parts.day);
    }

    if (options?.format === 'long') {
        return date.toLocaleDateString('en-US', {
            timeZone: tz,
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    }

    return date.toLocaleDateString('en-US', {
        timeZone: tz,
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });
}

// Time
export function formatTime(
    dateString: string | null | undefined,
    options?: {
        format?: '12h' | '24h';
        timezone?: string;
    }
): string {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const tz = options?.timezone ?? 'UTC';

    return date.toLocaleTimeString('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: (options?.format ?? '12h') === '12h',
    });
}

// Date & Time
export function formatDateTime(
    dateString: string | null | undefined,
    options?: {
        dateFormat?: 'short' | 'long';
        date_format?: string;
        timeFormat?: '12h' | '24h';
        timezone?: string;
    }
): string {
    if (!dateString) return 'N/A';
    const tz = options?.timezone ?? 'UTC';
    const dateStr = formatDate(dateString, {
        format: options?.dateFormat,
        date_format: options?.date_format,
        timezone: tz,
    });
    const timeStr = formatTime(dateString, { format: options?.timeFormat, timezone: tz });
    return `${dateStr} ${timeStr}`;
}
