import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { useFormatters } from '@/hooks/use-formatters';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { PaginatedData } from '@/types';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/transactions';
import type { Vendor } from '@/types';
import DatePicker from '@/components/ui/date-picker';
import ReactSelect from 'react-select';

type Props = {
    purchaseOrders: PaginatedData<PurchaseOrder>;
    vendors: Vendor[];
    filters: {
        vendor_id?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
};

const STATUS_BADGE: Record<PurchaseOrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    draft:              { label: 'Draft',            variant: 'secondary' },
    posted:             { label: 'Posted',           variant: 'default' },
    partially_received: { label: 'Partial Received', variant: 'outline' },
    fully_received:     { label: 'Fully Received',   variant: 'success' },
    cancelled:          { label: 'Cancelled',        variant: 'destructive' },
};

export default function PurchaseOrderReport({ purchaseOrders, vendors, filters }: Props) {
    const { formatAmount, formatDate, formatDecimal } = useFormatters();

    const [vendorId,  setVendorId]  = useState(filters.vendor_id  ?? '');
    const [status,    setStatus]    = useState(filters.status      ?? '');
    const [dateFrom,  setDateFrom]  = useState(filters.date_from   ?? '');
    const [dateTo,    setDateTo]    = useState(filters.date_to     ?? '');

    const vendorOptions = vendors.map((v) => ({ value: String(v.id), label: `${v.code} — ${v.name}` }));

    const selectClass = {
        control: () => 'border border-input bg-background text-sm rounded-md px-1 py-0.5 min-h-9',
        menu: () => 'bg-popover border border-border rounded-md shadow-md text-sm mt-1',
        option: ({ isFocused, isSelected }: { isFocused: boolean; isSelected: boolean }) =>
            `px-3 py-2 cursor-pointer ${isSelected ? 'bg-primary text-primary-foreground' : isFocused ? 'bg-accent text-accent-foreground' : ''}`,
        singleValue: () => 'text-foreground',
        input: () => 'text-foreground',
        placeholder: () => 'text-muted-foreground',
    };

    const applyFilters = () => {
        router.get('/reports/purchase-orders', {
            vendor_id:  vendorId  || undefined,
            status:     status    || undefined,
            date_from:  dateFrom  || undefined,
            date_to:    dateTo    || undefined,
        }, { preserveScroll: true });
    };

    const clearFilters = () => {
        setVendorId(''); setStatus(''); setDateFrom(''); setDateTo('');
        router.get('/reports/purchase-orders');
    };

    // Flatten all PO items into rows
    const rows = purchaseOrders.data.flatMap((po) =>
        (po.items ?? []).map((item) => ({ po, item }))
    );

    // Grand totals
    const grandTotal    = purchaseOrders.data.reduce((s, po) => s + Number(po.grand_total), 0);
    const totalGross    = purchaseOrders.data.reduce((s, po) => s + Number(po.total_gross), 0);
    const totalVat      = purchaseOrders.data.reduce((s, po) => s + Number(po.total_vat), 0);
    const totalDiscount = purchaseOrders.data.reduce((s, po) => s + Number(po.total_item_discount), 0);

    return (
        <>
            <Head title="Purchase Order Report" />
            <div className="space-y-4 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Purchase Order Report</h1>
                    <p className="text-sm text-muted-foreground">Item-level breakdown of all purchase orders</p>
                </div>

                {/* Filters */}
                <div className="rounded-lg border p-4 space-y-4">
                    <h3 className="font-semibold text-sm">Filters</h3>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs">Vendor</Label>
                            <ReactSelect
                                options={vendorOptions}
                                value={vendorOptions.find((o) => o.value === vendorId) ?? null}
                                onChange={(opt) => setVendorId(opt?.value ?? '')}
                                placeholder="All vendors"
                                isClearable
                                classNames={selectClass}
                                unstyled
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Status</Label>
                            <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
                                <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="posted">Posted</SelectItem>
                                    <SelectItem value="partially_received">Partial Received</SelectItem>
                                    <SelectItem value="fully_received">Fully Received</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Date From</Label>
                            <DatePicker value={dateFrom} onValueChange={setDateFrom} placeholder="Start date" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Date To</Label>
                            <DatePicker value={dateTo} onValueChange={setDateTo} placeholder="End date" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={applyFilters}>Apply Filters</Button>
                        <Button size="sm" variant="outline" onClick={clearFilters}>Clear</Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Total Orders',   value: String(purchaseOrders.total), mono: false },
                        { label: 'Total Discount', value: formatAmount(totalDiscount),  mono: true },
                        { label: 'Total VAT',      value: formatAmount(totalVat),       mono: true },
                        { label: 'Grand Total',    value: formatAmount(grandTotal),     mono: true },
                    ].map(({ label, value, mono }) => (
                        <div key={label} className="rounded-lg border p-4">
                            <p className="text-xs text-muted-foreground">{label}</p>
                            <p className={`text-xl font-semibold mt-1 ${mono ? 'font-mono' : ''}`}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>PO Code</TableHead>
                                <TableHead>Order Date</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>#</TableHead>
                                <TableHead>Material</TableHead>
                                <TableHead>UOM</TableHead>
                                <TableHead className="text-right">Qty Ordered</TableHead>
                                <TableHead className="text-right">Qty Received</TableHead>
                                <TableHead className="text-right">Qty Remaining</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead>Disc.</TableHead>
                                <TableHead className="text-right">Net Price</TableHead>
                                <TableHead className="text-right">VAT</TableHead>
                                <TableHead className="text-right">Gross</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={15} className="py-8 text-center text-sm text-muted-foreground">
                                        No data found.
                                    </TableCell>
                                </TableRow>
                            ) : rows.map(({ po, item }, i) => {
                                const isFirstItem = (po.items?.indexOf(item) ?? 0) === 0;
                                const badge = STATUS_BADGE[po.status];
                                const qtyRemaining = Number(item.qty_ordered) - Number(item.qty_received);

                                return (
                                    <TableRow key={`${po.id}-${item.id}`}
                                        className={i % 2 === 0 ? '' : 'bg-muted/20'}>

                                        {/* PO-level cells — only show on first item row */}
                                        <TableCell className="font-mono font-medium">
                                            {isFirstItem ? (
                                                <Link href={`/purchase-orders/${po.id}`}
                                                    className="text-primary hover:underline">
                                                    {po.code}
                                                </Link>
                                            ) : ''}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                            {isFirstItem ? formatDate(po.order_date) : ''}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {isFirstItem ? po.vendor?.name : ''}
                                        </TableCell>
                                        <TableCell>
                                            {isFirstItem ? (
                                                <Badge variant={badge.variant}>{badge.label}</Badge>
                                            ) : ''}
                                        </TableCell>

                                        {/* Item-level cells */}
                                        <TableCell className="text-muted-foreground">{item.line_number}</TableCell>
                                        <TableCell>
                                            <p className="font-medium text-sm">{item.material?.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.material?.code}</p>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {item.material?.uom?.acronym ?? '-'}
                                        </TableCell>
                                        <TableCell className="font-mono text-right">
                                            {formatDecimal(Number(item.qty_ordered))}
                                        </TableCell>
                                        <TableCell className="font-mono text-right">
                                            {formatDecimal(Number(item.qty_received))}
                                        </TableCell>
                                        <TableCell className={`font-mono text-right ${qtyRemaining > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                                            {formatDecimal(qtyRemaining)}
                                        </TableCell>
                                        <TableCell className="font-mono text-right">
                                            {formatAmount(Number(item.unit_price))}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {item.discount_type
                                                ? item.discount_type === 'percentage'
                                                    ? `${item.discount_amount}%`
                                                    : formatAmount(Number(item.discount_amount))
                                                : 'net'}
                                        </TableCell>
                                        <TableCell className="font-mono text-right">
                                            {formatAmount(Number(item.net_price))}
                                        </TableCell>
                                        <TableCell className="font-mono text-right text-muted-foreground">
                                            {item.is_vatable ? formatAmount(Number(item.vat_price)) : '-'}
                                        </TableCell>
                                        <TableCell className="font-mono text-right font-medium">
                                            {formatAmount(Number(item.gross_price))}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>

                        {/* Footer totals */}
                        {rows.length > 0 && (
                            <tfoot>
                                <tr className="border-t-2 bg-muted/50 font-semibold">
                                    <td colSpan={12} className="px-4 py-3 text-sm text-right text-muted-foreground">
                                        Page Totals
                                    </td>
                                    <td className="px-4 py-3 font-mono text-right text-sm">
                                        {formatAmount(purchaseOrders.data.reduce((s, po) => s + Number(po.total_net_price), 0))}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-right text-sm text-muted-foreground">
                                        {formatAmount(totalVat)}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-right text-sm">
                                        {formatAmount(totalGross)}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </Table>
                </div>

                {/* Pagination */}
                {purchaseOrders.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <p>Showing {purchaseOrders.from}–{purchaseOrders.to} of {purchaseOrders.total} orders</p>
                        <div className="flex gap-1">
                            {purchaseOrders.links.map((link, i) => (
                                link.url ? (
                                    <Link key={i} href={link.url}
                                        className={`px-3 py-1 rounded border text-sm ${link.active ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span key={i}
                                        className="px-3 py-1 rounded border border-border text-muted-foreground opacity-50 text-sm"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

PurchaseOrderReport.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Analytics', href: '#' },
        { title: 'Purchase Order Report', href: '/reports/purchase-orders' },
    ]}>{page}</AppLayout>
);
