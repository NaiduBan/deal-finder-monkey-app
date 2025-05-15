
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageCircle, User } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  
  // Check if current path matches the navigation item
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && path !== '/home' && location.pathname.startsWith(path));
  };
  
  // Navigation items
  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/chatbot', icon: MessageCircle, label: 'Assistant' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 ${
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
};

export default BottomNavigation;
