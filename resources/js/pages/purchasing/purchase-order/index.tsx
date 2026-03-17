import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { usePermissions } from '@/hooks/use-permissions';
import { useFormatters } from '@/hooks/use-formatters';
import AppLayout from '@/layouts/app-layout';
import type { PurchaseOrderData } from '@/types';
import type { PurchaseOrderStatus } from '@/types/transactions';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Edit, Plus, Trash2, CheckCircle, XCircle, PackageCheck, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import ClickableCode from '@/components/ui/clickable-code';

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

    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; code: string }>({
        open: false, id: 0, code: '',
    });
    const [actionDialog, setActionDialog] = useState<{ open: boolean; id: number; code: string; action: 'post' | 'cancel' | 'revert' | null }>({
        open: false, id: 0, code: '', action: null,
    });

    const handleDeleteConfirm = () => {
        router.delete(`/purchase-orders/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, code: '' });
    };

    const handleActionConfirm = () => {
        if (!actionDialog.action) return;
        router.post(`/purchase-orders/${actionDialog.id}/${actionDialog.action}`);
        setActionDialog({ open: false, id: 0, code: '', action: null });
    };

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
                            <Link href="/purchase-orders/create">
                                <Plus className="mr-2 h-4 w-4" />Create PO
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>PO Code</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Order Date</TableHead>
                                <TableHead>Delivery Date</TableHead>
                                <TableHead>Grand Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created By</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchaseOrders.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                                        No purchase orders available.
                                    </TableCell>
                                </TableRow>
                            ) : purchaseOrders.data.map((po) => {
                                const badge = STATUS_BADGE[po.status];
                                return (
                                    <TableRow key={po.id}>
                                        <TableCell><ClickableCode href={`/purchase-orders/${po.id}`} value={po.code} /></TableCell>
                                        <TableCell><ClickableCode href={`/vendors/${po.vendor?.id}`} value={po.vendor?.name} /></TableCell>
                                        <TableCell>{formatDate(po.order_date)}</TableCell>
                                        <TableCell>{po.delivery_date ? formatDate(po.delivery_date) : '-'}</TableCell>
                                        <TableCell className="font-mono">{formatAmount(Number(po.grand_total))}</TableCell>
                                        <TableCell><Badge variant={badge.variant}>{badge.label}</Badge></TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{po.user?.name}</TableCell>
                                        <TableCell className="text-right">
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
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Purchase Order?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <span className="font-semibold">{deleteDialog.code}</span> and all related goods receipts. This action cannot be undone.
                        </AlertDialogDescription>
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
                            {actionDialog.action === 'post'   ? 'Post Purchase Order?'   :
                            actionDialog.action === 'revert' ? 'Revert to Draft?'        : 'Cancel Purchase Order?'}
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
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Purchase Orders', href: '/purchase-orders' },
    ]}>{page}</AppLayout>
);
