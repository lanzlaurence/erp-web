import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { Permission } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Head } from '@inertiajs/react';

type Props = {
    permissions: Permission[];
};

type GroupedPermissions = {
    [key: string]: Permission[];
};

export default function Create({ permissions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [] as string[],
    });

    const groupedPermissions = permissions.reduce((acc: GroupedPermissions, permission) => {
        const category = permission.name.split('-')[0];
        if (!acc[category]) acc[category] = [];
        acc[category].push(permission);
        return acc;
    }, {});

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/roles');
    };

    const togglePermission = (permissionName: string) => {
        setData(
            'permissions',
            data.permissions.includes(permissionName)
                ? data.permissions.filter((p) => p !== permissionName)
                : [...data.permissions, permissionName],
        );
    };

    const toggleCategory = (category: string) => {
        const categoryPerms = groupedPermissions[category].map((p) => p.name);
        const allSelected = categoryPerms.every((p) => data.permissions.includes(p));
        setData(
            'permissions',
            allSelected
                ? data.permissions.filter((p) => !categoryPerms.includes(p))
                : [...new Set([...data.permissions, ...categoryPerms])],
        );
    };

    return (
        <>
            <Head title="Create Role" />
            <div className="mx-auto max-w-3xl space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Create Role</h1>
                    <p className="text-sm text-muted-foreground">Add a new role with permissions</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Role Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label>Permissions</Label>
                        <div className="space-y-4 rounded-md border p-4">
                            {Object.entries(groupedPermissions).map(([category, perms]) => (
                                <div key={category} className="space-y-2">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <Label className="text-base font-semibold capitalize">
                                            {category}
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleCategory(category)}
                                        >
                                            {perms.every((p) => data.permissions.includes(p.name))
                                                ? 'Deselect All'
                                                : 'Select All'}
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pl-2 md:grid-cols-4">
                                        {perms.map((permission) => (
                                            <div key={permission.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`permission-${permission.id}`}
                                                    checked={data.permissions.includes(permission.name)}
                                                    onCheckedChange={() => togglePermission(permission.name)}
                                                />
                                                <Label
                                                    htmlFor={`permission-${permission.id}`}
                                                    className="text-sm font-normal"
                                                >
                                                    {permission.name.split('-')[1]}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {errors.permissions && <p className="text-sm text-red-600">{errors.permissions}</p>}
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            Create Role
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
            { title: 'Roles', href: '/roles' },
            { title: 'Create', href: '/roles/create' },
        ]}
    >
        {page}
    </AppLayout>
);
