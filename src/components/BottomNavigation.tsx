import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bookmark, User, SlidersHorizontal, Store, Star, MessageCircle, FolderOpen, Menu } from 'lucide-react';
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
import MobileSidebar from './MobileSidebar';

const ListItem = ({ to, title, children }: { to: string, title: string, children: React.ReactNode }) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={to}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer hover:scale-105 active:scale-95"
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && path !== '/home' && location.pathname.startsWith(path));
  };
  
  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/saved', icon: Bookmark, label: 'Saved' },
    { path: '/preferences', icon: SlidersHorizontal, label: 'Preferences' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  if (isMobile) {
    // Mobile bottom navigation
    return (
      <>
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-spring-green-600 border-t border-spring-green-700 overflow-x-auto">
          <div className="flex justify-around items-center">
            {/* Menu button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex flex-col items-center py-2 px-2 text-white/80 hover:text-monkeyYellow transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
            >
              <div className="p-1 rounded-full">
                <Menu className="w-5 h-5" />
              </div>
              <span className="text-xs mt-1">Menu</span>
            </button>

            {navItems.map((item) => {
              const active = isActive(item.path);
              const IconComponent = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center py-2 px-2 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 ${
                    active ? 'text-monkeyYellow' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <div className={`p-1 rounded-full ${active ? 'bg-white/20' : ''}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Floating Chatbot Icon for Mobile */}
        <Link
          to="/chatbot"
          className="fixed bottom-20 right-4 z-40 bg-gradient-to-r from-monkeyGreen to-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 hover:rotate-3"
        >
          <MessageCircle className="w-6 h-6" />
        </Link>

        {/* Mobile Sidebar */}
        <MobileSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      </>
    );
  }

  const desktopNavItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/stores', icon: Store, label: 'Stores' },
    { path: '/brands', icon: Star, label: 'Brands' },
    { path: '/categories', icon: FolderOpen, label: 'Categories' },
    { path: '/saved', icon: Bookmark, label: 'Saved' },
  ];

  const profileMenuItems = [
    { to: '/profile', title: 'My Profile', description: 'View and edit your profile details.' },
    { to: '/preferences', title: 'Preferences', description: 'Manage your app settings.' },
    { to: '/login', title: 'Logout', description: 'Sign out from your account.' },
  ];

  // Desktop top navigation with advanced menu
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-20 bg-white border-b shadow-sm">
        <div className="w-full px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to="/home" className="flex items-center space-x-3 cursor-pointer hover:scale-105 transition-transform duration-200">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="https://offersmonkey.com/favicon.ico" alt="OffersMonkey Logo" className="w-full h-full rounded-full" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-spring-green-600">OffersMonkey</h1>
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
                            ? "bg-spring-green-500 text-white shadow-sm hover:bg-spring-green-600 hover:text-white"
                            : "text-gray-600 hover:text-spring-green-600 hover:bg-spring-green-50"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="font-medium">{item.label}</span>
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-spring-green-600 hover:bg-spring-green-50 data-[state=open]:bg-spring-green-50 rounded-md">
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
      
      {/* Floating Chatbot Icon for Desktop */}
      <Link
        to="/chatbot"
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-monkeyGreen to-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 hover:rotate-3"
      >
        <MessageCircle className="w-6 h-6" />
      </Link>
    </>
  );
};

export default BottomNavigation;
