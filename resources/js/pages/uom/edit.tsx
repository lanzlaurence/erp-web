import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { Uom } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Head } from '@inertiajs/react';

type Props = {
    uom: Uom;
};

export default function Edit({ uom }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        acronym: uom.acronym,
        description: uom.description || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/uoms/${uom.id}`);
    };

    return (
        <>
            <Head title="Edit UOM" />
            <div className="mx-auto max-w-2xl space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Edit UOM</h1>
                    <p className="text-sm text-muted-foreground">Update unit of measurement</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="acronym">Acronym</Label>
                        <Input
                            id="acronym"
                            value={data.acronym}
                            onChange={(e) => setData('acronym', e.target.value.toUpperCase())}
                            required
                        />
                        {errors.acronym && <p className="text-sm text-red-600">{errors.acronym}</p>}
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
                            Update UOM
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
            { title: 'UOM', href: '/uoms' },
            { title: 'Edit', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
