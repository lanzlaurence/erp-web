import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import AppLayout from '@/layouts/app-layout';
import type { GoodsReceiptShowData } from '@/types';
import type { GoodsReceiptStatus } from '@/types/transactions';
import { useFormatters } from '@/hooks/use-formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Edit } from 'lucide-react';
import { useState } from 'react';

const STATUS_BADGE: Record<GoodsReceiptStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
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

export default function Show({ goodsReceipt }: GoodsReceiptShowData) {
    const { formatAmount, formatDate, formatDateTime, formatDecimal } = useFormatters();
    const { hasPermission } = usePermissions();
    const badge = STATUS_BADGE[goodsReceipt.status];

    const [confirm, setConfirm] = useState<ConfirmAction>({
        open: false, action: null, label: '', description: '',
    });

    const triggerAction = (action: ConfirmAction['action'], label: string, description: string) => {
        setConfirm({ open: true, action, label, description });
    };

    const handleConfirm = () => {
        if (!confirm.action) return;
        router.post(`/goods-receipts/${goodsReceipt.id}/${confirm.action}`);
        setConfirm({ open: false, action: null, label: '', description: '' });
    };

    return (
        <>
            <Head title={`GR ${goodsReceipt.code}`} />
            <div className="mx-auto max-w-7xl space-y-6 p-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold">{goodsReceipt.code}</h1>
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Created by {goodsReceipt.user?.name} on {formatDateTime(goodsReceipt.created_at)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/goods-receipts"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
                        </Button>

                        {hasPermission('gr-edit') && goodsReceipt.status === 'pending' && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/goods-receipts/${goodsReceipt.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />Edit
                                </Link>
                            </Button>
                        )}

                        {/* Complete — only from pending */}
                        {hasPermission('gr-complete') && goodsReceipt.status === 'pending' && (
                            <Button size="sm"
                                onClick={() => triggerAction('complete', 'Complete Goods Receipt', 'This will receive the items and update inventory. This cannot be undone without cancelling.')}>
                                <CheckCircle className="mr-2 h-4 w-4" />Complete
                            </Button>
                        )}

                        {/* Cancel — from pending OR completed (completed will reverse inventory) */}
                        {hasPermission('gr-cancel') && ['pending', 'completed'].includes(goodsReceipt.status) && (
                            <Button size="sm" variant="destructive"
                                onClick={() => triggerAction(
                                    'cancel',
                                    'Cancel Goods Receipt',
                                    goodsReceipt.status === 'completed'
                                        ? 'This will cancel the goods receipt and REVERSE the inventory that was received. This action cannot be undone.'
                                        : 'This will cancel the goods receipt.'
                                )}>
                                <XCircle className="mr-2 h-4 w-4" />Cancel
                            </Button>
                        )}

                        {/* Revert — only from cancelled */}
                        {hasPermission('gr-revert') && goodsReceipt.status === 'cancelled' && (
                            <Button size="sm" variant="outline"
                                onClick={() => triggerAction('revert', 'Revert to Pending', 'This will revert the goods receipt back to pending. Inventory will NOT be restored — you must complete again.')}>
                                <RotateCcw className="mr-2 h-4 w-4" />Revert
                            </Button>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="space-y-4 rounded-lg border p-6">
                    <h3 className="font-semibold">Receipt Information</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Purchase Order</p>
                            <Link href={`/purchase-orders/${goodsReceipt.purchase_order?.id}`}
                                className="font-mono text-primary hover:underline">
                                {goodsReceipt.purchase_order?.code}
                            </Link>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Vendor</p>
                            <p>{goodsReceipt.purchase_order?.vendor?.name}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Destination</p>
                            <p>{goodsReceipt.destination?.name}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">GR Date</p>
                            <p>{formatDate(goodsReceipt.gr_date)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Transaction Date</p>
                            <p>{formatDate(goodsReceipt.transaction_date)}</p>
                        </div>
                    </div>
                    {goodsReceipt.remarks && (
                        <div>
                            <p className="text-sm text-muted-foreground">Remarks</p>
                            <p className="text-sm">{goodsReceipt.remarks}</p>
                        </div>
                    )}
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
                                    <TableHead>Qty Received</TableHead>
                                    <TableHead>Qty to Receive</TableHead>
                                    <TableHead>Qty Remaining</TableHead>
                                    <TableHead>Unit Cost</TableHead>
                                    <TableHead>Serial No.</TableHead>
                                    <TableHead>Batch No.</TableHead>
                                    <TableHead>Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {goodsReceipt.items?.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <p className="font-medium text-sm">{item.material?.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.material?.code}</p>
                                        </TableCell>
                                        <TableCell className="font-mono">{formatDecimal(Number(item.qty_ordered))}</TableCell>
                                        <TableCell className="font-mono">{formatDecimal(Number(item.qty_received))}</TableCell>
                                        <TableCell className="font-mono font-medium">{formatDecimal(Number(item.qty_to_receive))}</TableCell>
                                        <TableCell className="font-mono">{formatDecimal(Number(item.qty_remaining))}</TableCell>
                                        <TableCell className="font-mono">{formatAmount(Number(item.unit_cost))}</TableCell>
                                        <TableCell className="text-sm">{item.serial_number || '-'}</TableCell>
                                        <TableCell className="text-sm">{item.batch_number || '-'}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{item.remarks || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Logs */}
                {goodsReceipt.logs && goodsReceipt.logs.length > 0 && (
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Transaction Log</h3>
                        <div className="space-y-3">
                            {goodsReceipt.logs.map((log) => (
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
        { title: 'Goods Receipts', href: '/goods-receipts' },
        { title: 'View', href: '#' },
    ]}>{page}</AppLayout>
);
