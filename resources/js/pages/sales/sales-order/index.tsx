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
import type { SalesOrderData, SalesOrder, SharedData } from '@/types';
import type { SalesOrderStatus } from '@/types/transactions';

const STATUS_BADGE: Record<SalesOrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    draft:             { label: 'Draft',           variant: 'secondary' },
    posted:            { label: 'Posted',          variant: 'default' },
    partially_shipped: { label: 'Partial Shipped', variant: 'outline' },
    fully_shipped:     { label: 'Fully Shipped',   variant: 'success' },
    cancelled:         { label: 'Cancelled',       variant: 'destructive' },
};

export default function Index({ salesOrders }: SalesOrderData) {
    const { hasPermission } = usePermissions();
    const { formatAmount, formatDate } = useFormatters();
    const { preferences } = usePage<SharedData>().props;

    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; code: string }>({ open: false, id: 0, code: '' });
    const [actionDialog, setActionDialog] = useState<{ open: boolean; id: number; code: string; action: 'post' | 'cancel' | 'revert' | null }>({ open: false, id: 0, code: '', action: null });

    const handleDeleteConfirm = () => {
        router.delete(`/sales-orders/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, code: '' });
    };

    const handleActionConfirm = () => {
        if (!actionDialog.action) return;
        router.post(`/sales-orders/${actionDialog.id}/${actionDialog.action}`);
        setActionDialog({ open: false, id: 0, code: '', action: null });
    };

    const columns: ColumnDef<SalesOrder>[] = [
        {
            accessorKey: 'code',
            header: 'SO Code',
            size: 150,
            cell: ({ row }) => <ClickableCode href={`/sales-orders/${row.original.id}`} value={row.original.code} />,
        },
        {
            accessorKey: 'customer',
            header: 'Customer',
            size: 180,
            accessorFn: (row) => row.customer?.name ?? '',
            cell: ({ row }) => <ClickableCode href={`/customers/${row.original.customer?.id}`} value={row.original.customer?.name} />,
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
            size: 200,
            cell: ({ row }) => {
                const so = row.original;
                return (
                    <div className="flex justify-end gap-1">
                        {hasPermission('sales-order-view') && (
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/sales-orders/${so.id}`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                    <Eye className="h-4 w-4" />
                                    <span className="text-[10px] leading-none">View</span>
                                </Link>
                            </Button>
                        )}
                        {hasPermission('sales-order-edit') && so.status === 'draft' && (
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/sales-orders/${so.id}/edit`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                    <Edit className="h-4 w-4" />
                                    <span className="text-[10px] leading-none">Edit</span>
                                </Link>
                            </Button>
                        )}
                        {hasPermission('sales-order-post') && so.status === 'draft' && (
                            <Button variant="ghost" size="sm"
                                onClick={() => setActionDialog({ open: true, id: so.id, code: so.code, action: 'post' })}
                                className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                                <span className="text-[10px] leading-none">Post</span>
                            </Button>
                        )}
                        {hasPermission('sales-order-revert') && ['posted', 'cancelled'].includes(so.status) && (
                            <Button variant="ghost" size="sm"
                                onClick={() => setActionDialog({ open: true, id: so.id, code: so.code, action: 'revert' })}
                                className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                <RotateCcw className="h-4 w-4 text-blue-600" />
                                <span className="text-[10px] leading-none">Revert</span>
                            </Button>
                        )}
                        {hasPermission('goods-issue-create') && ['posted', 'partially_shipped'].includes(so.status) && (
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/sales-orders/${so.id}/goods-issues/create`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                    <PackageCheck className="h-4 w-4 text-green-600" />
                                    <span className="text-[10px] leading-none">Create GI</span>
                                </Link>
                            </Button>
                        )}
                        {hasPermission('sales-order-cancel') && so.status !== 'cancelled' && (
                            <Button variant="ghost" size="sm"
                                onClick={() => setActionDialog({ open: true, id: so.id, code: so.code, action: 'cancel' })}
                                className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                <XCircle className="h-4 w-4 text-orange-600" />
                                <span className="text-[10px] leading-none">Cancel</span>
                            </Button>
                        )}
                        {hasPermission('sales-order-delete') && so.status === 'draft' && (
                            <Button variant="ghost" size="sm"
                                onClick={() => setDeleteDialog({ open: true, id: so.id, code: so.code })}
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
            <Head title="Sales Orders" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Sales Orders</h1>
                        <p className="text-sm text-muted-foreground">Manage sales to customers</p>
                    </div>
                    {hasPermission('sales-order-create') && (
                        <Button asChild size="sm">
                            <Link href="/sales-orders/create"><Plus className="mr-2 h-4 w-4" />Create SO</Link>
                        </Button>
                    )}
                </div>
                <DataTable columns={columns} data={salesOrders} exportFileName="sales-orders" timezone={preferences.timezone} storageKey="sales-orders" />
            </div>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Sales Order?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete <span className="font-semibold">{deleteDialog.code}</span> and all related goods issues. This action cannot be undone.</AlertDialogDescription>
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
                            {actionDialog.action === 'post' ? 'Post Sales Order?' : actionDialog.action === 'revert' ? 'Revert to Draft?' : 'Cancel Sales Order?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionDialog.action === 'post'   && `This will post ${actionDialog.code} and lock it from editing.`}
                            {actionDialog.action === 'revert' && `This will revert ${actionDialog.code} back to draft status.`}
                            {actionDialog.action === 'cancel' && `This will cancel ${actionDialog.code} and ALL related goods issues. Completed GIs will have their inventory restored.`}
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
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Sales Orders', href: '/sales-orders' }]}>{page}</AppLayout>
);
