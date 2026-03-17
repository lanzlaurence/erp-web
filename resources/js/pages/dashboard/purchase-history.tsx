import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { useFormatters } from '@/hooks/use-formatters';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ClickableCode from '@/components/ui/clickable-code';
import type { PurchaseHistoryItem, StockByLocation } from '@/types';

type Props = {
    material: { id: number; code: string; name: string; uom: string | null };
    purchaseHistory: PurchaseHistoryItem[];
    stockByLocation: StockByLocation[];
};

export default function PurchaseHistory({ material, purchaseHistory, stockByLocation }: Props) {
    const { formatAmount, formatDecimal, formatDate } = useFormatters();

    return (
        <>
            <Head title={`Purchase History — ${material.name}`} />
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Purchase History</h1>
                        <p className="text-sm text-muted-foreground">{material.code} — {material.name}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
                    </Button>
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold">Purchase Orders</h3>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>PO Code</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Order Date</TableHead>
                                    <TableHead>UOM</TableHead>
                                    <TableHead className="text-right">Discount</TableHead>
                                    <TableHead className="text-right">Unit Cost After Disc.</TableHead>
                                    <TableHead className="text-right">Qty Ordered</TableHead>
                                    <TableHead className="text-right">Net Cost</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchaseHistory.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                                            No purchase history found.
                                        </TableCell>
                                    </TableRow>
                                ) : purchaseHistory.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell><ClickableCode href={`/purchase-orders/${row.po_id}`} value={row.po_code} /></TableCell>
                                        <TableCell><ClickableCode href={`/vendors/${row.vendor_id}`} value={row.vendor_code} /></TableCell>
                                        <TableCell>{formatDate(row.order_date)}</TableCell>
                                        <TableCell>{row.uom || '-'}</TableCell>
                                        <TableCell className="text-right font-mono">{formatAmount(row.discount_amount)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatAmount(row.unit_cost_after_discount)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatDecimal(row.qty_ordered)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatAmount(row.net_cost)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold">Stock by Location</h3>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Location</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stockByLocation.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2} className="py-8 text-center text-sm text-muted-foreground">
                                            No stock found.
                                        </TableCell>
                                    </TableRow>
                                ) : stockByLocation.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{row.location_name}</TableCell>
                                        <TableCell className="text-right font-mono">{formatDecimal(row.quantity)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </>
    );
}

PurchaseHistory.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Purchase History', href: '#' },
    ]}>{page}</AppLayout>
);
