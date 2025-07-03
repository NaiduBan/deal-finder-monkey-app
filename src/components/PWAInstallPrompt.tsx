
import React from 'react';
import { Download, X, Bell, Share, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePWA } from '@/hooks/usePWA';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';

const PWAInstallPrompt = () => {
  const { isInstallable, isIOS, canShowIOSPrompt, installApp } = usePWA();
  const { isSupported: isNotificationSupported, isSubscribed, subscribe, permission, isLoading } = usePushNotifications();
  const { toast } = useToast();
  const [dismissed, setDismissed] = React.useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = React.useState(false);

  // Check if notification prompt was previously dismissed
  const [notificationPromptDismissed, setNotificationPromptDismissed] = React.useState(() => {
    return localStorage.getItem('offersmonkey-notification-prompt-dismissed') === 'true';
  });

  // Don't show if notifications are already subscribed and app is not installable
  if (isSubscribed && !isInstallable) {
    return null;
  }

  // Don't show notification prompt if it was previously dismissed
  const shouldShowNotificationPrompt = isNotificationSupported && !isSubscribed && !notificationPromptDismissed;

  // Show if installable OR if notifications can be enabled (and not previously dismissed)
  const shouldShow = (isInstallable || shouldShowNotificationPrompt) && !dismissed;

  if (!shouldShow) {
    return null;
  }

  const isMainlyForNotifications = !isInstallable && shouldShowNotificationPrompt;

  const handleEnableNotifications = async () => {
    try {
      const success = await subscribe();
      if (success) {
        toast({
          title: "Notifications Enabled! 🎉",
          description: "You'll now receive alerts for flash deals and personalized offers",
        });
        setDismissed(true);
      } else {
        // Check the actual permission state after attempting to subscribe
        const currentPermission = Notification.permission;
        if (currentPermission === 'denied') {
          toast({
            title: "Notifications Blocked",
            description: "Please enable notifications in your browser settings and refresh the page",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Permission Required",
            description: "Please allow notifications when prompted by your browser",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast({
        title: "Error",
        description: "Failed to enable notifications. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInstallClick = async () => {
    const result = await installApp();
    if (result === 'ios-instructions') {
      setShowIOSInstructions(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // If this is mainly for notifications, remember that user dismissed it
    if (isMainlyForNotifications) {
      localStorage.setItem('offersmonkey-notification-prompt-dismissed', 'true');
      setNotificationPromptDismissed(true);
    }
  };

  const IOSInstructionsDialog = () => (
    <Dialog open={showIOSInstructions} onOpenChange={setShowIOSInstructions}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Install OffersMonkey
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            To install OffersMonkey on your iPhone, follow these steps:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                1
              </div>
              <div className="text-sm">
                <strong>Tap the Share button</strong> <Share className="w-4 h-4 inline mx-1" /> at the bottom of your Safari browser
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                2
              </div>
              <div className="text-sm">
                <strong>Scroll down and tap "Add to Home Screen"</strong> <Plus className="w-4 h-4 inline mx-1" />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                3
              </div>
              <div className="text-sm">
                <strong>Tap "Add"</strong> to install the app on your home screen
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-green-700">
              💡 Once installed, you can access OffersMonkey directly from your home screen for faster deal hunting!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
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
                    : isIOS 
                      ? 'Add to your home screen for quick access'
                      : 'Get quick access to deals'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isInstallable && (
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="bg-white text-spring-green-600 hover:bg-white/90 font-medium"
                >
                  {isIOS ? 'How to Install' : 'Install'}
                </Button>
              )}
              {shouldShowNotificationPrompt && (
                <Button
                  onClick={handleEnableNotifications}
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
                onClick={handleDismiss}
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
      <IOSInstructionsDialog />
    </>
  );
};

export default PWAInstallPrompt;
