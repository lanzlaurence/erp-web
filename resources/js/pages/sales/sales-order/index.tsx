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
import { Eye, Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ClickableCode from '@/components/ui/clickable-code';

const STATUS_BADGE: Record<SalesOrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    draft:            { label: 'Draft',           variant: 'secondary' },
    posted:           { label: 'Posted',          variant: 'default' },
    partially_issued: { label: 'Partial Issued',  variant: 'outline' },
    fully_issued:     { label: 'Fully Issued',    variant: 'success' },
    cancelled:        { label: 'Cancelled',       variant: 'destructive' },
};

export default function Index({ salesOrders }: SalesOrderData) {
    const { hasPermission } = usePermissions();
    const { formatAmount, formatDate } = useFormatters();
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; code: string }>({
        open: false, id: 0, code: '',
    });

    const handleDeleteConfirm = () => {
        router.delete(`/sales-orders/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, code: '' });
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
                                <Plus className="mr-2 h-4 w-4" />
                                Create SO
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
                                        <TableCell>
                                            <ClickableCode href={`/sales-orders/${so.id}`} value={so.code} />
                                        </TableCell>
                                        <TableCell>
                                            <ClickableCode href={`/customers/${so.customer?.id}`} value={so.customer?.name} />
                                        </TableCell>
                                        <TableCell>{formatDate(so.order_date)}</TableCell>
                                        <TableCell>{so.delivery_date ? formatDate(so.delivery_date) : '-'}</TableCell>
                                        <TableCell className="font-mono">{formatAmount(Number(so.grand_total))}</TableCell>
                                        <TableCell>
                                            <Badge variant={badge.variant}>{badge.label}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{so.user?.name}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {hasPermission('sales-order-view') && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/sales-orders/${so.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                                {hasPermission('sales-order-edit') && so.status === 'draft' && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/sales-orders/${so.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                                {hasPermission('sales-order-delete') && so.status === 'draft' && (
                                                    <Button variant="ghost" size="sm"
                                                        onClick={() => setDeleteDialog({ open: true, id: so.id, code: so.code })}>
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
                        <AlertDialogTitle>Delete Sales Order?</AlertDialogTitle>
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
        { title: 'Sales Orders', href: '/sales-orders' },
    ]}>{page}</AppLayout>
);
