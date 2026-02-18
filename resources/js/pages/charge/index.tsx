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
import type { ChargeData } from '@/types';
import { Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Head } from '@inertiajs/react';

export default function Index({ charges }: ChargeData) {
    const { hasPermission } = usePermissions();
    const { formatAmount, formatDecimal } = useFormatters();
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; name: string }>({
        open: false,
        id: 0,
        name: '',
    });

    const handleDeleteClick = (id: number, name: string) => {
        setDeleteDialog({ open: true, id, name });
    };

    const handleDeleteConfirm = () => {
        router.delete(`/charges/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, name: '' });
    };

    const getTypeBadge = (type: string) => {
        return type === 'tax' ? (
            <Badge variant="destructive">Tax</Badge>
        ) : (
            <Badge variant="success">Discount</Badge>
        );
    };

    const getValueDisplay = (valueType: string, value: string | number) => {
        if (valueType === 'percentage') {
            return `${formatDecimal(Number(value))}%`;
        }
        return formatAmount(Number(value));
    };

    return (
        <>
            <Head title="Charges" />

            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Charges</h1>
                    {hasPermission('charge-create') && (
                        <Button asChild size="sm">
                            <Link href="/charges/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Charge
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Value Type</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {charges.data.map((charge) => (
                                <TableRow key={charge.id}>
                                    <TableCell className="font-medium">{charge.name}</TableCell>
                                    <TableCell>{charge.description}</TableCell>
                                    <TableCell>{getTypeBadge(charge.type)}</TableCell>
                                    <TableCell className="capitalize">{charge.value_type}</TableCell>
                                    <TableCell className="font-mono">{getValueDisplay(charge.value_type, charge.value)}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={charge.status === 'active' ? 'default' : 'secondary'}
                                        >
                                            {charge.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {hasPermission('charge-edit') && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/charges/${charge.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {hasPermission('charge-delete') && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(charge.id, charge.name)}
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
                            This will permanently delete charge <span className="font-semibold">{deleteDialog.name}</span>. This action cannot be undone.
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
            { title: 'Charges', href: '/charges' },
        ]}
    >
        {page}
    </AppLayout>
);
