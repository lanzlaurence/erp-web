export type ThemeKey = 'blue' | 'violet' | 'green' | 'rose' | 'orange' | 'zinc';

export type Theme = {
    key: ThemeKey;
    label: string;
    color: string; // preview swatch color
    light: Record<string, string>;
    dark: Record<string, string>;
};

export const themes: Theme[] = [
    {
        key: 'zinc',
        label: 'Zinc',
        color: '#71717a',
        light: {
            '--primary': 'oklch(0.44 0.02 264)',
            '--primary-foreground': 'oklch(0.985 0 0)',
            '--secondary': 'oklch(0.94 0.01 264)',
            '--secondary-foreground': 'oklch(0.25 0.02 264)',
            '--accent': 'oklch(0.91 0.01 264)',
            '--accent-foreground': 'oklch(0.25 0.02 264)',
            '--ring': 'oklch(0.60 0.02 264)',
            '--sidebar': 'oklch(0.93 0.01 264)',
            '--sidebar-primary': 'oklch(0.44 0.02 264)',
            '--sidebar-primary-foreground': 'oklch(0.985 0 0)',
            '--sidebar-accent': 'oklch(0.88 0.01 264)',
            '--sidebar-ring': 'oklch(0.60 0.02 264)',
        },
        dark: {
            '--primary': 'oklch(0.71 0.02 264)',
            '--primary-foreground': 'oklch(0.13 0.02 264)',
            '--secondary': 'oklch(0.24 0.02 264)',
            '--secondary-foreground': 'oklch(0.93 0.01 264)',
            '--accent': 'oklch(0.26 0.02 264)',
            '--accent-foreground': 'oklch(0.93 0.01 264)',
            '--ring': 'oklch(0.52 0.02 264)',
            '--sidebar': 'oklch(0.18 0.02 264)',
            '--sidebar-primary': 'oklch(0.71 0.02 264)',
            '--sidebar-primary-foreground': 'oklch(0.93 0.01 264)',
            '--sidebar-accent': 'oklch(0.24 0.02 264)',
            '--sidebar-ring': 'oklch(0.52 0.02 264)',
        },
    },
    {
        key: 'blue',
        label: 'Blue',
        color: '#3b82f6',
        light: {
            '--primary': 'oklch(0.45 0.18 250)',
            '--primary-foreground': 'oklch(0.98 0.005 240)',
            '--secondary': 'oklch(0.93 0.03 240)',
            '--secondary-foreground': 'oklch(0.25 0.08 250)',
            '--accent': 'oklch(0.90 0.05 240)',
            '--accent-foreground': 'oklch(0.25 0.08 250)',
            '--ring': 'oklch(0.60 0.12 250)',
            '--sidebar': 'oklch(0.94 0.03 240)',
            '--sidebar-primary': 'oklch(0.45 0.18 250)',
            '--sidebar-primary-foreground': 'oklch(0.98 0.005 240)',
            '--sidebar-accent': 'oklch(0.88 0.05 240)',
            '--sidebar-ring': 'oklch(0.60 0.12 250)',
        },
        dark: {
            '--primary': 'oklch(0.60 0.18 250)',
            '--primary-foreground': 'oklch(0.13 0.03 250)',
            '--secondary': 'oklch(0.23 0.06 250)',
            '--secondary-foreground': 'oklch(0.93 0.02 240)',
            '--accent': 'oklch(0.25 0.07 250)',
            '--accent-foreground': 'oklch(0.93 0.02 240)',
            '--ring': 'oklch(0.50 0.14 250)',
            '--sidebar': 'oklch(0.17 0.05 250)',
            '--sidebar-primary': 'oklch(0.60 0.18 250)',
            '--sidebar-primary-foreground': 'oklch(0.93 0.02 240)',
            '--sidebar-accent': 'oklch(0.23 0.07 250)',
            '--sidebar-ring': 'oklch(0.50 0.14 250)',
        },
    },
    {
        key: 'violet',
        label: 'Violet',
        color: '#8b5cf6',
        light: {
            '--primary': 'oklch(0.48 0.22 290)',
            '--primary-foreground': 'oklch(0.98 0.005 290)',
            '--secondary': 'oklch(0.93 0.03 290)',
            '--secondary-foreground': 'oklch(0.25 0.08 290)',
            '--accent': 'oklch(0.90 0.05 290)',
            '--accent-foreground': 'oklch(0.25 0.08 290)',
            '--ring': 'oklch(0.60 0.15 290)',
            '--sidebar': 'oklch(0.94 0.03 290)',
            '--sidebar-primary': 'oklch(0.48 0.22 290)',
            '--sidebar-primary-foreground': 'oklch(0.98 0.005 290)',
            '--sidebar-accent': 'oklch(0.88 0.06 290)',
            '--sidebar-ring': 'oklch(0.60 0.15 290)',
        },
        dark: {
            '--primary': 'oklch(0.63 0.22 290)',
            '--primary-foreground': 'oklch(0.13 0.03 290)',
            '--secondary': 'oklch(0.23 0.06 290)',
            '--secondary-foreground': 'oklch(0.93 0.02 290)',
            '--accent': 'oklch(0.25 0.08 290)',
            '--accent-foreground': 'oklch(0.93 0.02 290)',
            '--ring': 'oklch(0.50 0.15 290)',
            '--sidebar': 'oklch(0.17 0.05 290)',
            '--sidebar-primary': 'oklch(0.63 0.22 290)',
            '--sidebar-primary-foreground': 'oklch(0.93 0.02 290)',
            '--sidebar-accent': 'oklch(0.23 0.07 290)',
            '--sidebar-ring': 'oklch(0.50 0.15 290)',
        },
    },
    {
        key: 'green',
        label: 'Green',
        color: '#22c55e',
        light: {
            '--primary': 'oklch(0.50 0.17 155)',
            '--primary-foreground': 'oklch(0.98 0.005 155)',
            '--secondary': 'oklch(0.93 0.03 155)',
            '--secondary-foreground': 'oklch(0.25 0.08 155)',
            '--accent': 'oklch(0.90 0.05 155)',
            '--accent-foreground': 'oklch(0.25 0.08 155)',
            '--ring': 'oklch(0.60 0.12 155)',
            '--sidebar': 'oklch(0.94 0.03 155)',
            '--sidebar-primary': 'oklch(0.50 0.17 155)',
            '--sidebar-primary-foreground': 'oklch(0.98 0.005 155)',
            '--sidebar-accent': 'oklch(0.88 0.05 155)',
            '--sidebar-ring': 'oklch(0.60 0.12 155)',
        },
        dark: {
            '--primary': 'oklch(0.62 0.17 155)',
            '--primary-foreground': 'oklch(0.13 0.03 155)',
            '--secondary': 'oklch(0.23 0.06 155)',
            '--secondary-foreground': 'oklch(0.93 0.02 155)',
            '--accent': 'oklch(0.25 0.07 155)',
            '--accent-foreground': 'oklch(0.93 0.02 155)',
            '--ring': 'oklch(0.50 0.12 155)',
            '--sidebar': 'oklch(0.17 0.05 155)',
            '--sidebar-primary': 'oklch(0.62 0.17 155)',
            '--sidebar-primary-foreground': 'oklch(0.93 0.02 155)',
            '--sidebar-accent': 'oklch(0.23 0.07 155)',
            '--sidebar-ring': 'oklch(0.50 0.12 155)',
        },
    },
    {
        key: 'rose',
        label: 'Rose',
        color: '#f43f5e',
        light: {
            '--primary': 'oklch(0.52 0.22 15)',
            '--primary-foreground': 'oklch(0.98 0.005 15)',
            '--secondary': 'oklch(0.93 0.03 15)',
            '--secondary-foreground': 'oklch(0.25 0.08 15)',
            '--accent': 'oklch(0.90 0.05 15)',
            '--accent-foreground': 'oklch(0.25 0.08 15)',
            '--ring': 'oklch(0.60 0.15 15)',
            '--sidebar': 'oklch(0.94 0.03 15)',
            '--sidebar-primary': 'oklch(0.52 0.22 15)',
            '--sidebar-primary-foreground': 'oklch(0.98 0.005 15)',
            '--sidebar-accent': 'oklch(0.88 0.06 15)',
            '--sidebar-ring': 'oklch(0.60 0.15 15)',
        },
        dark: {
            '--primary': 'oklch(0.64 0.22 15)',
            '--primary-foreground': 'oklch(0.13 0.03 15)',
            '--secondary': 'oklch(0.23 0.06 15)',
            '--secondary-foreground': 'oklch(0.93 0.02 15)',
            '--accent': 'oklch(0.25 0.07 15)',
            '--accent-foreground': 'oklch(0.93 0.02 15)',
            '--ring': 'oklch(0.50 0.15 15)',
            '--sidebar': 'oklch(0.17 0.05 15)',
            '--sidebar-primary': 'oklch(0.64 0.22 15)',
            '--sidebar-primary-foreground': 'oklch(0.93 0.02 15)',
            '--sidebar-accent': 'oklch(0.23 0.07 15)',
            '--sidebar-ring': 'oklch(0.50 0.15 15)',
        },
    },
    {
        key: 'orange',
        label: 'Orange',
        color: '#f97316',
        light: {
            '--primary': 'oklch(0.60 0.20 50)',
            '--primary-foreground': 'oklch(0.98 0.005 50)',
            '--secondary': 'oklch(0.93 0.03 50)',
            '--secondary-foreground': 'oklch(0.25 0.08 50)',
            '--accent': 'oklch(0.90 0.05 50)',
            '--accent-foreground': 'oklch(0.25 0.08 50)',
            '--ring': 'oklch(0.65 0.15 50)',
            '--sidebar': 'oklch(0.94 0.03 50)',
            '--sidebar-primary': 'oklch(0.60 0.20 50)',
            '--sidebar-primary-foreground': 'oklch(0.98 0.005 50)',
            '--sidebar-accent': 'oklch(0.88 0.06 50)',
            '--sidebar-ring': 'oklch(0.65 0.15 50)',
        },
        dark: {
            '--primary': 'oklch(0.70 0.20 50)',
            '--primary-foreground': 'oklch(0.13 0.03 50)',
            '--secondary': 'oklch(0.23 0.06 50)',
            '--secondary-foreground': 'oklch(0.93 0.02 50)',
            '--accent': 'oklch(0.25 0.07 50)',
            '--accent-foreground': 'oklch(0.93 0.02 50)',
            '--ring': 'oklch(0.55 0.15 50)',
            '--sidebar': 'oklch(0.17 0.05 50)',
            '--sidebar-primary': 'oklch(0.70 0.20 50)',
            '--sidebar-primary-foreground': 'oklch(0.93 0.02 50)',
            '--sidebar-accent': 'oklch(0.23 0.07 50)',
            '--sidebar-ring': 'oklch(0.55 0.15 50)',
        },
    },
];

export function getTheme(key: ThemeKey): Theme {
    return themes.find((t) => t.key === key) ?? themes[0];
}

export function buildThemeStyle(theme: Theme): string {
    const lightVars = Object.entries(theme.light)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n');
    const darkVars = Object.entries(theme.dark)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n');

    return `:root {\n${lightVars}\n}\n.dark {\n${darkVars}\n}`;
}
