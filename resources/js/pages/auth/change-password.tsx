import PasswordRequirements from '@/components/password-requirements';
import { Button } from '@/components/ui/button';
import { InputPassword } from '@/components/ui/input-password';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function ChangePassword() {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/password/change');
    };

    return (
        <AuthLayout
            title="Change your password"
            description="You must change your password before continuing"
        >
            <Head title="Change Password" />
            <form onSubmit={handleSubmit} className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="password">New Password</Label>
                    <InputPassword
                        id="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoFocus
                        placeholder="New password"
                    />
                    <PasswordRequirements password={data.password} />
                    {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                    <InputPassword
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder="Confirm password"
                    />
                    {errors.password_confirmation && <p className="text-sm text-red-600">{errors.password_confirmation}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    Change Password
                </Button>
            </form>
        </AuthLayout>
    );
}
