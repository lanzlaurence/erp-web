import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { usePermissions } from '@/hooks/use-permissions';
import { useFormatters } from '@/hooks/use-formatters';
import AppLayout from '@/layouts/app-layout';
import type { GoodsIssueData } from '@/types';
import type { GoodsIssueStatus } from '@/types/transactions';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Edit, Trash2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import ClickableCode from '@/components/ui/clickable-code';

const STATUS_BADGE: Record<GoodsIssueStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    pending:   { label: 'Pending',   variant: 'secondary' },
    completed: { label: 'Completed', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export default function Index({ goodsIssues }: GoodsIssueData) {
    const { hasPermission } = usePermissions();
    const { formatDate } = useFormatters();

    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; code: string }>({
        open: false, id: 0, code: '',
    });
    const [actionDialog, setActionDialog] = useState<{ open: boolean; id: number; code: string; action: 'complete' | 'cancel' | 'revert' | null; fromCompleted: boolean; soStatus?: string }>({
        open: false, id: 0, code: '', action: null, fromCompleted: false, soStatus: '',
    });

    const handleDeleteConfirm = () => {
        router.delete(`/goods-issues/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, code: '' });
    };

    const handleActionConfirm = () => {
        if (!actionDialog.action) return;
        router.post(`/goods-issues/${actionDialog.id}/${actionDialog.action}`);
        setActionDialog({ open: false, id: 0, code: '', action: null, fromCompleted: false });
    };

    return (
        <>
            <Head title="Goods Issues" />
            <div className="space-y-4 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Goods Issues</h1>
                    <p className="text-sm text-muted-foreground">Issue records from sales orders</p>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>GI Code</TableHead>
                                <TableHead>SO Code</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>GI Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created By</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {goodsIssues.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                                        No goods issues available.
                                    </TableCell>
                                </TableRow>
                            ) : goodsIssues.data.map((gi) => {
                                const badge = STATUS_BADGE[gi.status];
                                const soIsCancelled = gi.sales_order?.status === 'cancelled';
                                return (
                                    <TableRow key={gi.id}>
                                        <TableCell><ClickableCode href={`/goods-issues/${gi.id}`} value={gi.code} /></TableCell>
                                        <TableCell><ClickableCode href={`/sales-orders/${gi.sales_order?.id}`} value={gi.sales_order?.code} /></TableCell>
                                        <TableCell><ClickableCode href={`/customers/${gi.sales_order?.customer?.id}`} value={gi.sales_order?.customer?.name} /></TableCell>
                                        <TableCell>{gi.location?.name}</TableCell>
                                        <TableCell>{formatDate(gi.gi_date)}</TableCell>
                                        <TableCell><Badge variant={badge.variant}>{badge.label}</Badge></TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{gi.user?.name}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                {hasPermission('goods-issue-view') && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/goods-issues/${gi.id}`} className="flex flex-col items-center gap-0.5 h-auto py-1 w-14">
                                                            <Eye className="h-4 w-4" />
                                                            <span className="text-[10px] leading-none">View</span>
                                                        </Link>
                                                    </Button>
                                                )}
                                                {hasPermission('goods-issue-edit') && gi.status === 'pending' && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/goods-issues/${gi.id}/edit`} className="flex flex-col items-center gap-0.5 h-auto py-1 w-14">
                                                            <Edit className="h-4 w-4" />
                                                            <span className="text-[10px] leading-none">Edit</span>
                                                        </Link>
                                                    </Button>
                                                )}
                                                {hasPermission('goods-issue-complete') && gi.status === 'pending' && (
                                                    <Button variant="ghost" size="sm"
                                                        onClick={() => setActionDialog({ open: true, id: gi.id, code: gi.code, action: 'complete', fromCompleted: false })}
                                                        className="flex flex-col items-center gap-0.5 h-auto py-1 w-14">
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                        <span className="text-[10px] leading-none">Complete</span>
                                                    </Button>
                                                )}
                                                {hasPermission('goods-issue-revert') && gi.status === 'cancelled' && !soIsCancelled && (
                                                    <Button variant="ghost" size="sm"
                                                        onClick={() => setActionDialog({ open: true, id: gi.id, code: gi.code, action: 'revert', fromCompleted: false })}
                                                        className="flex flex-col items-center gap-0.5 h-auto py-1 w-14">
                                                        <RotateCcw className="h-4 w-4 text-blue-600" />
                                                        <span className="text-[10px] leading-none">Revert</span>
                                                    </Button>
                                                )}
                                                {hasPermission('goods-issue-cancel') && ['pending', 'completed'].includes(gi.status) && (
                                                    <Button variant="ghost" size="sm"
                                                        onClick={() => setActionDialog({ open: true, id: gi.id, code: gi.code, action: 'cancel', fromCompleted: gi.status === 'completed' })}
                                                        className="flex flex-col items-center gap-0.5 h-auto py-1 w-14">
                                                        <XCircle className="h-4 w-4 text-orange-600" />
                                                        <span className="text-[10px] leading-none">Cancel</span>
                                                    </Button>
                                                )}
                                                {hasPermission('goods-issue-delete') && gi.status === 'pending' && (
                                                    <Button variant="ghost" size="sm"
                                                        onClick={() => setDeleteDialog({ open: true, id: gi.id, code: gi.code })}
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
                        <AlertDialogTitle>Delete Goods Issue?</AlertDialogTitle>
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
                            {actionDialog.action === 'complete' ? 'Complete Goods Issue?' :
                            actionDialog.action === 'revert'   ? 'Revert to Pending?'    : 'Cancel Goods Issue?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionDialog.action === 'complete' && `This will complete ${actionDialog.code} and deduct stock from inventory.`}
                            {actionDialog.action === 'revert'   && `This will revert ${actionDialog.code} back to pending.`}
                            {actionDialog.action === 'cancel'   && (actionDialog.fromCompleted
                                ? `This will cancel ${actionDialog.code} and restore inventory stock.`
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
        { title: 'Goods Issues', href: '/goods-issues' },
    ]}>{page}</AppLayout>
);
