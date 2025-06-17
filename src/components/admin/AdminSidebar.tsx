
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  BarChart3,
  Users,
  ShoppingBag,
  Package,
  Settings,
  Activity,
  Database,
  Mail,
  Bell,
  UserCheck,
  TrendingUp,
  FileText,
  Shield,
  Zap,
  Globe,
  CreditCard,
  Target,
  MessageSquare,
  Calendar,
  Tag,
  LayoutGrid
} from 'lucide-react';

const navigationItems = [
  {
    group: 'Analytics',
    items: [
      { title: 'Dashboard', url: '/admin/dashboard', icon: BarChart3 },
      { title: 'Real-time Analytics', url: '/admin/analytics', icon: TrendingUp },
      { title: 'Reports', url: '/admin/reports', icon: FileText },
    ]
  },
  {
    group: 'User Management',
    items: [
      { title: 'Users', url: '/admin/users', icon: Users },
      { title: 'User Segments', url: '/admin/user-segments', icon: UserCheck },
      { title: 'User Journey', url: '/admin/user-journey', icon: Target },
    ]
  },
  {
    group: 'Content Management',
    items: [
      { title: 'Offers', url: '/admin/offers', icon: ShoppingBag },
      { title: 'Cuelink', url: '/admin/cuelink', icon: Package },
      { title: 'Categories', url: '/admin/categories', icon: Tag },
      { title: 'Banners', url: '/admin/banners', icon: LayoutGrid },
    ]
  },
  {
    group: 'Communication',
    items: [
      { title: 'Email Campaigns', url: '/admin/email-campaigns', icon: Mail },
      { title: 'Notifications', url: '/admin/notifications', icon: Bell },
      { title: 'Chat Support', url: '/admin/chat-support', icon: MessageSquare },
    ]
  },
  {
    group: 'Business Intelligence',
    items: [
      { title: 'Revenue Analytics', url: '/admin/revenue', icon: CreditCard },
      { title: 'Conversion Funnel', url: '/admin/conversion', icon: Zap },
      { title: 'A/B Testing', url: '/admin/ab-testing', icon: Globe },
    ]
  },
  {
    group: 'System',
    items: [
      { title: 'System Health', url: '/admin/system', icon: Activity },
      { title: 'Database', url: '/admin/database', icon: Database },
      { title: 'Security', url: '/admin/security', icon: Shield },
      { title: 'Audit Logs', url: '/admin/audit', icon: Calendar },
      { title: 'Settings', url: '/admin/settings', icon: Settings },
    ]
  }
];

export function AdminSidebar() {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavClass = (isActive: boolean) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50 text-muted-foreground";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible>
      <SidebarContent className="bg-white border-r">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-bold text-gray-900">Admin CRM</h2>
                <p className="text-xs text-gray-500">Advanced Management</p>
              </div>
            )}
          </div>
        </div>

        {navigationItems.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            {!collapsed && <SidebarGroupLabel>{group.group}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClass(isActive(item.url))}>
                        <item.icon className="mr-3 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
