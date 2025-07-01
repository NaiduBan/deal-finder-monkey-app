
import React from 'react';
import { Bell, BellOff, Smartphone, Zap, Heart, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';

const NotificationSettings = () => {
  const { 
    isSupported, 
    permission, 
    isSubscribed, 
    isLoading, 
    subscribe, 
    unsubscribe, 
    showTestNotification 
  } = usePushNotifications();
  const { toast } = useToast();

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      const success = await unsubscribe();
      toast({
        title: success ? "Notifications Disabled" : "Error",
        description: success 
          ? "You will no longer receive push notifications" 
          : "Failed to disable notifications. Please try again.",
        variant: success ? "default" : "destructive"
      });
    } else {
      const success = await subscribe();
      toast({
        title: success ? "Notifications Enabled!" : "Error",
        description: success 
          ? "You'll now receive notifications for flash deals and personalized offers" 
          : "Failed to enable notifications. Please check your browser settings.",
        variant: success ? "default" : "destructive"
      });
    }
  };

  const handleTestNotification = () => {
    showTestNotification({
      title: "🎉 Test Notification",
      message: "This is how you'll receive flash deal alerts!",
      type: "flash_deal",
      url: "/home"
    });
    
    toast({
      title: "Test Notification Sent",
      description: "Check if you received the notification above!"
    });
  };

  if (!isSupported) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BellOff className="w-5 h-5 text-orange-600" />
            <CardTitle className="text-orange-800">Push Notifications Not Supported</CardTitle>
          </div>
          <CardDescription className="text-orange-700">
            Your browser doesn't support push notifications. Try using a modern browser like Chrome, Firefox, or Safari.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-spring-green-600" />
              <CardTitle>Push Notifications</CardTitle>
            </div>
            <Badge variant={isSubscribed ? "default" : "secondary"}>
              {isSubscribed ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <CardDescription>
            Get instant notifications for flash deals, personalized offers, and important updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-4 h-4 text-gray-600" />
              <span className="font-medium">Enable Push Notifications</span>
            </div>
            <Switch
              checked={isSubscribed}
              onCheckedChange={handleToggleNotifications}
              disabled={isLoading || permission === 'denied'}
            />
          </div>

          {permission === 'denied' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                <strong>Notifications Blocked:</strong> Please enable notifications in your browser settings 
                and refresh the page to receive push notifications.
              </p>
            </div>
          )}

          {permission === 'default' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Click the switch above to enable notifications. Your browser will ask for permission.
              </p>
            </div>
          )}

          {isSubscribed && (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✅ Great! You'll receive notifications for new deals and offers.
                </p>
              </div>

              <Button 
                variant="outline" 
                onClick={handleTestNotification}
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                Send Test Notification
              </Button>
            </div>
          )}

          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-medium text-sm text-gray-700 mb-2">You'll be notified about:</h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span>Flash deals and limited-time offers</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Heart className="w-3 h-3 text-red-500" />
                <span>Personalized offers based on your preferences</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Settings className="w-3 h-3 text-gray-500" />
                <span>Important app updates and features</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
