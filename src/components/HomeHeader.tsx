
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bell } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useIsMobile } from '@/hooks/use-mobile';

const HomeHeader = () => {
  const { user } = useUser();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="bg-spring-green-600 text-white py-4 px-4 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{user.location}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/notifications" className="flex items-center">
              <Bell className="w-5 h-5 text-white" />
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-monkeyYellow text-[10px] text-black absolute translate-x-3 -translate-y-2">
                3
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back!</h1>
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-gray-500" />
          <span className="text-gray-600 text-lg">{user.location}</span>
        </div>
      </div>
      <Link to="/notifications" className="flex items-center bg-spring-green-600 text-white px-6 py-3 rounded-lg hover:bg-spring-green-700 transition-colors shadow-lg">
        <Bell className="w-5 h-5 mr-2" />
        <span className="font-medium">Notifications</span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-monkeyYellow text-sm font-bold text-black ml-3">
          3
        </span>
      </Link>
    </div>
  );
};

export default HomeHeader;
