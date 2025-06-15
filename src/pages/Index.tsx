
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 overflow-x-hidden">
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
