import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useFormatters } from '@/hooks/use-formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import type { CustomerData, Customer, SharedData } from '@/types';

export default function Index({ customers }: CustomerData) {
    const { hasPermission } = usePermissions();
    const { formatAmount } = useFormatters();
    const { preferences } = usePage<SharedData>().props;
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; code: string }>({
        open: false, id: 0, code: '',
    });

    const handleDeleteConfirm = () => {
        router.delete(`/customers/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, code: '' });
    };

    const columns: ColumnDef<Customer>[] = [
        {
            accessorKey: 'code',
            header: 'Customer',
            size: 200,
            filterFn: 'multiField' as any,
            cell: ({ row }) => (
                <div>
                    <p className="font-mono text-sm font-medium">{row.original.code}</p>
                    <p className="text-xs text-muted-foreground">{row.original.name}</p>
                </div>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Customer Name',
            size: 0,
            meta: { hidden: true },
        },
        {
            accessorKey: 'payment_terms',
            header: 'Payment Terms',
            size: 150,
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.payment_terms || '-'}</span>,
        },
        {
            accessorKey: 'credit_amount',
            header: 'Credit Amount',
            size: 140,
            cell: ({ row }) => <span className="font-mono">{formatAmount(Number(row.original.credit_amount))}</span>,
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
            id: 'actions',
            header: 'Actions',
            enableSorting: false,
            enableColumnFilter: false,
            size: 120,
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    {hasPermission('customer-view') && (
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/customers/${row.original.id}`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                <Eye className="h-4 w-4" />
                                <span className="text-[10px] leading-none">View</span>
                            </Link>
                        </Button>
                    )}
                    {hasPermission('customer-edit') && (
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/customers/${row.original.id}/edit`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                <Edit className="h-4 w-4" />
                                <span className="text-[10px] leading-none">Edit</span>
                            </Link>
                        </Button>
                    )}
                    {hasPermission('customer-delete') && (
                        <Button variant="ghost" size="sm"
                            onClick={() => setDeleteDialog({ open: true, id: row.original.id, code: row.original.code })}
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
            <Head title="Customers" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Customers</h1>
                    {hasPermission('customer-create') && (
                        <Button asChild size="sm">
                            <Link href="/customers/create">
                                <Plus className="mr-2 h-4 w-4" />Add Customer
                            </Link>
                        </Button>
                    )}
                </div>
                <DataTable
                    columns={columns}
                    data={customers}
                    exportFileName="customers"
                    timezone={preferences.timezone}
                    initialColumnVisibility={{ name: false }}
                    storageKey="customers"
                />
            </div>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete customer <span className="font-semibold">{deleteDialog.code}</span>. This action cannot be undone.
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
        { title: 'Customers', href: '/customers' },
    ]}>{page}</AppLayout>
);
