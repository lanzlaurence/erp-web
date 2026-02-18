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
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/use-permissions';
import { useFormatters } from '@/hooks/use-formatters';
import AppLayout from '@/layouts/app-layout';
import type { MaterialData } from '@/types';
import { Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Head } from '@inertiajs/react';

export default function Index({ materials }: MaterialData) {
    const { hasPermission } = usePermissions();
    const { formatAmount } = useFormatters();
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; code: string }>({
        open: false,
        id: 0,
        code: '',
    });

    const handleDeleteClick = (id: number, code: string) => {
        setDeleteDialog({ open: true, id, code });
    };

    const handleDeleteConfirm = () => {
        router.delete(`/materials/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, code: '' });
    };

    return (
        <>
            <Head title="Materials" />

            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Materials</h1>
                    {hasPermission('material-create') && (
                        <Button asChild size="sm">
                            <Link href="/materials/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Material
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
                                <TableHead>Brand</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>UOM</TableHead>
                                <TableHead>Unit Cost</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {materials.data.map((material) => (
                                <TableRow key={material.id}>
                                    <TableCell className="font-medium">{material.code}</TableCell>
                                    <TableCell>{material.name}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {material.brand?.name || '-'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {material.category?.name || '-'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {material.uom?.acronym || '-'}
                                    </TableCell>
                                    <TableCell>{formatAmount(Number(material.unit_cost))}</TableCell>
                                    <TableCell>{formatAmount(Number(material.unit_price))}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                material.status === 'active' ? 'default' : 'secondary'
                                            }
                                        >
                                            {material.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {hasPermission('material-view') && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/materials/${material.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {hasPermission('material-edit') && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/materials/${material.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {hasPermission('material-delete') && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(material.id, material.code)}
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
                            This will permanently delete material <span className="font-semibold">{deleteDialog.code}</span>. This action cannot be undone.
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
            { title: 'Materials', href: '/materials' },
        ]}
    >
        {page}
    </AppLayout>
);
