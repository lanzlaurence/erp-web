import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import AppLayout from '@/layouts/app-layout';
import type { GoodsReceiptShowData } from '@/types';
import type { GoodsReceiptStatus } from '@/types/transactions';
import { useFormatters } from '@/hooks/use-formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ClickableCode from '@/components/ui/clickable-code';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import type { GoodsReceiptItem, TransactionLog } from '@/types/transactions';

const STATUS_BADGE: Record<GoodsReceiptStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    pending:   { label: 'Pending',   variant: 'secondary' },
    completed: { label: 'Completed', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'destructive' },
};

type ConfirmAction = {
    open: boolean;
    action: 'complete' | 'cancel' | 'revert' | 'delete' | null;
    label: string;
    description: string;
};

export default function Show({ goodsReceipt }: GoodsReceiptShowData) {
    const { formatAmount, formatDate, formatDateTime, formatDecimal } = useFormatters();
    const { hasPermission } = usePermissions();
    const badge = STATUS_BADGE[goodsReceipt.status];
    const poIsCancelled = goodsReceipt.purchase_order?.status === 'cancelled';

    const [confirm, setConfirm] = useState<ConfirmAction>({ open: false, action: null, label: '', description: '' });

    const triggerAction = (action: ConfirmAction['action'], label: string, description: string) => {
        setConfirm({ open: true, action, label, description });
    };

    const handleConfirm = () => {
        if (!confirm.action) return;
        if (confirm.action === 'delete') {
            router.delete(`/goods-receipts/${goodsReceipt.id}`);
        } else {
            router.post(`/goods-receipts/${goodsReceipt.id}/${confirm.action}`);
        }
        setConfirm({ open: false, action: null, label: '', description: '' });
    };

    const { preferences } = usePage<SharedData>().props;

    const itemColumns: ColumnDef<GoodsReceiptItem>[] = [
        {
            accessorKey: 'material',
            header: 'Material',
            size: 200,
            accessorFn: (row) => row.material?.name ?? '',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium text-sm">{row.original.material?.name}</p>
                    <p className="text-xs text-muted-foreground">{row.original.material?.code}</p>
                </div>
            ),
        },
        {
            accessorKey: 'qty_ordered',
            header: 'Qty Ordered',
            size: 120,
            cell: ({ row }) => <span className="font-mono">{formatDecimal(Number(row.original.qty_ordered))}</span>,
        },
        {
            accessorKey: 'qty_received',
            header: 'Qty Received',
            size: 120,
            cell: ({ row }) => <span className="font-mono">{formatDecimal(Number(row.original.qty_received))}</span>,
        },
        {
            accessorKey: 'qty_to_receive',
            header: 'Qty to Receive',
            size: 130,
            cell: ({ row }) => <span className="font-mono font-medium">{formatDecimal(Number(row.original.qty_to_receive))}</span>,
        },
        {
            accessorKey: 'qty_remaining',
            header: 'Qty Remaining',
            size: 130,
            cell: ({ row }) => <span className="font-mono">{formatDecimal(Number(row.original.qty_remaining))}</span>,
        },
        {
            accessorKey: 'unit_cost',
            header: 'Unit Cost',
            size: 120,
            cell: ({ row }) => <span className="font-mono">{formatAmount(Number(row.original.unit_cost))}</span>,
        },
        {
            accessorKey: 'serial_number',
            header: 'Serial No.',
            size: 130,
            cell: ({ row }) => <span className="text-sm">{row.original.serial_number || '-'}</span>,
        },
        {
            accessorKey: 'batch_number',
            header: 'Batch No.',
            size: 130,
            cell: ({ row }) => <span className="text-sm">{row.original.batch_number || '-'}</span>,
        },
        {
            accessorKey: 'remarks',
            header: 'Remarks',
            size: 180,
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.remarks || '-'}</span>,
        },
    ];

    const logColumns: ColumnDef<TransactionLog>[] = [
        {
            accessorKey: 'created_at',
            header: 'Date & Time',
            size: 160,
            accessorFn: (row) => formatDateTime(row.created_at),
            cell: ({ row }) => <span className="text-sm whitespace-nowrap">{formatDateTime(row.original.created_at)}</span>,
        },
        {
            accessorKey: 'user',
            header: 'By',
            size: 140,
            accessorFn: (row) => row.user?.name ?? '',
            cell: ({ row }) => <span className="font-medium text-sm">{row.original.user?.name ?? '-'}</span>,
        },
        {
            accessorKey: 'action',
            header: 'Action',
            size: 120,
            cell: ({ row }) => <span className="text-sm">{row.original.action}</span>,
        },
        {
            accessorKey: 'from_status',
            header: 'Status Change',
            size: 180,
            cell: ({ row }) => {
                const { from_status, to_status } = row.original;
                if (from_status && to_status) return (
                    <span className="text-sm">
                        <span className="text-muted-foreground">{from_status}</span>
                        <span className="mx-1">→</span>
                        <span className="font-medium">{to_status}</span>
                    </span>
                );
                return <span className="text-sm text-muted-foreground">-</span>;
            },
        },
        {
            accessorKey: 'remarks',
            header: 'Remarks',
            size: 200,
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.remarks || '-'}</span>,
        },
    ];

    return (
        <>
            <Head title={`GR ${goodsReceipt.code}`} />
            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold">{goodsReceipt.code}</h1>
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Created by {goodsReceipt.user?.name} on {formatDateTime(goodsReceipt.created_at)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/goods-receipts"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
                        </Button>
                        {hasPermission('goods-receipt-edit') && goodsReceipt.status === 'pending' && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/goods-receipts/${goodsReceipt.id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit</Link>
                            </Button>
                        )}
                        {hasPermission('goods-receipt-complete') && goodsReceipt.status === 'pending' && (
                            <Button size="sm"
                                onClick={() => triggerAction('complete', 'Complete Goods Receipt', 'This will receive the items and update inventory.')}>
                                <CheckCircle className="mr-2 h-4 w-4" />Complete
                            </Button>
                        )}
                        {hasPermission('goods-receipt-revert') && goodsReceipt.status === 'cancelled' && !poIsCancelled && (
                            <Button size="sm" variant="outline"
                                onClick={() => triggerAction('revert', 'Revert to Pending', 'This will revert the goods receipt back to pending. Inventory will NOT be restored — you must complete again.')}>
                                <RotateCcw className="mr-2 h-4 w-4" />Revert to Pending
                            </Button>
                        )}
                        {hasPermission('goods-receipt-cancel') && ['pending', 'completed'].includes(goodsReceipt.status) && (
                            <Button size="sm" variant="destructive"
                                onClick={() => triggerAction('cancel', 'Cancel Goods Receipt',
                                    goodsReceipt.status === 'completed'
                                        ? 'This will cancel the GR and REVERSE the inventory that was received.'
                                        : 'This will cancel the goods receipt.')}>
                                <XCircle className="mr-2 h-4 w-4" />Cancel
                            </Button>
                        )}
                        {hasPermission('goods-receipt-delete') && goodsReceipt.status === 'pending' && (
                            <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-600"
                                onClick={() => triggerAction('delete', 'Delete Goods Receipt', 'This will permanently delete this goods receipt. This action cannot be undone.')}>
                                <Trash2 className="mr-2 h-4 w-4" />Delete
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-4 rounded-lg border p-6">
                    <h3 className="font-semibold">Receipt Information</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Purchase Order</p>
                            <ClickableCode href={`/purchase-orders/${goodsReceipt.purchase_order?.id}`} value={goodsReceipt.purchase_order?.code} />
                        </div>
                        <div>
                            <p className="text-muted-foreground">Vendor</p>
                            <ClickableCode href={`/vendors/${goodsReceipt.purchase_order?.vendor?.id}`} value={goodsReceipt.purchase_order?.vendor?.name} />
                        </div>
                        <div>
                            <p className="text-muted-foreground">Location</p>
                            <p>{goodsReceipt.location?.name}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">GR Date</p>
                            <p>{formatDate(goodsReceipt.gr_date)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Transaction Date</p>
                            <p>{formatDate(goodsReceipt.transaction_date)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Created By</p>
                            <p>{goodsReceipt.user?.name}</p>
                        </div>
                    </div>
                    {goodsReceipt.remarks && (
                        <div>
                            <p className="text-sm text-muted-foreground">Remarks</p>
                            <p className="text-sm">{goodsReceipt.remarks}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-4 rounded-lg border p-6">
                    <h3 className="font-semibold">Items</h3>
                    <DataTable
                        columns={itemColumns}
                        data={goodsReceipt.items ?? []}
                        timezone={preferences.timezone}
                        storageKey="gr-show-items"
                    />
                </div>

                {goodsReceipt.logs && goodsReceipt.logs.length > 0 && (
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Transaction Log</h3>
                        <DataTable
                            columns={logColumns}
                            data={goodsReceipt.logs}
                            timezone={preferences.timezone}
                            storageKey="gr-show-logs"
                        />
                    </div>
                )}
            </div>

            <AlertDialog open={confirm.open} onOpenChange={(open) => setConfirm({ ...confirm, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirm.label}</AlertDialogTitle>
                        <AlertDialogDescription>{confirm.description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Goods Receipts', href: '/goods-receipts' },
        { title: 'View', href: '#' },
    ]}>{page}</AppLayout>
);
