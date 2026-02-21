import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { Location } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Head } from '@inertiajs/react';

type Props = {
    location: Location;
};

export default function Edit({ location }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        code: location.code,
        name: location.name,
        description: location.description || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/locations/${location.id}`);
    };

    return (
        <>
            <Head title="Edit Location" />
            <div className="mx-auto max-w-2xl space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Edit Location</h1>
                    <p className="text-sm text-muted-foreground">Update location information</p>
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
                            Update Location
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
            { title: 'Locations', href: '/locations' },
            { title: 'Edit', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
