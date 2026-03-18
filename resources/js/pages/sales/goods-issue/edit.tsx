import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { Location } from '@/types';
import type { GoodsIssue } from '@/types/transactions';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import ReactSelect from 'react-select';
import { useFormatters } from '@/hooks/use-formatters';
import InputAmount from '@/components/ui/input-amount';
import DatePicker from '@/components/ui/date-picker';

type Props = {
    goodsIssue: GoodsIssue;
    locations: Location[];
};

type ItemRow = {
    sales_order_item_id: string;
    material_id: string;
    qty_ordered: number;
    qty_shipped: number;
    qty_to_ship: string;
    qty_remaining: number;
    unit_price: number;
    serial_number: string;
    batch_number: string;
    remarks: string;
};

export default function Edit({ goodsIssue, locations }: Props) {
    const { formatAmount, formatDecimal } = useFormatters();

    const { data, setData, put, processing, errors } = useForm({
        location_id:      String(goodsIssue.location_id),
        gi_date:          goodsIssue.gi_date,
        transaction_date: goodsIssue.transaction_date,
        remarks:          goodsIssue.remarks ?? '',
        items: (goodsIssue.items ?? []).map((i) => ({
            sales_order_item_id: String(i.sales_order_item_id),
            material_id:         String(i.material_id),
            qty_ordered:         Number(i.qty_ordered),
            qty_shipped:          Number(i.qty_shipped),
            qty_to_ship:        String(i.qty_to_ship),
            qty_remaining:       Number(i.qty_remaining),
            unit_price:          Number(i.unit_price),
            serial_number:       i.serial_number ?? '',
            batch_number:        i.batch_number ?? '',
            remarks:             i.remarks ?? '',
        })) as ItemRow[],
    });

    const selectClass = {
        control: () => 'border border-input bg-background text-sm rounded-md px-1 py-0.5 min-h-9',
        menu: () => 'bg-popover border border-border rounded-md shadow-md text-sm mt-1',
        option: ({ isFocused, isSelected }: { isFocused: boolean; isSelected: boolean }) =>
            `px-3 py-2 cursor-pointer ${isSelected ? 'bg-primary text-primary-foreground' : isFocused ? 'bg-accent text-accent-foreground' : ''}`,
        singleValue: () => 'text-foreground',
        input: () => 'text-foreground',
        placeholder: () => 'text-muted-foreground',
    };

    const locationOptions = locations.map((l) => ({ value: String(l.id), label: `${l.code} — ${l.name}` }));

    const updateItem = (index: number, field: string, value: string) => {
        const updated = [...data.items];
        const item = { ...updated[index], [field]: value };

        if (field === 'qty_to_ship') {
            const originalRemaining = updated[index].qty_remaining + parseFloat(updated[index].qty_to_ship || '0');
            const qtyToShip = Math.min(Math.max(parseFloat(value) || 0, 0), originalRemaining);
            item.qty_to_ship = String(qtyToShip);
            item.qty_remaining = originalRemaining - qtyToShip;
        }

        updated[index] = item;
        setData('items', updated);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/goods-issues/${goodsIssue.id}`);
    };

    return (
        <>
            <Head title={`Edit ${goodsIssue.code}`} />
            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Edit {goodsIssue.code}</h1>
                    <p className="text-sm text-muted-foreground">
                        Editing goods issue for <span className="font-medium">{goodsIssue.sales_order?.code}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Issue Information</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>GI Date</Label>
                                <DatePicker
                                    value={data.gi_date}
                                    onValueChange={(val) => setData('gi_date', val)}
                                    placeholder="Select GI date"
                                />
                                {errors.gi_date && <p className="text-sm text-red-600">{errors.gi_date}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Transaction Date</Label>
                                <DatePicker
                                    value={data.transaction_date}
                                    onValueChange={(val) => setData('transaction_date', val)}
                                    placeholder="Select transaction date"
                                />
                                {errors.transaction_date && <p className="text-sm text-red-600">{errors.transaction_date}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <ReactSelect
                                    options={locationOptions}
                                    value={locationOptions.find((o) => o.value === data.location_id) ?? null}
                                    onChange={(opt) => setData('location_id', opt?.value ?? '')}
                                    placeholder="Select location..."
                                    classNames={selectClass}
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                    unstyled
                                />
                                {errors.location_id && <p className="text-sm text-red-600">{errors.location_id}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Items</h3>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Material</TableHead>
                                        <TableHead>Qty Ordered</TableHead>
                                        <TableHead>Qty Shipped</TableHead>
                                        <TableHead className="w-32">Qty to Ship</TableHead>
                                        <TableHead>Qty Remaining</TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead>Serial No.</TableHead>
                                        <TableHead>Batch No.</TableHead>
                                        <TableHead>Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <p className="font-medium text-sm">{goodsIssue.items?.[index]?.material?.name}</p>
                                                <p className="text-xs text-muted-foreground">{goodsIssue.items?.[index]?.material?.code}</p>
                                            </TableCell>
                                            <TableCell className="font-mono">{formatDecimal(item.qty_ordered)}</TableCell>
                                            <TableCell className="font-mono">{formatDecimal(item.qty_shipped)}</TableCell>
                                            <TableCell>
                                                <InputAmount
                                                    value={item.qty_to_ship}
                                                    max={item.qty_remaining + parseFloat(item.qty_to_ship || '0')}
                                                    onValueChange={(val) => updateItem(index, 'qty_to_ship', String(val ?? 0))}
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono text-muted-foreground">{formatDecimal(item.qty_remaining)}</TableCell>
                                            <TableCell className="font-mono">{formatAmount(item.unit_price)}</TableCell>
                                            <TableCell>
                                                <Input
                                                    className="h-8 text-xs w-28"
                                                    value={item.serial_number}
                                                    onChange={(e) => updateItem(index, 'serial_number', e.target.value)}
                                                    placeholder="Optional"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    className="h-8 text-xs w-28"
                                                    value={item.batch_number}
                                                    onChange={(e) => updateItem(index, 'batch_number', e.target.value)}
                                                    placeholder="Optional"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    className="h-8 text-xs w-32"
                                                    value={item.remarks}
                                                    onChange={(e) => updateItem(index, 'remarks', e.target.value)}
                                                    placeholder="Optional"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Remarks</h3>
                        <Textarea
                            value={data.remarks}
                            onChange={(e) => setData('remarks', e.target.value)}
                            placeholder="Optional remarks"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Update Goods Issue</Button>
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
        { title: 'Goods Issues', href: '/goods-issues' },
        { title: 'Edit', href: '#' },
    ]}>{page}</AppLayout>
);
