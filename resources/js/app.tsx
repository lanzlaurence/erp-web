import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';

createInertiaApp({
    title: (title) => {
        const appName = (window as any).Laravel?.appName || 'Example App';
        return title ? `${title} - ${appName}` : appName;
    },
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        // Store app name globally for title
        const pageProps = props.initialPage.props as any;
        (window as any).Laravel = {
            ...(window as any).Laravel,
            appName: pageProps.preferences?.app_name || 'Example App',
        };

        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
