import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { Inventory } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import InputAmount from '@/components/ui/input-amount';

export default function Edit({ inventory }: { inventory: Inventory }) {
    const { data, setData, put, processing, errors } = useForm({
        quantity: String(inventory.quantity),
        remarks: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/inventories/${inventory.id}`);
    };

    return (
        <>
            <Head title="Adjust Stock" />
            <div className="mx-auto max-w-xl space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Adjust Stock</h1>
                    <p className="text-sm text-muted-foreground">Update inventory quantity</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold">Stock Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Material</p>
                                <p className="text-sm">{inventory.material?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Destination</p>
                                <p className="text-sm">{inventory.destination?.name}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold">Adjustment</h3>

                        <div className="space-y-2">
                            <Label>New Quantity</Label>
                            <InputAmount
                                value={data.quantity}
                                onValueChange={(val) => setData('quantity', String(val ?? 0))}
                            />
                            {errors.quantity && <p className="text-sm text-red-600">{errors.quantity}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                                placeholder="Reason for adjustment"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Save Adjustment</Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inventory', href: '/inventories' },
        { title: 'Adjust', href: '#' },
    ]}>{page}</AppLayout>
);
