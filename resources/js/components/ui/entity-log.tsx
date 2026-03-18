import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import type { EntityLog } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { useFormatters } from '@/hooks/use-formatters';
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

type Props = {
    logs: EntityLog[];
    storageKey?: string;
};

export default function EntityLogSection({ logs, storageKey }: Props) {
    const { formatDateTime } = useFormatters();
    const { preferences } = usePage<SharedData>().props;

    const columns: ColumnDef<EntityLog>[] = [
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
            accessorKey: 'user',
            header: 'By',
            size: 140,
            accessorFn: (row) => row.user?.name ?? '',
            cell: ({ row }) => (
                <span className="text-sm font-medium">{row.original.user?.name ?? '-'}</span>
            ),
        },
        {
            accessorKey: 'action',
            header: 'Action',
            size: 100,
            cell: ({ row }) => (
                <Badge variant={
                    row.original.action === 'created' ? 'success' :
                    row.original.action === 'deleted' ? 'destructive' : 'secondary'
                }>
                    {row.original.action}
                </Badge>
            ),
        },
        {
            accessorKey: 'changes',
            header: 'Changes',
            size: 400,
            enableSorting: false,
            cell: ({ row }) => {
                const changes = row.original.changes;
                if (!changes || changes.length === 0) return <span className="text-sm text-muted-foreground">-</span>;
                return (
                    <div className="space-y-1">
                        {changes.map((c, i) => (
                            <div key={i} className="text-xs">
                                <span className="font-medium">{c.field}</span>
                                <span className="text-muted-foreground mx-1">·</span>
                                <span className="text-red-500 line-through">{c.old || '—'}</span>
                                <span className="mx-1">→</span>
                                <span className="text-green-600">{c.new || '—'}</span>
                            </div>
                        ))}
                    </div>
                );
            },
        },
        {
            accessorKey: 'remarks',
            header: 'Remarks',
            size: 200,
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">{row.original.remarks ?? '-'}</span>
            ),
        },
    ];

    if (logs.length === 0) return null;

    return (
        <div className="space-y-4 rounded-lg border p-6">
            <h3 className="font-semibold">Activity Log</h3>
            <DataTable
                columns={columns}
                data={logs}
                timezone={preferences.timezone}
                storageKey={storageKey}
            />
        </div>
    );
}
