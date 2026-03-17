import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useFormatters } from '@/hooks/use-formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, Edit, Trash2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import ClickableCode from '@/components/ui/clickable-code';
import type { GoodsReceiptData, GoodsReceipt, SharedData } from '@/types';
import type { GoodsReceiptStatus } from '@/types/transactions';

const STATUS_BADGE: Record<GoodsReceiptStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    pending:   { label: 'Pending',   variant: 'secondary' },
    completed: { label: 'Completed', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export default function Index({ goodsReceipts }: GoodsReceiptData) {
    const { hasPermission } = usePermissions();
    const { formatDate } = useFormatters();
    const { preferences } = usePage<SharedData>().props;

    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; code: string }>({ open: false, id: 0, code: '' });
    const [actionDialog, setActionDialog] = useState<{ open: boolean; id: number; code: string; action: 'complete' | 'cancel' | 'revert' | null; fromCompleted: boolean }>({ open: false, id: 0, code: '', action: null, fromCompleted: false });

    const handleDeleteConfirm = () => {
        router.delete(`/goods-receipts/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, code: '' });
    };

    const handleActionConfirm = () => {
        if (!actionDialog.action) return;
        router.post(`/goods-receipts/${actionDialog.id}/${actionDialog.action}`);
        setActionDialog({ open: false, id: 0, code: '', action: null, fromCompleted: false });
    };

    const columns: ColumnDef<GoodsReceipt>[] = [
        {
            accessorKey: 'code',
            header: 'GR Code',
            size: 150,
            cell: ({ row }) => <ClickableCode href={`/goods-receipts/${row.original.id}`} value={row.original.code} />,
        },
        {
            accessorKey: 'purchase_order',
            header: 'PO Code',
            size: 150,
            accessorFn: (row) => row.purchase_order?.code ?? '',
            cell: ({ row }) => <ClickableCode href={`/purchase-orders/${row.original.purchase_order?.id}`} value={row.original.purchase_order?.code} />,
        },
        {
            accessorKey: 'vendor',
            header: 'Vendor',
            size: 180,
            accessorFn: (row) => row.purchase_order?.vendor?.name ?? '',
            cell: ({ row }) => <ClickableCode href={`/vendors/${row.original.purchase_order?.vendor?.id}`} value={row.original.purchase_order?.vendor?.name} />,
        },
        {
            accessorKey: 'location',
            header: 'Location',
            size: 140,
            accessorFn: (row) => row.location?.name ?? '',
            cell: ({ row }) => row.original.location?.name,
        },
        {
            accessorKey: 'gr_date',
            header: 'GR Date',
            size: 130,
            accessorFn: (row) => formatDate(row.gr_date),
            cell: ({ row }) => formatDate(row.original.gr_date),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            size: 120,
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
            size: 160,
            cell: ({ row }) => {
                const gr = row.original;
                const poIsCancelled = gr.purchase_order?.status === 'cancelled';
                return (
                    <div className="flex justify-end gap-1">
                        {hasPermission('goods-receipt-view') && (
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/goods-receipts/${gr.id}`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                    <Eye className="h-4 w-4" />
                                    <span className="text-[10px] leading-none">View</span>
                                </Link>
                            </Button>
                        )}
                        {hasPermission('goods-receipt-edit') && gr.status === 'pending' && (
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/goods-receipts/${gr.id}/edit`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                    <Edit className="h-4 w-4" />
                                    <span className="text-[10px] leading-none">Edit</span>
                                </Link>
                            </Button>
                        )}
                        {hasPermission('goods-receipt-complete') && gr.status === 'pending' && (
                            <Button variant="ghost" size="sm"
                                onClick={() => setActionDialog({ open: true, id: gr.id, code: gr.code, action: 'complete', fromCompleted: false })}
                                className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-[10px] leading-none">Complete</span>
                            </Button>
                        )}
                        {hasPermission('goods-receipt-revert') && gr.status === 'cancelled' && !poIsCancelled && (
                            <Button variant="ghost" size="sm"
                                onClick={() => setActionDialog({ open: true, id: gr.id, code: gr.code, action: 'revert', fromCompleted: false })}
                                className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                <RotateCcw className="h-4 w-4 text-blue-600" />
                                <span className="text-[10px] leading-none">Revert</span>
                            </Button>
                        )}
                        {hasPermission('goods-receipt-cancel') && ['pending', 'completed'].includes(gr.status) && (
                            <Button variant="ghost" size="sm"
                                onClick={() => setActionDialog({ open: true, id: gr.id, code: gr.code, action: 'cancel', fromCompleted: gr.status === 'completed' })}
                                className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                <XCircle className="h-4 w-4 text-orange-600" />
                                <span className="text-[10px] leading-none">Cancel</span>
                            </Button>
                        )}
                        {hasPermission('goods-receipt-delete') && gr.status === 'pending' && (
                            <Button variant="ghost" size="sm"
                                onClick={() => setDeleteDialog({ open: true, id: gr.id, code: gr.code })}
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
            <Head title="Goods Receipts" />
            <div className="space-y-4 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Goods Receipts</h1>
                    <p className="text-sm text-muted-foreground">Receiving records from purchase orders</p>
                </div>
                <DataTable columns={columns} data={goodsReceipts} exportFileName="goods-receipts" timezone={preferences.timezone} storageKey="goods-receipts" />
            </div>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Goods Receipt?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete <span className="font-semibold">{deleteDialog.code}</span>. This action cannot be undone.</AlertDialogDescription>
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
                            {actionDialog.action === 'complete' ? 'Complete Goods Receipt?' : actionDialog.action === 'revert' ? 'Revert to Pending?' : 'Cancel Goods Receipt?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionDialog.action === 'complete' && `This will complete ${actionDialog.code} and add stock to inventory.`}
                            {actionDialog.action === 'revert'   && `This will revert ${actionDialog.code} back to pending. Inventory will NOT be restored — you must complete again.`}
                            {actionDialog.action === 'cancel'   && (actionDialog.fromCompleted ? `This will cancel ${actionDialog.code} and REVERSE the inventory that was received.` : `This will cancel ${actionDialog.code}.`)}
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
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Goods Receipts', href: '/goods-receipts' }]}>{page}</AppLayout>
);
