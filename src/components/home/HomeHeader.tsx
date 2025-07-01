
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
      <div className="bg-gradient-to-r from-spring-green-600 to-spring-green-700 text-white py-4 px-4 fixed top-0 left-0 right-0 z-30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-monkeyYellow" />
            </div>
            <div>
              <h1 className="text-sm font-bold">Welcome back!</h1>
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-white/80" />
                <span className="text-xs text-white/90">{user.location}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-center">
              <div className="text-sm font-bold text-monkeyYellow">{offersCount}+</div>
              <div className="text-xs text-white/80">Deals</div>
            </div>
            <Link to="/notifications" className="flex items-center relative">
              <Bell className="w-5 h-5 text-white" />
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-monkeyYellow text-[10px] text-black absolute -translate-y-2 translate-x-3 font-bold">
                3
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-spring-green-600 to-spring-green-700 rounded-2xl p-8 text-white shadow-xl">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-white/5 rounded-2xl"></div>
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-monkeyYellow rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="pt-2">
            <h1 className="text-3xl font-bold mb-3">Welcome back!</h1>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-monkeyYellow" />
              <span className="text-lg text-white/90 font-medium">{user.location}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex space-x-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[100px]">
              <div className="text-2xl font-bold text-monkeyYellow">{offersCount}+</div>
              <div className="text-sm text-white/80 font-medium">Deals</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[100px]">
              <div className="text-2xl font-bold text-monkeyYellow">{cuelinkOffersCount}+</div>
              <div className="text-sm text-white/80 font-medium">Flash</div>
            </div>
          </div>
          
          <Link 
            to="/notifications" 
            className="flex items-center bg-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-2xl hover:bg-white/30 transition-all duration-200 shadow-lg"
          >
            <Bell className="w-6 h-6 mr-3" />
            <span className="font-medium">Alerts</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-monkeyYellow text-sm text-black ml-3 font-bold">
              3
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeHeader;
