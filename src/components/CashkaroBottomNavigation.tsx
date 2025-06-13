
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Store, Tag, Wallet, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const CashkaroBottomNavigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Check if current path matches the navigation item
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };
  
  // Navigation items for CashKaro style
  const navItems = [
    { path: '/cashkaro', icon: Home, label: 'Home' },
    { path: '/stores', icon: Store, label: 'Stores' },
    { path: '/offers', icon: Tag, label: 'Offers' },
    { path: '/cashback', icon: Wallet, label: 'Cashback' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  if (isMobile) {
    // Mobile bottom navigation
    return (
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t shadow-lg">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 ${
                  active ? 'text-red-500' : 'text-gray-600'
                }`}
              >
                <div className={`p-1 rounded-full ${active ? 'bg-red-50' : ''}`}>
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

  // Desktop top navigation
  return (
    <div className="fixed top-0 left-0 right-0 z-20 bg-white border-b shadow-sm">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">💰</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-red-500">CashKaro</h1>
              <p className="text-xs text-gray-500">Earn cashback on every purchase</p>
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
                      ? 'bg-red-500 text-white' 
                      : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
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

export default CashkaroBottomNavigation;
