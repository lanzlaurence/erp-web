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
import type { VendorData } from '@/types';
import { Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Head } from '@inertiajs/react';

export default function Index({ vendors }: VendorData) {
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
        router.delete(`/vendors/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, code: '' });
    };

    return (
        <>
            <Head title="Vendors" />

            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Vendors</h1>
                    {hasPermission('vendor-create') && (
                        <Button asChild size="sm">
                            <Link href="/vendors/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Vendor
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
                                <TableHead>Payment Terms</TableHead>
                                <TableHead>Credit Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vendors.data.map((vendor) => (
                                <TableRow key={vendor.id}>
                                    <TableCell className="font-medium">{vendor.code}</TableCell>
                                    <TableCell>{vendor.name}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {vendor.payment_terms || '-'}
                                    </TableCell>
                                    <TableCell>{formatAmount(Number(vendor.credit_amount))}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={vendor.status === 'active' ? 'default' : 'secondary'}
                                        >
                                            {vendor.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {hasPermission('vendor-view') && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/vendors/${vendor.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {hasPermission('vendor-edit') && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/vendors/${vendor.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {hasPermission('vendor-delete') && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(vendor.id, vendor.code)}
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
                            This will permanently delete vendor <span className="font-semibold">{deleteDialog.code}</span>. This action cannot be undone.
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
            { title: 'Vendors', href: '/vendors' },
        ]}
    >
        {page}
    </AppLayout>
);
