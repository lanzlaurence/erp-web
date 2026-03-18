import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import AppLayout from '@/layouts/app-layout';
import type { SalesOrderShowData } from '@/types';
import type { SalesOrderStatus } from '@/types/transactions';
import { useFormatters } from '@/hooks/use-formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, CheckCircle, XCircle, RotateCcw, PackageCheck, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ClickableCode from '@/components/ui/clickable-code';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import type { SalesOrderItem, SalesOrderCharge, GoodsIssue, TransactionLog } from '@/types/transactions';

const STATUS_BADGE: Record<SalesOrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    draft:             { label: 'Draft',           variant: 'secondary' },
    posted:            { label: 'Posted',          variant: 'default' },
    partially_shipped: { label: 'Partial Shipped', variant: 'outline' },
    fully_shipped:     { label: 'Fully Shipped',   variant: 'success' },
    cancelled:         { label: 'Cancelled',       variant: 'destructive' },
};

type ConfirmAction = {
    open: boolean;
    action: 'post' | 'cancel' | 'revert' | 'delete' | null;
    label: string;
    description: string;
};

export default function Show({ salesOrder }: SalesOrderShowData) {
    const { formatAmount, formatDate, formatDateTime } = useFormatters();
    const { hasPermission } = usePermissions();
    const badge = STATUS_BADGE[salesOrder.status];

    const [confirm, setConfirm] = useState<ConfirmAction>({ open: false, action: null, label: '', description: '' });

    const triggerAction = (action: ConfirmAction['action'], label: string, description: string) => {
        setConfirm({ open: true, action, label, description });
    };

    const handleConfirm = () => {
        if (!confirm.action) return;
        if (confirm.action === 'delete') {
            router.delete(`/sales-orders/${salesOrder.id}`);
        } else {
            router.post(`/sales-orders/${salesOrder.id}/${confirm.action}`);
        }
        setConfirm({ open: false, action: null, label: '', description: '' });
    };

    const { preferences } = usePage<SharedData>().props;

    const soItemColumns: ColumnDef<SalesOrderItem>[] = [
        {
            accessorKey: 'line_number',
            header: '#',
            size: 50,
            cell: ({ row }) => row.original.line_number,
        },
        {
            accessorKey: 'material',
            header: 'Material',
            size: 200,
            accessorFn: (row) => row.material?.name ?? '',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.material?.name}</p>
                    <p className="text-xs text-muted-foreground">{row.original.material?.code}</p>
                </div>
            ),
        },
        {
            accessorKey: 'qty_ordered',
            header: 'Qty Ordered',
            size: 120,
            cell: ({ row }) => <span className="font-mono">{Number(row.original.qty_ordered).toFixed(2)}</span>,
        },
        {
            accessorKey: 'qty_shipped',
            header: 'Qty Shipped',
            size: 120,
            cell: ({ row }) => <span className="font-mono">{Number(row.original.qty_shipped).toFixed(2)}</span>,
        },
        {
            accessorKey: 'unit_price',
            header: 'Unit Price',
            size: 120,
            cell: ({ row }) => <span className="font-mono">{formatAmount(Number(row.original.unit_price))}</span>,
        },
        {
            accessorKey: 'discount_type',
            header: 'Discount',
            size: 110,
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.discount_type
                        ? row.original.discount_type === 'percentage'
                            ? `${row.original.discount_amount}%`
                            : formatAmount(Number(row.original.discount_amount))
                        : '-'}
                </span>
            ),
        },
        {
            accessorKey: 'unit_price_after_discount',
            header: 'After Disc.',
            size: 120,
            cell: ({ row }) => <span className="font-mono">{formatAmount(Number(row.original.unit_price_after_discount))}</span>,
        },
        {
            accessorKey: 'net_price',
            header: 'Net Price',
            size: 120,
            cell: ({ row }) => <span className="font-mono">{formatAmount(Number(row.original.net_price))}</span>,
        },
        {
            accessorKey: 'vat_price',
            header: 'VAT',
            size: 110,
            cell: ({ row }) => (
                <span className="font-mono text-sm">
                    {row.original.is_vatable ? formatAmount(Number(row.original.vat_price)) : '-'}
                </span>
            ),
        },
        {
            accessorKey: 'gross_price',
            header: 'Gross Price',
            size: 120,
            cell: ({ row }) => <span className="font-mono font-medium">{formatAmount(Number(row.original.gross_price))}</span>,
        },
        {
            accessorKey: 'remarks',
            header: 'Remarks',
            size: 180,
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.remarks || '-'}</span>,
        },
    ];

    const soChargeColumns: ColumnDef<SalesOrderCharge>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            size: 160,
            cell: ({ row }) => row.original.name,
        },
        {
            accessorKey: 'type',
            header: 'Type',
            size: 100,
            cell: ({ row }) => (
                <Badge variant={row.original.type === 'tax' ? 'default' : 'destructive'}>{row.original.type}</Badge>
            ),
        },
        {
            accessorKey: 'value',
            header: 'Value',
            size: 120,
            cell: ({ row }) => row.original.value_type === 'percentage'
                ? `${row.original.value}%`
                : formatAmount(Number(row.original.value)),
        },
        {
            accessorKey: 'computed_amount',
            header: 'Computed Amount',
            size: 150,
            cell: ({ row }) => <span className="font-mono">{formatAmount(Number(row.original.computed_amount))}</span>,
        },
    ];

    const giColumns: ColumnDef<GoodsIssue>[] = [
        {
            accessorKey: 'code',
            header: 'GI Code',
            size: 140,
            cell: ({ row }) => <ClickableCode href={`/goods-issues/${row.original.id}`} value={row.original.code} />,
        },
        {
            accessorKey: 'location',
            header: 'Location',
            size: 150,
            accessorFn: (row) => row.location?.name ?? '',
            cell: ({ row }) => row.original.location?.name,
        },
        {
            accessorKey: 'gi_date',
            header: 'GI Date',
            size: 120,
            cell: ({ row }) => formatDate(row.original.gi_date),
        },
        {
            accessorKey: 'transaction_date',
            header: 'Transaction Date',
            size: 140,
            cell: ({ row }) => formatDate(row.original.transaction_date),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            size: 110,
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'completed' ? 'success' : row.original.status === 'cancelled' ? 'destructive' : 'secondary'}>
                    {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
                </Badge>
            ),
        },
        {
            accessorKey: 'user',
            header: 'Created By',
            size: 140,
            accessorFn: (row) => row.user?.name ?? '',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.user?.name}</span>,
        },
        {
            id: 'actions',
            header: 'Actions',
            enableSorting: false,
            enableColumnFilter: false,
            size: 80,
            cell: ({ row }) => hasPermission('goods-issue-view') ? (
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/goods-issues/${row.original.id}`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                        <Eye className="h-4 w-4" />
                        <span className="text-[10px] leading-none">View</span>
                    </Link>
                </Button>
            ) : null,
        },
    ];

    const soLogColumns: ColumnDef<TransactionLog>[] = [
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
            <Head title={`SO ${salesOrder.code}`} />
            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold">{salesOrder.code}</h1>
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Created by {salesOrder.user?.name} on {formatDateTime(salesOrder.created_at)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/sales-orders"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
                        </Button>
                        {hasPermission('sales-order-edit') && salesOrder.status === 'draft' && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/sales-orders/${salesOrder.id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit</Link>
                            </Button>
                        )}
                        {hasPermission('sales-order-post') && salesOrder.status === 'draft' && (
                            <Button size="sm"
                                onClick={() => triggerAction('post', 'Post Sales Order', 'This will post the sales order and lock it from editing.')}>
                                <CheckCircle className="mr-2 h-4 w-4" />Post
                            </Button>
                        )}
                        {hasPermission('sales-order-revert') && ['posted', 'cancelled'].includes(salesOrder.status) && (
                            <Button size="sm" variant="outline"
                                onClick={() => triggerAction('revert', 'Revert to Draft', 'This will revert the sales order back to draft status.')}>
                                <RotateCcw className="mr-2 h-4 w-4" />Revert to Draft
                            </Button>
                        )}
                        {hasPermission('goods-issue-create') && ['posted', 'partially_shipped'].includes(salesOrder.status) && (
                            <Button size="sm" asChild>
                                <Link href={`/sales-orders/${salesOrder.id}/goods-issues/create`}>
                                    <PackageCheck className="mr-2 h-4 w-4" />Create GI
                                </Link>
                            </Button>
                        )}
                        {hasPermission('sales-order-cancel') && salesOrder.status !== 'cancelled' && (
                            <Button size="sm" variant="destructive"
                                onClick={() => triggerAction('cancel', 'Cancel Sales Order',
                                    'This will cancel the sales order and ALL related goods issues. Completed GIs will have their inventory restored.')}>
                                <XCircle className="mr-2 h-4 w-4" />Cancel
                            </Button>
                        )}
                        {hasPermission('sales-order-delete') && salesOrder.status === 'draft' && (
                            <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-600"
                                onClick={() => triggerAction('delete', 'Delete Sales Order', 'This will permanently delete this sales order and all related goods issues. This action cannot be undone.')}>
                                <Trash2 className="mr-2 h-4 w-4" />Delete
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Order Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Customer</p>
                                <ClickableCode href={`/customers/${salesOrder.customer?.id}`} value={salesOrder.customer?.name} />
                            </div>
                            <div>
                                <p className="text-muted-foreground">Reference No.</p>
                                <p>{salesOrder.reference_no || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Order Date</p>
                                <p>{formatDate(salesOrder.order_date)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Delivery Date</p>
                                <p>{salesOrder.delivery_date ? formatDate(salesOrder.delivery_date) : '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Payment Terms</p>
                                <p>{salesOrder.customer?.payment_terms || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Credit Amount</p>
                                <p className="font-mono">{formatAmount(Number(salesOrder.customer?.credit_amount ?? 0))}</p>
                            </div>
                        </div>
                        {salesOrder.remarks && (
                            <div>
                                <p className="text-sm text-muted-foreground">Remarks</p>
                                <p className="text-sm">{salesOrder.remarks}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 rounded-lg border p-6">
                        <h3 className="font-semibold">Summary</h3>
                        <div className="space-y-2 text-sm">
                            {[
                                { label: 'Total Before Discount', value: Number(salesOrder.total_before_discount) },
                                { label: 'Total Item Discount',   value: -Number(salesOrder.total_item_discount) },
                                { label: 'Total Net Price',       value: Number(salesOrder.total_net_price) },
                                { label: 'Total VAT',             value: Number(salesOrder.total_vat) },
                                { label: 'Total Gross',           value: Number(salesOrder.total_gross) },
                                { label: 'Header Discount',       value: -Number(salesOrder.header_discount_total) },
                                { label: 'Total Charges',         value: Number(salesOrder.total_charges) },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between">
                                    <span className="text-muted-foreground">{label}</span>
                                    <span className={`font-mono ${value < 0 ? 'text-red-600' : ''}`}>
                                        {value < 0 ? '-' : ''}{formatAmount(Math.abs(value))}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between border-t pt-2 font-semibold">
                                <span>Grand Total</span>
                                <span className="font-mono">{formatAmount(Number(salesOrder.grand_total))}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 rounded-lg border p-6">
                    <h3 className="font-semibold">Items</h3>
                    <DataTable
                        columns={soItemColumns}
                        data={salesOrder.items ?? []}
                        timezone={preferences.timezone}
                        storageKey="so-show-items"
                    />
                </div>

                {salesOrder.charges && salesOrder.charges.length > 0 && (
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Charges</h3>
                        <DataTable
                            columns={soChargeColumns}
                            data={salesOrder.charges}
                            timezone={preferences.timezone}
                            storageKey="so-show-charges"
                        />
                    </div>
                )}

                {salesOrder.goods_issues && salesOrder.goods_issues.length > 0 && (
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">
                            Goods Issues
                            <span className="ml-2 text-sm font-normal text-muted-foreground">({salesOrder.goods_issues.length})</span>
                        </h3>
                        <DataTable
                            columns={giColumns}
                            data={salesOrder.goods_issues}
                            timezone={preferences.timezone}
                            storageKey="so-show-gis"
                        />
                    </div>
                )}

                {salesOrder.logs && salesOrder.logs.length > 0 && (
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Transaction Log</h3>
                        <DataTable
                            columns={soLogColumns}
                            data={salesOrder.logs}
                            timezone={preferences.timezone}
                            storageKey="so-show-logs"
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
        { title: 'Sales Orders', href: '/sales-orders' },
        { title: 'View', href: '#' },
    ]}>{page}</AppLayout>
);
