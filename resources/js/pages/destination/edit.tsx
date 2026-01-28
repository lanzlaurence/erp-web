import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { Destination } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type Props = {
    destination: Destination;
};

export default function Edit({ destination }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        code: destination.code,
        name: destination.name,
        description: destination.description || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/destinations/${destination.id}`);
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6 p-4">
            <div>
                <h1 className="text-2xl font-semibold">Edit Destination</h1>
                <p className="text-sm text-muted-foreground">Update destination information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                        id="code"
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                        required
                    />
                    {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
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
                        rows={4}
                    />
                    {errors.description && (
                        <p className="text-sm text-red-600">{errors.description}</p>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button type="submit" disabled={processing}>
                        Update Destination
                    </Button>
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Destinations', href: '/destinations' },
            { title: 'Edit', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
