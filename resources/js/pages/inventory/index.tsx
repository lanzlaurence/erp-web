import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { usePermissions } from '@/hooks/use-permissions';
import { useFormatters } from '@/hooks/use-formatters';
import AppLayout from '@/layouts/app-layout';
import type { InventoryData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftRight, Eye, Edit, Plus, Trash2, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

export default function Index({ inventories }: InventoryData) {
    const { hasPermission } = usePermissions();
    const { formatDecimal, formatAmount } = useFormatters();
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; name: string }>({
        open: false, id: 0, name: '',
    });

    const handleDeleteConfirm = () => {
        router.delete(`/inventories/${deleteDialog.id}`);
        setDeleteDialog({ open: false, id: 0, name: '' });
    };

    return (
        <>
            <Head title="Inventory" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Inventory</h1>
                    {/* {hasPermission('inventory-create') && (
                        <Button asChild size="sm">
                            <Link href="/inventories/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Stock
                            </Link>
                        </Button>
                    )} */}
                    {hasPermission('inventory-adjust') && (
                        <Button asChild size="sm">
                            <Link href="/inventories/manual-adjustment">
                                <SlidersHorizontal className="mr-2 h-4 w-4" />
                                Manual Adjustment
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Inventory Code</TableHead>
                                <TableHead>Material</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Quantity</TableHead>
                                {/* <TableHead>Avg Unit Cost</TableHead>
                                <TableHead>Avg Unit Price</TableHead> */}
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventories.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                                        No inventory records available.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                inventories.data.map((inventory) => (
                                    <TableRow key={inventory.id}>
                                        <TableCell className="font-mono text-sm">{inventory.code}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-medium">{inventory.material?.name}</p>
                                                <p className="text-xs text-muted-foreground">{inventory.material?.code}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{inventory.location?.name}</TableCell>
                                        <TableCell className="font-mono">{formatDecimal(Number(inventory.quantity))}</TableCell>
                                        {/* <TableCell>{formatAmount(Number(inventory.material?.avg_unit_cost))}</TableCell>
                                        <TableCell>{formatAmount(Number(inventory.material?.avg_unit_price))}</TableCell> */}
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {hasPermission('inventory-view') && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/inventories/${inventory.id}`} className="flex flex-col items-center gap-0.5 h-auto py-1">
                                                            <Eye className="h-4 w-4" />
                                                            <span className="text-[10px] leading-none">View</span>
                                                        </Link>
                                                    </Button>
                                                )}
                                                {/* {hasPermission('inventory-adjust') && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/inventories/${inventory.id}/adjust`} className="flex flex-col items-center gap-0.5 h-auto py-1">
                                                            <Edit className="h-4 w-4" />
                                                            <span className="text-[10px] leading-none">Adjust</span>
                                                        </Link>
                                                    </Button>
                                                )} */}
                                                {/* {hasPermission('inventory-transfer') && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/inventories/${inventory.id}/transfer`} className="flex flex-col items-center gap-0.5 h-auto py-1">
                                                            <ArrowLeftRight className="h-4 w-4" />
                                                            <span className="text-[10px] leading-none">Transfer</span>
                                                        </Link>
                                                    </Button>
                                                )} */}
                                                {hasPermission('inventory-delete') && (
                                                    <Button variant="ghost" size="sm" className="flex flex-col items-center gap-0.5 h-auto py-1"
                                                        onClick={() => setDeleteDialog({ open: true, id: inventory.id, name: inventory.material?.name ?? '' })}>
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                        <span className="text-[10px] leading-none text-red-600">Delete</span>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {inventories.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <p>Showing {inventories.from}–{inventories.to} of {inventories.total} records</p>
                        <div className="flex gap-1">
                            {inventories.links.map((link, i) => (
                                link.url ? (
                                    <Link key={i} href={link.url}
                                        className={`px-3 py-1 rounded border text-sm ${link.active ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span key={i}
                                        className="px-3 py-1 rounded border border-border text-muted-foreground opacity-50 text-sm"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will delete inventory for <span className="font-semibold">{deleteDialog.name}</span>. Cannot delete if stock is greater than 0.
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
        { title: 'Inventory', href: '/inventories' },
    ]}>{page}</AppLayout>
);
