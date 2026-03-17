import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import InputAmount from '@/components/ui/input-amount';
import InputPercentage from '@/components/ui/input-percentage';
import { useFormatters } from '@/hooks/use-formatters';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        type: 'tax' as 'tax' | 'discount',
        value_type: 'percentage' as 'percentage' | 'fixed',
        value: '0',
        status: 'active' as 'active' | 'inactive',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/charges');
    };

    const { getDecimalPlaces, currency } = useFormatters();

    return (
        <>
            <Head title="Create Charge" />
            <div className="mx-auto max-w-2xl space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Create Charge</h1>
                    <p className="text-sm text-muted-foreground">Add a new tax or discount charge</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold">Charge Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g., VAT 12%, Delivery Charge"
                                required
                            />
                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Brief description of the charge"
                                rows={3}
                            />
                            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select value={data.type} onValueChange={(value: 'tax' | 'discount') => setData('type', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tax">Tax</SelectItem>
                                        <SelectItem value="discount">Discount</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="value_type">Value Type</Label>
                                <Select value={data.value_type} onValueChange={(value: 'percentage' | 'fixed') => setData('value_type', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage</SelectItem>
                                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.value_type && <p className="text-sm text-red-600">{errors.value_type}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="value">
                                    Value {data.value_type === 'percentage' ? '(%)' : `(${currency.symbol})`}
                                </Label>
                                {data.value_type === 'percentage' ? (
                                    <InputPercentage
                                        value={data.value}
                                        onValueChange={(val) => setData('value', String(val ?? 0))}
                                    />
                                ) : (
                                    <InputAmount
                                        value={data.value}
                                        onValueChange={(val) => setData('value', String(val ?? 0))}
                                    />
                                )}
                                {errors.value && <p className="text-sm text-red-600">{errors.value}</p>}
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
                                {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            Create Charge
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

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Charges', href: '/charges' },
            { title: 'Create', href: '/charges/create' },
        ]}
    >
        {page}
    </AppLayout>
);
