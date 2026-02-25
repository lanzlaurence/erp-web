import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { useFormatters } from '@/hooks/use-formatters';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { PaginatedData } from '@/types';

type Location = { id: number; name: string };
type Category = { id: number; name: string };

type InventoryRow = {
    id: number;
    code: string;
    quantity: string;
    material: {
        id: number;
        code: string;
        name: string;
        avg_unit_cost: string;
        avg_unit_price: string;
        reorder_level: number | null;
        brand?: { name: string } | null;
        category?: { name: string } | null;
        uom?: { acronym: string } | null;
    } | null;
    location: { id: number; name: string } | null;
};

type Summary = {
    total_skus: number;
    zero_stock_count: number;
    total_cost_value: number;
    total_price_value: number;
};

type Props = {
    inventories: PaginatedData<InventoryRow>;
    locations: Location[];
    categories: Category[];
    filters: {
        location_id?: string;
        category_id?: string;
        material_search?: string;
        stock_filter?: string;
    };
    summary: Summary;
};

export default function InventoryReport({ inventories, locations, categories, filters, summary }: Props) {
    const { formatAmount, formatDecimal } = useFormatters();

    const [locationId,      setLocationId]      = useState(filters.location_id      ?? '');
    const [categoryId,      setCategoryId]      = useState(filters.category_id      ?? '');
    const [materialSearch,  setMaterialSearch]  = useState(filters.material_search  ?? '');
    const [stockFilter,     setStockFilter]     = useState(filters.stock_filter     ?? '');

    const applyFilters = () => {
        router.get('/analytics/inventory-report', {
            location_id:     locationId     || undefined,
            category_id:     categoryId     || undefined,
            material_search: materialSearch || undefined,
            stock_filter:    stockFilter    || undefined,
        }, { preserveScroll: true });
    };

    const clearFilters = () => {
        setLocationId(''); setCategoryId(''); setMaterialSearch(''); setStockFilter('');
        router.get('/analytics/inventory-report');
    };

    const getStockStatus = (row: InventoryRow): { label: string; variant: 'destructive' | 'outline' | 'success' | 'secondary' } => {
        const qty      = Number(row.quantity);
        const reorder  = row.material?.reorder_level ?? 0;
        if (qty <= 0)                         return { label: 'Zero Stock',  variant: 'destructive' };
        if (reorder > 0 && qty <= reorder)    return { label: 'Low Stock',   variant: 'outline' };
        return                                       { label: 'In Stock',    variant: 'success' };
    };

    return (
        <>
            <Head title="Inventory Report" />
            <div className="space-y-4 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Inventory Report</h1>
                    <p className="text-sm text-muted-foreground">Current stock levels with cost and price valuation</p>
                </div>

                {/* Filters */}
                <div className="rounded-lg border p-4 space-y-4">
                    <h3 className="font-semibold text-sm">Filters</h3>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs">Material</Label>
                            <Input
                                placeholder="Search by name or code"
                                value={materialSearch}
                                onChange={(e) => setMaterialSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Location</Label>
                            <Select value={locationId || 'all'} onValueChange={(v) => setLocationId(v === 'all' ? '' : v)}>
                                <SelectTrigger><SelectValue placeholder="All locations" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Locations</SelectItem>
                                    {locations.map((l) => (
                                        <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Category</Label>
                            <Select value={categoryId || 'all'} onValueChange={(v) => setCategoryId(v === 'all' ? '' : v)}>
                                <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Stock Status</Label>
                            <Select value={stockFilter || 'all'} onValueChange={(v) => setStockFilter(v === 'all' ? '' : v)}>
                                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="positive">In Stock</SelectItem>
                                    <SelectItem value="low">Low Stock</SelectItem>
                                    <SelectItem value="zero">Zero Stock</SelectItem>
                                </SelectContent>
                            </Select>
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
                        { label: 'Total SKUs',         value: String(summary.total_skus),                   mono: false },
                        { label: 'Zero Stock Items',   value: String(summary.zero_stock_count),             mono: false },
                        { label: 'Total Cost Value',   value: formatAmount(summary.total_cost_value),       mono: true  },
                        { label: 'Total Price Value',  value: formatAmount(summary.total_price_value),      mono: true  },
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
                                <TableHead>Inv. Code</TableHead>
                                <TableHead>Material</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>UOM</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Avg Unit Cost</TableHead>
                                <TableHead className="text-right">Cost Value</TableHead>
                                <TableHead className="text-right">Avg Unit Price</TableHead>
                                <TableHead className="text-right">Price Value</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventories.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={12} className="py-8 text-center text-sm text-muted-foreground">
                                        No inventory records found.
                                    </TableCell>
                                </TableRow>
                            ) : inventories.data.map((row) => {
                                const qty        = Number(row.quantity);
                                const avgCost    = Number(row.material?.avg_unit_cost ?? 0);
                                const avgPrice   = Number(row.material?.avg_unit_price ?? 0);
                                const costValue  = qty * avgCost;
                                const priceValue = qty * avgPrice;
                                const status     = getStockStatus(row);

                                return (
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            <Link href={`/inventories/${row.id}`} className="font-mono text-sm text-primary hover:underline">
                                                {row.code}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm font-medium">{row.material?.name}</p>
                                            <p className="text-xs text-muted-foreground">{row.material?.code}</p>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {row.material?.brand?.name ?? '-'}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {row.material?.category?.name ?? '-'}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {row.material?.uom?.acronym ?? '-'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {row.location?.name ?? '-'}
                                        </TableCell>
                                        <TableCell className="font-mono text-right">
                                            {formatDecimal(qty)}
                                        </TableCell>
                                        <TableCell className="font-mono text-right text-muted-foreground">
                                            {formatAmount(avgCost)}
                                        </TableCell>
                                        <TableCell className="font-mono text-right font-medium">
                                            {formatAmount(costValue)}
                                        </TableCell>
                                        <TableCell className="font-mono text-right text-muted-foreground">
                                            {formatAmount(avgPrice)}
                                        </TableCell>
                                        <TableCell className="font-mono text-right font-medium">
                                            {formatAmount(priceValue)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={status.variant}>{status.label}</Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>

                        {/* Page totals footer */}
                        {inventories.data.length > 0 && (
                            <tfoot>
                                <tr className="border-t-2 bg-muted/50 font-semibold">
                                    <td colSpan={8} className="px-4 py-3 text-sm text-right text-muted-foreground">
                                        Page Totals
                                    </td>
                                    <td className="px-4 py-3 font-mono text-right text-sm">
                                        {formatAmount(
                                            inventories.data.reduce((s, r) =>
                                                s + Number(r.quantity) * Number(r.material?.avg_unit_cost ?? 0), 0)
                                        )}
                                    </td>
                                    <td />
                                    <td className="px-4 py-3 font-mono text-right text-sm">
                                        {formatAmount(
                                            inventories.data.reduce((s, r) =>
                                                s + Number(r.quantity) * Number(r.material?.avg_unit_price ?? 0), 0)
                                        )}
                                    </td>
                                    <td />
                                </tr>
                            </tfoot>
                        )}
                    </Table>
                </div>

                {/* Pagination */}
                {inventories.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <p>Showing {inventories.from}–{inventories.to} of {inventories.total} records</p>
                        <div className="flex gap-1">
                            {inventories.links.map((link, i) => (
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

InventoryReport.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Analytics', href: '#' },
        { title: 'Inventory Report', href: '/analytics/inventory-report' },
    ]}>{page}</AppLayout>
);
