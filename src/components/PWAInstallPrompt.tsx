
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

const PWAInstallPrompt = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show prompt after 3 seconds if app is installable and not dismissed
    const timer = setTimeout(() => {
      if (isInstallable && !dismissed && !isInstalled) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isInstallable, dismissed, isInstalled]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    // Remember dismissal for 24 hours
    localStorage.setItem('pwa-dismissed', Date.now().toString());
  };

  // Check if previously dismissed within 24 hours
  useEffect(() => {
    const dismissedTime = localStorage.getItem('pwa-dismissed');
    if (dismissedTime) {
      const now = Date.now();
      const dismissedAt = parseInt(dismissedTime);
      if (now - dismissedAt < 24 * 60 * 60 * 1000) { // 24 hours
        setDismissed(true);
      }
    }
  }, []);

  if (!showPrompt || !isInstallable || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <Card className="bg-gradient-to-r from-spring-green-600 to-emerald-600 border-0 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-spring-green-600" />
              </div>
              <div className="text-white">
                <h3 className="font-semibold text-sm">Install OffersMonkey</h3>
                <p className="text-xs text-white/90">Get faster access to deals!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="bg-white text-spring-green-600 hover:bg-gray-100 font-medium"
              >
                <Download className="w-4 h-4 mr-1" />
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
