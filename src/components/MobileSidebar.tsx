
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Store, 
  Star, 
  FolderOpen, 
  Home, 
  Bookmark, 
  User, 
  SlidersHorizontal,
  ChevronRight,
  MessageCircle,
  Bell,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';

const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useUser();
  const { userProfile } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && path !== '/home' && location.pathname.startsWith(path));
  };

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const mainMenuItems = [
    { path: '/home', icon: Home, label: 'Home', badge: null },
    { path: '/stores', icon: Store, label: 'Stores', badge: null },
    { path: '/brands', icon: Star, label: 'Brands', badge: null },
    { path: '/categories', icon: FolderOpen, label: 'Categories', badge: null },
  ];

  const secondaryMenuItems = [
    { path: '/saved', icon: Bookmark, label: 'Saved Offers', badge: user.savedOffers?.length || 0 },
    { path: '/preferences', icon: SlidersHorizontal, label: 'Preferences', badge: null },
    { path: '/notifications', icon: Bell, label: 'Notifications', badge: null },
    { path: '/chatbot', icon: MessageCircle, label: 'AI Assistant', badge: null },
  ];

  const userName = userProfile?.name || user.name || 'User';
  const userEmail = userProfile?.email || user.email || 'user@example.com';
  const userInitials = userName.split(' ').map(name => name[0]).join('').toUpperCase();

  return (
    <>
      {/* Sidebar Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSidebar}
        className="p-2 hover:bg-white/20 rounded-full transition-colors"
      >
        <Menu className="w-6 h-6 text-white" />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out md:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-spring-green-600 to-emerald-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <img src="https://offersmonkey.com/favicon.ico" alt="OffersMonkey Logo" className="w-full h-full rounded-full" />
                </div>
                <h1 className="text-lg font-bold">OffersMonkey</h1>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSidebar}
                className="p-2 hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* User Profile Summary */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{userInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{userName}</p>
                <p className="text-white/80 text-sm truncate">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto py-4">
            {/* Main Navigation */}
            <div className="px-4 mb-6">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
                Discover
              </h3>
              <nav className="space-y-1">
                {mainMenuItems.map((item) => {
                  const active = isActive(item.path);
                  const IconComponent = item.icon;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeSidebar}
                      className={`
                        flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200
                        ${active 
                          ? 'bg-spring-green-500 text-white shadow-sm' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Secondary Navigation */}
            <div className="px-4 mb-6">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
                My Account
              </h3>
              <nav className="space-y-1">
                {secondaryMenuItems.map((item) => {
                  const active = isActive(item.path);
                  const IconComponent = item.icon;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeSidebar}
                      className={`
                        flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200
                        ${active 
                          ? 'bg-spring-green-500 text-white shadow-sm' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.badge !== null && item.badge > 0 && (
                          <Badge className="bg-spring-green-600 text-white text-xs px-2 py-1">
                            {item.badge}
                          </Badge>
                        )}
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Profile Link */}
            <div className="px-4">
              <Link
                to="/profile"
                onClick={closeSidebar}
                className={`
                  flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700
                  ${isActive('/profile') 
                    ? 'bg-spring-green-500 text-white shadow-sm border-spring-green-500' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5" />
                  <span className="font-medium">My Profile</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Link
              to="/settings"
              onClick={closeSidebar}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
