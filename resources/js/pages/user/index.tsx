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
import type { UserData, User, SharedData } from '@/types';

export default function Index({ users }: UserData) {
    const { hasPermission } = usePermissions();
    const { formatDate } = useFormatters();
    const { preferences } = usePage<SharedData>().props;
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; name: string }>({
        open: false, id: 0, name: '',
    });

    const handleDeleteConfirm = () => {
        router.delete(`/users/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, name: '' });
    };

    const isProtected = (user: User) => user.id === 1;

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            size: 180,
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
        },
        {
            accessorKey: 'email',
            header: 'Email',
            size: 200,
            cell: ({ row }) => <span className="text-sm">{row.original.email}</span>,
        },
        {
            accessorKey: 'roles',
            header: 'Roles',
            size: 180,
            accessorFn: (row) => row.roles?.map((r) => r.name).join(', ') ?? '',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.roles?.map((r) => r.name).join(', ') || '-'}
                </span>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            size: 160,
            accessorFn: (row) => {
                const parts = [];
                if (row.is_active) parts.push('Active'); else parts.push('Inactive');
                if (row.is_locked) parts.push('Locked');
                if (row.force_password_change) parts.push('Must change password');
                return parts.join(' ');
            },
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <Badge variant={row.original.is_active ? 'success' : 'destructive'}>
                        {row.original.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {row.original.is_locked && (
                        <Badge variant="destructive" className="text-xs">Locked</Badge>
                    )}
                    {row.original.force_password_change && (
                        <Badge variant="outline" className="text-xs">Must change password</Badge>
                    )}
                </div>
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
                    {isProtected(row.original) ? (
                        <Badge variant="outline" className="text-xs">Protected</Badge>
                    ) : (
                        <>
                            {hasPermission('user-edit') && (
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/users/${row.original.id}/edit`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                        <Edit className="h-4 w-4" />
                                        <span className="text-[10px] leading-none">Edit</span>
                                    </Link>
                                </Button>
                            )}
                            {hasPermission('user-delete') && (
                                <Button variant="ghost" size="sm"
                                    onClick={() => setDeleteDialog({ open: true, id: row.original.id, name: row.original.name })}
                                    className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                    <span className="text-[10px] leading-none text-red-600">Delete</span>
                                </Button>
                            )}
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Users" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Users</h1>
                    {hasPermission('user-create') && (
                        <Button asChild size="sm">
                            <Link href="/users/create">
                                <Plus className="mr-2 h-4 w-4" />Add User
                            </Link>
                        </Button>
                    )}
                </div>
                <DataTable
                    columns={columns}
                    data={users}
                    exportFileName="users"
                    timezone={preferences.timezone}
                    storageKey="users"
                />
            </div>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete user <span className="font-semibold">{deleteDialog.name}</span>. This action cannot be undone.
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
        { title: 'Users', href: '/users' },
    ]}>{page}</AppLayout>
);
