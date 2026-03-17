import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useFormatters } from '@/hooks/use-formatters';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { usePage } from '@inertiajs/react';
import ClickableCode from '@/components/ui/clickable-code';
import type { SharedData, InventoryLogPageData, InventoryLogRow } from '@/types';

const LOG_TYPE_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    initial:          { label: 'Initial',       variant: 'default' },
    adjustment:       { label: 'Adjustment',    variant: 'secondary' },
    transfer_in:      { label: 'Transfer In',   variant: 'success' },
    transfer_out:     { label: 'Transfer Out',  variant: 'destructive' },
    purchase_receipt: { label: 'PO Receipt',    variant: 'success' },
    purchase_return:  { label: 'PO Return',     variant: 'destructive' },
    sales_issue:      { label: 'Sales Issue',   variant: 'destructive' },
    sales_return:     { label: 'Sales Return',  variant: 'success' },
};

export default function InventoryLogPage({ logs }: InventoryLogPageData) {
    const { formatDecimal, formatDateTime } = useFormatters();
    const { preferences } = usePage<SharedData>().props;

    const columns: ColumnDef<InventoryLogRow>[] = [
        {
            accessorKey: 'movement_code',
            header: 'Mov. Code',
            size: 140,
            cell: ({ row }) => <span className="font-mono text-sm">{row.original.movement_code}</span>,
        },
        {
            accessorKey: 'created_at',
            header: 'Date & Time',
            size: 160,
            accessorFn: (row) => formatDateTime(row.created_at),
            cell: ({ row }) => (
                <span className="text-sm whitespace-nowrap">{formatDateTime(row.original.created_at)}</span>
            ),
        },
        {
            accessorKey: 'type',
            header: 'Type',
            size: 140,
            cell: ({ row }) => {
                const badge = LOG_TYPE_BADGE[row.original.type] ?? { label: row.original.type, variant: 'outline' as const };
                return <Badge variant={badge.variant}>{badge.label}</Badge>;
            },
        },
        {
            accessorKey: 'inventory_code',
            header: 'Inv. Code',
            size: 130,
            cell: ({ row }) => <ClickableCode href={`/inventories/${row.original.inventory_id}`} value={row.original.inventory_code} />,
        },
        {
            accessorKey: 'material_code',
            header: 'Material',
            size: 200,
            filterFn: 'multiField' as any,
            cell: ({ row }) => (
                <div>
                    <ClickableCode href={`/materials/${row.original.material_id}`} value={row.original.material_code} />
                    <p className="text-xs text-muted-foreground">{row.original.material_name}</p>
                </div>
            ),
        },
        {
            accessorKey: 'material_name',
            header: 'Material Name',
            size: 0,
            meta: { hidden: true },
        },
        {
            accessorKey: 'location_name',
            header: 'Location',
            size: 150,
            cell: ({ row }) => <span className="text-sm">{row.original.location_name ?? '-'}</span>,
        },
        {
            accessorKey: 'quantity_before',
            header: 'Before',
            size: 100,
            cell: ({ row }) => <span className="font-mono text-sm">{formatDecimal(row.original.quantity_before)}</span>,
        },
        {
            accessorKey: 'quantity_change',
            header: 'Change',
            size: 100,
            cell: ({ row }) => (
                <span className={`font-mono text-sm font-medium ${row.original.quantity_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {row.original.quantity_change >= 0 ? '+' : ''}{formatDecimal(row.original.quantity_change)}
                </span>
            ),
        },
        {
            accessorKey: 'quantity_after',
            header: 'After',
            size: 100,
            cell: ({ row }) => <span className="font-mono text-sm">{formatDecimal(row.original.quantity_after)}</span>,
        },
        {
            accessorKey: 'transfer_location_name',
            header: 'Transfer To/From',
            size: 150,
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.transfer_location_name ?? '-'}</span>,
        },
        {
            accessorKey: 'user_name',
            header: 'By',
            size: 130,
            cell: ({ row }) => <span className="text-sm">{row.original.user_name ?? '-'}</span>,
        },
        {
            accessorKey: 'remarks',
            header: 'Remarks',
            size: 200,
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.remarks ?? '-'}</span>,
        },
    ];

    return (
        <>
            <Head title="Inventory Log" />
            <div className="space-y-4 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Inventory Log</h1>
                    <p className="text-sm text-muted-foreground">Audit trail for all inventory movements and adjustments</p>
                </div>
                <DataTable
                    columns={columns}
                    data={logs}
                    exportFileName="inventory-log"
                    timezone={preferences.timezone}
                    initialColumnVisibility={{ material_name: false }}
                    storageKey="inventory-log"
                />
            </div>
        </>
    );
}

InventoryLogPage.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Activity', href: '#' },
        { title: 'Inventory Log', href: '/activity/inventory-log' },
    ]}>{page}</AppLayout>
);
