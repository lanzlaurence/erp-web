import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import AppLayout from '@/layouts/app-layout';
import type { SalesOrderShowData } from '@/types';
import type { SalesOrderStatus } from '@/types/transactions';
import { useFormatters } from '@/hooks/use-formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, CheckCircle, XCircle, RotateCcw, PackageCheck, Eye } from 'lucide-react';
import { useState } from 'react';
import ClickableCode from '@/components/ui/clickable-code';

const STATUS_BADGE: Record<SalesOrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    draft:            { label: 'Draft',          variant: 'secondary' },
    posted:           { label: 'Posted',         variant: 'default' },
    partially_issued: { label: 'Partial Issued', variant: 'outline' },
    fully_issued:     { label: 'Fully Issued',   variant: 'success' },
    cancelled:        { label: 'Cancelled',      variant: 'destructive' },
};

type ConfirmAction = {
    open: boolean;
    action: 'post' | 'cancel' | 'revert' | null;
    label: string;
    description: string;
};

export default function Show({ salesOrder }: SalesOrderShowData) {
    const { formatAmount, formatDate, formatDateTime } = useFormatters();
    const { hasPermission } = usePermissions();
    const badge = STATUS_BADGE[salesOrder.status];

    const [confirm, setConfirm] = useState<ConfirmAction>({ open: false, action: null, label: '', description: '' });

    const triggerAction = (action: ConfirmAction['action'], label: string, description: string) => {
        setConfirm({ open: true, action, label, description });
    };

    const handleConfirm = () => {
        if (!confirm.action) return;
        router.post(`/sales-orders/${salesOrder.id}/${confirm.action}`);
        setConfirm({ open: false, action: null, label: '', description: '' });
    };

    return (
        <>
            <Head title={`SO ${salesOrder.code}`} />
            <div className="mx-auto max-w-7xl space-y-6 p-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold">{salesOrder.code}</h1>
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Created by {salesOrder.user?.name} on {formatDateTime(salesOrder.created_at)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/sales-orders"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
                        </Button>

                        {hasPermission('sales-order-edit') && salesOrder.status === 'draft' && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/sales-orders/${salesOrder.id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit</Link>
                            </Button>
                        )}

                        {hasPermission('sales-order-post') && salesOrder.status === 'draft' && (
                            <Button size="sm" onClick={() => triggerAction('post', 'Post Sales Order', 'This will post the sales order and lock it from editing.')}>
                                <CheckCircle className="mr-2 h-4 w-4" />Post
                            </Button>
                        )}

                        {hasPermission('sales-order-revert') && salesOrder.status === 'posted' && (
                            <Button size="sm" variant="outline" onClick={() => triggerAction('revert', 'Revert to Draft', 'This will revert the sales order back to draft status.')}>
                                <RotateCcw className="mr-2 h-4 w-4" />Revert to Draft
                            </Button>
                        )}

                        {hasPermission('goods-issue-create') && ['posted', 'partially_issued'].includes(salesOrder.status) && (
                            <Button size="sm" asChild>
                                <Link href={`/sales-orders/${salesOrder.id}/goods-issues/create`}>
                                    <PackageCheck className="mr-2 h-4 w-4" />Create GI
                                </Link>
                            </Button>
                        )}

                        {hasPermission('sales-order-cancel') && !['draft', 'cancelled'].includes(salesOrder.status) && (() => {
                            const hasCompletedGi = salesOrder.goodsIssues?.some((gi) => gi.status === 'completed');
                            return hasCompletedGi ? (
                                <Button size="sm" variant="outline" disabled title="Cancel all goods issues before cancelling this SO">
                                    <XCircle className="mr-2 h-4 w-4" />Cancel
                                </Button>
                            ) : (
                                <Button size="sm" variant="destructive" onClick={() => triggerAction('cancel', 'Cancel Sales Order', 'This will cancel the sales order.')}>
                                    <XCircle className="mr-2 h-4 w-4" />Cancel
                                </Button>
                            );
                        })()}

                        {hasPermission('sales-order-cancel') && salesOrder.status === 'draft' && (
                            <Button size="sm" variant="destructive" onClick={() => triggerAction('cancel', 'Cancel Sales Order', 'This will cancel the sales order.')}>
                                <XCircle className="mr-2 h-4 w-4" />Cancel
                            </Button>
                        )}
                    </div>
                </div>

                {/* Order Info + Summary */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Order Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Customer</p>
                                <ClickableCode href={`/customers/${salesOrder.customer?.id}`} value={salesOrder.customer?.name} />
                            </div>
                            <div>
                                <p className="text-muted-foreground">Reference No.</p>
                                <p>{salesOrder.reference_no || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Order Date</p>
                                <p>{formatDate(salesOrder.order_date)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Delivery Date</p>
                                <p>{salesOrder.delivery_date ? formatDate(salesOrder.delivery_date) : '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Payment Terms</p>
                                <p>{salesOrder.customer?.payment_terms || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Credit Amount</p>
                                <p className="font-mono">{formatAmount(Number(salesOrder.customer?.credit_amount ?? 0))}</p>
                            </div>
                        </div>
                        {salesOrder.remarks && (
                            <div>
                                <p className="text-sm text-muted-foreground">Remarks</p>
                                <p className="text-sm">{salesOrder.remarks}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 rounded-lg border p-6">
                        <h3 className="font-semibold">Summary</h3>
                        <div className="space-y-2 text-sm">
                            {[
                                { label: 'Total Before Discount', value: Number(salesOrder.total_before_discount) },
                                { label: 'Total Item Discount',   value: -Number(salesOrder.total_item_discount) },
                                { label: 'Total Net Price',       value: Number(salesOrder.total_net_price) },
                                { label: 'Total VAT',             value: Number(salesOrder.total_vat) },
                                { label: 'Total Gross',           value: Number(salesOrder.total_gross) },
                                { label: 'Header Discount',       value: -Number(salesOrder.header_discount_total) },
                                { label: 'Total Charges',         value: Number(salesOrder.total_charges) },
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
                                <span className="font-mono">{formatAmount(Number(salesOrder.grand_total))}</span>
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
                                    <TableHead>Qty Issued</TableHead>
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
                                {salesOrder.items?.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.line_number}</TableCell>
                                        <TableCell>
                                            <p className="font-medium">{item.material?.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.material?.code}</p>
                                        </TableCell>
                                        <TableCell className="font-mono">{Number(item.qty_ordered).toFixed(2)}</TableCell>
                                        <TableCell className="font-mono">{Number(item.qty_issued).toFixed(2)}</TableCell>
                                        <TableCell className="font-mono">{formatAmount(Number(item.unit_price))}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {item.discount_type ? `${item.discount_type === 'percentage' ? `${item.discount_amount}%` : formatAmount(Number(item.discount_amount))}` : '-'}
                                        </TableCell>
                                        <TableCell className="font-mono">{formatAmount(Number(item.unit_price_after_discount))}</TableCell>
                                        <TableCell className="font-mono">{formatAmount(Number(item.net_price))}</TableCell>
                                        <TableCell className="font-mono text-sm">{item.is_vatable ? formatAmount(Number(item.vat_price)) : '-'}</TableCell>
                                        <TableCell className="font-mono font-medium">{formatAmount(Number(item.gross_price))}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{item.remarks || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Charges */}
                {salesOrder.charges && salesOrder.charges.length > 0 && (
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
                                {salesOrder.charges.map((charge) => (
                                    <TableRow key={charge.id}>
                                        <TableCell>{charge.name}</TableCell>
                                        <TableCell><Badge variant={charge.type === 'tax' ? 'default' : 'destructive'}>{charge.type}</Badge></TableCell>
                                        <TableCell>{charge.value_type === 'percentage' ? `${charge.value}%` : formatAmount(Number(charge.value))}</TableCell>
                                        <TableCell className="font-mono">{formatAmount(Number(charge.computed_amount))}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Goods Issues */}
                {salesOrder.goods_issues && salesOrder.goods_issues.length > 0 && (
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">
                            Goods Issues
                            <span className="ml-2 text-sm font-normal text-muted-foreground">({salesOrder.goods_issues.length})</span>
                        </h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>GI Code</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>GI Date</TableHead>
                                    <TableHead>Transaction Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salesOrder.goods_issues.map((gi) => (
                                    <TableRow key={gi.id}>
                                        <TableCell><ClickableCode href={`/goods-issues/${gi.id}`} value={gi.code} /></TableCell>
                                        <TableCell>{gi.location?.name}</TableCell>
                                        <TableCell>{formatDate(gi.gi_date)}</TableCell>
                                        <TableCell>{formatDate(gi.transaction_date)}</TableCell>
                                        <TableCell>
                                            <Badge variant={gi.status === 'completed' ? 'success' : gi.status === 'cancelled' ? 'destructive' : 'secondary'}>
                                                {gi.status.charAt(0).toUpperCase() + gi.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{gi.user?.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/goods-issues/${gi.id}`}><Eye className="h-4 w-4" /></Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Logs */}
                {salesOrder.logs && salesOrder.logs.length > 0 && (
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Transaction Log</h3>
                        <div className="space-y-3">
                            {salesOrder.logs.map((log) => (
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
        { title: 'Sales Orders', href: '/sales-orders' },
        { title: 'View', href: '#' },
    ]}>{page}</AppLayout>
);
