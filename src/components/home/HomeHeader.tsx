
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bell, Sparkles } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface HomeHeaderProps {
  offersCount: number;
  cuelinkOffersCount: number;
}

const HomeHeader = ({ offersCount, cuelinkOffersCount }: HomeHeaderProps) => {
  const { user } = useUser();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="bg-gradient-to-r from-spring-green-500 to-emerald-600 text-white py-4 px-4 fixed top-0 left-0 right-0 z-30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-monkeyYellow" />
            </div>
            <div>
              <h1 className="text-sm font-bold">Welcome back!</h1>
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-white/80" />
                <span className="text-xs text-white/90">{user.location || 'Your Location'}</span>
              </div>
            </div>
          </div>
          
          <Link to="/notifications" className="flex items-center relative">
            <Bell className="w-5 h-5 text-white" />
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-monkeyYellow text-[10px] text-black absolute -translate-y-2 translate-x-3 font-bold">
              3
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-spring-green-500 to-emerald-600 rounded-2xl p-6 mb-6 text-white shadow-lg max-w-5xl mx-auto">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-white/5 rounded-2xl"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-orange-400 rounded-2xl flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
            <div className="flex items-center space-x-2 mt-1">
              <MapPin className="w-4 h-4 text-orange-200" />
              <span className="text-sm text-white/90 font-medium">{user.location || 'Your Location'}</span>
            </div>
          </div>
        </div>
        
        <Link 
          to="/notifications" 
          className="flex items-center bg-white/20 backdrop-blur-sm text-white px-4 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 shadow-sm"
        >
          <Bell className="w-5 h-5 mr-2" />
          <span className="font-medium text-sm">Alerts</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-400 text-xs text-white ml-2 font-bold">
            3
          </span>
        </Link>
      </div>
    </div>
  );
};

export default HomeHeader;
