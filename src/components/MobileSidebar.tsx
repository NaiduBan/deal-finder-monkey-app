
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  Store, 
  Star, 
  FolderOpen, 
  Bookmark, 
  Settings, 
  User, 
  Bell,
  Bot,
  MapPin,
  Users,
  ChevronRight
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose
} from "@/components/ui/drawer";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  const menuItems = [
    {
      category: "Browse",
      items: [
        { icon: Store, label: 'Stores', path: '/stores' },
        { icon: Star, label: 'Brands', path: '/brands' },
        { icon: FolderOpen, label: 'Categories', path: '/categories' },
      ]
    },
    {
      category: "Smart Features",
      items: [
        { icon: Bot, label: 'AI Assistant', path: '/ai-assistant' },
        { icon: MapPin, label: 'Local Deals', path: '/local-deals' },
        { icon: Users, label: 'Social Shopping', path: '/social-shopping' },
      ]
    },
    {
      category: "Account",
      items: [
        { icon: Bookmark, label: 'Saved Offers', path: '/saved' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: Settings, label: 'Preferences', path: '/preferences' },
        { icon: User, label: 'Profile', path: '/profile' },
      ]
    }
  ];

  const handleItemClick = () => {
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader className="flex items-center justify-between border-b border-gray-200 pb-4">
          <DrawerTitle className="text-xl font-bold text-spring-green-600">
            Menu
          </DrawerTitle>
          <DrawerClose asChild>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </DrawerClose>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {menuItems.map((section) => (
              <div key={section.category} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  {section.category}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleItemClick}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-spring-green-50 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-spring-green-100 rounded-lg flex items-center justify-center group-hover:bg-spring-green-200 transition-colors">
                          <item.icon className="w-5 h-5 text-spring-green-600" />
                        </div>
                        <span className="font-medium text-gray-900 group-hover:text-spring-green-700">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-spring-green-600" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">OffersMonkey v1.0</p>
            <p className="text-xs text-gray-400 mt-1">Find the best deals</p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileSidebar;
