// resources/js/components/app-sidebar.tsx
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { SystemUpdatesModal } from '@/components/system-updates-modal';
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
import type { NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Box,
    Folder,
    GitBranch,
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
    Cog,
    ShoppingCart,
    TrendingUp,
    Warehouse,
    ShoppingBag,
    Coins,
    Activity as ActivityIcon,
    ClipboardList,
    BarChart2,
    PackageSearch,
    PackageCheck,
    Truck,
    FileText,
} from 'lucide-react';
import { useState } from 'react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { hasPermission } = usePermissions();
    const [showUpdates, setShowUpdates] = useState(false);

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Analytics',
            href: '#',
            icon: BarChart2,
            items: [
                { title: 'Purchase Order Report', href: '/reports/purchase-orders',  icon: ShoppingCart,  permission: 'po-view' },
            ],
        },
        {
            title: 'Transaction',
            href: '#',
            icon: TrendingUp,
            isActive: true,
            // badge: 1,
            items: [
                {
                    title: 'Purchase Orders',
                    href: '/purchase-orders',
                    icon: ShoppingCart,
                    permission: 'po-view',
                    // badge: 9
                },
                { title: 'Goods Receipts', href: '/goods-receipts', icon: PackageCheck, permission: 'gr-view' },
                { title: 'Sales Orders', href: '#', icon: ShoppingBag },
                { title: 'Goods Issues', href: '#', icon: Truck},
                { title: 'Inventory', href: '/inventories', icon: Warehouse, permission: 'inventory-view' },
            ],
        },
        {
            title: 'Activity',
            href: '#',
            icon: ActivityIcon,
            items: [
                { title: 'Transaction Log',  href: '/activity/transaction-log',  icon: FileText,      permission: 'transaction-log-view' },
                { title: 'Inventory Log',    href: '/activity/inventory-log',    icon: ClipboardList, permission: 'inventory-log-view' },
            ],
        },
        {
            title: 'Master',
            href: '#',
            icon: Package,
            items: [
                { title: 'Materials', href: '/materials', icon: PackageOpen, permission: 'material-view' },
                { title: 'Vendors', href: '/vendors', icon: Building2, permission: 'vendor-view' },
                { title: 'Customers', href: '/customers', icon: UserCircle, permission: 'customer-view' },
            ],
        },
        {
            title: 'Configuration',
            href: '#',
            icon: Cog,
            items: [
                { title: 'Brands', href: '/brands', icon: Tag, permission: 'brand-view' },
                { title: 'Categories', href: '/categories', icon: Folder, permission: 'category-view' },
                { title: 'UOM', href: '/uoms', icon: Box, permission: 'uom-view' },
                { title: 'Locations', href: '/locations', icon: MapPin, permission: 'location-view' },
                { title: 'Charges', href: '/charges', icon: CreditCard, permission: 'charge-view' },
                // { title: 'Currencies', href: '/currencies', icon: Coins, permission: 'currency-view' },
            ],
        },
        {
            title: 'System',
            href: '#',
            icon: Settings2,
            items: [
                { title: 'Users', href: '/users', icon: Users, permission: 'user-view' },
                { title: 'Roles', href: '/roles', icon: Shield, permission: 'role-view' },
                { title: 'Preferences', href: '/preferences', icon: SlidersHorizontal,permission: 'preference-view' },
            ],
        },
    ];

    const footerNavItems: NavItem[] = [
        // {
        //     title: 'Documentation',
        //     href: '#',
        //     icon: BookOpen,
        // },
        // {
        //     title: 'System Updates',
        //     href: '#',
        //     icon: GitBranch,
        //     onClick: () => setShowUpdates(true),
        // },
    ];

    const filterNavItems = (items: NavItem[]): NavItem[] => {
        return items
            .map((item) => {
                if (item.items) {
                    const filteredItems = filterNavItems(item.items);
                    return filteredItems.length > 0 ? { ...item, items: filteredItems } : null;
                }
                return !item.permission || hasPermission(item.permission) ? item : null;
            })
            .filter((item): item is NavItem => item !== null);
    };

    const filteredMainNavItems = filterNavItems(mainNavItems);

    return (
        <>
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/dashboard" prefetch>
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

            <SystemUpdatesModal
                open={showUpdates}
                onOpenChange={setShowUpdates}
            />
        </>
    );
}
