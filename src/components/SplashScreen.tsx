
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    // Show the tagline after the logo animation
    const taglineTimeout = setTimeout(() => {
      setShowTagline(true);
    }, 1000);

    // Navigate directly to login page after splash screen
    const navigationTimeout = setTimeout(() => {
      navigate('/login');
    }, 3000);

    return () => {
      clearTimeout(taglineTimeout);
      clearTimeout(navigationTimeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center monkey-gradient">
      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg animate-splash-logo mb-8 p-4">
        <img 
          src="/lovable-uploads/7af3a309-4731-4f26-b6d0-72b4fc7c953f.png" 
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
