import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { useFormatters } from '@/hooks/use-formatters';
import { Head, Link } from '@inertiajs/react';
import type { PaginatedData } from '@/types';
import type { TransactionLog } from '@/types/transactions';

type Props = {
    logs: PaginatedData<TransactionLog>;
};

const ACTION_BADGE: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success'> = {
    created:            'secondary',
    posted:             'default',
    updated:            'outline',
    completed:          'success',
    cancelled:          'destructive',
    reverted:           'outline',
    gr_created:         'secondary',
    gr_completed:       'success',
    status_recalculated: 'outline',
    status_updated:     'outline',
};

export default function TransactionLogPage({ logs }: Props) {
    const { formatDateTime } = useFormatters();

    const getReference = (log: TransactionLog) => {
        if (!log.loggable_type) return '-';
        const type = log.loggable_type.split('\\').pop(); // e.g. PurchaseOrder, GoodsReceipt
        return type?.replace(/([A-Z])/g, ' $1').trim() ?? '-';
    };

    const getHref = (log: TransactionLog) => {
        const type = log.loggable_type?.split('\\').pop();
        if (type === 'PurchaseOrder') return `/purchase-orders/${log.loggable_id}`;
        if (type === 'GoodsReceipt')  return `/goods-receipts/${log.loggable_id}`;
        return null;
    };

    return (
        <>
            <Head title="Transaction Log" />
            <div className="space-y-4 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Transaction Log</h1>
                    <p className="text-sm text-muted-foreground">Audit trail for purchase orders and goods receipts</p>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Document Type</TableHead>
                                <TableHead>Document</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Status Change</TableHead>
                                <TableHead>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                                        No transaction logs available.
                                    </TableCell>
                                </TableRow>
                            ) : logs.data.map((log) => {
                                const href      = getHref(log);
                                const docType   = getReference(log);
                                const badgeVariant = ACTION_BADGE[log.action] ?? 'secondary';

                                return (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                            {formatDateTime(log.created_at)}
                                        </TableCell>
                                        <TableCell className="font-medium text-sm">
                                            {log.user?.name ?? '-'}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {docType}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {href ? (
                                                <Link href={href} className="text-primary hover:underline">
                                                    #{log.loggable_id}
                                                </Link>
                                            ) : (
                                                <span>#{log.loggable_id}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={badgeVariant}>
                                                {log.action.replace(/_/g, ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {log.from_status && log.to_status ? (
                                                <span>
                                                    <span className="text-muted-foreground">{log.from_status.replace(/_/g, ' ')}</span>
                                                    <span className="mx-1">→</span>
                                                    <span className="font-medium">{log.to_status.replace(/_/g, ' ')}</span>
                                                </span>
                                            ) : log.to_status ? (
                                                <span className="font-medium">{log.to_status.replace(/_/g, ' ')}</span>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                            {log.remarks || '-'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {logs.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <p>Showing {logs.from}–{logs.to} of {logs.total} logs</p>
                        <div className="flex gap-1">
                            {logs.links.map((link, i) => (
                                link.url ? (
                                    <Link key={i} href={link.url}
                                        className={`px-3 py-1 rounded border text-sm ${link.active ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span key={i}
                                        className="px-3 py-1 rounded border border-border text-muted-foreground opacity-50 text-sm"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                        </div>
                    </div>
                )}
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
