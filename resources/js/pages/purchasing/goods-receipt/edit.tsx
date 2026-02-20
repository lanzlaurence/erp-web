import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { Destination } from '@/types';
import type { GoodsReceipt } from '@/types/transactions';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import ReactSelect from 'react-select';
import { useFormatters } from '@/hooks/use-formatters';
import InputAmount from '@/components/ui/input-amount';
import DatePicker from '@/components/ui/date-picker';

type Props = {
    goodsReceipt: GoodsReceipt;
    destinations: Destination[];
};

export default function Edit({ goodsReceipt, destinations }: Props) {
    const { formatAmount, formatDecimal } = useFormatters();

    const { data, setData, put, processing, errors } = useForm({
        destination_id:   String(goodsReceipt.destination_id),
        gr_date:          goodsReceipt.gr_date,
        transaction_date: goodsReceipt.transaction_date,
        remarks:          goodsReceipt.remarks ?? '',
        items: (goodsReceipt.items ?? []).map((i) => ({
            purchase_order_item_id: String(i.purchase_order_item_id),
            qty_ordered:            Number(i.qty_ordered),
            qty_received:           Number(i.qty_received),
            qty_to_receive:         String(i.qty_to_receive),
            qty_remaining:          Number(i.qty_remaining),
            unit_cost:              Number(i.unit_cost),
            serial_number:          i.serial_number ?? '',
            batch_number:           i.batch_number ?? '',
            remarks:                i.remarks ?? '',
        })),
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

    const destinationOptions = destinations.map((d) => ({ value: String(d.id), label: `${d.code} — ${d.name}` }));

    // When material tracks serial number, auto-split into qty=1 rows
    const updateItem = (index: number, field: string, value: string) => {
        const updated = [...data.items];
        const item    = { ...updated[index], [field]: value };

        if (field === 'qty_to_receive') {
            const max          = item.qty_ordered - item.qty_received;
            const qtyToReceive = Math.min(Math.max(parseFloat(value) || 0, 0), max);
            item.qty_to_receive = String(qtyToReceive);
            item.qty_remaining  = max - qtyToReceive;
        }

        updated[index] = item;
        setData('items', updated);
    };

    const splitSerialLines = (index: number) => {
        const item    = data.items[index];
        const qty     = Math.floor(parseFloat(item.qty_to_receive) || 0);
        if (qty <= 1) return;

        const splitItems = Array.from({ length: qty }, () => ({
            ...item,
            qty_to_receive: '1',
            qty_remaining:  item.qty_ordered - item.qty_received - 1,
            serial_number:  '',
            batch_number:   item.batch_number, // keep batch
        }));

        const updated = [...data.items];
        updated.splice(index, 1, ...splitItems);
        setData('items', updated);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/goods-receipts/${goodsReceipt.id}`);
    };

    return (
        <>
            <Head title={`Edit ${goodsReceipt.gr_number}`} />
            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Edit {goodsReceipt.gr_number}</h1>
                    <p className="text-sm text-muted-foreground">
                        For PO <span className="font-medium">{goodsReceipt.purchaseOrder?.po_number}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Receipt Information</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>GR Date</Label>
                                <DatePicker
                                    value={data.gr_date}
                                    onValueChange={(val) => setData('gr_date', val)}
                                    placeholder="Select GR date"
                                />
                                {errors.gr_date && <p className="text-sm text-red-600">{errors.gr_date}</p>}
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
                                <Label>Destination</Label>
                                <ReactSelect
                                    options={destinationOptions}
                                    value={destinationOptions.find((o) => o.value === data.destination_id) ?? null}
                                    onChange={(opt) => setData('destination_id', opt?.value ?? '')}
                                    placeholder="Select destination..."
                                    classNames={selectClass}
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                    unstyled
                                />
                                {errors.destination_id && <p className="text-sm text-red-600">{errors.destination_id}</p>}
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
                                        <TableHead>Qty Received</TableHead>
                                        <TableHead>Qty to Receive</TableHead>
                                        <TableHead>Qty Remaining</TableHead>
                                        <TableHead>Unit Cost</TableHead>
                                        <TableHead>Serial No.</TableHead>
                                        <TableHead>Batch No.</TableHead>
                                        <TableHead>Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.items.map((item, index) => {
                                        const grItem = goodsReceipt.items?.[index];
                                        const material = grItem?.material;
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <p className="font-medium text-sm">{material?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{material?.code}</p>
                                                </TableCell>
                                                <TableCell className="font-mono">{formatDecimal(item.qty_ordered)}</TableCell>
                                                <TableCell className="font-mono">{formatDecimal(item.qty_received)}</TableCell>
                                                <TableCell>
                                                    <InputAmount
                                                        value={item.qty_to_receive}
                                                        onValueChange={(val) => {
                                                            const max = item.qty_ordered - item.qty_received;
                                                            const clamped = Math.min(Math.max(Number(val) || 0, 0), max);
                                                            updateItem(index, 'qty_to_receive', String(clamped));
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell className={`font-mono text-sm ${item.qty_remaining < 0 ? 'text-red-600' : ''}`}>
                                                    {formatDecimal(item.qty_remaining)}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">{formatAmount(item.unit_cost)}</TableCell>
                                                <TableCell>
                                                    {material?.track_serial_number ? (
                                                        <div className="flex items-center gap-2">
                                                            <Input className="h-8 text-xs w-32" value={item.serial_number}
                                                                onChange={(e) => updateItem(index, 'serial_number', e.target.value)}
                                                                placeholder="Serial no." />
                                                            {parseFloat(item.qty_to_receive) > 1 && (
                                                                <Button type="button" variant="outline" size="sm"
                                                                    onClick={() => splitSerialLines(index)}
                                                                    title="Split into individual serial lines">
                                                                    Split
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ) : <span className="text-xs text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell>
                                                    {material?.track_batch_number ? (
                                                        <Input className="h-8 text-xs w-32" value={item.batch_number}
                                                            onChange={(e) => updateItem(index, 'batch_number', e.target.value)} />
                                                    ) : <span className="text-xs text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell>
                                                    <Input className="h-8 text-xs w-32" value={item.remarks}
                                                        onChange={(e) => updateItem(index, 'remarks', e.target.value)}
                                                        placeholder="Optional" />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Remarks</h3>
                        <Textarea value={data.remarks} onChange={(e) => setData('remarks', e.target.value)}
                            placeholder="Optional remarks" rows={3} />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Update Goods Receipt</Button>
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
        { title: 'Goods Receipts', href: '/goods-receipts' },
        { title: 'Edit', href: '#' },
    ]}>{page}</AppLayout>
);
