
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bookmark, MessageCircle, User, SlidersHorizontal } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const ListItem = ({ to, title, children }: { to: string, title: string, children: React.ReactNode }) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={to}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

const BottomNavigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && path !== '/home' && location.pathname.startsWith(path));
  };
  
  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/saved', icon: Bookmark, label: 'Saved' },
    { path: '/chatbot', icon: MessageCircle, label: 'Assistant' },
    { path: '/preferences', icon: SlidersHorizontal, label: 'Preferences' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  if (isMobile) {
    // Mobile bottom navigation (unchanged)
    return (
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t overflow-x-auto">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-2 ${
                  active ? 'text-monkeyYellow' : 'text-gray-600'
                }`}
              >
                <div className={`p-1 rounded-full ${active ? 'bg-monkeyGreen' : ''}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  const desktopNavItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/saved', icon: Bookmark, label: 'Saved' },
    { path: '/chatbot', icon: MessageCircle, label: 'Assistant' },
  ];

  const profileMenuItems = [
    { to: '/profile', title: 'My Profile', description: 'View and edit your profile details.' },
    { to: '/preferences', title: 'Preferences', description: 'Manage your app settings.' },
    { to: '/login', title: 'Logout', description: 'Sign out from your account.' },
  ];

  // Desktop top navigation with advanced menu
  return (
    <div className="fixed top-0 left-0 right-0 z-20 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/home" className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="https://offersmonkey.com/favicon.ico" alt="OffersMonkey Logo" className="w-full h-full rounded-full" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-monkeyGreen">OffersMonkey</h1>
              <p className="text-xs text-gray-500 leading-none">Find the best deals</p>
            </div>
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              {desktopNavItems.map((item) => (
                <NavigationMenuItem key={item.path}>
                  <Link to={item.path}>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "flex items-center space-x-2",
                        isActive(item.path)
                          ? "bg-monkeyGreen text-white shadow-sm hover:bg-monkeyGreen/90 hover:text-white"
                          : "text-gray-600 hover:text-monkeyGreen hover:bg-monkeyGreen/5"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}

              <NavigationMenuItem>
                <NavigationMenuTrigger className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-monkeyGreen hover:bg-monkeyGreen/5 data-[state=open]:bg-monkeyGreen/5 rounded-md">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Profile</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[250px] gap-3 p-4 md:w-[300px]">
                    {profileMenuItems.map((item) => (
                      <ListItem key={item.to} to={item.to} title={item.title}>
                        {item.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
