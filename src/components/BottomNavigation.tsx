
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bookmark, MessageCircle, User, SlidersHorizontal } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const BottomNavigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Check if current path matches the navigation item
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && path !== '/home' && location.pathname.startsWith(path));
  };
  
  // Navigation items
  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/saved', icon: Bookmark, label: 'Saved' },
    { path: '/chatbot', icon: MessageCircle, label: 'Assistant' },
    { path: '/preferences/stores', icon: SlidersHorizontal, label: 'Preferences' },
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

  // Desktop top navigation - full width
  return (
    <div className="fixed top-0 left-0 right-0 z-20 bg-white border-b shadow-sm">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-monkeyGreen rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">🐵</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-monkeyGreen">OffersMonkey</h1>
              <p className="text-xs text-gray-500">Find the best deals</p>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="flex items-center space-x-8">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const IconComponent = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    active 
                      ? 'bg-monkeyGreen text-white' 
                      : 'text-gray-600 hover:text-monkeyGreen hover:bg-monkeyGreen/10'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
