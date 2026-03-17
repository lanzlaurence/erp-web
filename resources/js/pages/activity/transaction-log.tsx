import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useFormatters } from '@/hooks/use-formatters';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { usePage } from '@inertiajs/react';
import ClickableCode from '@/components/ui/clickable-code';
import type { SharedData, TransactionLogPageData, TransactionLogRow } from '@/types';

const ACTION_BADGE: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success'> = {
    created:              'secondary',
    posted:               'default',
    updated:              'outline',
    completed:            'success',
    cancelled:            'destructive',
    reverted:             'outline',
    gr_created:           'secondary',
    gr_completed:         'success',
    status_recalculated:  'outline',
    status_updated:       'outline',
};

const getHref = (log: TransactionLogRow): string | null => {
    const type = log.loggable_type?.split('\\').pop();
    if (type === 'PurchaseOrder') return `/purchase-orders/${log.loggable_id}`;
    if (type === 'GoodsReceipt')  return `/goods-receipts/${log.loggable_id}`;
    if (type === 'SalesOrder')    return `/sales-orders/${log.loggable_id}`;
    if (type === 'GoodsIssue')    return `/goods-issues/${log.loggable_id}`;
    return null;
};

const getDocType = (log: TransactionLogRow): string => {
    const type = log.loggable_type?.split('\\').pop();
    return type?.replace(/([A-Z])/g, ' $1').trim() ?? '-';
};

export default function TransactionLogPage({ logs }: TransactionLogPageData) {
    const { formatDateTime } = useFormatters();
    const { preferences } = usePage<SharedData>().props;

    const columns: ColumnDef<TransactionLogRow>[] = [
        {
            accessorKey: 'created_at',
            header: 'Date & Time',
            size: 160,
            cell: ({ row }) => <span className="text-sm whitespace-nowrap">{formatDateTime(row.original.created_at)}</span>,
        },
        {
            accessorKey: 'user_name',
            header: 'User',
            size: 140,
            cell: ({ row }) => <span className="font-medium text-sm">{row.original.user_name ?? '-'}</span>,
        },
        {
            accessorKey: 'loggable_type',
            header: 'Document Type',
            size: 160,
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{getDocType(row.original)}</span>,
        },
        {
            accessorKey: 'loggable_code',
            header: 'Document',
            size: 150,
            cell: ({ row }) => {
                const href = getHref(row.original);
                return href ? (
                    <ClickableCode href={href} value={row.original.loggable_code ?? `#${row.original.loggable_id}`} />
                ) : (
                    <span className="font-mono text-sm text-muted-foreground">#{row.original.loggable_id}</span>
                );
            },
        },
        {
            accessorKey: 'action',
            header: 'Action',
            size: 140,
            cell: ({ row }) => (
                <Badge variant={ACTION_BADGE[row.original.action] ?? 'secondary'}>
                    {row.original.action.replace(/_/g, ' ')}
                </Badge>
            ),
        },
        {
            accessorKey: 'from_status',
            header: 'Status Change',
            size: 180,
            cell: ({ row }) => {
                const { from_status, to_status } = row.original;
                if (from_status && to_status) return (
                    <span className="text-sm">
                        <span className="text-muted-foreground">{from_status.replace(/_/g, ' ')}</span>
                        <span className="mx-1">→</span>
                        <span className="font-medium">{to_status.replace(/_/g, ' ')}</span>
                    </span>
                );
                if (to_status) return <span className="text-sm font-medium">{to_status.replace(/_/g, ' ')}</span>;
                return <span className="text-sm text-muted-foreground">-</span>;
            },
        },
        {
            accessorKey: 'remarks',
            header: 'Remarks',
            size: 200,
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.remarks ?? '-'}</span>,
        },
    ];

    return (
        <>
            <Head title="Transaction Log" />
            <div className="space-y-4 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Transaction Log</h1>
                    <p className="text-sm text-muted-foreground">Audit trail for all transactions</p>
                </div>
                <DataTable
                    columns={columns}
                    data={logs}
                    exportFileName="transaction-log"
                    timezone={preferences.timezone}
                    storageKey="transaction-log"
                />
            </div>
        </>
    );
}

TransactionLogPage.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Activity', href: '#' },
        { title: 'Transaction Log', href: '/activity/transaction-log' },
    ]}>{page}</AppLayout>
);
