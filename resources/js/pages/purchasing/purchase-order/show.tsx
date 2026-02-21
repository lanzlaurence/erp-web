import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { PurchaseOrderShowData } from '@/types';
import type { PurchaseOrderStatus } from '@/types/transactions';
import { useFormatters } from '@/hooks/use-formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, CheckCircle, XCircle, RotateCcw, PackageCheck, Eye } from 'lucide-react';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const STATUS_BADGE: Record<PurchaseOrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    draft:              { label: 'Draft',            variant: 'secondary' },
    posted:             { label: 'Posted',           variant: 'default' },
    partially_received: { label: 'Partial Received', variant: 'outline' },
    fully_received:     { label: 'Fully Received',   variant: 'success' },
    cancelled:          { label: 'Cancelled',        variant: 'destructive' },
};

type ConfirmAction = {
    open: boolean;
    action: 'post' | 'cancel' | 'revert' | null;
    label: string;
    description: string;
};

export default function Show({ purchaseOrder }: PurchaseOrderShowData) {
    const { formatAmount, formatDate, formatDateTime } = useFormatters();
    const { hasPermission } = usePermissions();
    const badge = STATUS_BADGE[purchaseOrder.status];

    const [confirm, setConfirm] = useState<ConfirmAction>({
        open: false, action: null, label: '', description: '',
    });

    const triggerAction = (action: ConfirmAction['action'], label: string, description: string) => {
        setConfirm({ open: true, action, label, description });
    };

    const handleConfirm = () => {
        if (!confirm.action) return;
        router.post(`/purchase-orders/${purchaseOrder.id}/${confirm.action}`);
        setConfirm({ open: false, action: null, label: '', description: '' });
    };

    return (
        <>
            <Head title={`PO ${purchaseOrder.code}`} />
            <div className="mx-auto max-w-7xl space-y-6 p-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold">{purchaseOrder.code}</h1>
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Created by {purchaseOrder.user?.name} on {formatDateTime(purchaseOrder.created_at)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/purchase-orders"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
                        </Button>

                        {hasPermission('po-edit') && purchaseOrder.status === 'draft' && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/purchase-orders/${purchaseOrder.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />Edit
                                </Link>
                            </Button>
                        )}

                        {hasPermission('po-post') && purchaseOrder.status === 'draft' && (
                            <Button size="sm"
                                onClick={() => triggerAction('post', 'Post Purchase Order', 'This will post the purchase order and lock it from editing.')}>
                                <CheckCircle className="mr-2 h-4 w-4" />Post
                            </Button>
                        )}

                        {hasPermission('po-revert') && purchaseOrder.status === 'posted' && (
                            <Button size="sm" variant="outline"
                                onClick={() => triggerAction('revert', 'Revert to Draft', 'This will revert the purchase order back to draft status.')}>
                                <RotateCcw className="mr-2 h-4 w-4" />Revert to Draft
                            </Button>
                        )}

                        {hasPermission('gr-create') && ['posted', 'partially_received'].includes(purchaseOrder.status) && (
                            <Button size="sm" asChild>
                                <Link href={`/purchase-orders/${purchaseOrder.id}/goods-receipts/create`}>
                                    <PackageCheck className="mr-2 h-4 w-4" />Create GR
                                </Link>
                            </Button>
                        )}

                        {/* Cancel */}
                        {hasPermission('po-cancel') && !['draft', 'cancelled'].includes(purchaseOrder.status) && (() => {
                            const hasCompletedGr = purchaseOrder.goodsReceipts?.some((gr) => gr.status === 'completed');
                            return hasCompletedGr ? (
                                <Button size="sm" variant="outline" disabled title="Cancel all goods receipts before cancelling this PO">
                                    <XCircle className="mr-2 h-4 w-4" />Cancel
                                </Button>
                            ) : (
                                <Button size="sm" variant="destructive"
                                    onClick={() => triggerAction('cancel', 'Cancel Purchase Order', 'This will cancel the purchase order.')}>
                                    <XCircle className="mr-2 h-4 w-4" />Cancel
                                </Button>
                            );
                        })()}

                        {/* Allow cancel from draft too */}
                        {hasPermission('po-cancel') && purchaseOrder.status === 'draft' && (
                            <Button size="sm" variant="destructive"
                                onClick={() => triggerAction('cancel', 'Cancel Purchase Order', 'This will cancel the purchase order.')}>
                                <XCircle className="mr-2 h-4 w-4" />Cancel
                            </Button>
                        )}
                    </div>
                </div>

                {/* Order Info */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Order Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Vendor</p>
                                <p className="font-medium">{purchaseOrder.vendor?.name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Reference No.</p>
                                <p>{purchaseOrder.reference_no || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Order Date</p>
                                <p>{formatDate(purchaseOrder.order_date)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Delivery Date</p>
                                <p>{purchaseOrder.delivery_date ? formatDate(purchaseOrder.delivery_date) : '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Payment Terms</p>
                                <p>{purchaseOrder.vendor?.payment_terms || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Credit Amount</p>
                                <p className="font-mono">{formatAmount(Number(purchaseOrder.vendor?.credit_amount ?? 0))}</p>
                            </div>
                        </div>
                        {purchaseOrder.remarks && (
                            <div>
                                <p className="text-sm text-muted-foreground">Remarks</p>
                                <p className="text-sm">{purchaseOrder.remarks}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 rounded-lg border p-6">
                        <h3 className="font-semibold">Summary</h3>
                        <div className="space-y-2 text-sm">
                            {[
                                { label: 'Total Before Discount', value: Number(purchaseOrder.total_before_discount) },
                                { label: 'Total Item Discount',   value: -Number(purchaseOrder.total_item_discount) },
                                { label: 'Total Net Price',       value: Number(purchaseOrder.total_net_price) },
                                { label: 'Total VAT',             value: Number(purchaseOrder.total_vat) },
                                { label: 'Total Gross',           value: Number(purchaseOrder.total_gross) },
                                { label: 'Header Discount',       value: -Number(purchaseOrder.header_discount_total) },
                                { label: 'Total Charges',         value: Number(purchaseOrder.total_charges) },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between">
                                    <span className="text-muted-foreground">{label}</span>
                                    <span className={`font-mono ${value < 0 ? 'text-red-600' : ''}`}>
                                        {value < 0 ? '-' : ''}{formatAmount(Math.abs(value))}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between border-t pt-2 font-semibold">
                                <span>Grand Total</span>
                                <span className="font-mono">{formatAmount(Number(purchaseOrder.grand_total))}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="space-y-4 rounded-lg border p-6">
                    <h3 className="font-semibold">Items</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Material</TableHead>
                                    <TableHead>Qty Ordered</TableHead>
                                    <TableHead>Qty Received</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>After Disc.</TableHead>
                                    <TableHead>Net Price</TableHead>
                                    <TableHead>VAT</TableHead>
                                    <TableHead>Gross Price</TableHead>
                                    <TableHead>Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchaseOrder.items?.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.line_number}</TableCell>
                                        <TableCell>
                                            <p className="font-medium">{item.material?.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.material?.code}</p>
                                        </TableCell>
                                        <TableCell className="font-mono">{Number(item.qty_ordered).toFixed(2)}</TableCell>
                                        <TableCell className="font-mono">{Number(item.qty_received).toFixed(2)}</TableCell>
                                        <TableCell className="font-mono">{formatAmount(Number(item.unit_price))}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {item.discount_type
                                                ? `${item.discount_type === 'percentage' ? `${item.discount_amount}%` : formatAmount(Number(item.discount_amount))}`
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="font-mono">{formatAmount(Number(item.unit_price_after_discount))}</TableCell>
                                        <TableCell className="font-mono">{formatAmount(Number(item.net_price))}</TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {item.is_vatable ? formatAmount(Number(item.vat_price)) : '-'}
                                        </TableCell>
                                        <TableCell className="font-mono font-medium">{formatAmount(Number(item.gross_price))}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{item.remarks || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Charges */}
                {purchaseOrder.charges && purchaseOrder.charges.length > 0 && (
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Charges</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Computed Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchaseOrder.charges.map((charge) => (
                                    <TableRow key={charge.id}>
                                        <TableCell>{charge.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={charge.type === 'tax' ? 'default' : 'destructive'}>
                                                {charge.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {charge.value_type === 'percentage'
                                                ? `${charge.value}%`
                                                : formatAmount(Number(charge.value))}
                                        </TableCell>
                                        <TableCell className="font-mono">{formatAmount(Number(charge.computed_amount))}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Goods Receipts */}
                {purchaseOrder.goods_receipts && purchaseOrder.goods_receipts.length > 0 && (
                    <div className="space-y-4 rounded-lg border p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">
                                Goods Receipts
                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                    ({purchaseOrder.goods_receipts.length})
                                </span>
                            </h3>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>GR Code</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>GR Date</TableHead>
                                    <TableHead>Transaction Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchaseOrder.goods_receipts.map((gr) => (
                                    <TableRow key={gr.id}>
                                        <TableCell className="font-mono font-medium">{gr.code}</TableCell>
                                        <TableCell>{gr.location?.name}</TableCell>
                                        <TableCell>{formatDate(gr.gr_date)}</TableCell>
                                        <TableCell>{formatDate(gr.transaction_date)}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                gr.status === 'completed' ? 'success' :
                                                gr.status === 'cancelled' ? 'destructive' : 'secondary'
                                            }>
                                                {gr.status.charAt(0).toUpperCase() + gr.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{gr.user?.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/goods-receipts/${gr.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Logs */}
                {purchaseOrder.logs && purchaseOrder.logs.length > 0 && (
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Transaction Log</h3>
                        <div className="space-y-3">
                            {purchaseOrder.logs.map((log) => (
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
        { title: 'Purchase Orders', href: '/purchase-orders' },
        { title: 'View', href: '#' },
    ]}>{page}</AppLayout>
);
