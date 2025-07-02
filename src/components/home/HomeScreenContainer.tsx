import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface HomeScreenContainerProps {
  children: React.ReactNode;
}

const HomeScreenContainer = ({ children }: HomeScreenContainerProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={`bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen relative overflow-hidden ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,_transparent_25%,_rgba(156,146,172,0.03)_25%,_rgba(156,146,172,0.03)_50%,_transparent_50%,_transparent_75%,_rgba(156,146,172,0.03)_75%,_rgba(156,146,172,0.03))] bg-[length:60px_60px] opacity-30"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-spring-green-300/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-indigo-300/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      
      {/* Main content with better organization */}
      <div className={`space-y-8 relative z-10 ${isMobile ? 'p-4 pt-20' : 'w-full'}`}>
        <div className={`${!isMobile ? 'max-w-[1440px] mx-auto px-6 py-8' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default HomeScreenContainer;