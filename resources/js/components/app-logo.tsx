// resources/js/components/app-logo.tsx
import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { preferences } = usePage<SharedData>().props;

    return (
        <>
            <div className="flex size-8 items-center justify-center overflow-hidden rounded-md">
                <AppLogoIcon
                    src={preferences.app_logo}
                    className="size-8 object-contain"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate font-semibold leading-tight">
                    {preferences.app_name}
                </span>
            </div>
        </>
    );
}
