import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { useFormatters } from '@/hooks/use-formatters';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ShoppingBag } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import type { BreadcrumbItem, DashboardData, DashboardMaterialRow } from '@/types';
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import ClickableCode from '@/components/ui/clickable-code';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard({ materials }: DashboardData) {
    const { formatAmount, formatDecimal } = useFormatters();
    const { preferences } = usePage<SharedData>().props;

    const columns: ColumnDef<DashboardMaterialRow>[] = [
        {
            accessorKey: 'sku',
            header: 'SKU',
            size: 100,
            cell: ({ row }) => <span className="font-mono text-sm">{row.original.sku || '-'}</span>,
        },
        {
            accessorKey: 'code',
            header: 'Material',
            size: 200,
            filterFn: 'multiField' as any,
            cell: ({ row }) => (
                <div>
                    <ClickableCode href={`/materials/${row.original.id}`} value={row.original.code} />
                    <p className="text-xs text-muted-foreground">{row.original.name}</p>
                </div>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Material Name',
            size: 0,
            meta: { hidden: true },
        },
        {
            accessorKey: 'description',
            header: 'Description',
            size: 200,
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground max-w-48 truncate block">
                    {row.original.description || '-'}
                </span>
            ),
        },
        {
            accessorKey: 'category',
            header: 'Category',
            size: 130,
            cell: ({ row }) => row.original.category || '-',
        },
        {
            accessorKey: 'brand',
            header: 'Brand',
            size: 120,
            cell: ({ row }) => row.original.brand || '-',
        },
        {
            accessorKey: 'uom',
            header: 'UOM',
            size: 100,
            cell: ({ row }) => row.original.uom || '-',
        },
        {
            accessorKey: 'unit_cost',
            header: 'Unit Cost',
            size: 120,
            cell: ({ row }) => <span className="font-mono">{formatAmount(row.original.unit_cost)}</span>,
        },
        {
            accessorKey: 'avg_unit_cost',
            header: 'Avg Unit Cost',
            size: 140,
            cell: ({ row }) => <span className="font-mono">{formatAmount(row.original.avg_unit_cost)}</span>,
        },
        {
            accessorKey: 'unit_price',
            header: 'Unit Price',
            size: 120,
            cell: ({ row }) => <span className="font-mono">{formatAmount(row.original.unit_price)}</span>,
        },
        {
            accessorKey: 'avg_unit_price',
            header: 'Avg Unit Price',
            size: 140,
            cell: ({ row }) => <span className="font-mono">{formatAmount(row.original.avg_unit_price)}</span>,
        },
        {
            accessorKey: 'current_stock',
            header: 'Current Stock',
            size: 130,
            cell: ({ row }) => <span className="font-mono">{formatDecimal(row.original.current_stock)}</span>,
        },
        {
            accessorKey: 'total_stock_value',
            header: 'Total Stock Value',
            size: 160,
            cell: ({ row }) => <span className="font-mono">{formatAmount(row.original.total_stock_value)}</span>,
        },
        {
            accessorKey: 'total_sold_value',
            header: 'Total Sold Value',
            size: 150,
            cell: ({ row }) => <span className="font-mono">{formatAmount(row.original.total_sold_value)}</span>,
        },
        {
            id: 'actions',
            header: 'History',
            enableSorting: false,
            enableColumnFilter: false,
            size: 130,
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/material/${row.original.id}/purchase-history`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                            <span className="text-[10px] leading-none">Purchase</span>
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/material/${row.original.id}/sales-history`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                            <ShoppingBag className="h-4 w-4 text-green-600" />
                            <span className="text-[10px] leading-none">Sales</span>
                        </Link>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-4 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Inventory overview and stock report</p>
                </div>
                <DataTable
                    columns={columns}
                    data={materials}
                    exportFileName="inventory-report"
                    timezone={preferences.timezone}
                    initialColumnVisibility={{ name: false }}
                    storageKey="dashboard"
                />
            </div>
        </AppLayout>
    );
}
