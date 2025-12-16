import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { HomeIcon, ShoppingBagIcon, ShoppingCartIcon, UserIcon } from "lucide-react";
import NavLink from "@/components/NavLink/navlink"; // Using HeroIcons

export function AppSidebar() {
    const navItems = [
        {
            label: 'Dashboard',
            href: '#',
            icon: <HomeIcon className="w-5 h-5 mr-2" />,
        },
        {
            label: 'Products',
            href: '/admin/products',
            icon: <ShoppingBagIcon className="w-5 h-5 mr-2" />,
        },
        {
            label: 'Orders',
            href: '#',
            icon: <ShoppingCartIcon className="w-5 h-5 mr-2" />,
        },
        {
            label: 'Customers',
            href: '#',
            icon: <UserIcon className="w-5 h-5 mr-2" />,
        },
    ];

    return (
        <Sidebar className="w-64 min-h-screen">
            <SidebarHeader className="px-4 py-6 text-xl font-semibold">
                eCommerce Dashboard
            </SidebarHeader>
            <SidebarContent className="overflow-y-auto px-2 py-6">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-sm">CMS</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton  className="hover:bg-primary"  asChild>
                                        <NavLink activeClassName="bg-primary text-white font-bold" href={item.href}>
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="bg-gray-900 text-center py-4">
                <p className="text-xs text-gray-500">© 2025 Your eCommerce Platform</p>
            </SidebarFooter>
        </Sidebar>
    );
}
