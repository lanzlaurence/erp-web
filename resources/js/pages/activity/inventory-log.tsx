// js/pages/activity/inventory-log.tsx
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { InventoryLogData } from '@/types';
import { useFormatters } from '@/hooks/use-formatters';
import { Head } from '@inertiajs/react';
import ClickableCode from '@/components/ui/clickable-code';

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

export default function Inventory({ logs }: InventoryLogData) {
    const { formatDecimal, formatDateTime } = useFormatters();

    return (
        <>
            <Head title="Inventory Log" />
            <div className="space-y-4 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Inventory Log</h1>
                    <p className="text-sm text-muted-foreground">Audit trail for all inventory movements and adjustments</p>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mov. Code</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Inv. Code</TableHead>
                                <TableHead>Material</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Before</TableHead>
                                <TableHead>Change</TableHead>
                                <TableHead>After</TableHead>
                                <TableHead>Transfer <br /> To/From</TableHead>
                                <TableHead>By</TableHead>
                                <TableHead>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="py-8 text-center text-sm text-muted-foreground">
                                        No inventory log records available.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.data.map((log) => {
                                    const badge = LOG_TYPE_BADGE[log.type] ?? { label: log.type, variant: 'outline' as const };
                                    return (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-mono text-sm">{log.movement_code}</TableCell>
                                            <TableCell className="text-sm whitespace-nowrap">
                                                {formatDateTime(log.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={badge.variant}>{badge.label}</Badge>
                                            </TableCell>
                                            <ClickableCode
                                                href={`/inventories/${log.inventory?.id}`}
                                                value={log.inventory?.code}
                                            />
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm font-medium">{log.material?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{log.material?.code}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{log.location?.name}</TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {formatDecimal(Number(log.quantity_before))}
                                            </TableCell>
                                            <TableCell className={`font-mono text-sm font-medium ${Number(log.quantity_change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {Number(log.quantity_change) >= 0 ? '+' : ''}{formatDecimal(Number(log.quantity_change))}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {formatDecimal(Number(log.quantity_after))}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {log.transfer_location?.name ?? '-'}
                                            </TableCell>
                                            <TableCell className="text-sm">{log.user?.name ?? '-'}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {log.remarks ?? '-'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}

Inventory.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Activity' , href: '#' },
        { title: 'Inventory Log', href: '/activity/inventory-log' },
    ]}>{page}</AppLayout>
);
