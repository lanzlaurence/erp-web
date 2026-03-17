import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useFormatters } from '@/hooks/use-formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, Edit, Plus, Trash2, CheckCircle, XCircle, PackageCheck, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import ClickableCode from '@/components/ui/clickable-code';
import type { PurchaseOrderData, PurchaseOrder, SharedData } from '@/types';
import type { PurchaseOrderStatus } from '@/types/transactions';

const STATUS_BADGE: Record<PurchaseOrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    draft:              { label: 'Draft',            variant: 'secondary' },
    posted:             { label: 'Posted',           variant: 'default' },
    partially_received: { label: 'Partial Received', variant: 'outline' },
    fully_received:     { label: 'Fully Received',   variant: 'success' },
    cancelled:          { label: 'Cancelled',        variant: 'destructive' },
};

export default function Index({ purchaseOrders }: PurchaseOrderData) {
    const { hasPermission } = usePermissions();
    const { formatAmount, formatDate } = useFormatters();
    const { preferences } = usePage<SharedData>().props;

    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; code: string }>({ open: false, id: 0, code: '' });
    const [actionDialog, setActionDialog] = useState<{ open: boolean; id: number; code: string; action: 'post' | 'cancel' | 'revert' | null }>({ open: false, id: 0, code: '', action: null });

    const handleDeleteConfirm = () => {
        router.delete(`/purchase-orders/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, code: '' });
    };

    const handleActionConfirm = () => {
        if (!actionDialog.action) return;
        router.post(`/purchase-orders/${actionDialog.id}/${actionDialog.action}`);
        setActionDialog({ open: false, id: 0, code: '', action: null });
    };

    const columns: ColumnDef<PurchaseOrder>[] = [
        {
            accessorKey: 'code',
            header: 'PO Code',
            size: 150,
            cell: ({ row }) => <ClickableCode href={`/purchase-orders/${row.original.id}`} value={row.original.code} />,
        },
        {
            accessorKey: 'vendor',
            header: 'Vendor',
            size: 180,
            accessorFn: (row) => row.vendor?.name ?? '',
            cell: ({ row }) => <ClickableCode href={`/vendors/${row.original.vendor?.id}`} value={row.original.vendor?.name} />,
        },
        {
            accessorKey: 'order_date',
            header: 'Order Date',
            size: 130,
            accessorFn: (row) => formatDate(row.order_date),
            cell: ({ row }) => formatDate(row.original.order_date),
        },
        {
            accessorKey: 'delivery_date',
            header: 'Delivery Date',
            size: 130,
            accessorFn: (row) => row.delivery_date ? formatDate(row.delivery_date) : '-',
            cell: ({ row }) => row.original.delivery_date ? formatDate(row.original.delivery_date) : '-',
        },
        {
            accessorKey: 'grand_total',
            header: 'Grand Total',
            size: 140,
            cell: ({ row }) => <span className="font-mono">{formatAmount(Number(row.original.grand_total))}</span>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            size: 140,
            accessorFn: (row) => STATUS_BADGE[row.status]?.label ?? row.status,
            cell: ({ row }) => {
                const badge = STATUS_BADGE[row.original.status];
                return <Badge variant={badge.variant}>{badge.label}</Badge>;
            },
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
            size: 180,
            cell: ({ row }) => {
                const po = row.original;
                return (
                    <div className="flex justify-end gap-1">
                        {hasPermission('purchase-order-view') && (
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/purchase-orders/${po.id}`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                    <Eye className="h-4 w-4" />
                                    <span className="text-[10px] leading-none">View</span>
                                </Link>
                            </Button>
                        )}
                        {hasPermission('purchase-order-edit') && po.status === 'draft' && (
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/purchase-orders/${po.id}/edit`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                    <Edit className="h-4 w-4" />
                                    <span className="text-[10px] leading-none">Edit</span>
                                </Link>
                            </Button>
                        )}
                        {hasPermission('purchase-order-post') && po.status === 'draft' && (
                            <Button variant="ghost" size="sm"
                                onClick={() => setActionDialog({ open: true, id: po.id, code: po.code, action: 'post' })}
                                className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                                <span className="text-[10px] leading-none">Post</span>
                            </Button>
                        )}
                        {hasPermission('purchase-order-revert') && ['posted', 'cancelled'].includes(po.status) && (
                            <Button variant="ghost" size="sm"
                                onClick={() => setActionDialog({ open: true, id: po.id, code: po.code, action: 'revert' })}
                                className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                <RotateCcw className="h-4 w-4 text-blue-600" />
                                <span className="text-[10px] leading-none">Revert</span>
                            </Button>
                        )}
                        {hasPermission('goods-receipt-create') && ['posted', 'partially_received'].includes(po.status) && (
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/purchase-orders/${po.id}/goods-receipts/create`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                    <PackageCheck className="h-4 w-4 text-green-600" />
                                    <span className="text-[10px] leading-none">Create GR</span>
                                </Link>
                            </Button>
                        )}
                        {hasPermission('purchase-order-cancel') && po.status !== 'cancelled' && (
                            <Button variant="ghost" size="sm"
                                onClick={() => setActionDialog({ open: true, id: po.id, code: po.code, action: 'cancel' })}
                                className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                <XCircle className="h-4 w-4 text-orange-600" />
                                <span className="text-[10px] leading-none">Cancel</span>
                            </Button>
                        )}
                        {hasPermission('purchase-order-delete') && po.status === 'draft' && (
                            <Button variant="ghost" size="sm"
                                onClick={() => setDeleteDialog({ open: true, id: po.id, code: po.code })}
                                className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                <Trash2 className="h-4 w-4 text-red-600" />
                                <span className="text-[10px] leading-none">Delete</span>
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <Head title="Purchase Orders" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Purchase Orders</h1>
                        <p className="text-sm text-muted-foreground">Manage procurement from vendors</p>
                    </div>
                    {hasPermission('purchase-order-create') && (
                        <Button asChild size="sm">
                            <Link href="/purchase-orders/create"><Plus className="mr-2 h-4 w-4" />Create PO</Link>
                        </Button>
                    )}
                </div>
                <DataTable columns={columns} data={purchaseOrders} exportFileName="purchase-orders" timezone={preferences.timezone} storageKey="purchase-orders" />
            </div>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Purchase Order?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete <span className="font-semibold">{deleteDialog.code}</span> and all related goods receipts. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {actionDialog.action === 'post' ? 'Post Purchase Order?' : actionDialog.action === 'revert' ? 'Revert to Draft?' : 'Cancel Purchase Order?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionDialog.action === 'post'   && `This will post ${actionDialog.code} and lock it from editing.`}
                            {actionDialog.action === 'revert' && `This will revert ${actionDialog.code} back to draft status.`}
                            {actionDialog.action === 'cancel' && `This will cancel ${actionDialog.code} and ALL related goods receipts. Completed GRs will have their inventory reversed.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleActionConfirm}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Purchase Orders', href: '/purchase-orders' }]}>{page}</AppLayout>
);
