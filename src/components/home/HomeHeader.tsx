
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bell, Sparkles, Sun } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface HomeHeaderProps {
  offersCount: number;
  cuelinkOffersCount: number;
}

const HomeHeader = ({ offersCount, cuelinkOffersCount }: HomeHeaderProps) => {
  const { user } = useUser();
  const isMobile = useIsMobile();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isMobile) {
    return (
      <div className="bg-gradient-to-br from-primary/90 via-primary to-emerald-600 text-white py-6 px-4 fixed top-0 left-0 right-0 z-30 shadow-xl border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Sun className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-300 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">{getGreeting()}!</h1>
              <div className="flex items-center space-x-1 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-200" />
                <span className="text-xs text-emerald-100 font-medium">{user?.name || 'User'} • {user?.location || 'Vizag'}</span>
              </div>
            </div>
          </div>
          
          <Link to="/notifications" className="relative group cursor-pointer hover:scale-110 transition-transform duration-200">
            <div className="flex items-center bg-white/15 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 shadow-lg group-hover:bg-white/25 transition-colors duration-200">
              <Bell className="w-4 h-4 text-white mr-1.5" />
              <span className="text-xs font-medium text-white">Alerts</span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-[10px] text-white ml-1.5 font-bold shadow-sm">
                3
              </span>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/95 via-primary to-emerald-600 rounded-3xl p-8 mb-8 text-white shadow-2xl border border-white/10">
      {/* Enhanced background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 rounded-3xl"></div>
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-20 translate-x-20 blur-xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full translate-y-16 -translate-x-16 blur-2xl"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-5">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-xl">
              <Sun className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full animate-pulse shadow-lg"></div>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">{getGreeting()}!</h1>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-emerald-200" />
                <span className="text-sm text-emerald-100 font-medium">{user?.name || 'User'}</span>
              </div>
              <div className="w-1 h-1 bg-emerald-300 rounded-full"></div>
              <span className="text-sm text-emerald-100 font-medium">{user?.location || 'Vizag'}</span>
            </div>
          </div>
        </div>
        
        <Link 
          to="/notifications" 
          className="group flex items-center bg-white/15 backdrop-blur-md text-white px-6 py-4 rounded-2xl hover:bg-white/25 transition-all duration-300 shadow-xl border border-white/20 cursor-pointer hover:scale-105 hover:shadow-2xl"
        >
          <Bell className="w-5 h-5 mr-3 group-hover:animate-pulse" />
          <div className="flex flex-col items-start">
            <span className="font-semibold text-sm">Alerts</span>
            <span className="text-xs text-emerald-100">New updates</span>
          </div>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-xs text-white ml-3 font-bold shadow-lg">
            3
          </span>
        </Link>
      </div>
    </div>
  );
};

export default HomeHeader;
