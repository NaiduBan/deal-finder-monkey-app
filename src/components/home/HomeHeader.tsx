
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
      <div className="bg-gradient-to-r from-spring-green-600 to-spring-green-700 text-white py-2 px-4 fixed top-0 left-0 right-0 z-30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-monkeyYellow" />
            </div>
            <div>
              <h1 className="text-xs font-bold">Welcome back!</h1>
              <div className="flex items-center space-x-1">
                <MapPin className="w-2 h-2 text-white/80" />
                <span className="text-[10px] text-white/90">{user.location}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-center">
              <div className="text-xs font-bold text-monkeyYellow">{offersCount}+</div>
              <div className="text-[10px] text-white/80">Deals</div>
            </div>
            <Link to="/notifications" className="flex items-center relative">
              <Bell className="w-4 h-4 text-white" />
              <span className="flex h-3 w-3 items-center justify-center rounded-full bg-monkeyYellow text-[8px] text-black absolute -translate-y-1 translate-x-2 font-bold">
                3
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-spring-green-600 to-spring-green-700 rounded-xl p-3 mb-4 text-white shadow-lg">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-white/5 rounded-xl"></div>
      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-monkeyYellow rounded-lg flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Welcome back!</h1>
            <div className="flex items-center space-x-1 mt-0.5">
              <MapPin className="w-3 h-3 text-monkeyYellow" />
              <span className="text-xs text-white/90 font-medium">{user.location}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 text-center min-w-[60px]">
              <div className="text-sm font-bold text-monkeyYellow">{offersCount}+</div>
              <div className="text-[10px] text-white/80 font-medium">Deals</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 text-center min-w-[60px]">
              <div className="text-sm font-bold text-monkeyYellow">{cuelinkOffersCount}+</div>
              <div className="text-[10px] text-white/80 font-medium">Flash</div>
            </div>
          </div>
          
          <Link 
            to="/notifications" 
            className="flex items-center bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 shadow-sm"
          >
            <Bell className="w-4 h-4 mr-1" />
            <span className="font-medium text-xs">Alerts</span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-monkeyYellow text-[10px] text-black ml-1 font-bold">
              3
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeHeader;
