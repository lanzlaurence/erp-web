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
import { usePreferences } from '@/hooks/use-preferences';
import AppLayout from '@/layouts/app-layout';
import type { CustomerData } from '@/types';
import { Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function Index({ customers }: CustomerData) {
    const { hasPermission } = usePermissions();
    const { formatDecimal } = usePreferences();
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; code: string }>({
        open: false,
        id: 0,
        code: '',
    });

    const handleDeleteClick = (id: number, code: string) => {
        setDeleteDialog({ open: true, id, code });
    };

    const handleDeleteConfirm = () => {
        router.delete(`/customers/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, code: '' });
    };

    return (
        <>
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Customers</h1>
                    {hasPermission('customer-create') && (
                        <Button asChild size="sm">
                            <Link href="/customers/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Customer
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
                            {customers.data.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.code}</TableCell>
                                    <TableCell>{customer.name}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {customer.payment_terms || '-'}
                                    </TableCell>
                                    <TableCell>{formatDecimal(Number(customer.credit_amount))}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={customer.status === 'active' ? 'default' : 'secondary'}
                                        >
                                            {customer.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {hasPermission('customer-view') && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/customers/${customer.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {hasPermission('customer-edit') && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/customers/${customer.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {hasPermission('customer-delete') && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(customer.id, customer.code)}
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
                            This will permanently delete customer <span className="font-semibold">{deleteDialog.code}</span>. This action cannot be undone.
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
            { title: 'Customers', href: '/customers' },
        ]}
    >
        {page}
    </AppLayout>
);
