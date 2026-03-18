import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { useFormatters } from '@/hooks/use-formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, ArrowLeftRight, Edit } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import type { InventoryShowData, InventoryLog, SharedData } from '@/types';

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

export default function Show({ inventory, logs }: InventoryShowData) {
    const { formatDecimal, formatDateTime } = useFormatters();
    const { hasPermission } = usePermissions();
    const { preferences } = usePage<SharedData>().props;

    const columns: ColumnDef<InventoryLog>[] = [
        {
            accessorKey: 'created_at',
            header: 'Date',
            size: 160,
            accessorFn: (row) => formatDateTime(row.created_at),
            cell: ({ row }) => <span className="text-sm whitespace-nowrap">{formatDateTime(row.original.created_at)}</span>,
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
            accessorKey: 'quantity_before',
            header: 'Before',
            size: 100,
            cell: ({ row }) => <span className="font-mono">{formatDecimal(Number(row.original.quantity_before))}</span>,
        },
        {
            accessorKey: 'quantity_change',
            header: 'Change',
            size: 100,
            cell: ({ row }) => (
                <span className={`font-mono font-medium ${Number(row.original.quantity_change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Number(row.original.quantity_change) >= 0 ? '+' : ''}{formatDecimal(Number(row.original.quantity_change))}
                </span>
            ),
        },
        {
            accessorKey: 'quantity_after',
            header: 'After',
            size: 100,
            cell: ({ row }) => <span className="font-mono">{formatDecimal(Number(row.original.quantity_after))}</span>,
        },
        {
            accessorKey: 'transfer_location',
            header: 'Transfer To/From',
            size: 150,
            accessorFn: (row) => row.transfer_location?.name ?? '',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.transfer_location?.name ?? '-'}</span>,
        },
        {
            accessorKey: 'user',
            header: 'By',
            size: 130,
            accessorFn: (row) => row.user?.name ?? '',
            cell: ({ row }) => <span className="text-sm">{row.original.user?.name ?? '-'}</span>,
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
            <Head title="View Inventory" />
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{inventory.material?.name}</h1>
                        <p className="text-sm text-muted-foreground">{inventory.location?.name}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/inventories"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Inventory Code</p>
                        <p className="text-sm font-mono">{inventory.code}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Material Code</p>
                        <p className="text-sm">{inventory.material?.code}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Location</p>
                        <p className="text-sm">{inventory.location?.name}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Current Quantity</p>
                        <p className="text-sm font-mono font-semibold">{formatDecimal(Number(inventory.quantity))}</p>
                    </div>
                </div>

                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">Inventory Logs</h3>
                    <DataTable
                        columns={columns}
                        data={logs}
                        exportFileName={`inventory-log-${inventory.code}`}
                        timezone={preferences.timezone}
                        storageKey={`inventory-show-${inventory.id}`}
                    />
                </div>
            </div>
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inventory', href: '/inventories' },
        { title: 'View', href: '#' },
    ]}>{page}</AppLayout>
);
