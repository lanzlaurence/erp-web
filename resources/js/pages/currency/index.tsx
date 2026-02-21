import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import type { CurrencyData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function Index({ currencies }: CurrencyData) {
    const { hasPermission } = usePermissions();
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; name: string }>({
        open: false, id: 0, name: '',
    });

    const handleDeleteConfirm = () => {
        router.delete(`/currencies/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, name: '' });
    };

    return (
        <>
            <Head title="Currencies" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Currencies</h1>
                    {hasPermission('currency-create') && (
                        <Button asChild size="sm">
                            <Link href="/currencies/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Currency
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
                                <TableHead>Symbol</TableHead>
                                <TableHead>Exchange Rate</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currencies.data.map((currency) => (
                                <TableRow key={currency.id}>
                                    <TableCell className="font-medium">{currency.code}</TableCell>
                                    <TableCell>{currency.name}</TableCell>
                                    <TableCell className="font-mono">{currency.symbol}</TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {Number(currency.exchange_rate).toFixed(6)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={currency.is_active ? 'default' : 'secondary'}>
                                            {currency.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {hasPermission('currency-view') && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/currencies/${currency.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {hasPermission('currency-edit') && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/currencies/${currency.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {hasPermission('currency-delete') && (
                                                <Button variant="ghost" size="sm"
                                                    onClick={() => setDeleteDialog({ open: true, id: currency.id, name: currency.name })}>
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

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <span className="font-semibold">{deleteDialog.name}</span>. This action cannot be undone.
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
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Currencies', href: '/currencies' },
    ]}>{page}</AppLayout>
);
