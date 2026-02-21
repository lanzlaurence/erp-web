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
import { Eye, Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

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

    const handleDeleteConfirm = () => {
        router.delete(`/purchase-orders/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, code: '' });
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
                    {hasPermission('po-create') && (
                        <Button asChild size="sm">
                            <Link href="/purchase-orders/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create PO
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
                                        <TableCell className="font-mono font-medium">{po.code}</TableCell>
                                        <TableCell>{po.vendor?.name}</TableCell>
                                        <TableCell>{formatDate(po.order_date)}</TableCell>
                                        <TableCell>{po.delivery_date ? formatDate(po.delivery_date) : '-'}</TableCell>
                                        <TableCell className="font-mono">{formatAmount(Number(po.grand_total))}</TableCell>
                                        <TableCell>
                                            <Badge variant={badge.variant}>{badge.label}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{po.user?.name}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {hasPermission('po-view') && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/purchase-orders/${po.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                                {hasPermission('po-edit') && po.status === 'draft' && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/purchase-orders/${po.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                                {hasPermission('po-delete') && po.status === 'draft' && (
                                                    <Button variant="ghost" size="sm"
                                                        onClick={() => setDeleteDialog({ open: true, id: po.id, code: po.code })}>
                                                        <Trash2 className="h-4 w-4 text-red-600" />
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
                            This will permanently delete <span className="font-semibold">{deleteDialog.code}</span>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
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
