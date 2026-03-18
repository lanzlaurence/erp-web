// js/layouts/app-layout.tsx
import { toast } from '@/lib/toast';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { buildThemeStyle, getTheme, ThemeKey } from '@/lib/themes';
import type { AppLayoutProps, SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { router } from '@inertiajs/react';

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { flash, preferences } = usePage<SharedData>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    // Re-apply theme whenever preferences change
    useEffect(() => {
        const themeKey = (preferences.color_theme ?? 'blue') as ThemeKey;
        const theme = getTheme(themeKey);
        let styleEl = document.getElementById('app-color-theme');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'app-color-theme';
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = buildThemeStyle(theme);
    }, [preferences.color_theme]);

    useEffect(() => {
        const handlePageShow = (e: PageTransitionEvent) => {
            if (e.persisted) {
                router.reload();
            }
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, []);

    return (
        <>
            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppLayoutTemplate>
            <Toaster position="top-right" richColors closeButton />
        </>
    );
};
