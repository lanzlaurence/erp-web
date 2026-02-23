import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { InventoryShowData } from '@/types';
import { useFormatters } from '@/hooks/use-formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowLeftRight, Edit } from 'lucide-react';

const LOG_TYPE_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    initial:          { label: 'Initial',        variant: 'default' },
    adjustment:       { label: 'Adjustment',     variant: 'secondary' },
    transfer_in:      { label: 'Transfer In',    variant: 'success' },
    transfer_out:     { label: 'Transfer Out',   variant: 'destructive' },
    purchase_receipt: { label: 'PO Receipt',     variant: 'success' },
    purchase_return:  { label: 'PO Return',      variant: 'destructive' },
    sales_issue:      { label: 'Sales Issue',    variant: 'destructive' },
    sales_return:     { label: 'Sales Return',   variant: 'success' },
};

export default function Show({ inventory, logs }: InventoryShowData) {
    const { formatDecimal, formatDateTime } = useFormatters();
    const { hasPermission } = usePermissions();

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
                        {hasPermission('inventory-adjust') && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/inventories/${inventory.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />Adjust
                                </Link>
                            </Button>
                        )}
                        {hasPermission('inventory-transfer') && (
                            <Button size="sm" asChild>
                                <Link href={`/inventories/${inventory.id}/transfer`}>
                                    <ArrowLeftRight className="mr-2 h-4 w-4" />Transfer
                                </Link>
                            </Button>
                        )}
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
                        <p className="text-sm font-medium text-muted-foreground">location</p>
                        <p className="text-sm">{inventory.location?.name}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Current Quantity</p>
                        <p className="text-sm font-mono font-semibold">{formatDecimal(Number(inventory.quantity))}</p>
                    </div>
                </div>

                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">Inventory Logs</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Before</TableHead>
                                <TableHead>Change</TableHead>
                                <TableHead>After</TableHead>
                                <TableHead>Transfer To/From</TableHead>
                                <TableHead>By</TableHead>
                                <TableHead>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.map((log) => {
                                const badge = LOG_TYPE_BADGE[log.type] ?? { label: log.type, variant: 'outline' };
                                return (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-sm">{formatDateTime(log.created_at)}</TableCell>
                                        <TableCell>
                                            <Badge variant={badge.variant}>{badge.label}</Badge>
                                        </TableCell>
                                        <TableCell className="font-mono">{formatDecimal(Number(log.quantity_before))}</TableCell>
                                        <TableCell className={`font-mono font-medium ${Number(log.quantity_change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {Number(log.quantity_change) >= 0 ? '+' : ''}{formatDecimal(Number(log.quantity_change))}
                                        </TableCell>
                                        <TableCell className="font-mono">{formatDecimal(Number(log.quantity_after))}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {log.transfer_location?.name ?? '-'}
                                        </TableCell>
                                        <TableCell className="text-sm">{log.user?.name ?? '-'}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{log.remarks ?? '-'}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
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
