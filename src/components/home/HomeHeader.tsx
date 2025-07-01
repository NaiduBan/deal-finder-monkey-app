
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
      <div className="bg-gradient-to-r from-spring-green-600 to-spring-green-700 text-white py-2 px-3 fixed top-0 left-0 right-0 z-30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-2.5 h-2.5 text-monkeyYellow" />
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
    <div className="relative overflow-hidden bg-gradient-to-r from-spring-green-600 to-spring-green-700 rounded-xl px-4 py-2.5 mb-4 text-white shadow-lg max-w-4xl">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-white/5 rounded-xl"></div>
      <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 bg-monkeyYellow rounded-lg flex items-center justify-center shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold">Welcome back!</h1>
            <div className="flex items-center space-x-1 mt-0.5">
              <MapPin className="w-3 h-3 text-monkeyYellow" />
              <span className="text-xs text-white/90 font-medium">{user.location}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2.5">
          <div className="flex space-x-1.5">
            <div className="bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1.5 text-center min-w-[50px]">
              <div className="text-sm font-bold text-monkeyYellow">{offersCount}+</div>
              <div className="text-[10px] text-white/80 font-medium">Deals</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1.5 text-center min-w-[50px]">
              <div className="text-sm font-bold text-monkeyYellow">{cuelinkOffersCount}+</div>
              <div className="text-[10px] text-white/80 font-medium">Flash</div>
            </div>
          </div>
          
          <Link 
            to="/notifications" 
            className="flex items-center bg-white/20 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-lg hover:bg-white/30 transition-all duration-200 shadow-sm"
          >
            <Bell className="w-3.5 h-3.5 mr-1" />
            <span className="font-medium text-xs">Alerts</span>
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-monkeyYellow text-[9px] text-black ml-1 font-bold">
              3
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeHeader;
