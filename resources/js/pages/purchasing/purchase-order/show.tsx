import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import AppLayout from '@/layouts/app-layout';
import type { PurchaseOrderShowData } from '@/types';
import type { PurchaseOrderStatus } from '@/types/transactions';
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
import type {
    PurchaseOrderItem, PurchaseOrderCharge, GoodsReceipt,
    TransactionLog
} from '@/types/transactions';

const STATUS_BADGE: Record<PurchaseOrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    draft:              { label: 'Draft',            variant: 'secondary' },
    posted:             { label: 'Posted',           variant: 'default' },
    partially_received: { label: 'Partial Received', variant: 'outline' },
    fully_received:     { label: 'Fully Received',   variant: 'success' },
    cancelled:          { label: 'Cancelled',        variant: 'destructive' },
};

type ConfirmAction = {
    open: boolean;
    action: 'post' | 'cancel' | 'revert' | 'delete' | null;
    label: string;
    description: string;
};

export default function Show({ purchaseOrder }: PurchaseOrderShowData) {
    const { formatAmount, formatDate, formatDateTime } = useFormatters();
    const { hasPermission } = usePermissions();
    const badge = STATUS_BADGE[purchaseOrder.status];

    const [confirm, setConfirm] = useState<ConfirmAction>({ open: false, action: null, label: '', description: '' });

    const triggerAction = (action: ConfirmAction['action'], label: string, description: string) => {
        setConfirm({ open: true, action, label, description });
    };

    const handleConfirm = () => {
        if (!confirm.action) return;
        if (confirm.action === 'delete') {
            router.delete(`/purchase-orders/${purchaseOrder.id}`);
        } else {
            router.post(`/purchase-orders/${purchaseOrder.id}/${confirm.action}`);
        }
        setConfirm({ open: false, action: null, label: '', description: '' });
    };

    const { preferences } = usePage<SharedData>().props;

    const poItemColumns: ColumnDef<PurchaseOrderItem>[] = [
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
            accessorKey: 'qty_received',
            header: 'Qty Received',
            size: 120,
            cell: ({ row }) => <span className="font-mono">{Number(row.original.qty_received).toFixed(2)}</span>,
        },
        {
            accessorKey: 'unit_cost',
            header: 'Unit Cost',
            size: 120,
            cell: ({ row }) => <span className="font-mono">{formatAmount(Number(row.original.unit_cost))}</span>,
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
            accessorKey: 'unit_cost_after_discount',
            header: 'After Disc.',
            size: 120,
            cell: ({ row }) => <span className="font-mono">{formatAmount(Number(row.original.unit_cost_after_discount))}</span>,
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

    const poChargeColumns: ColumnDef<PurchaseOrderCharge>[] = [
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

    const grColumns: ColumnDef<GoodsReceipt>[] = [
        {
            accessorKey: 'code',
            header: 'GR Code',
            size: 140,
            cell: ({ row }) => <ClickableCode href={`/goods-receipts/${row.original.id}`} value={row.original.code} />,
        },
        {
            accessorKey: 'location',
            header: 'Location',
            size: 150,
            accessorFn: (row) => row.location?.name ?? '',
            cell: ({ row }) => row.original.location?.name,
        },
        {
            accessorKey: 'gr_date',
            header: 'GR Date',
            size: 120,
            cell: ({ row }) => formatDate(row.original.gr_date),
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
            cell: ({ row }) => hasPermission('goods-receipt-view') ? (
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/goods-receipts/${row.original.id}`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                        <Eye className="h-4 w-4" />
                        <span className="text-[10px] leading-none">View</span>
                    </Link>
                </Button>
            ) : null,
        },
    ];

    const poLogColumns: ColumnDef<TransactionLog>[] = [
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
            <Head title={`PO ${purchaseOrder.code}`} />
            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold">{purchaseOrder.code}</h1>
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Created by {purchaseOrder.user?.name} on {formatDateTime(purchaseOrder.created_at)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/purchase-orders"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
                        </Button>
                        {hasPermission('purchase-order-edit') && purchaseOrder.status === 'draft' && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/purchase-orders/${purchaseOrder.id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit</Link>
                            </Button>
                        )}
                        {hasPermission('purchase-order-post') && purchaseOrder.status === 'draft' && (
                            <Button size="sm"
                                onClick={() => triggerAction('post', 'Post Purchase Order', 'This will post the purchase order and lock it from editing.')}>
                                <CheckCircle className="mr-2 h-4 w-4" />Post
                            </Button>
                        )}
                        {hasPermission('purchase-order-revert') && ['posted', 'cancelled'].includes(purchaseOrder.status) && (
                            <Button size="sm" variant="outline"
                                onClick={() => triggerAction('revert', 'Revert to Draft', 'This will revert the purchase order back to draft status.')}>
                                <RotateCcw className="mr-2 h-4 w-4" />Revert to Draft
                            </Button>
                        )}
                        {hasPermission('goods-receipt-create') && ['posted', 'partially_received'].includes(purchaseOrder.status) && (
                            <Button size="sm" asChild>
                                <Link href={`/purchase-orders/${purchaseOrder.id}/goods-receipts/create`}>
                                    <PackageCheck className="mr-2 h-4 w-4" />Create GR
                                </Link>
                            </Button>
                        )}
                        {hasPermission('purchase-order-cancel') && purchaseOrder.status !== 'cancelled' && (
                            <Button size="sm" variant="destructive"
                                onClick={() => triggerAction('cancel', 'Cancel Purchase Order',
                                    'This will cancel the purchase order and ALL related goods receipts. Completed GRs will have their inventory reversed.')}>
                                <XCircle className="mr-2 h-4 w-4" />Cancel
                            </Button>
                        )}
                        {hasPermission('purchase-order-delete') && purchaseOrder.status === 'draft' && (
                            <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-600"
                                onClick={() => triggerAction('delete', 'Delete Purchase Order', 'This will permanently delete this purchase order and all related goods receipts. This action cannot be undone.')}>
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
                                <p className="text-muted-foreground">Vendor</p>
                                <ClickableCode href={`/vendors/${purchaseOrder.vendor?.id}`} value={purchaseOrder.vendor?.name} />
                            </div>
                            <div>
                                <p className="text-muted-foreground">Reference No.</p>
                                <p>{purchaseOrder.reference_no || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Order Date</p>
                                <p>{formatDate(purchaseOrder.order_date)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Delivery Date</p>
                                <p>{purchaseOrder.delivery_date ? formatDate(purchaseOrder.delivery_date) : '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Payment Terms</p>
                                <p>{purchaseOrder.vendor?.payment_terms || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Credit Amount</p>
                                <p className="font-mono">{formatAmount(Number(purchaseOrder.vendor?.credit_amount ?? 0))}</p>
                            </div>
                        </div>
                        {purchaseOrder.remarks && (
                            <div>
                                <p className="text-sm text-muted-foreground">Remarks</p>
                                <p className="text-sm">{purchaseOrder.remarks}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 rounded-lg border p-6">
                        <h3 className="font-semibold">Summary</h3>
                        <div className="space-y-2 text-sm">
                            {[
                                { label: 'Total Before Discount', value: Number(purchaseOrder.total_before_discount) },
                                { label: 'Total Item Discount',   value: -Number(purchaseOrder.total_item_discount) },
                                { label: 'Total Net Price',       value: Number(purchaseOrder.total_net_price) },
                                { label: 'Total VAT',             value: Number(purchaseOrder.total_vat) },
                                { label: 'Total Gross',           value: Number(purchaseOrder.total_gross) },
                                { label: 'Header Discount',       value: -Number(purchaseOrder.header_discount_total) },
                                { label: 'Total Charges',         value: Number(purchaseOrder.total_charges) },
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
                                <span className="font-mono">{formatAmount(Number(purchaseOrder.grand_total))}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 rounded-lg border p-6">
                    <h3 className="font-semibold">Items</h3>
                    <DataTable
                        columns={poItemColumns}
                        data={purchaseOrder.items ?? []}
                        timezone={preferences.timezone}
                        storageKey="po-show-items"
                    />
                </div>

                {purchaseOrder.charges && purchaseOrder.charges.length > 0 && (
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Charges</h3>
                        <DataTable
                            columns={poChargeColumns}
                            data={purchaseOrder.charges}
                            timezone={preferences.timezone}
                            storageKey="po-show-charges"
                        />
                    </div>
                )}

                {purchaseOrder.goods_receipts && purchaseOrder.goods_receipts.length > 0 && (
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">
                            Goods Receipts
                            <span className="ml-2 text-sm font-normal text-muted-foreground">({purchaseOrder.goods_receipts.length})</span>
                        </h3>
                        <DataTable
                            columns={grColumns}
                            data={purchaseOrder.goods_receipts}
                            timezone={preferences.timezone}
                            storageKey="po-show-grs"
                        />
                    </div>
                )}

                {purchaseOrder.logs && purchaseOrder.logs.length > 0 && (
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Transaction Log</h3>
                        <DataTable
                            columns={poLogColumns}
                            data={purchaseOrder.logs}
                            timezone={preferences.timezone}
                            storageKey="po-show-logs"
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
        { title: 'Purchase Orders', href: '/purchase-orders' },
        { title: 'View', href: '#' },
    ]}>{page}</AppLayout>
);
