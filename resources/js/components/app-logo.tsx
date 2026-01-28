// resources/js/components/app-logo.tsx
import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { preferences } = usePage<SharedData>().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon
                    src={preferences.app_logo}
                    className="size-5 fill-current text-white dark:text-black"
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
