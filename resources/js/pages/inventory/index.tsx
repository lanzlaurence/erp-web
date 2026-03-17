import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useFormatters } from '@/hooks/use-formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeftRight, Eye, Edit, Plus, Trash2, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import type { InventoryData, Inventory, SharedData } from '@/types';

export default function Index({ inventories }: InventoryData) {
    const { hasPermission } = usePermissions();
    const { formatDecimal } = useFormatters();
    const { preferences } = usePage<SharedData>().props;
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; name: string }>({
        open: false, id: 0, name: '',
    });

    const handleDeleteConfirm = () => {
        router.delete(`/inventories/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, name: '' });
    };

    const columns: ColumnDef<Inventory>[] = [
        {
            accessorKey: 'code',
            header: 'Inventory Code',
            size: 150,
            cell: ({ row }) => <span className="font-mono text-sm">{row.original.code}</span>,
        },
        {
            accessorKey: 'material',
            header: 'Material',
            size: 200,
            accessorFn: (row) => `${row.material?.name ?? ''} ${row.material?.code ?? ''}`,
            cell: ({ row }) => (
                <div>
                    <p className="text-sm font-medium">{row.original.material?.name}</p>
                    <p className="text-xs text-muted-foreground">{row.original.material?.code}</p>
                </div>
            ),
        },
        {
            accessorKey: 'location',
            header: 'Location',
            size: 150,
            accessorFn: (row) => row.location?.name ?? '',
            cell: ({ row }) => row.original.location?.name,
        },
        {
            accessorKey: 'quantity',
            header: 'Quantity',
            size: 120,
            cell: ({ row }) => <span className="font-mono">{formatDecimal(Number(row.original.quantity))}</span>,
        },
        {
            id: 'actions',
            header: 'Actions',
            enableSorting: false,
            enableColumnFilter: false,
            size: 100,
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    {hasPermission('inventory-view') && (
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/inventories/${row.original.id}`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                <Eye className="h-4 w-4" />
                                <span className="text-[10px] leading-none">View</span>
                            </Link>
                        </Button>
                    )}
                    {/* {hasPermission('inventory-adjust') && (
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/inventories/${row.original.id}/adjust`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                <Edit className="h-4 w-4" />
                                <span className="text-[10px] leading-none">Adjust</span>
                            </Link>
                        </Button>
                    )} */}
                    {/* {hasPermission('inventory-transfer') && (
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/inventories/${row.original.id}/transfer`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                <ArrowLeftRight className="h-4 w-4" />
                                <span className="text-[10px] leading-none">Transfer</span>
                            </Link>
                        </Button>
                    )} */}
                    {hasPermission('inventory-delete') && (
                        <Button variant="ghost" size="sm"
                            onClick={() => setDeleteDialog({ open: true, id: row.original.id, name: row.original.material?.name ?? '' })}
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
            <Head title="Inventory" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Inventory</h1>
                    {/* {hasPermission('inventory-create') && (
                        <Button asChild size="sm">
                            <Link href="/inventories/create">
                                <Plus className="mr-2 h-4 w-4" />Add Stock
                            </Link>
                        </Button>
                    )} */}
                    {hasPermission('inventory-adjust') && (
                        <Button asChild size="sm">
                            <Link href="/inventories/manual-adjustment">
                                <SlidersHorizontal className="mr-2 h-4 w-4" />Manual Adjustment
                            </Link>
                        </Button>
                    )}
                </div>
                <DataTable
                    columns={columns}
                    data={inventories}
                    exportFileName="inventories"
                    timezone={preferences.timezone}
                    storageKey="inventories"
                />
            </div>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will delete inventory for <span className="font-semibold">{deleteDialog.name}</span>. Cannot delete if stock is greater than 0.
                        </AlertDialogDescription>
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
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inventory', href: '/inventories' },
    ]}>{page}</AppLayout>
);
