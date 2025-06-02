
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is authenticated, go directly to home
        setTimeout(() => navigate('/home'), 2000);
        return;
      }

      // Show the tagline after the logo animation
      const taglineTimeout = setTimeout(() => {
        setShowTagline(true);
      }, 1000);

      // Navigate to login after splash screen for unauthenticated users
      const navigationTimeout = setTimeout(() => {
        navigate('/login');
      }, 3000);

      return () => {
        clearTimeout(taglineTimeout);
        clearTimeout(navigationTimeout);
      };
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center monkey-gradient">
      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg animate-splash-logo mb-8 p-4">
        <img 
          src="/lovable-uploads/36b4568e-cccc-479e-8cc6-09adf49b2275.png" 
          alt="OffersMonkey Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      <h1 className="text-white text-3xl font-bold mb-2">OffersMonkey</h1>
      {showTagline && (
        <p className="text-white text-lg animate-fade-up">Uncover the Best Deals Near You!</p>
      )}
    </div>
  );
};

export default SplashScreen;
