import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { Brand, Category, Material, Uom } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import InputAmount from '@/components/ui/input-amount';
import { useFormatters } from '@/hooks/use-formatters';

type Props = {
    material: Material;
    brands: Brand[];
    categories: Category[];
    uoms: Uom[];
};

export default function Edit({ material, brands, categories, uoms }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        code: material.code,
        sku: material.sku || '',
        name: material.name,
        description: material.description || '',
        weight: material.weight?.toString() || '',
        length: material.length?.toString() || '',
        width: material.width?.toString() || '',
        height: material.height?.toString() || '',
        volume: material.volume?.toString() || '',
        min_stock_level: material.min_stock_level.toString(),
        max_stock_level: material.max_stock_level.toString(),
        reorder_level: material.reorder_level.toString(),
        unit_cost: material.unit_cost.toString(),
        unit_price: material.unit_price.toString(),
        avg_unit_cost: material.avg_unit_cost.toString(),
        avg_unit_price: material.avg_unit_price.toString(),
        status: material.status,
        track_serial_number: material.track_serial_number,
        track_batch_number: material.track_batch_number,
        brand_id: material.brand_id?.toString() || '',
        category_id: material.category_id?.toString() || '',
        uom_id: material.uom_id?.toString() || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/materials/${material.id}`);
    };

    const { currency } = useFormatters();

    return (
        <>
            <Head title="Edit Material" />
            <div className="mx-auto max-w-4xl space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Edit Material</h1>
                    <p className="text-sm text-muted-foreground">Update material information</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Code</Label>
                                <Input value={material.code} disabled className="bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input id="sku" value={data.sku} onChange={(e) => setData('sku', e.target.value)} placeholder="Optional" />
                                {errors.sku && <p className="text-sm text-red-600">{errors.sku}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Dimensions */}
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold">Dimensions</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    step="0.01"
                                    value={data.weight}
                                    onChange={(e) => setData('weight', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="length">Length (m)</Label>
                                <Input
                                    id="length"
                                    type="number"
                                    step="0.01"
                                    value={data.length}
                                    onChange={(e) => setData('length', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="width">Width (m)</Label>
                                <Input
                                    id="width"
                                    type="number"
                                    step="0.01"
                                    value={data.width}
                                    onChange={(e) => setData('width', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="height">Height (m)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    step="0.01"
                                    value={data.height}
                                    onChange={(e) => setData('height', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="volume">Volume (m³)</Label>
                                <Input
                                    id="volume"
                                    type="number"
                                    step="0.01"
                                    value={data.volume}
                                    onChange={(e) => setData('volume', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stock Levels */}
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold">Stock Levels</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="min_stock_level">Min Stock Level</Label>
                                <Input
                                    id="min_stock_level"
                                    type="number"
                                    value={data.min_stock_level}
                                    onChange={(e) => setData('min_stock_level', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="max_stock_level">Max Stock Level</Label>
                                <Input
                                    id="max_stock_level"
                                    type="number"
                                    value={data.max_stock_level}
                                    onChange={(e) => setData('max_stock_level', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reorder_level">Reorder Level</Label>
                                <Input
                                    id="reorder_level"
                                    type="number"
                                    value={data.reorder_level}
                                    onChange={(e) => setData('reorder_level', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold">Pricing</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="unit_cost">Unit Cost ({currency.symbol})</Label>
                                <InputAmount
                                    value={data.unit_cost}
                                    onValueChange={(val) => setData('unit_cost', String(val ?? 0))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit_price">Unit Price ({currency.symbol})</Label>
                                <InputAmount
                                    value={data.unit_price}
                                    onValueChange={(val) => setData('unit_price', String(val ?? 0))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Categories & Settings */}
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold">Categories & Settings</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="brand_id">Brand</Label>
                                <Select value={data.brand_id} onValueChange={(value) => setData('brand_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id.toString()}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category_id">Category</Label>
                                <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="uom_id">UOM</Label>
                                <Select value={data.uom_id} onValueChange={(value) => setData('uom_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select UOM" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {uoms.map((uom) => (
                                            <SelectItem key={uom.id} value={uom.id.toString()}>
                                                {uom.acronym}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={data.status} onValueChange={(value: 'active' | 'inactive') => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="track_serial_number"
                                    checked={data.track_serial_number}
                                    onCheckedChange={(checked) => setData('track_serial_number', checked)}
                                />
                                <Label htmlFor="track_serial_number">Track Serial Number</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="track_batch_number"
                                    checked={data.track_batch_number}
                                    onCheckedChange={(checked) => setData('track_batch_number', checked)}
                                />
                                <Label htmlFor="track_batch_number">Track Batch Number</Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            Update Material
                        </Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Materials', href: '/materials' },
            { title: 'Edit', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
