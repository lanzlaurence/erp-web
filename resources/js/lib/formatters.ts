// js/lib/formatters.ts

// Amount
export function formatAmount(
    amount: number | null | undefined,
    options?: {
        decimals?: number;
        prefix?: string;
    }
): string {
    if (amount === null || amount === undefined) return '0.00';

    const decimals = options?.decimals ?? 2;
    const prefix = options?.prefix ?? '';

    return (
        prefix +
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
        timezone?: string;
    }
): string {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const tz = options?.timezone ?? 'UTC';

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
        timeFormat?: '12h' | '24h';
        timezone?: string;
    }
): string {
    if (!dateString) return 'N/A';

    const tz = options?.timezone ?? 'UTC';
    const dateStr = formatDate(dateString, { format: options?.dateFormat, timezone: tz });
    const timeStr = formatTime(dateString, { format: options?.timeFormat, timezone: tz });

    return `${dateStr} ${timeStr}`;
}
