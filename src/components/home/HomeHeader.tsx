
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bell, Crown, Sparkles } from 'lucide-react';
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
      <div className="bg-gradient-to-r from-spring-green-600 to-spring-green-700 text-white py-6 px-4 fixed top-0 left-0 right-0 z-30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-monkeyYellow" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Welcome back!</h1>
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
    <div className="relative overflow-hidden bg-gradient-to-br from-spring-green-600 via-spring-green-700 to-green-600 rounded-3xl p-10 mb-8 text-white shadow-2xl">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-black/5"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-monkeyYellow to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                Welcome back, Saver!
              </h1>
              <div className="flex items-center space-x-2 mt-2">
                <MapPin className="w-5 h-5 text-monkeyYellow" />
                <span className="text-xl text-white/90 font-medium">{user.location}</span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 max-w-2xl">
            <p className="text-xl text-white/95 font-medium">
              🎉 Ready to discover amazing deals? We've got fresh offers waiting for you!
            </p>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center space-x-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center min-w-[120px]">
              <div className="text-3xl font-bold text-monkeyYellow mb-1">{offersCount}+</div>
              <div className="text-sm text-white/80 font-medium">Live Deals</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center min-w-[120px]">
              <div className="text-3xl font-bold text-monkeyYellow mb-1">{cuelinkOffersCount}+</div>
              <div className="text-sm text-white/80 font-medium">Flash Deals</div>
            </div>
          </div>
          
          <Link 
            to="/notifications" 
            className="flex items-center bg-white/15 backdrop-blur-sm text-white px-6 py-4 rounded-2xl hover:bg-white/25 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Bell className="w-6 h-6 mr-3" />
            <span className="font-medium">Notifications</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-monkeyYellow text-sm text-black ml-3 font-bold shadow-sm">
              3
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeHeader;
