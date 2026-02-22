import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { Charge, Customer, Material } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useCallback, useState } from 'react';
import ReactSelect from 'react-select';
import { Plus, Trash2, Info } from 'lucide-react';
import { useFormatters } from '@/hooks/use-formatters';
import InputAmount from '@/components/ui/input-amount';
import DatePicker from '@/components/ui/date-picker';

type Props = {
    customers: Customer[];
    materials: Material[];
    charges: Charge[];
};

type ItemRow = {
    material_id: string;
    qty_ordered: string;
    unit_price: string;
    discount_type: 'fixed' | 'percentage' | '';
    discount_amount: string;
    unit_price_after_discount: number;
    net_price: number;
    is_vatable: boolean;
    vat_type: 'exclusive' | 'inclusive';
    vat_rate: string;
    vat_price: number;
    gross_price: number;
    remarks: string;
};

type ChargeRow = { charge_id: string };

const emptyItem = (): ItemRow => ({
    material_id: '',
    qty_ordered: '1',
    unit_price: '0',
    discount_type: '',
    discount_amount: '0',
    unit_price_after_discount: 0,
    net_price: 0,
    is_vatable: false,
    vat_type: 'exclusive',
    vat_rate: '12',
    vat_price: 0,
    gross_price: 0,
    remarks: '',
});

function computeItem(item: ItemRow): ItemRow {
    const unitPrice   = parseFloat(item.unit_price) || 0;
    const qty         = parseFloat(item.qty_ordered) || 0;
    const discountAmt = parseFloat(item.discount_amount) || 0;
    const vatRate     = parseFloat(item.vat_rate) || 0;

    let unitAfterDiscount = unitPrice;
    if (item.discount_type === 'fixed') unitAfterDiscount = Math.max(0, unitPrice - discountAmt);
    else if (item.discount_type === 'percentage') unitAfterDiscount = unitPrice * (1 - discountAmt / 100);

    const netPrice = unitAfterDiscount * qty;
    let vatPrice = 0;
    if (item.is_vatable) {
        vatPrice = item.vat_type === 'exclusive'
            ? netPrice * (vatRate / 100)
            : netPrice - netPrice / (1 + vatRate / 100);
    }

    return {
        ...item,
        unit_price_after_discount: unitAfterDiscount,
        net_price: netPrice,
        vat_price: vatPrice,
        gross_price: item.vat_type === 'exclusive' ? netPrice + vatPrice : netPrice,
    };
}

export default function Create({ customers, materials, charges }: Props) {
    const { formatAmount, formatDecimal } = useFormatters();
    const [materialModal, setMaterialModal] = useState<{ open: boolean; material: Material | null }>({
        open: false, material: null,
    });

    const { data, setData, post, processing, errors } = useForm({
        customer_id:     '',
        order_date:      new Date().toISOString().split('T')[0],
        delivery_date:   '',
        reference_no:    '',
        discount_type:   '' as 'fixed' | 'percentage' | '',
        discount_amount: '0',
        remarks:         '',
        items:           [emptyItem()] as ItemRow[],
        charges:         [] as ChargeRow[],
    });

    const selectClass = {
        control: () => 'border border-input bg-background text-sm rounded-md px-1 py-0.5 min-h-9',
        menu: () => 'bg-popover border border-border rounded-md shadow-md text-sm mt-1 z-50',
        option: ({ isFocused, isSelected }: { isFocused: boolean; isSelected: boolean }) =>
            `px-3 py-2 cursor-pointer ${isSelected ? 'bg-primary text-primary-foreground' : isFocused ? 'bg-accent text-accent-foreground' : ''}`,
        singleValue: () => 'text-foreground',
        input: () => 'text-foreground',
        placeholder: () => 'text-muted-foreground',
    };

    const customerOptions = customers.map((c) => ({ value: String(c.id), label: `${c.code} — ${c.name}` }));
    const materialOptions = materials.map((m) => ({ value: String(m.id), label: `${m.code} — ${m.name}` }));
    const chargeOptions   = charges.map((c) => ({ value: String(c.id), label: c.name }));
    const selectedCustomer = customers.find((c) => String(c.id) === data.customer_id);

    const updateItem = useCallback((index: number, field: keyof ItemRow, value: string | boolean) => {
        const updated = [...data.items];
        updated[index] = computeItem({ ...updated[index], [field]: value });
        setData('items', updated);
    }, [data.items]);

    const addItem    = () => setData('items', [...data.items, emptyItem()]);
    const removeItem = (i: number) => setData('items', data.items.filter((_, idx) => idx !== i));
    const addCharge    = () => setData('charges', [...data.charges, { charge_id: '' }]);
    const removeCharge = (i: number) => setData('charges', data.charges.filter((_, idx) => idx !== i));

    const totalBeforeDiscount = data.items.reduce((s, i) => s + (parseFloat(i.unit_price) || 0) * (parseFloat(i.qty_ordered) || 0), 0);
    const totalItemDiscount   = data.items.reduce((s, i) => s + ((parseFloat(i.unit_price) || 0) - i.unit_price_after_discount) * (parseFloat(i.qty_ordered) || 0), 0);
    const totalNetPrice       = data.items.reduce((s, i) => s + i.net_price, 0);
    const totalVat            = data.items.reduce((s, i) => s + i.vat_price, 0);
    const totalGross          = data.items.reduce((s, i) => s + i.gross_price, 0);

    const headerDiscount = (() => {
        const amt = parseFloat(data.discount_amount) || 0;
        if (data.discount_type === 'fixed') return amt;
        if (data.discount_type === 'percentage') return totalGross * (amt / 100);
        return 0;
    })();

    const afterHeaderDiscount = totalGross - headerDiscount;
    const totalCharges = data.charges.reduce((sum, cr) => {
        const charge = charges.find((c) => String(c.id) === cr.charge_id);
        if (!charge) return sum;
        const computed = charge.value_type === 'fixed' ? Number(charge.value) : afterHeaderDiscount * (Number(charge.value) / 100);
        return charge.type === 'tax' ? sum + computed : sum - computed;
    }, 0);
    const grandTotal = afterHeaderDiscount + totalCharges;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/sales-orders');
    };

    return (
        <>
            <Head title="Create Sales Order" />
            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Create Sales Order</h1>
                    <p className="text-sm text-muted-foreground">Create a new sales order</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header */}
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Order Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Customer</Label>
                                <ReactSelect
                                    options={customerOptions}
                                    onChange={(opt) => setData('customer_id', opt?.value ?? '')}
                                    placeholder="Select customer..."
                                    classNames={selectClass}
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                    unstyled
                                />
                                {errors.customer_id && <p className="text-sm text-red-600">{errors.customer_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Reference No.</Label>
                                <Input value={data.reference_no}
                                    onChange={(e) => setData('reference_no', e.target.value)}
                                    placeholder="Optional" />
                            </div>

                            {selectedCustomer && (
                                <div className="col-span-2 rounded-md bg-muted/50 p-3 text-sm flex gap-6">
                                    <p><span className="text-muted-foreground">Address:</span> {[selectedCustomer.address_line_1, selectedCustomer.city, selectedCustomer.country].filter(Boolean).join(', ') || '-'}</p>
                                    <p><span className="text-muted-foreground">Payment Terms:</span> {selectedCustomer.payment_terms || '-'}</p>
                                    <p><span className="text-muted-foreground">Credit Amount:</span> {formatAmount(Number(selectedCustomer.credit_amount))}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Order Date</Label>
                                <DatePicker
                                    value={data.order_date}
                                    onValueChange={(val) => {
                                        setData('order_date', val);
                                        if (data.delivery_date && data.delivery_date < val) setData('delivery_date', '');
                                    }}
                                    placeholder="Select order date"
                                />
                                {errors.order_date && <p className="text-sm text-red-600">{errors.order_date}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Delivery Date</Label>
                                <DatePicker
                                    value={data.delivery_date}
                                    onValueChange={(val) => setData('delivery_date', val)}
                                    placeholder="Select delivery date"
                                    disabled={!data.order_date}
                                    minDate={data.order_date ? new Date(data.order_date) : undefined}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-4 rounded-lg border p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Items</h3>
                            <Button type="button" size="sm" variant="outline" onClick={addItem}>
                                <Plus className="mr-2 h-4 w-4" />Add Item
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[200px]">Material</TableHead>
                                        <TableHead>Info</TableHead>
                                        <TableHead className="min-w-[100px]">Qty</TableHead>
                                        <TableHead className="min-w-[120px]">Unit Price</TableHead>
                                        <TableHead className="min-w-[100px]">Disc. Type</TableHead>
                                        <TableHead className="min-w-[100px]">Disc. Amount</TableHead>
                                        <TableHead className="min-w-[120px]">Price After Disc.</TableHead>
                                        <TableHead className="min-w-[100px]">Net Price</TableHead>
                                        <TableHead className="min-w-[80px]">Vatable</TableHead>
                                        <TableHead className="min-w-[100px]">VAT Type</TableHead>
                                        <TableHead className="min-w-[80px]">VAT Rate</TableHead>
                                        <TableHead className="min-w-[100px]">VAT Price</TableHead>
                                        <TableHead className="min-w-[100px]">Gross Price</TableHead>
                                        <TableHead className="min-w-[150px]">Remarks</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <ReactSelect
                                                    options={materialOptions}
                                                    onChange={(opt) => {
                                                        const mat = materials.find((m) => String(m.id) === opt?.value);
                                                        const updated = [...data.items];
                                                        updated[index] = computeItem({
                                                            ...updated[index],
                                                            material_id: opt?.value ?? '',
                                                            unit_price: mat ? String(mat.unit_price) : '0',
                                                        });
                                                        setData('items', updated);
                                                    }}
                                                    placeholder="Select..."
                                                    classNames={selectClass}
                                                    menuPortalTarget={document.body}
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                    unstyled
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {item.material_id ? (
                                                    <button type="button"
                                                        onClick={() => {
                                                            const mat = materials.find((m) => String(m.id) === item.material_id);
                                                            if (mat) setMaterialModal({ open: true, material: mat });
                                                        }}
                                                        className="relative flex items-center justify-center cursor-pointer overflow-hidden">
                                                        <span className="absolute inline-flex h-8 w-8 rounded-full bg-primary/20 animate-ping" />
                                                        <span className="relative inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
                                                            <Info className="h-4 w-4 text-primary" />
                                                        </span>
                                                    </button>
                                                ) : <span className="text-xs text-muted-foreground">—</span>}
                                            </TableCell>
                                            <TableCell>
                                                <InputAmount value={item.qty_ordered} onValueChange={(val) => updateItem(index, 'qty_ordered', String(val ?? 0))} />
                                            </TableCell>
                                            <TableCell>
                                                <InputAmount value={item.unit_price} onValueChange={(val) => updateItem(index, 'unit_price', String(val ?? 0))} />
                                            </TableCell>
                                            <TableCell>
                                                <Select value={item.discount_type || 'none'}
                                                    onValueChange={(val) => updateItem(index, 'discount_type', val === 'none' ? '' : val)}>
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="None" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        <SelectItem value="fixed">Fixed</SelectItem>
                                                        <SelectItem value="percentage">%</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <InputAmount value={item.discount_amount} onValueChange={(val) => updateItem(index, 'discount_amount', String(val ?? 0))} disabled={!item.discount_type} />
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-muted-foreground">{formatAmount(item.unit_price_after_discount)}</TableCell>
                                            <TableCell className="font-mono text-sm text-muted-foreground">{formatAmount(item.net_price)}</TableCell>
                                            <TableCell>
                                                <Switch checked={item.is_vatable} onCheckedChange={(val) => updateItem(index, 'is_vatable', val)} />
                                            </TableCell>
                                            <TableCell>
                                                <Select value={item.vat_type} onValueChange={(val) => updateItem(index, 'vat_type', val)} disabled={!item.is_vatable}>
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="exclusive">Exclusive</SelectItem>
                                                        <SelectItem value="inclusive">Inclusive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input className="h-8 text-xs w-16" value={item.vat_rate} onChange={(e) => updateItem(index, 'vat_rate', e.target.value)} disabled={!item.is_vatable} />
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-muted-foreground">{formatAmount(item.vat_price)}</TableCell>
                                            <TableCell className="font-mono text-sm font-medium">{formatAmount(item.gross_price)}</TableCell>
                                            <TableCell>
                                                <Input className="h-8 text-xs" value={item.remarks} onChange={(e) => updateItem(index, 'remarks', e.target.value)} placeholder="Optional" />
                                            </TableCell>
                                            <TableCell>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} disabled={data.items.length === 1}>
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Discount + Charges + Summary */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="space-y-4 rounded-lg border p-6">
                                <h3 className="font-semibold">Header Discount</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Discount Type</Label>
                                        <Select value={data.discount_type || 'none'}
                                            onValueChange={(val) => setData('discount_type', val === 'none' ? '' : val as 'fixed' | 'percentage' | '')}>
                                            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                <SelectItem value="fixed">Fixed</SelectItem>
                                                <SelectItem value="percentage">Percentage</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Discount Amount</Label>
                                        <InputAmount value={data.discount_amount}
                                            onValueChange={(val) => setData('discount_amount', String(val ?? 0))}
                                            disabled={!data.discount_type} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 rounded-lg border p-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">Charges</h3>
                                    <Button type="button" size="sm" variant="outline" onClick={addCharge}>
                                        <Plus className="mr-2 h-4 w-4" />Add Charge
                                    </Button>
                                </div>
                                {data.charges.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No charges added.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {data.charges.map((cr, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <ReactSelect
                                                        options={chargeOptions.filter((o) => !data.charges.some((c, i) => i !== index && c.charge_id === o.value))}
                                                        value={chargeOptions.find((o) => o.value === cr.charge_id) ?? null}
                                                        onChange={(opt) => {
                                                            const updated = [...data.charges];
                                                            updated[index] = { charge_id: opt?.value ?? '' };
                                                            setData('charges', updated);
                                                        }}
                                                        placeholder="Select charge..."
                                                        classNames={selectClass}
                                                        menuPortalTarget={document.body}
                                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                        unstyled
                                                    />
                                                </div>
                                                {cr.charge_id && (() => {
                                                    const charge = charges.find((c) => String(c.id) === cr.charge_id);
                                                    return charge ? (
                                                        <div className="text-sm text-muted-foreground whitespace-nowrap text-right">
                                                            <p>{charge.value_type === 'percentage' ? `${charge.value}%` : formatAmount(Number(charge.value))} — {charge.type}</p>
                                                        </div>
                                                    ) : null;
                                                })()}
                                                <Button type="button" variant="ghost" size="sm" onClick={() => removeCharge(index)}>
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg border p-6 space-y-2 text-sm">
                            <h3 className="font-semibold mb-4">Summary</h3>
                            {[
                                { label: 'Total Before Discount', value: totalBeforeDiscount },
                                { label: 'Total Item Discount',   value: -totalItemDiscount },
                                { label: 'Total Net Price',       value: totalNetPrice },
                                { label: 'Total VAT',             value: totalVat },
                                { label: 'Total Gross',           value: totalGross },
                                { label: 'Header Discount',       value: -headerDiscount },
                                { label: 'Total Charges',         value: totalCharges },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between">
                                    <span className="text-muted-foreground">{label}</span>
                                    <span className={`font-mono ${value < 0 ? 'text-red-600' : ''}`}>
                                        {value < 0 ? '-' : ''}{formatAmount(Math.abs(value))}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between border-t pt-2 font-semibold text-base">
                                <span>Grand Total</span>
                                <span className="font-mono">{formatAmount(grandTotal)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Remarks</h3>
                        <Textarea value={data.remarks} onChange={(e) => setData('remarks', e.target.value)} placeholder="Optional remarks" rows={3} />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Create Sales Order</Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                    </div>
                </form>
            </div>

            <Dialog open={materialModal.open} onOpenChange={(open) => setMaterialModal({ open, material: null })}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Material Information</DialogTitle></DialogHeader>
                    {materialModal.material && (() => {
                        const m = materialModal.material;
                        return (
                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-3">
                                    <div><p className="text-muted-foreground">Code</p><p className="font-medium">{m.code}</p></div>
                                    <div><p className="text-muted-foreground">SKU</p><p>{m.sku || '-'}</p></div>
                                    <div><p className="text-muted-foreground">Name</p><p className="font-medium">{m.name}</p></div>
                                    <div className="col-span-2"><p className="text-muted-foreground">Description</p><p>{m.description || '-'}</p></div>
                                </div>
                                <div className="border-t pt-3 grid grid-cols-3 gap-3">
                                    <div><p className="text-muted-foreground">Brand</p><p>{m.brand?.name || '-'}</p></div>
                                    <div><p className="text-muted-foreground">Category</p><p>{m.category?.name || '-'}</p></div>
                                    <div><p className="text-muted-foreground">UOM</p><p>{m.uom?.acronym || '-'}</p></div>
                                </div>
                                <div className="border-t pt-3 grid grid-cols-2 gap-3">
                                    <div><p className="text-muted-foreground">Unit Price</p><p className="font-mono">{formatAmount(Number(m.unit_price))}</p></div>
                                    <div><p className="text-muted-foreground">Avg Unit Price</p><p className="font-mono">{formatAmount(Number(m.avg_unit_price))}</p></div>
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
        { title: 'Create', href: '/sales-orders/create' },
    ]}>{page}</AppLayout>
);
