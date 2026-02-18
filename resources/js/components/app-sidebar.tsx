// resources/js/components/app-sidebar.tsx
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Box,
    Folder,
    LayoutGrid,
    MapPin,
    PackageOpen,
    Shield,
    SlidersHorizontal,
    Tag,
    Users,
    Building2,
    UserCircle,
    Package,
    CreditCard,
    Settings2,
    Cog
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Master',
        href: '#',
        icon: Package,
        items: [
            {
                title: 'Materials',
                href: '/materials',
                icon: PackageOpen,
                permission: 'material-view',
            },
            {
                title: 'Vendors',
                href: '/vendors',
                icon: Building2,
                permission: 'vendor-view',
            },
            {
                title: 'Customers',
                href: '/customers',
                icon: UserCircle,
                permission: 'customer-view',
            },
        ],
    },
    {
        title: 'Configuration',
        href: '#',
        icon: Cog,
        items: [
            {
                title: 'Brands',
                href: '/brands',
                icon: Tag,
                permission: 'brand-view',
            },
            {
                title: 'Categories',
                href: '/categories',
                icon: Folder,
                permission: 'category-view',
            },
            {
                title: 'UOM',
                href: '/uoms',
                icon: Box,
                permission: 'uom-view',
            },
            {
                title: 'Destinations',
                href: '/destinations',
                icon: MapPin,
                permission: 'destination-view',
            },
            {
                title: 'Charges',
                href: '/charges',
                icon: CreditCard,
                permission: 'charge-view',
            },
        ],
    },
    {
        title: 'System',
        href: '#',
        icon: Settings2,
        items: [
            {
                title: 'Users',
                href: '/users',
                icon: Users,
                permission: 'user-view',
            },
            {
                title: 'Roles',
                href: '/roles',
                icon: Shield,
                permission: 'role-view',
            },
            {
                title: 'Preferences',
                href: '/preferences',
                icon: SlidersHorizontal,
                permission: 'preference-view',
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    {
        title: 'Documentation',
        href: '/dashboard',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { hasPermission } = usePermissions();

    const filterNavItems = (items: NavItem[]): NavItem[] => {
        return items
            .map((item) => {
                if (item.items) {
                    const filteredItems = filterNavItems(item.items);
                    return filteredItems.length > 0
                        ? { ...item, items: filteredItems }
                        : null;
                }
                return !item.permission || hasPermission(item.permission) ? item : null;
            })
            .filter((item): item is NavItem => item !== null);
    };

    const filteredMainNavItems = filterNavItems(mainNavItems);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredMainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
