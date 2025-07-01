
import { Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect } from 'react';
import HeroSection from '@/components/landing/HeroSection';
import StatsSection from '@/components/landing/StatsSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FinalCtaSection from '@/components/landing/FinalCtaSection';
import Footer from '@/components/landing/Footer';
import LiveDealsSection from '@/components/landing/LiveDealsSection';

const Index = () => {
  const isMobile = useIsMobile();

  // Check if trying to access admin
  if (window.location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }

  // Redirect mobile users directly to the app
  useEffect(() => {
    if (isMobile) {
      window.location.href = '/splash';
    }
  }, [isMobile]);

  // Don't render anything for mobile users (they'll be redirected)
  if (isMobile) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-spring-green-200/30 to-spring-green-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-monkeyYellow/20 to-spring-green-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-spring-green-100/20 to-emerald-100/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <HeroSection />
      <StatsSection />
      <LiveDealsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FinalCtaSection />
      <Footer />
    </div>
  );
};

export default Index;
