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
import { Eye, Edit, Trash2 } from 'lucide-react';
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

    const handleDeleteConfirm = () => {
        router.delete(`/goods-issues/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, code: '' });
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
                                            <div className="flex justify-end gap-2">
                                                {hasPermission('goods-issue-view') && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/goods-issues/${gi.id}`}><Eye className="h-4 w-4" /></Link>
                                                    </Button>
                                                )}
                                                {hasPermission('goods-issue-edit') && gi.status === 'pending' && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/goods-issues/${gi.id}/edit`}><Edit className="h-4 w-4" /></Link>
                                                    </Button>
                                                )}
                                                {hasPermission('goods-issue-delete') && gi.status === 'pending' && (
                                                    <Button variant="ghost" size="sm"
                                                        onClick={() => setDeleteDialog({ open: true, id: gi.id, code: gi.code })}>
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
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Goods Issues', href: '/goods-issues' },
    ]}>{page}</AppLayout>
);
