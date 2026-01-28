import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        description: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/destinations');
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6 p-4">
            <div>
                <h1 className="text-2xl font-semibold">Create Destination</h1>
                <p className="text-sm text-muted-foreground">Add a new destination</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                        id="code"
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                        placeholder="e.g., WH-MNL"
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
                        Create Destination
                    </Button>
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Destinations', href: '/destinations' },
            { title: 'Create', href: '/destinations/create' },
        ]}
    >
        {page}
    </AppLayout>
);
