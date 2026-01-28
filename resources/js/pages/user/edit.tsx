import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import type { Role, User } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type Props = {
    user: User & { roles: Role[] };
    roles: Role[];
};

export default function Edit({ user, roles }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        is_active: user.is_active,
        roles: user.roles?.map((r) => r.name) || [],
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/users/${user.id}`);
    };

    const toggleRole = (roleName: string) => {
        setData(
            'roles',
            data.roles.includes(roleName)
                ? data.roles.filter((r) => r !== roleName)
                : [...data.roles, roleName],
        );
    };

    const toggleAllRoles = () => {
        setData('roles', data.roles.length === roles.length ? [] : roles.map((r) => r.name));
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6 p-4">
            <div>
                <h1 className="text-2xl font-semibold">Edit User</h1>
                <p className="text-sm text-muted-foreground">Update user information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password (leave blank to keep current)</Label>
                    <Input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="is_active"
                        checked={data.is_active}
                        onCheckedChange={(checked) => setData('is_active', checked)}
                    />
                    <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Roles</Label>
                        <Button type="button" variant="outline" size="sm" onClick={toggleAllRoles}>
                            {data.roles.length === roles.length ? 'Deselect All' : 'Select All'}
                        </Button>
                    </div>
                    <div className="space-y-2 rounded-md border p-3">
                        {roles.map((role) => (
                            <div key={role.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`role-${role.id}`}
                                    checked={data.roles.includes(role.name)}
                                    onCheckedChange={() => toggleRole(role.name)}
                                />
                                <Label htmlFor={`role-${role.id}`} className="font-normal">
                                    {role.name}
                                </Label>
                            </div>
                        ))}
                    </div>
                    {errors.roles && <p className="text-sm text-red-600">{errors.roles}</p>}
                </div>

                <div className="flex gap-2">
                    <Button type="submit" disabled={processing}>
                        Update User
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
            { title: 'Users', href: '/users' },
            { title: 'Edit', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
