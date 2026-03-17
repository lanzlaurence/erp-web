import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useFormatters } from '@/hooks/use-formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import type { RoleData, Role, Permission, SharedData } from '@/types';

type RoleWithPermissions = Role & { permissions: Permission[] };

export default function Index({ roles }: RoleData) {
    const { hasPermission } = usePermissions();
    const { formatDate } = useFormatters();
    const { preferences } = usePage<SharedData>().props;
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; name: string }>({
        open: false, id: 0, name: '',
    });

    const handleDeleteConfirm = () => {
        router.delete(`/roles/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, name: '' });
    };

    const isProtected = (role: Role) => role.id === 1;

    const groupPermissions = (permissions: Permission[]) =>
        permissions.reduce((acc, perm) => {
            const category = perm.name.split('-')[0];
            if (!acc[category]) acc[category] = [];
            acc[category].push(perm);
            return acc;
        }, {} as Record<string, Permission[]>);

    const columns: ColumnDef<RoleWithPermissions>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            size: 180,
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
        },
        {
            accessorKey: 'permissions',
            header: 'Permissions',
            size: 300,
            enableSorting: false,
            accessorFn: (row) => row.permissions?.map((p) => p.name).join(' ') ?? '',
            cell: ({ row }) => {
                const grouped = groupPermissions(row.original.permissions ?? []);
                return (
                    <Collapsible>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center gap-2 p-0 hover:bg-transparent">
                                <span className="text-sm text-muted-foreground">
                                    {row.original.permissions?.length || 0} permissions
                                </span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="space-y-2 pt-2">
                                {Object.entries(grouped).map(([category, perms]) => (
                                    <div key={category} className="space-y-1">
                                        <p className="text-xs font-semibold capitalize">{category}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {perms.map((perm) => (
                                                <span key={perm.id} className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                    {perm.name.split('-').slice(1).join(' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                );
            },
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
                            {hasPermission('role-edit') && (
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/roles/${row.original.id}/edit`} className="flex flex-col items-center gap-1 h-auto py-1 w-14">
                                        <Edit className="h-4 w-4" />
                                        <span className="text-[10px] leading-none">Edit</span>
                                    </Link>
                                </Button>
                            )}
                            {hasPermission('role-delete') && (
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
            <Head title="Roles" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Roles</h1>
                    {hasPermission('role-create') && (
                        <Button asChild size="sm">
                            <Link href="/roles/create">
                                <Plus className="mr-2 h-4 w-4" />Add Role
                            </Link>
                        </Button>
                    )}
                </div>
                <DataTable
                    columns={columns}
                    data={roles}
                    exportFileName="roles"
                    timezone={preferences.timezone}
                    storageKey="roles"
                />
            </div>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete role <span className="font-semibold">{deleteDialog.name}</span>. This action cannot be undone.
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
        { title: 'Roles', href: '/roles' },
    ]}>{page}</AppLayout>
);
