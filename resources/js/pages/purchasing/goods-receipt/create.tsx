import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { Location } from '@/types';
import type { PurchaseOrder, PurchaseOrderItem } from '@/types/transactions';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import ReactSelect from 'react-select';
import { useFormatters } from '@/hooks/use-formatters';
import InputAmount from '@/components/ui/input-amount';
import { Info } from 'lucide-react';
import DatePicker from '@/components/ui/date-picker';

type Props = {
    purchaseOrder: PurchaseOrder;
    locations: Location[];
};

type ItemRow = {
    purchase_order_item_id: string;
    material_id: string;
    qty_ordered: number;
    qty_received: number;
    qty_to_receive: string;
    qty_remaining: number;
    unit_cost: number;
    serial_number: string;
    batch_number: string;
    remarks: string;
};

export default function Create({ purchaseOrder, locations }: Props) {
    const { formatAmount, formatDecimal } = useFormatters();
    const [materialModal, setMaterialModal] = useState<{ open: boolean; item: PurchaseOrderItem | null }>({
        open: false, item: null,
    });

    const initialItems: ItemRow[] = (purchaseOrder.items ?? [])
        .filter((i) => Number(i.qty_ordered) > Number(i.qty_received))
        .map((i) => ({
            purchase_order_item_id: String(i.id),
            material_id:  String(i.material_id),
            qty_ordered: Number(i.qty_ordered),
            qty_received: Number(i.qty_received),
            qty_to_receive: String(Number(i.qty_ordered) - Number(i.qty_received)),
            qty_remaining: Number(i.qty_ordered) - Number(i.qty_received),
            unit_cost: Number(i.unit_cost_after_discount),
            serial_number: '',
            batch_number: '',
            remarks: '',
        }));

    const { data, setData, post, processing, errors } = useForm({
        purchase_order_id: String(purchaseOrder.id),
        location_id: '',
        gr_date: new Date().toISOString().split('T')[0],
        transaction_date: new Date().toISOString().split('T')[0],
        remarks: '',
        items: initialItems,
    });

    const selectClass = {
        control: () => 'border border-input bg-background text-sm rounded-md px-1 py-0.5 min-h-9',
        menu: () => 'bg-popover border border-border rounded-md shadow-md text-sm mt-1',
        option: ({ isFocused, isSelected }: { isFocused: boolean; isSelected: boolean }) => `px-3 py-2 cursor-pointer ${isSelected ? 'bg-primary text-primary-foreground' : isFocused ? 'bg-accent text-accent-foreground' : ''}`,
        singleValue: () => 'text-foreground',
        input: () => 'text-foreground',
        placeholder: () => 'text-muted-foreground',
    };

    const locationOptions = locations.map((d) => ({ value: String(d.id), label: `${d.code} — ${d.name}` }));

    // When material tracks serial number, auto-split into qty=1 rows
    const updateItem = (index: number, field: string, value: string) => {
        const updated = [...data.items];
        const item = { ...updated[index], [field]: value };

        if (field === 'qty_to_receive') {
            const max = item.qty_ordered - item.qty_received;
            const qtyToReceive = Math.min(Math.max(parseFloat(value) || 0, 0), max);
            item.qty_to_receive = String(qtyToReceive);
            item.qty_remaining = max - qtyToReceive;
        }

        updated[index] = item;
        setData('items', updated);
    };

    const splitSerialLines = (index: number) => {
        const item = data.items[index];
        const qty = Math.floor(parseFloat(item.qty_to_receive) || 0);
        if (qty <= 1) return;

        const batchNumber = item.batch_number; // capture before split

        const splitItems = Array.from({ length: qty }, () => ({
            ...item,
            qty_to_receive: '1',
            qty_remaining: item.qty_ordered - item.qty_received - 1,
            serial_number: '', // each row fills their own
            batch_number: batchNumber, // same for all
        }));

        const updated = [...data.items];
        updated.splice(index, 1, ...splitItems);
        setData('items', updated);
    };

    const unsplitSerialLines = (index: number) => {
        const item = data.items[index];
        const poItemId = item.purchase_order_item_id;

        // find all rows with same po item id
        const matchingRows = data.items.filter((i) => i.purchase_order_item_id === poItemId);
        if (matchingRows.length <= 1) return;

        const totalQty = matchingRows.reduce((sum, i) => sum + parseFloat(i.qty_to_receive || '0'), 0);
        const max = item.qty_ordered - item.qty_received;

        const merged: typeof item = {
            ...item,
            qty_to_receive: String(totalQty),
            qty_remaining: max - totalQty,
            serial_number: '',
            batch_number: matchingRows[0].batch_number, // keep batch from first row
        };

        // remove all matching rows, insert merged at first occurrence
        const firstIndex = data.items.findIndex((i) => i.purchase_order_item_id === poItemId);
        const updated = data.items.filter((i) => i.purchase_order_item_id !== poItemId);
        updated.splice(firstIndex, 0, merged);
        setData('items', updated);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/goods-receipts');
    };

    const openMaterialModal = (poItemId: string) => {
        const poItem = purchaseOrder.items?.find((i) => String(i.id) === poItemId);
        if (poItem) setMaterialModal({ open: true, item: poItem });
    };

    return (
        <>
            <Head title="Create Goods Receipt" />
            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Create Goods Receipt</h1>
                    <p className="text-sm text-muted-foreground">
                        Receiving for <span className="font-medium">{purchaseOrder.code}</span> — {purchaseOrder.vendor?.name}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* GR Header */}
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
                                <Label>location</Label>
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

                    {/* Items */}
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Items to Receive</h3>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Material</TableHead>
                                        <TableHead>Info</TableHead>
                                        <TableHead>Qty Ordered</TableHead>
                                        <TableHead>Qty Received</TableHead>
                                        <TableHead className="w-32 min-w-0">Qty to Receive</TableHead>
                                        <TableHead>Qty Remaining</TableHead>
                                        <TableHead>Unit Cost</TableHead>
                                        <TableHead>Serial No.</TableHead>
                                        <TableHead>Batch No.</TableHead>
                                        <TableHead>Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="py-6 text-center text-sm text-muted-foreground">
                                                All items have been fully received.
                                            </TableCell>
                                        </TableRow>
                                    ) : data.items.map((item, index) => {
                                        const poItem = purchaseOrder.items?.find((i) => String(i.id) === item.purchase_order_item_id);
                                        const material = poItem?.material;
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <p className="font-medium text-sm">{material?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{material?.code}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <button
                                                        type="button"
                                                        onClick={() => openMaterialModal(item.purchase_order_item_id)}
                                                        className="relative flex items-center justify-center cursor-pointer overflow-hidden"
                                                        title="View material details"
                                                    >
                                                        <span className="absolute inline-flex h-8 w-8 rounded-full bg-primary/20 animate-ping" />
                                                        <span className="relative inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
                                                            <Info className="h-4 w-4 text-primary" />
                                                        </span>
                                                    </button>
                                                </TableCell>
                                                <TableCell className="font-mono">{formatDecimal(item.qty_ordered)}</TableCell>
                                                <TableCell className="font-mono">{formatDecimal(item.qty_received)}</TableCell>
                                                <TableCell className="w-32">
                                                    {(() => {
                                                        const isSplit = data.items.filter(
                                                            (i) => i.purchase_order_item_id === item.purchase_order_item_id
                                                        ).length > 1;

                                                        return isSplit ? (
                                                            <span className="font-mono text-sm px-2">{formatDecimal(parseFloat(item.qty_to_receive))}</span>
                                                        ) : (
                                                            <InputAmount
                                                                value={item.qty_to_receive}
                                                                onValueChange={(val) => {
                                                                    const max = item.qty_ordered - item.qty_received;
                                                                    const clamped = Math.min(Math.max(Number(val) || 0, 0), max);
                                                                    updateItem(index, 'qty_to_receive', String(clamped));
                                                                }}
                                                            />
                                                        );
                                                    })()}
                                                </TableCell>
                                                <TableCell className={`font-mono text-sm ${item.qty_remaining < 0 ? 'text-red-600' : ''}`}>
                                                    {formatDecimal(item.qty_remaining)}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">{formatAmount(item.unit_cost)}</TableCell>
                                                <TableCell>
                                                    {material?.track_serial_number ? (() => {
                                                        const firstIndex = data.items.findIndex(
                                                            (i) => i.purchase_order_item_id === item.purchase_order_item_id
                                                        );
                                                        const isFirst = firstIndex === index;
                                                        const splitCount = data.items.filter(
                                                            (i) => i.purchase_order_item_id === item.purchase_order_item_id
                                                        ).length;
                                                        const isSplit = splitCount > 1;

                                                        return (
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    className="h-8 text-xs w-32"
                                                                    value={item.serial_number}
                                                                    onChange={(e) => updateItem(index, 'serial_number', e.target.value)}
                                                                    placeholder="Serial no."
                                                                />
                                                                {/* Split button — only on first row when not yet split */}
                                                                {isFirst && !isSplit && parseFloat(item.qty_to_receive) > 1 && (
                                                                    <Button type="button" variant="outline" size="sm"
                                                                        onClick={() => splitSerialLines(index)}
                                                                        title="Split into individual serial lines">
                                                                        Split
                                                                    </Button>
                                                                )}
                                                                {/* Unsplit button — only on first row when already split */}
                                                                {isFirst && isSplit && (
                                                                    <Button type="button" variant="outline" size="sm"
                                                                        onClick={() => unsplitSerialLines(index)}
                                                                        title="Merge back into one row">
                                                                        Unsplit
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        );
                                                    })() : <span className="text-xs text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell>
                                                    {material?.track_batch_number ? (() => {
                                                        // find if this is the first row with this po item id
                                                        const firstIndex = data.items.findIndex(
                                                            (i) => i.purchase_order_item_id === item.purchase_order_item_id
                                                        );
                                                        const isFirst = firstIndex === index;

                                                        return isFirst ? (
                                                            <Input
                                                                className="h-8 text-xs w-32"
                                                                value={item.batch_number}
                                                                onChange={(e) => {
                                                                    // auto-fill all rows with same po item id
                                                                    const updated = data.items.map((i, idx) =>
                                                                        i.purchase_order_item_id === item.purchase_order_item_id
                                                                            ? { ...i, batch_number: e.target.value }
                                                                            : i
                                                                    );
                                                                    setData('items', updated);
                                                                }}
                                                                placeholder="Batch no."
                                                            />
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground font-mono">
                                                                {item.batch_number || '—'}
                                                            </span>
                                                        );
                                                    })() : <span className="text-xs text-muted-foreground">N/A</span>}
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

                    {/* Remarks */}
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Remarks</h3>
                        <Textarea value={data.remarks} onChange={(e) => setData('remarks', e.target.value)}
                            placeholder="Optional remarks" rows={3} />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing || data.items.length === 0}>
                            Create Goods Receipt
                        </Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                    </div>
                </form>
            </div>

            {/* Material Info Modal */}
            <Dialog open={materialModal.open} onOpenChange={(open) => setMaterialModal({ open, item: null })}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Material Information</DialogTitle>
                    </DialogHeader>
                    {materialModal.item && (() => {
                        const m = materialModal.item.material;
                        return (
                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-3">
                                    <div><p className="text-muted-foreground">Code</p><p className="font-medium">{m?.code}</p></div>
                                    <div><p className="text-muted-foreground">SKU</p><p>{m?.sku || '-'}</p></div>
                                    <div><p className="text-muted-foreground">Name</p><p className="font-medium">{m?.name}</p></div>
                                    <div className="col-span-2"><p className="text-muted-foreground">Description</p><p>{m?.description || '-'}</p></div>
                                </div>
                                <div className="border-t pt-3 grid grid-cols-3 gap-3">
                                    <div><p className="text-muted-foreground">Brand</p><p>{m?.brand?.name || '-'}</p></div>
                                    <div><p className="text-muted-foreground">Category</p><p>{m?.category?.name || '-'}</p></div>
                                    <div><p className="text-muted-foreground">UOM</p><p>{m?.uom?.acronym || '-'}</p></div>
                                </div>
                                <div className="border-t pt-3 grid grid-cols-3 gap-3">
                                    <div><p className="text-muted-foreground">Weight (kg)</p><p className="font-mono">{m?.weight ? formatDecimal(Number(m.weight)) : '-'}</p></div>
                                    <div><p className="text-muted-foreground">Length (m)</p><p className="font-mono">{m?.length ? formatDecimal(Number(m.length)) : '-'}</p></div>
                                    <div><p className="text-muted-foreground">Width (m)</p><p className="font-mono">{m?.width ? formatDecimal(Number(m.width)) : '-'}</p></div>
                                    <div><p className="text-muted-foreground">Height (m)</p><p className="font-mono">{m?.height ? formatDecimal(Number(m.height)) : '-'}</p></div>
                                    <div><p className="text-muted-foreground">Volume (m³)</p><p className="font-mono">{m?.volume ? formatDecimal(Number(m.volume)) : '-'}</p></div>
                                </div>
                                <div className="border-t pt-3 grid grid-cols-2 gap-3">
                                    <div><p className="text-muted-foreground">Unit Cost</p><p className="font-mono">{formatAmount(Number(m?.unit_cost))}</p></div>
                                    <div><p className="text-muted-foreground">Unit Price</p><p className="font-mono">{formatAmount(Number(m?.unit_cost))}</p></div>
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
        { title: 'Purchase Orders', href: '/purchase-orders' },
        { title: 'Goods Receipts', href: '/goods-receipts' },
        { title: 'Create', href: '#' },
    ]}>{page}</AppLayout>
);
