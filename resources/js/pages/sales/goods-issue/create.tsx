import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { Location } from '@/types';
import type { SalesOrder, SalesOrderItem } from '@/types/transactions';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import ReactSelect from 'react-select';
import { useFormatters } from '@/hooks/use-formatters';
import InputAmount from '@/components/ui/input-amount';
import { Info } from 'lucide-react';
import DatePicker from '@/components/ui/date-picker';

type Props = {
    salesOrder: SalesOrder;
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

export default function Create({ salesOrder, locations }: Props) {
    const { formatAmount, formatDecimal } = useFormatters();
    const [materialModal, setMaterialModal] = useState<{ open: boolean; item: SalesOrderItem | null }>({
        open: false, item: null,
    });

    const initialItems: ItemRow[] = (salesOrder.items ?? [])
        .filter((i) => Number(i.qty_ordered) > Number(i.qty_shipped))
        .map((i) => ({
            sales_order_item_id: String(i.id),
            material_id:         String(i.material_id),
            qty_ordered:         Number(i.qty_ordered),
            qty_shipped:          Number(i.qty_shipped),
            qty_to_ship:        String(Number(i.qty_ordered) - Number(i.qty_shipped)),
            qty_remaining:       Number(i.qty_ordered) - Number(i.qty_shipped),
            unit_price:          Number(i.unit_price_after_discount),
            serial_number:       '',
            batch_number:        '',
            remarks:             '',
        }));

    const { data, setData, post, processing, errors } = useForm({
        sales_order_id: String(salesOrder.id),
        location_id:    '',
        gi_date:        new Date().toISOString().split('T')[0],
        transaction_date: new Date().toISOString().split('T')[0],
        remarks:        '',
        items:          initialItems,
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
        const item    = { ...updated[index], [field]: value };

        if (field === 'qty_to_ship') {
            const max        = item.qty_ordered - item.qty_shipped;
            const qtyToIssue = Math.min(Math.max(parseFloat(value) || 0, 0), max);
            item.qty_to_ship  = String(qtyToIssue);
            item.qty_remaining = max - qtyToIssue;
        }

        updated[index] = item;
        setData('items', updated);
    };

    const splitSerialLines = (index: number) => {
        const item = data.items[index];
        const qty  = Math.floor(parseFloat(item.qty_to_ship) || 0);
        if (qty <= 1) return;

        const batchNumber = item.batch_number;
        const splitItems  = Array.from({ length: qty }, () => ({
            ...item,
            qty_to_ship:  '1',
            qty_remaining: item.qty_ordered - item.qty_shipped - 1,
            serial_number: '',
            batch_number:  batchNumber,
        }));

        const updated = [...data.items];
        updated.splice(index, 1, ...splitItems);
        setData('items', updated);
    };

    const unsplitSerialLines = (index: number) => {
        const item     = data.items[index];
        const soItemId = item.sales_order_item_id;

        const matchingRows = data.items.filter((i) => i.sales_order_item_id === soItemId);
        if (matchingRows.length <= 1) return;

        const totalQty = matchingRows.reduce((sum, i) => sum + parseFloat(i.qty_to_ship || '0'), 0);
        const max      = item.qty_ordered - item.qty_shipped;

        const merged: typeof item = {
            ...item,
            qty_to_ship:  String(totalQty),
            qty_remaining: max - totalQty,
            serial_number: '',
            batch_number:  matchingRows[0].batch_number,
        };

        const firstIndex = data.items.findIndex((i) => i.sales_order_item_id === soItemId);
        const updated    = data.items.filter((i) => i.sales_order_item_id !== soItemId);
        updated.splice(firstIndex, 0, merged);
        setData('items', updated);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/goods-issues');
    };

    return (
        <>
            <Head title="Create Goods Issue" />
            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Create Goods Issue</h1>
                    <p className="text-sm text-muted-foreground">
                        Issuing for <span className="font-medium">{salesOrder.code}</span> — {salesOrder.customer?.name}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Issue Information</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>GI Date</Label>
                                <DatePicker value={data.gi_date} onValueChange={(val) => setData('gi_date', val)} placeholder="Select GI date" />
                                {errors.gi_date && <p className="text-sm text-red-600">{errors.gi_date}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Transaction Date</Label>
                                <DatePicker value={data.transaction_date} onValueChange={(val) => setData('transaction_date', val)} placeholder="Select transaction date" />
                                {errors.transaction_date && <p className="text-sm text-red-600">{errors.transaction_date}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <ReactSelect
                                    options={locationOptions}
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
                        <h3 className="font-semibold">Items to Issue</h3>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Material</TableHead>
                                        <TableHead>Info</TableHead>
                                        <TableHead>Qty Ordered</TableHead>
                                        <TableHead>Qty Shipped</TableHead>
                                        <TableHead className="w-32 min-w-0">Qty to Ship</TableHead>
                                        <TableHead>Qty Remaining</TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead>Serial No.</TableHead>
                                        <TableHead>Batch No.</TableHead>
                                        <TableHead>Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="py-6 text-center text-sm text-muted-foreground">
                                                All items have been fully issued.
                                            </TableCell>
                                        </TableRow>
                                    ) : data.items.map((item, index) => {
                                        const soItem = salesOrder.items?.find((i) => String(i.id) === item.sales_order_item_id);
                                        const sameItemRows = data.items.filter((i) => i.sales_order_item_id === item.sales_order_item_id);
                                        const isSplit = sameItemRows.length > 1;

                                        return (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <p className="font-medium text-sm">{soItem?.material?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{soItem?.material?.code}</p>
                                                </TableCell>
                                                <TableCell>
                                                    {soItem && (
                                                        <button type="button"
                                                            onClick={() => setMaterialModal({ open: true, item: soItem })}
                                                            className="relative flex items-center justify-center cursor-pointer overflow-hidden">
                                                            <span className="absolute inline-flex h-8 w-8 rounded-full bg-primary/20 animate-ping" />
                                                            <span className="relative inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
                                                                <Info className="h-4 w-4 text-primary" />
                                                            </span>
                                                        </button>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono">{formatDecimal(item.qty_ordered)}</TableCell>
                                                <TableCell className="font-mono">{formatDecimal(item.qty_shipped)}</TableCell>
                                                <TableCell>
                                                    <InputAmount
                                                        value={item.qty_to_ship}
                                                        max={item.qty_ordered - item.qty_shipped}
                                                        onValueChange={(val) => updateItem(index, 'qty_to_ship', String(val ?? 0))}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-mono text-muted-foreground">{formatDecimal(item.qty_remaining)}</TableCell>
                                                <TableCell className="font-mono">{formatAmount(item.unit_price)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Input
                                                            className="h-8 text-xs w-28"
                                                            value={item.serial_number}
                                                            onChange={(e) => updateItem(index, 'serial_number', e.target.value)}
                                                            placeholder="Optional"
                                                        />
                                                        {!isSplit && parseFloat(item.qty_to_ship) > 1 && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 text-xs px-2 whitespace-nowrap"
                                                                onClick={() => splitSerialLines(index)}
                                                            >
                                                                Split
                                                            </Button>
                                                        )}
                                                        {isSplit && data.items.findIndex((i) => i.sales_order_item_id === item.sales_order_item_id) === index && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 text-xs px-2 whitespace-nowrap"
                                                                onClick={() => unsplitSerialLines(index)}
                                                            >
                                                                Unsplit
                                                            </Button>
                                                        )}
                                                    </div>
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
                                        );
                                    })}
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
                        <Button type="submit" disabled={processing || data.items.length === 0}>
                            Create Goods Issue
                        </Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                    </div>
                </form>
            </div>

            <Dialog open={materialModal.open} onOpenChange={(open) => setMaterialModal({ open, item: null })}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Material Information</DialogTitle></DialogHeader>
                    {materialModal.item && (() => {
                        const i = materialModal.item;
                        return (
                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-3">
                                    <div><p className="text-muted-foreground">Code</p><p className="font-medium">{i.material?.code}</p></div>
                                    <div><p className="text-muted-foreground">Name</p><p className="font-medium">{i.material?.name}</p></div>
                                    <div><p className="text-muted-foreground">Qty Ordered</p><p className="font-mono">{formatDecimal(Number(i.qty_ordered))}</p></div>
                                    <div><p className="text-muted-foreground">Qty Shipped</p><p className="font-mono">{formatDecimal(Number(i.qty_shipped))}</p></div>
                                    <div><p className="text-muted-foreground">Qty Remaining</p><p className="font-mono">{formatDecimal(Number(i.qty_ordered) - Number(i.qty_shipped))}</p></div>
                                    <div><p className="text-muted-foreground">Unit Price</p><p className="font-mono">{formatAmount(Number(i.unit_price_after_discount))}</p></div>
                                </div>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Sales Orders', href: '/sales-orders' },
        { title: 'Create GI', href: '#' },
    ]}>{page}</AppLayout>
);
