import { Button } from '@/components/ui/button';
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
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import type { LocationData } from '@/types';
import { Link, router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useFormatters } from '@/hooks/use-formatters';

export default function Index({ locations }: LocationData) {
    const { hasPermission } = usePermissions();
    const { formatDate } = useFormatters();
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; code: string; name: string }>({
        open: false,
        id: 0,
        code: '',
        name: '',
    });

    const handleDeleteClick = (id: number, code: string, name: string) => {
        setDeleteDialog({ open: true, id, code, name });
    };

    const handleDeleteConfirm = () => {
        router.delete(`/locations/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, code: '', name: '' });
    };

    return (
        <>
            <Head title="Locations" />

            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Locations</h1>
                    {hasPermission('location-create') && (
                        <Button asChild size="sm">
                            <Link href="/locations/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Location
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Updated At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {locations.data.map((location) => (
                                <TableRow key={location.id}>
                                    <TableCell className="font-medium">{location.code}</TableCell>
                                    <TableCell>{location.name}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {location.description || '-'}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{formatDate(location.created_at)}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{formatDate(location.updated_at)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {hasPermission('location-edit') && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/locations/${location.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {hasPermission('location-delete') && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(location.id, location.code, location.name)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open: boolean) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete location <span className="font-semibold">{deleteDialog.code} - {deleteDialog.name}</span>. This action cannot be undone.
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
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Locations', href: '/locations' },
        ]}
    >
        {page}
    </AppLayout>
);
