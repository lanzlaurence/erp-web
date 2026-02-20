import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/hooks/use-permissions';
import { useFormatters } from '@/hooks/use-formatters';
import AppLayout from '@/layouts/app-layout';
import type { GoodsReceiptData } from '@/types';
import type { GoodsReceiptStatus } from '@/types/transactions';
import { Head, Link } from '@inertiajs/react';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { router } from '@inertiajs/react';

const STATUS_BADGE: Record<GoodsReceiptStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    pending:   { label: 'Pending',   variant: 'secondary' },
    completed: { label: 'Completed', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export default function Index({ goodsReceipts }: GoodsReceiptData) {
    const { hasPermission } = usePermissions();
    const { formatDate } = useFormatters();
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; grNumber: string }>({
        open: false, id: 0, grNumber: '',
    });

    const handleDeleteConfirm = () => {
        router.delete(`/goods-receipts/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, grNumber: '' });
    };

    return (
        <>
            <Head title="Goods Receipts" />
            <div className="space-y-4 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Goods Receipts</h1>
                    <p className="text-sm text-muted-foreground">Receiving records from purchase orders</p>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>GR Code</TableHead>
                                <TableHead>PO Code</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>GR Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created By</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {goodsReceipts.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                                        No goods receipts available.
                                    </TableCell>
                                </TableRow>
                            ) : goodsReceipts.data.map((gr) => {
                                const badge = STATUS_BADGE[gr.status];
                                return (
                                    <TableRow key={gr.id}>
                                        <TableCell className="font-mono font-medium">{gr.code}</TableCell>
                                        <TableCell className="font-mono">{gr.purchase_order?.code}</TableCell>
                                        <TableCell>{gr.purchase_order?.vendor?.name}</TableCell>
                                        <TableCell>{gr.destination?.name}</TableCell>
                                        <TableCell>{formatDate(gr.gr_date)}</TableCell>
                                        <TableCell>
                                            <Badge variant={badge.variant}>{badge.label}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{gr.user?.name}</TableCell>
                                        <TableCell className="text-right">
                                            {hasPermission('gr-view') && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/goods-receipts/${gr.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {hasPermission('gr-edit') && gr.status === 'pending' && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/goods-receipts/${gr.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {hasPermission('gr-delete') && gr.status === 'pending' && (
                                                <Button variant="ghost" size="sm"
                                                    onClick={() => setDeleteDialog({ open: true, id: gr.id, grNumber: gr.gr_number })}>
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            )}
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
                        <AlertDialogTitle>Delete Goods Receipt?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <span className="font-semibold">{deleteDialog.grNumber}</span>. This action cannot be undone.
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
        { title: 'Goods Receipts', href: '/goods-receipts' },
    ]}>{page}</AppLayout>
);
