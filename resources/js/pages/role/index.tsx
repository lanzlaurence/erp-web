import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import type { Permission, RoleData, Role } from '@/types';
import { Link, router } from '@inertiajs/react';
import { ChevronDown, Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Head } from '@inertiajs/react';

export default function Index({ roles }: RoleData) {
    const { hasPermission } = usePermissions();
    const [expandedRoles, setExpandedRoles] = useState<number[]>([]);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; name: string }>({
        open: false,
        id: 0,
        name: '',
    });

    const handleDeleteClick = (id: number, name: string) => {
        setDeleteDialog({ open: true, id, name });
    };

    const handleDeleteConfirm = () => {
        router.delete(`/roles/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, name: '' });
    };

    const toggleExpand = (roleId: number) => {
        setExpandedRoles((prev) =>
            prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
        );
    };

    const groupPermissions = (permissions: Permission[]) => {
        return permissions.reduce(
            (acc, permission) => {
                const category = permission.name.split('-')[0];
                if (!acc[category]) acc[category] = [];
                acc[category].push(permission);
                return acc;
            },
            {} as Record<string, Permission[]>,
        );
    };

    const isProtected = (role: Role) => role.id === 1;

    return (
        <>
            <Head title="Roles" />

            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Roles</h1>
                    {hasPermission('role-create') && (
                        <Button asChild size="sm">
                            <Link href="/roles/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Role
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.data.map((role) => {
                                const isExpanded = expandedRoles.includes(role.id);
                                const groupedPermissions = groupPermissions(role.permissions || []);

                                return (
                                    <>
                                        <TableRow key={role.id}>
                                            <TableCell className="font-medium">{role.name}</TableCell>
                                            <TableCell>
                                                <Collapsible open={isExpanded} onOpenChange={() => toggleExpand(role.id)}>
                                                    <CollapsibleTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="flex items-center gap-2 p-0 hover:bg-transparent"
                                                        >
                                                            <span className="text-sm text-muted-foreground">
                                                                {role.permissions?.length || 0} permissions
                                                            </span>
                                                            <ChevronDown
                                                                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                            />
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                </Collapsible>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {isProtected(role) ? (
                                                        <Badge variant="outline" className="text-xs">
                                                            Protected
                                                        </Badge>
                                                    ) : (
                                                        <>
                                                            {hasPermission('role-edit') && (
                                                                <Button variant="ghost" size="sm" asChild>
                                                                    <Link href={`/roles/${role.id}/edit`}>
                                                                        <Edit className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                            )}
                                                            {hasPermission('role-delete') && (
                                                                <Button variant="ghost" size="sm"
                                                                    onClick={() => handleDeleteClick(role.id, role.name)}>
                                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        {isExpanded && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="bg-muted/50">
                                                    <div className="space-y-3 py-3">
                                                        {Object.entries(groupedPermissions).map(([category, perms]) => (
                                                            <div key={category} className="space-y-1">
                                                                <p className="text-sm font-semibold capitalize">
                                                                    {category}
                                                                </p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {perms.map((perm: Permission) => (
                                                                        <span
                                                                            key={perm.id}
                                                                            className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                                                        >
                                                                            {perm.name.split('-').slice(1).join(' ')}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open: boolean) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete role <span className="font-semibold">{deleteDialog.name}</span>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Roles', href: '/roles' }]}>
        {page}
    </AppLayout>
);
