
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bell, Crown } from 'lucide-react';
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
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">{user.location}</span>
          </div>
          <div className="flex items-center space-x-3">
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
    <div className="relative overflow-hidden bg-gradient-to-r from-spring-green-600 via-spring-green-700 to-green-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-monkeyYellow" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Welcome back, Saver!</h1>
              <div className="flex items-center space-x-2 mt-1">
                <MapPin className="w-4 h-4 text-white/80" />
                <span className="text-white/90">{user.location}</span>
              </div>
            </div>
          </div>
          <p className="text-lg text-white/90">
            🎉 Discover amazing deals and save money on your favorite brands!
          </p>
        </div>
        <div className="hidden lg:flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-monkeyYellow">{offersCount}+</div>
            <div className="text-sm text-white/80">Live Deals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-monkeyYellow">{cuelinkOffersCount}+</div>
            <div className="text-sm text-white/80">Flash Deals</div>
          </div>
          <Link to="/notifications" className="flex items-center bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
            <Bell className="w-5 h-5 mr-2" />
            <span>Notifications</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-monkeyYellow text-xs text-black ml-2 font-bold">
              3
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeHeader;
