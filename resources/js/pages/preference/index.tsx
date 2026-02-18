import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { themes, ThemeKey } from '@/lib/themes';
import AppLayout from '@/layouts/app-layout';
import { router, useForm } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { FormEvent, useState } from 'react';
import Select from 'react-select';
import { CURRENCY_OPTIONS } from '@/lib/currencies';

// Common timezones list
const TIMEZONE_OPTIONS = Intl.supportedValuesOf('timeZone').map((tz) => ({
    value: tz,
    label: tz.replace(/_/g, ' '),
}));

type Props = {
    formData: {
        app_name: string;
        app_logo_url: string;
        decimal_places: string;
        color_theme: string;
        timezone: string;
        currency: string;
    };
};

export default function Index({ formData }: Props) {
    const [preview, setPreview] = useState<string | null>(null);
    const { data, setData, post, processing, errors } = useForm({
        app_name: formData.app_name,
        app_logo: null as File | null,
        decimal_places: formData.decimal_places,
        color_theme: formData.color_theme as ThemeKey,
        timezone: formData.timezone,
        currency: formData.currency,
        _method: 'POST',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/preferences', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setPreview(null);
                router.reload();
            },
        });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('app_logo', file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6 p-4">
            <div>
                <h1 className="text-2xl font-semibold">Preferences</h1>
                <p className="text-sm text-muted-foreground">Manage application preferences</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* App Name */}
                <div className="space-y-2">
                    <Label htmlFor="app_name">Application Name</Label>
                    <Input
                        id="app_name"
                        value={data.app_name}
                        onChange={(e) => setData('app_name', e.target.value)}
                        required
                    />
                    {errors.app_name && <p className="text-sm text-red-600">{errors.app_name}</p>}
                </div>

                {/* Logo */}
                <div className="space-y-2">
                    <Label htmlFor="app_logo">Application Logo</Label>
                    <div className="flex items-center gap-4">
                        <img
                            src={preview || formData.app_logo_url}
                            alt="Logo"
                            className="h-16 w-16 rounded-md border object-contain"
                        />
                        <Input
                            id="app_logo"
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                            onChange={handleLogoChange}
                        />
                    </div>
                    {errors.app_logo && <p className="text-sm text-red-600">{errors.app_logo}</p>}
                    <p className="text-xs text-muted-foreground">
                        Supported formats: PNG, JPG, JPEG, SVG (max 5MB)
                    </p>
                </div>

                {/* Decimal Places */}
                <div className="space-y-2">
                    <Label htmlFor="decimal_places">Decimal Places (0–6)</Label>
                    <Input
                        id="decimal_places"
                        type="number"
                        min="0"
                        max="6"
                        value={data.decimal_places}
                        onChange={(e) => setData('decimal_places', e.target.value)}
                        required
                    />
                    {errors.decimal_places && (
                        <p className="text-sm text-red-600">{errors.decimal_places}</p>
                    )}
                </div>

                {/* Currency */}
                <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                        options={CURRENCY_OPTIONS}
                        value={CURRENCY_OPTIONS.find((o) => o.value === data.currency) ?? null}
                        onChange={(option) => setData('currency', option?.value ?? 'PHP')}
                        placeholder="Select currency..."
                        isSearchable
                        classNames={{
                            control: () =>
                                'border border-input bg-background text-sm rounded-md px-1 py-0.5 min-h-9',
                            menu: () =>
                                'bg-popover border border-border rounded-md shadow-md text-sm mt-1',
                            option: ({ isFocused, isSelected }) =>
                                `px-3 py-2 cursor-pointer ${
                                    isSelected
                                        ? 'bg-primary text-primary-foreground'
                                        : isFocused
                                        ? 'bg-accent text-accent-foreground'
                                        : ''
                                }`,
                            singleValue: () => 'text-foreground',
                            input: () => 'text-foreground',
                            placeholder: () => 'text-muted-foreground',
                        }}
                        unstyled
                    />
                    {errors.currency && <p className="text-sm text-red-600">{errors.currency}</p>}
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                        options={TIMEZONE_OPTIONS}
                        value={TIMEZONE_OPTIONS.find((o) => o.value === data.timezone) ?? null}
                        onChange={(option) => setData('timezone', option?.value ?? 'UTC')}
                        placeholder="Select timezone..."
                        isSearchable
                        classNames={{
                            control: () =>
                                'border border-input bg-background text-sm rounded-md px-1 py-0.5 min-h-9',
                            menu: () =>
                                'bg-popover border border-border rounded-md shadow-md text-sm mt-1',
                            option: ({ isFocused, isSelected }) =>
                                `px-3 py-2 cursor-pointer ${
                                    isSelected
                                        ? 'bg-primary text-primary-foreground'
                                        : isFocused
                                          ? 'bg-accent text-accent-foreground'
                                          : ''
                                }`,
                            singleValue: () => 'text-foreground',
                            input: () => 'text-foreground',
                            placeholder: () => 'text-muted-foreground',
                        }}
                        unstyled
                    />
                    {errors.timezone && (
                        <p className="text-sm text-red-600">{errors.timezone}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Used for displaying dates and times throughout the app
                    </p>
                </div>

                {/* Color Theme */}
                <div className="space-y-2">
                    <Label>Color Theme</Label>
                    <div className="flex gap-3">
                        {themes.map((theme) => (
                            <button
                                key={theme.key}
                                type="button"
                                onClick={() => setData('color_theme', theme.key)}
                                className="group flex flex-col items-center gap-1.5"
                                title={theme.label}
                            >
                                <span
                                    className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all"
                                    style={{
                                        backgroundColor: theme.color,
                                        borderColor:
                                            data.color_theme === theme.key
                                                ? theme.color
                                                : 'transparent',
                                        boxShadow:
                                            data.color_theme === theme.key
                                                ? `0 0 0 3px ${theme.color}40`
                                                : 'none',
                                    }}
                                >
                                    {data.color_theme === theme.key && (
                                        <Check className="h-4 w-4 text-white" strokeWidth={3} />
                                    )}
                                </span>
                                <span className="text-xs text-muted-foreground">{theme.label}</span>
                            </button>
                        ))}
                    </div>
                    {errors.color_theme && (
                        <p className="text-sm text-red-600">{errors.color_theme}</p>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button type="submit" disabled={processing}>
                        Save Preferences
                    </Button>
                </div>
            </form>
        </div>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Preferences', href: '/preferences' },
        ]}
    >
        {page}
    </AppLayout>
);
