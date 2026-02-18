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
import type { DestinationData } from '@/types';
import { Link, router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Head } from '@inertiajs/react';

export default function Index({ destinations }: DestinationData) {
    const { hasPermission } = usePermissions();
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
        router.delete(`/destinations/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, code: '', name: '' });
    };

    return (
        <>
            <Head title="Destinations" />

            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Destinations</h1>
                    {hasPermission('destination-create') && (
                        <Button asChild size="sm">
                            <Link href="/destinations/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Destination
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
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {destinations.data.map((destination) => (
                                <TableRow key={destination.id}>
                                    <TableCell className="font-medium">{destination.code}</TableCell>
                                    <TableCell>{destination.name}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {destination.description || '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {hasPermission('destination-edit') && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/destinations/${destination.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {hasPermission('destination-delete') && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(destination.id, destination.code, destination.name)}
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
                            This will permanently delete destination <span className="font-semibold">{deleteDialog.code} - {deleteDialog.name}</span>. This action cannot be undone.
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
            { title: 'Destinations', href: '/destinations' },
        ]}
    >
        {page}
    </AppLayout>
);
