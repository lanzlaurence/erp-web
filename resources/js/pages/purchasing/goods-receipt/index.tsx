import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { usePermissions } from '@/hooks/use-permissions';
import { useFormatters } from '@/hooks/use-formatters';
import AppLayout from '@/layouts/app-layout';
import type { GoodsReceiptData } from '@/types';
import type { GoodsReceiptStatus } from '@/types/transactions';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Edit, Trash2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import ClickableCode from '@/components/ui/clickable-code';

const STATUS_BADGE: Record<GoodsReceiptStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    pending:   { label: 'Pending',   variant: 'secondary' },
    completed: { label: 'Completed', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export default function Index({ goodsReceipts }: GoodsReceiptData) {
    const { hasPermission } = usePermissions();
    const { formatDate } = useFormatters();

    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; code: string }>({
        open: false, id: 0, code: '',
    });
    const [actionDialog, setActionDialog] = useState<{ open: boolean; id: number; code: string; action: 'complete' | 'cancel' | 'revert' | null; fromCompleted: boolean; poStatus?: string }>({
        open: false, id: 0, code: '', action: null, fromCompleted: false, poStatus: '',
    });

    const handleDeleteConfirm = () => {
        router.delete(`/goods-receipts/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, code: '' });
    };

    const handleActionConfirm = () => {
        if (!actionDialog.action) return;
        router.post(`/goods-receipts/${actionDialog.id}/${actionDialog.action}`);
        setActionDialog({ open: false, id: 0, code: '', action: null, fromCompleted: false });
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
                                <TableHead>Location</TableHead>
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
                                const poIsCancelled = gr.purchase_order?.status === 'cancelled';
                                return (
                                    <TableRow key={gr.id}>
                                        <TableCell><ClickableCode href={`/goods-receipts/${gr.id}`} value={gr.code} /></TableCell>
                                        <TableCell><ClickableCode href={`/purchase-orders/${gr.purchase_order?.id}`} value={gr.purchase_order?.code} /></TableCell>
                                        <TableCell><ClickableCode href={`/vendors/${gr.purchase_order?.vendor?.id}`} value={gr.purchase_order?.vendor?.name} /></TableCell>
                                        <TableCell>{gr.location?.name}</TableCell>
                                        <TableCell>{formatDate(gr.gr_date)}</TableCell>
                                        <TableCell><Badge variant={badge.variant}>{badge.label}</Badge></TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{gr.user?.name}</TableCell>
                                        <TableCell className="text-right">
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
                            This will permanently delete <span className="font-semibold">{deleteDialog.code}</span>. This action cannot be undone.
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
                            {actionDialog.action === 'complete' ? 'Complete Goods Receipt?' :
                            actionDialog.action === 'revert'   ? 'Revert to Pending?'      : 'Cancel Goods Receipt?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionDialog.action === 'complete' && `This will complete ${actionDialog.code} and add stock to inventory.`}
                            {actionDialog.action === 'revert'   && `This will revert ${actionDialog.code} back to pending. Inventory will NOT be restored — you must complete again.`}
                            {actionDialog.action === 'cancel'   && (actionDialog.fromCompleted
                                ? `This will cancel ${actionDialog.code} and REVERSE the inventory that was received.`
                                : `This will cancel ${actionDialog.code}.`)}
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
        { title: 'Goods Receipts', href: '/goods-receipts' },
    ]}>{page}</AppLayout>
);
