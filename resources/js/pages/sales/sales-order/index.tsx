import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { usePermissions } from '@/hooks/use-permissions';
import { useFormatters } from '@/hooks/use-formatters';
import AppLayout from '@/layouts/app-layout';
import type { SalesOrderData } from '@/types';
import type { SalesOrderStatus } from '@/types/transactions';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Edit, Plus, Trash2, CheckCircle, XCircle, PackageCheck, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import ClickableCode from '@/components/ui/clickable-code';

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

    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; code: string }>({
        open: false, id: 0, code: '',
    });
    const [actionDialog, setActionDialog] = useState<{ open: boolean; id: number; code: string; action: 'post' | 'cancel' | 'revert' | null }>({
        open: false, id: 0, code: '', action: null,
    });

    const handleDeleteConfirm = () => {
        router.delete(`/sales-orders/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, code: '' });
    };

    const handleActionConfirm = () => {
        if (!actionDialog.action) return;
        router.post(`/sales-orders/${actionDialog.id}/${actionDialog.action}`);
        setActionDialog({ open: false, id: 0, code: '', action: null });
    };

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
                            <Link href="/sales-orders/create">
                                <Plus className="mr-2 h-4 w-4" />Create SO
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SO Code</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Order Date</TableHead>
                                <TableHead>Delivery Date</TableHead>
                                <TableHead>Grand Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created By</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salesOrders.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                                        No sales orders available.
                                    </TableCell>
                                </TableRow>
                            ) : salesOrders.data.map((so) => {
                                const badge = STATUS_BADGE[so.status];
                                return (
                                    <TableRow key={so.id}>
                                        <TableCell><ClickableCode href={`/sales-orders/${so.id}`} value={so.code} /></TableCell>
                                        <TableCell><ClickableCode href={`/customers/${so.customer?.id}`} value={so.customer?.name} /></TableCell>
                                        <TableCell>{formatDate(so.order_date)}</TableCell>
                                        <TableCell>{so.delivery_date ? formatDate(so.delivery_date) : '-'}</TableCell>
                                        <TableCell className="font-mono">{formatAmount(Number(so.grand_total))}</TableCell>
                                        <TableCell><Badge variant={badge.variant}>{badge.label}</Badge></TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{so.user?.name}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                {hasPermission('sales-order-view') && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/sales-orders/${so.id}`} className="flex flex-col items-center gap-0.5 h-auto py-1 w-14">
                                                            <Eye className="h-4 w-4" />
                                                            <span className="text-[10px] leading-none">View</span>
                                                        </Link>
                                                    </Button>
                                                )}
                                                {hasPermission('sales-order-edit') && so.status === 'draft' && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/sales-orders/${so.id}/edit`} className="flex flex-col items-center gap-0.5 h-auto py-1 w-14">
                                                            <Edit className="h-4 w-4" />
                                                            <span className="text-[10px] leading-none">Edit</span>
                                                        </Link>
                                                    </Button>
                                                )}
                                                {hasPermission('sales-order-post') && so.status === 'draft' && (
                                                    <Button variant="ghost" size="sm"
                                                        onClick={() => setActionDialog({ open: true, id: so.id, code: so.code, action: 'post' })}
                                                        className="flex flex-col items-center gap-0.5 h-auto py-1 w-14">
                                                        <CheckCircle className="h-4 w-4 text-blue-600" />
                                                        <span className="text-[10px] leading-none">Post</span>
                                                    </Button>
                                                )}
                                                {hasPermission('sales-order-revert') && ['posted', 'cancelled'].includes(so.status) && (
                                                    <Button variant="ghost" size="sm"
                                                        onClick={() => setActionDialog({ open: true, id: so.id, code: so.code, action: 'revert' })}
                                                        className="flex flex-col items-center gap-0.5 h-auto py-1 w-14">
                                                        <RotateCcw className="h-4 w-4 text-blue-600" />
                                                        <span className="text-[10px] leading-none">Revert</span>
                                                    </Button>
                                                )}
                                                {hasPermission('goods-issue-create') && ['posted', 'partially_shipped'].includes(so.status) && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/sales-orders/${so.id}/goods-issues/create`} className="flex flex-col items-center gap-0.5 h-auto py-1 w-14">
                                                            <PackageCheck className="h-4 w-4 text-green-600" />
                                                            <span className="text-[10px] leading-none">Create GI</span>
                                                        </Link>
                                                    </Button>
                                                )}
                                                {hasPermission('sales-order-cancel') && so.status !== 'cancelled' && (
                                                    <Button variant="ghost" size="sm"
                                                        onClick={() => setActionDialog({ open: true, id: so.id, code: so.code, action: 'cancel' })}
                                                        className="flex flex-col items-center gap-0.5 h-auto py-1 w-14">
                                                        <XCircle className="h-4 w-4 text-orange-600" />
                                                        <span className="text-[10px] leading-none">Cancel</span>
                                                    </Button>
                                                )}
                                                {hasPermission('sales-order-delete') && so.status === 'draft' && (
                                                    <Button variant="ghost" size="sm"
                                                        onClick={() => setDeleteDialog({ open: true, id: so.id, code: so.code })}
                                                        className="flex flex-col items-center gap-0.5 h-auto py-1 w-14">
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
                        <AlertDialogTitle>Delete Sales Order?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <span className="font-semibold">{deleteDialog.code}</span> and all related goods issues. This action cannot be undone.
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
                            {actionDialog.action === 'post'   ? 'Post Sales Order?'   :
                            actionDialog.action === 'revert' ? 'Revert to Draft?'     : 'Cancel Sales Order?'}
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
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Sales Orders', href: '/sales-orders' },
    ]}>{page}</AppLayout>
);
