import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { Location, Material, Inventory } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import ReactSelect from 'react-select';
import InputAmount from '@/components/ui/input-amount';
import DatePicker from '@/components/ui/date-picker';
import { useFormatters } from '@/hooks/use-formatters';

type Props = {
    materials: Material[];
    locations: Location[];
    inventories: Inventory[];
};

type ActionType = 'initial' | 'adjust' | 'transfer';

const actionOptions = [
    { value: 'initial',  label: 'Initial Stock — Add new material stock to a location' },
    { value: 'adjust',   label: 'Stock Adjustment — Correct quantity of existing stock' },
    { value: 'transfer', label: 'Stock Transfer — Move stock to another location' },
];

export default function ManualAdjustment({ materials, locations, inventories }: Props) {
    const { formatDecimal } = useFormatters();

    const { data, setData, post, processing, errors, reset } = useForm({
        action:               '' as ActionType | '',
        transaction_date:     new Date().toISOString().split('T')[0],
        location_id:          '',
        transfer_location_id: '',
        material_id:          '',
        inventory_id:         '',
        quantity:             '0',
        remarks:              '',
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

    const materialOptions  = materials.map((m) => ({ value: String(m.id), label: `${m.code} — ${m.name}` }));
    const locationOptions  = locations.map((l) => ({ value: String(l.id), label: `${l.code} — ${l.name}` }));

    // Inventories filtered by selected location (for adjust/transfer)
    const inventoryOptions = inventories
        .filter((i) => data.location_id ? String(i.location_id) === data.location_id : true)
        .map((i) => ({ value: String(i.id), label: `${i.material?.name} (${i.material?.code}) — Qty: ${formatDecimal(Number(i.quantity))}` }));

    // Transfer-to locations exclude current location
    const transferLocationOptions = locations
        .filter((l) => String(l.id) !== data.location_id)
        .map((l) => ({ value: String(l.id), label: `${l.code} — ${l.name}` }));

    // Selected inventory record
    const selectedInventory = inventories.find((i) => String(i.id) === data.inventory_id);

    const handleActionChange = (val: ActionType) => {
        setData({
            action: val,
            transaction_date: data.transaction_date,
            location_id: '',
            transfer_location_id: '',
            material_id: '',
            inventory_id: '',
            quantity: '0',
            remarks: data.remarks,
        });
    };

    const handleLocationChange = (val: string) => {
        setData('location_id', val);
        setData('inventory_id', '');
        setData('quantity', '0');
    };

    const handleInventoryChange = (val: string) => {
        setData('inventory_id', val);
        const inv = inventories.find((i) => String(i.id) === val);
        if (inv && data.action === 'adjust') {
            setData('quantity', String(inv.quantity));
        } else {
            setData('quantity', '0');
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/inventories/manual-adjustment');
    };

    const isInitial  = data.action === 'initial';
    const isAdjust   = data.action === 'adjust';
    const isTransfer = data.action === 'transfer';
    const hasAction  = isInitial || isAdjust || isTransfer;

    return (
        <>
            <Head title="Manual Adjustment" />
            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Manual Adjustment</h1>
                    <p className="text-sm text-muted-foreground">Add, adjust, or transfer inventory stock</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Card 1 — Action + Date + Location */}
                    <div className="space-y-4 rounded-lg border p-6">
                        <h3 className="font-semibold">Transaction Information</h3>
                        <div className={`grid gap-4 ${isTransfer ? 'grid-cols-4' : 'grid-cols-3'}`}>
                            <div className="space-y-2">
                                <Label>Action</Label>
                                <ReactSelect
                                    options={actionOptions}
                                    value={actionOptions.find((o) => o.value === data.action) ?? null}
                                    onChange={(opt) => handleActionChange(opt?.value as ActionType)}
                                    placeholder="Select action..."
                                    classNames={selectClass}
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                    unstyled
                                />
                                {errors.action && <p className="text-sm text-red-600">{errors.action}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Transaction Date</Label>
                                <DatePicker
                                    value={data.transaction_date}
                                    onValueChange={(val) => setData('transaction_date', val)}
                                    placeholder="Select date"
                                />
                                {errors.transaction_date && <p className="text-sm text-red-600">{errors.transaction_date}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Location</Label>
                                {isAdjust || isTransfer ? (
                                    // For adjust/transfer: select existing inventory location
                                    <ReactSelect
                                        options={locationOptions}
                                        value={locationOptions.find((o) => o.value === data.location_id) ?? null}
                                        onChange={(opt) => handleLocationChange(opt?.value ?? '')}
                                        placeholder="Select location..."
                                        classNames={selectClass}
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                        unstyled
                                        isDisabled={!hasAction}
                                    />
                                ) : (
                                    // For initial: select any location
                                    <ReactSelect
                                        options={locationOptions}
                                        value={locationOptions.find((o) => o.value === data.location_id) ?? null}
                                        onChange={(opt) => setData('location_id', opt?.value ?? '')}
                                        placeholder="Select location..."
                                        classNames={selectClass}
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                        unstyled
                                        isDisabled={!hasAction}
                                    />
                                )}
                                {errors.location_id && <p className="text-sm text-red-600">{errors.location_id}</p>}
                            </div>

                            {/* Transfer-to location — only for transfer */}
                            {isTransfer && (
                                <div className="space-y-2">
                                    <Label>Transfer To</Label>
                                    <ReactSelect
                                        options={transferLocationOptions}
                                        value={transferLocationOptions.find((o) => o.value === data.transfer_location_id) ?? null}
                                        onChange={(opt) => setData('transfer_location_id', opt?.value ?? '')}
                                        placeholder="Select destination..."
                                        classNames={selectClass}
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                        unstyled
                                    />
                                    {errors.transfer_location_id && <p className="text-sm text-red-600">{errors.transfer_location_id}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card 2 — Material + Quantity */}
                    {hasAction && (
                        <div className="space-y-4 rounded-lg border p-6">
                            <h3 className="font-semibold">
                                {isInitial ? 'Stock Details' : isAdjust ? 'Adjustment Details' : 'Transfer Details'}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Material */}
                                <div className="space-y-2">
                                    <Label>Material</Label>
                                    {isInitial ? (
                                        <ReactSelect
                                            options={materialOptions}
                                            value={materialOptions.find((o) => o.value === data.material_id) ?? null}
                                            onChange={(opt) => setData('material_id', opt?.value ?? '')}
                                            placeholder="Select material..."
                                            classNames={selectClass}
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                            unstyled
                                        />
                                    ) : (
                                        // For adjust/transfer: pick from inventories at selected location
                                        <>
                                            <ReactSelect
                                                options={inventoryOptions}
                                                value={inventoryOptions.find((o) => o.value === data.inventory_id) ?? null}
                                                onChange={(opt) => handleInventoryChange(opt?.value ?? '')}
                                                placeholder={data.location_id ? 'Select material...' : 'Select location first...'}
                                                classNames={selectClass}
                                                menuPortalTarget={document.body}
                                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                unstyled
                                                isDisabled={!data.location_id}
                                            />
                                            {selectedInventory && (
                                                <p className="text-xs text-muted-foreground">
                                                    Current qty: <span className="font-mono">{formatDecimal(Number(selectedInventory.quantity))}</span>
                                                    {isTransfer && (
                                                        <span> — max transfer: <span className="font-mono">{formatDecimal(Number(selectedInventory.quantity))}</span></span>
                                                    )}
                                                </p>
                                            )}
                                        </>
                                    )}
                                    {errors.material_id && <p className="text-sm text-red-600">{errors.material_id}</p>}
                                    {errors.inventory_id && <p className="text-sm text-red-600">{errors.inventory_id}</p>}
                                </div>

                                {/* Quantity */}
                                <div className="space-y-2">
                                    <Label>
                                        {isInitial ? 'Initial Quantity' : isAdjust ? 'New Quantity' : 'Quantity to Transfer'}
                                    </Label>
                                    <InputAmount
                                        value={data.quantity}
                                        max={isTransfer && selectedInventory ? Number(selectedInventory.quantity) : undefined}
                                        onValueChange={(val) => setData('quantity', String(val ?? 0))}
                                        disabled={
                                            (isAdjust && !data.inventory_id) ||
                                            (isTransfer && !data.inventory_id)
                                        }
                                    />
                                    {errors.quantity && <p className="text-sm text-red-600">{errors.quantity}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Card 3 — Remarks */}
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
                        <Button type="submit" disabled={processing || !hasAction}>
                            {isInitial ? 'Add Stock' : isAdjust ? 'Save Adjustment' : isTransfer ? 'Transfer Stock' : 'Submit'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                    </div>
                </form>
            </div>
        </>
    );
}

ManualAdjustment.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manual Adjustment', href: '/inventories/manual-adjustment' },
    ]}>{page}</AppLayout>
);
