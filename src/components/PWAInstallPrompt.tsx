
import React from 'react';
import { Download, X, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const PWAInstallPrompt = () => {
  const { isInstallable, installApp } = usePWA();
  const { isSupported: isNotificationSupported, isSubscribed } = usePushNotifications();
  const [dismissed, setDismissed] = React.useState(false);

  // Show if installable OR if notifications can be enabled
  const shouldShow = (isInstallable || (isNotificationSupported && !isSubscribed)) && !dismissed;

  if (!shouldShow) {
    return null;
  }

  const isMainlyForNotifications = !isInstallable && isNotificationSupported && !isSubscribed;

  return (
    <Card className="bg-gradient-to-r from-spring-green-500 to-spring-green-600 text-white border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              {isMainlyForNotifications ? (
                <Bell className="w-5 h-5 text-white" />
              ) : (
                <Download className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {isMainlyForNotifications ? 'Enable Notifications' : 'Install OffersMonkey'}
              </h3>
              <p className="text-xs text-white/90">
                {isMainlyForNotifications 
                  ? 'Get instant alerts for flash deals' 
                  : 'Get quick access to deals'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isInstallable && (
              <Button
                onClick={installApp}
                size="sm"
                className="bg-white text-spring-green-600 hover:bg-white/90 font-medium"
              >
                Install
              </Button>
            )}
            {isNotificationSupported && !isSubscribed && (
              <Button
                onClick={() => {
                  // Navigate to settings or show notification setup
                  window.location.href = '/settings';
                }}
                size="sm"
                variant={isInstallable ? "ghost" : "default"}
                className={isInstallable 
                  ? "text-white hover:bg-white/20" 
                  : "bg-white text-spring-green-600 hover:bg-white/90 font-medium"
                }
              >
                {isInstallable ? <Bell className="w-4 h-4" /> : 'Enable'}
              </Button>
            )}
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
