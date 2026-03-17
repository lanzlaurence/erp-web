import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useFormatters } from '@/hooks/use-formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import type { ChargeData, Charge, SharedData } from '@/types';

export default function Index({ charges }: ChargeData) {
    const { hasPermission } = usePermissions();
    const { formatDate, formatAmount, formatDecimal } = useFormatters();
    const { preferences } = usePage<SharedData>().props;
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; name: string }>({
        open: false, id: 0, name: '',
    });

    const handleDeleteConfirm = () => {
        router.delete(`/charges/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, name: '' });
    };

    const columns: ColumnDef<Charge>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            size: 160,
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
        },
        {
            accessorKey: 'description',
            header: 'Description',
            size: 200,
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.description || '-'}</span>,
        },
        {
            accessorKey: 'type',
            header: 'Type',
            size: 100,
            cell: ({ row }) => (
                row.original.type === 'tax'
                    ? <Badge variant="destructive">Tax</Badge>
                    : <Badge variant="success">Discount</Badge>
            ),
        },
        {
            accessorKey: 'value_type',
            header: 'Value Type',
            size: 120,
            cell: ({ row }) => <span className="capitalize">{row.original.value_type}</span>,
        },
        {
            accessorKey: 'value',
            header: 'Value',
            size: 100,
            cell: ({ row }) => (
                <span className="font-mono">
                    {row.original.value_type === 'percentage'
                        ? `${formatDecimal(Number(row.original.value))}%`
                        : formatAmount(Number(row.original.value))}
                </span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            size: 100,
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
                    {row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Created At',
            size: 130,
            accessorFn: (row) => formatDate(row.created_at),
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.created_at)}</span>,
        },
        {
            accessorKey: 'updated_at',
            header: 'Updated At',
            size: 130,
            accessorFn: (row) => formatDate(row.updated_at),
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.updated_at)}</span>,
        },
        {
            id: 'actions',
            header: 'Actions',
            enableSorting: false,
            enableColumnFilter: false,
            size: 100,
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    {hasPermission('charge-edit') && (
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/charges/${row.original.id}/edit`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                <Edit className="h-4 w-4" />
                                <span className="text-[10px] leading-none">Edit</span>
                            </Link>
                        </Button>
                    )}
                    {hasPermission('charge-delete') && (
                        <Button variant="ghost" size="sm"
                            onClick={() => setDeleteDialog({ open: true, id: row.original.id, name: row.original.name })}
                            className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                            <Trash2 className="h-4 w-4 text-red-600" />
                            <span className="text-[10px] leading-none text-red-600">Delete</span>
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Charges" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Charges</h1>
                    {hasPermission('charge-create') && (
                        <Button asChild size="sm">
                            <Link href="/charges/create"><Plus className="mr-2 h-4 w-4" />Add Charge</Link>
                        </Button>
                    )}
                </div>
                <DataTable columns={columns} data={charges} exportFileName="charges" timezone={preferences.timezone} storageKey="charges" />
            </div>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete charge <span className="font-semibold">{deleteDialog.name}</span>. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Charges', href: '/charges' }]}>{page}</AppLayout>
);
