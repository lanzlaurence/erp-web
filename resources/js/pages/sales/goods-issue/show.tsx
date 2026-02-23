import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import AppLayout from '@/layouts/app-layout';
import type { GoodsIssueShowData } from '@/types';
import type { GoodsIssueStatus } from '@/types/transactions';
import { useFormatters } from '@/hooks/use-formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import ClickableCode from '@/components/ui/clickable-code';

const STATUS_BADGE: Record<GoodsIssueStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    pending:   { label: 'Pending',   variant: 'secondary' },
    completed: { label: 'Completed', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'destructive' },
};

type ConfirmAction = {
    open: boolean;
    action: 'complete' | 'cancel' | 'revert' | null;
    label: string;
    description: string;
};

export default function Show({ goodsIssue }: GoodsIssueShowData) {
    const { formatAmount, formatDate, formatDecimal, formatDateTime } = useFormatters();
    const { hasPermission } = usePermissions();
    const badge = STATUS_BADGE[goodsIssue.status];

    const [confirm, setConfirm] = useState<ConfirmAction>({ open: false, action: null, label: '', description: '' });

    const triggerAction = (action: ConfirmAction['action'], label: string, description: string) => {
        setConfirm({ open: true, action, label, description });
    };

    const handleConfirm = () => {
        if (!confirm.action) return;
        router.post(`/goods-issues/${goodsIssue.id}/${confirm.action}`);
        setConfirm({ open: false, action: null, label: '', description: '' });
    };

    return (
        <>
            <Head title={`GI ${goodsIssue.code}`} />
            <div className="mx-auto max-w-7xl space-y-6 p-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold">{goodsIssue.code}</h1>
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Created by {goodsIssue.user?.name} on {formatDateTime(goodsIssue.created_at)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/goods-issues"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
                        </Button>

                        {hasPermission('goods-issue-edit') && goodsIssue.status === 'pending' && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/goods-issues/${goodsIssue.id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit</Link>
                            </Button>
                        )}

                        {hasPermission('goods-issue-complete') && goodsIssue.status === 'pending' && (
                            <Button size="sm" onClick={() => triggerAction('complete', 'Complete Goods Issue', 'This will complete the GI and deduct stock from inventory.')}>
                                <CheckCircle className="mr-2 h-4 w-4" />Complete
                            </Button>
                        )}

                        {hasPermission('goods-issue-revert') && goodsIssue.status === 'cancelled' && (
                            <Button size="sm" variant="outline" onClick={() => triggerAction('revert', 'Revert to Pending', 'This will revert the goods issue back to pending status.')}>
                                <RotateCcw className="mr-2 h-4 w-4" />Revert to Pending
                            </Button>
                        )}

                        {hasPermission('goods-issue-cancel') && ['pending', 'completed'].includes(goodsIssue.status) && (
                            <Button size="sm" variant="destructive"
                                onClick={() => triggerAction('cancel', 'Cancel Goods Issue',
                                    goodsIssue.status === 'completed'
                                        ? 'This will cancel the GI and restore inventory stock.'
                                        : 'This will cancel the goods issue.'
                                )}>
                                <XCircle className="mr-2 h-4 w-4" />Cancel
                            </Button>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="rounded-lg border p-6">
                    <h3 className="font-semibold mb-4">Issue Information</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Sales Order</p>
                            <ClickableCode href={`/sales-orders/${goodsIssue.salesOrder?.id}`} value={goodsIssue.salesOrder?.code} />
                        </div>
                        <div>
                            <p className="text-muted-foreground">Customer</p>
                            <ClickableCode href={`/customers/${goodsIssue.salesOrder?.customer?.id}`} value={goodsIssue.salesOrder?.customer?.name} />
                        </div>
                        <div>
                            <p className="text-muted-foreground">Location</p>
                            <p>{goodsIssue.location?.name}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">GI Date</p>
                            <p>{formatDate(goodsIssue.gi_date)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Transaction Date</p>
                            <p>{formatDate(goodsIssue.transaction_date)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Created By</p>
                            <p>{goodsIssue.user?.name}</p>
                        </div>
                        {goodsIssue.remarks && (
                            <div className="col-span-3">
                                <p className="text-muted-foreground">Remarks</p>
                                <p>{goodsIssue.remarks}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Items */}
                <div className="space-y-4 rounded-lg border p-6">
                    <h3 className="font-semibold">Items</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Material</TableHead>
                                    <TableHead>Qty Ordered</TableHead>
                                    <TableHead>Qty Shipped (SO)</TableHead>
                                    <TableHead>Qty to Ship</TableHead>
                                    <TableHead>Qty Remaining</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Serial No.</TableHead>
                                    <TableHead>Batch No.</TableHead>
                                    <TableHead>Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {goodsIssue.items?.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <p className="font-medium">{item.material?.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.material?.code}</p>
                                        </TableCell>
                                        <TableCell className="font-mono">{formatDecimal(Number(item.qty_ordered))}</TableCell>
                                        <TableCell className="font-mono">{formatDecimal(Number(item.qty_shipped))}</TableCell>
                                        <TableCell className="font-mono font-medium">{formatDecimal(Number(item.qty_to_ship))}</TableCell>
                                        <TableCell className="font-mono text-muted-foreground">{formatDecimal(Number(item.qty_remaining))}</TableCell>
                                        <TableCell className="font-mono">{formatAmount(Number(item.unit_price))}</TableCell>
                                        <TableCell>{item.serial_number || '-'}</TableCell>
                                        <TableCell>{item.batch_number || '-'}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{item.remarks || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Logs */}
                {goodsIssue.logs && goodsIssue.logs.length > 0 && (
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Transaction Log</h3>
                        <div className="space-y-3">
                            {goodsIssue.logs.map((log) => (
                                <div key={log.id} className="flex items-start gap-3 text-sm">
                                    <div className="mt-0.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                                    <div className="flex-1">
                                        <p>
                                            <span className="font-medium">{log.user?.name}</span>
                                            {' '}<span className="text-muted-foreground">{log.action}</span>
                                            {log.from_status && log.to_status && (
                                                <span className="text-muted-foreground"> · {log.from_status} → {log.to_status}</span>
                                            )}
                                        </p>
                                        {log.remarks && <p className="text-muted-foreground">{log.remarks}</p>}
                                        <p className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <AlertDialog open={confirm.open} onOpenChange={(open) => setConfirm({ ...confirm, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirm.label}</AlertDialogTitle>
                        <AlertDialogDescription>{confirm.description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Goods Issues', href: '/goods-issues' },
        { title: 'View', href: '#' },
    ]}>{page}</AppLayout>
);
