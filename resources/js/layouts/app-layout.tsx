import { toast } from '@/lib/toast';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps, SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Toaster } from 'sonner';

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    return (
        <>
            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppLayoutTemplate>
            <Toaster position="top-right" richColors />
        </>
    );
};
