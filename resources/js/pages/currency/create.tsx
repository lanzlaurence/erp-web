import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        symbol: '',
        exchange_rate: '1.000000',
        is_active: true,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/currencies');
    };

    return (
        <>
            <Head title="Create Currency" />
            <div className="mx-auto max-w-xl space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Create Currency</h1>
                    <p className="text-sm text-muted-foreground">Add a new currency</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold">Currency Information</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Code</Label>
                                <Input id="code" value={data.code}
                                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                    placeholder="e.g., USD" maxLength={10} required />
                                {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="symbol">Symbol</Label>
                                <Input id="symbol" value={data.symbol}
                                    onChange={(e) => setData('symbol', e.target.value)}
                                    placeholder="e.g., $" maxLength={10} required />
                                {errors.symbol && <p className="text-sm text-red-600">{errors.symbol}</p>}
                            </div>

                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="exchange_rate">Exchange Rate</Label>
                                <Input
                                    id="exchange_rate"
                                    type="number"
                                    step="0.000001"
                                    min="0.000001"
                                    value={data.exchange_rate}
                                    onChange={(e) => setData('exchange_rate', e.target.value)}
                                    placeholder="e.g., 1.000000"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Rate relative to your base currency</p>
                                {errors.exchange_rate && <p className="text-sm text-red-600">{errors.exchange_rate}</p>}
                            </div>

                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., US Dollar" required />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div className="col-span-2 flex items-center space-x-2">
                                <Switch id="is_active" checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)} />
                                <Label htmlFor="is_active">Active</Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Create Currency</Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Currencies', href: '/currencies' },
        { title: 'Create', href: '/currencies/create' },
    ]}>{page}</AppLayout>
);
