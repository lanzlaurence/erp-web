import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { useFormatters } from '@/hooks/use-formatters';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ShoppingBag } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import type { DashboardData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard({ materials }: DashboardData) {
    const { formatAmount, formatDecimal } = useFormatters();

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="space-y-4 p-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Dashboard</h1>
                        <p className="text-sm text-muted-foreground">Inventory overview and stock report</p>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead>UOM</TableHead>
                                    <TableHead className="text-right">Unit Cost</TableHead>
                                    <TableHead className="text-right">Avg Unit Cost</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Avg Unit Price</TableHead>
                                    <TableHead className="text-right">Current Stock</TableHead>
                                    <TableHead className="text-right">Total Stock Value</TableHead>
                                    <TableHead className="text-right">Total Sold Value</TableHead>
                                    <TableHead className="text-right">History</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {materials.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={15} className="py-8 text-center text-sm text-muted-foreground">
                                            No materials found.
                                        </TableCell>
                                    </TableRow>
                                ) : materials.map((material) => (
                                    <TableRow key={material.id}>
                                        <TableCell className="font-mono text-sm">{material.code}</TableCell>
                                        <TableCell className="font-mono text-sm">{material.sku || '-'}</TableCell>
                                        <TableCell className="font-medium">{material.name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-48 truncate">{material.description || '-'}</TableCell>
                                        <TableCell>{material.category || '-'}</TableCell>
                                        <TableCell>{material.brand || '-'}</TableCell>
                                        <TableCell>{material.uom || '-'}</TableCell>
                                        <TableCell className="text-right font-mono">{formatAmount(material.unit_cost)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatAmount(material.avg_unit_cost)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatAmount(material.unit_price)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatAmount(material.avg_unit_price)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatDecimal(material.current_stock)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatAmount(material.total_stock_value)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatAmount(material.total_sold_value)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/dashboard/material/${material.id}/purchase-history`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                                                        <span className="text-[10px] leading-none">Purchase</span>
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/dashboard/material/${material.id}/sales-history`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                                        <ShoppingBag className="h-4 w-4 text-green-600" />
                                                        <span className="text-[10px] leading-none">Sales</span>
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
