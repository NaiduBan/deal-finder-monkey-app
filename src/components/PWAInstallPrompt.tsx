
import React from 'react';
import { Download, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

const PWAInstallPrompt = () => {
  const { isInstallable, installApp } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  if (!isInstallable || dismissed) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-spring-green-500 to-spring-green-600 text-white border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Install OffersMonkey</h3>
              <p className="text-xs text-white/90">Get quick access to deals</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={installApp}
              size="sm"
              className="bg-white text-spring-green-600 hover:bg-white/90 font-medium"
            >
              Install
            </Button>
            <Button
              onClick={() => setDismissed(true)}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-1 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;
