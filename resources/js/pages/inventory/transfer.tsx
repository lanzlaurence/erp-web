import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { Destination, Inventory } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import ReactSelect from 'react-select';
import InputAmount from '@/components/ui/input-amount';
import { useFormatters } from '@/hooks/use-formatters';

type Props = {
    inventory: Inventory;
    destinations: Destination[];
};

export default function Transfer({ inventory, destinations }: Props) {
    const { formatDecimal } = useFormatters();
    const { data, setData, post, processing, errors } = useForm({
        destination_id: '',
        quantity: '0',
        remarks: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/inventories/${inventory.id}/transfer`);
    };

    const destinationOptions = destinations.map((d) => ({ value: String(d.id), label: `${d.code} — ${d.name}` }));

    const selectClass = {
        control: () => 'border border-input bg-background text-sm rounded-md px-1 py-0.5 min-h-9',
        menu: () => 'bg-popover border border-border rounded-md shadow-md text-sm mt-1',
        option: ({ isFocused, isSelected }: { isFocused: boolean; isSelected: boolean }) =>
            `px-3 py-2 cursor-pointer ${isSelected ? 'bg-primary text-primary-foreground' : isFocused ? 'bg-accent text-accent-foreground' : ''}`,
        singleValue: () => 'text-foreground',
        input: () => 'text-foreground',
        placeholder: () => 'text-muted-foreground',
    };

    return (
        <>
            <Head title="Transfer Stock" />
            <div className="mx-auto max-w-xl space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Transfer Stock</h1>
                    <p className="text-sm text-muted-foreground">Move stock to another destination</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold">Current Stock</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Material</p>
                                <p className="text-sm">{inventory.material?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">From</p>
                                <p className="text-sm">{inventory.destination?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Available Quantity</p>
                                <p className="text-sm font-mono">{formatDecimal(Number(inventory.quantity))}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold">Transfer Details</h3>

                        <div className="space-y-2">
                            <Label>Transfer To</Label>
                            <ReactSelect
                                options={destinationOptions}
                                onChange={(opt) => setData('destination_id', opt?.value ?? '')}
                                placeholder="Select destination..."
                                classNames={selectClass}
                                unstyled
                            />
                            {errors.destination_id && <p className="text-sm text-red-600">{errors.destination_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Quantity to Transfer</Label>
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
                                placeholder="Optional remarks"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Transfer</Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                    </div>
                </form>
            </div>
        </>
    );
}

Transfer.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inventory', href: '/inventories' },
        { title: 'Transfer', href: '#' },
    ]}>{page}</AppLayout>
);
