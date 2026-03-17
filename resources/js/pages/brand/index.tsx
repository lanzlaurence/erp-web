import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useFormatters } from '@/hooks/use-formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import type { BrandData, Brand, SharedData } from '@/types';

export default function Index({ brands }: BrandData) {
    const { hasPermission } = usePermissions();
    const { formatDate } = useFormatters();
    const { preferences } = usePage<SharedData>().props;
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; name: string }>({
        open: false, id: 0, name: '',
    });

    const handleDeleteConfirm = () => {
        router.delete(`/brands/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, name: '' });
    };

    const columns: ColumnDef<Brand>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            size: 180,
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
        },
        {
            accessorKey: 'description',
            header: 'Description',
            size: 250,
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.description || '-'}</span>,
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
                    {hasPermission('brand-edit') && (
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/brands/${row.original.id}/edit`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                <Edit className="h-4 w-4" />
                                <span className="text-[10px] leading-none">Edit</span>
                            </Link>
                        </Button>
                    )}
                    {hasPermission('brand-delete') && (
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
            <Head title="Brands" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Brands</h1>
                    {hasPermission('brand-create') && (
                        <Button asChild size="sm">
                            <Link href="/brands/create"><Plus className="mr-2 h-4 w-4" />Add Brand</Link>
                        </Button>
                    )}
                </div>
                <DataTable columns={columns} data={brands} exportFileName="brands" timezone={preferences.timezone} storageKey="brands" />
            </div>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete brand <span className="font-semibold">{deleteDialog.name}</span>. This action cannot be undone.</AlertDialogDescription>
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
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Brands', href: '/brands' }]}>{page}</AppLayout>
);
