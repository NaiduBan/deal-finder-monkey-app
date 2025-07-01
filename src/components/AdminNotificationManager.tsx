
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Send, 
  Users, 
  Zap, 
  Heart, 
  Settings, 
  Plus,
  History,
  Target
} from 'lucide-react';
import { 
  createNotification, 
  createBulkNotifications, 
  createFlashDealNotification,
  createSystemNotification 
} from '@/services/notificationService';

const AdminNotificationManager = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'general' as 'flash_deal' | 'personalized' | 'general' | 'system',
    targetType: 'all' as 'all' | 'specific' | 'preferences',
    targetValue: '',
    url: ''
  });

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and message",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      let success = false;

      if (notificationForm.targetType === 'all') {
        // Send to all users - create system notification
        success = await createSystemNotification(
          notificationForm.title,
          notificationForm.message
        );
      } else {
        // For specific users or preferences, we'll create a general notification
        // In a real implementation, you'd fetch specific user IDs based on criteria
        success = await createSystemNotification(
          notificationForm.title,
          notificationForm.message
        );
      }

      if (success) {
        toast({
          title: "Notification Sent!",
          description: "Your notification has been sent successfully to users.",
        });
        
        // Reset form
        setNotificationForm({
          title: '',
          message: '',
          type: 'general',
          targetType: 'all',
          targetValue: '',
          url: ''
        });
      } else {
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickNotification = async (type: 'flash_deal' | 'daily_deal' | 'system') => {
    setIsLoading(true);
    
    try {
      let success = false;
      
      switch (type) {
        case 'flash_deal':
          success = await createSystemNotification(
            "⚡ Flash Deal Alert!",
            "Amazing flash deals are now live! Don't miss out on incredible savings."
          );
          break;
        case 'daily_deal':
          success = await createSystemNotification(
            "🌅 Daily Deals Updated",
            "New daily deals are available. Check out today's best offers!"
          );
          break;
        case 'system':
          success = await createSystemNotification(
            "🔧 System Update",
            "We've updated our app with new features and improvements."
          );
          break;
      }

      if (success) {
        toast({
          title: "Quick Notification Sent!",
          description: "Your quick notification has been sent to all users.",
        });
      }
    } catch (error) {
      console.error('Error sending quick notification:', error);
      toast({
        title: "Error",
        description: "Failed to send quick notification.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Manager</h2>
          <p className="text-gray-600">Send notifications to users and manage notification settings</p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-1">
          <Bell className="w-3 h-3" />
          <span>Active</span>
        </Badge>
      </div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send" className="flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span>Send Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="quick" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Quick Actions</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Create New Notification</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Title
                  </label>
                  <Input
                    placeholder="Enter notification title"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Type
                  </label>
                  <Select 
                    value={notificationForm.type} 
                    onValueChange={(value: any) => setNotificationForm({...notificationForm, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="flash_deal">Flash Deal</SelectItem>
                      <SelectItem value="personalized">Personalized</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <Textarea
                  placeholder="Enter your notification message"
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <Select 
                    value={notificationForm.targetType} 
                    onValueChange={(value: any) => setNotificationForm({...notificationForm, targetType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="specific">Specific Users</SelectItem>
                      <SelectItem value="preferences">By Preferences</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action URL (Optional)
                  </label>
                  <Input
                    placeholder="e.g., /offers/123"
                    value={notificationForm.url}
                    onChange={(e) => setNotificationForm({...notificationForm, url: e.target.value})}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSendNotification} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-orange-800">
                  <Zap className="w-5 h-5" />
                  <span>Flash Deal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700 mb-3">
                  Send instant flash deal notifications to all users
                </p>
                <Button 
                  onClick={() => handleQuickNotification('flash_deal')}
                  disabled={isLoading}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Send Flash Deal Alert
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <Heart className="w-5 h-5" />
                  <span>Daily Deals</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700 mb-3">
                  Notify users about updated daily deals
                </p>
                <Button 
                  onClick={() => handleQuickNotification('daily_deal')}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Send Daily Update
                </Button>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <Settings className="w-5 h-5" />
                  <span>System Update</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700 mb-3">
                  Send system updates and announcements
                </p>
                <Button 
                  onClick={() => handleQuickNotification('system')}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Send System Update
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable Push Notifications</h4>
                  <p className="text-sm text-gray-600">Allow sending push notifications to users</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto Flash Deal Notifications</h4>
                  <p className="text-sm text-gray-600">Automatically notify users about new flash deals</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Daily Notification Summary</h4>
                  <p className="text-sm text-gray-600">Send daily summary of new offers to users</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Admin Notification Alerts</h4>
                  <p className="text-sm text-gray-600">Receive alerts when notifications are sent</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="w-5 h-5" />
                <span>Recent Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">Flash Deal Alert</p>
                      <p className="text-xs text-gray-600">Sent 2 hours ago</p>
                    </div>
                  </div>
                  <Badge variant="outline">Delivered</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">Daily Deals Update</p>
                      <p className="text-xs text-gray-600">Sent 1 day ago</p>
                    </div>
                  </div>
                  <Badge variant="outline">Delivered</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">System Maintenance</p>
                      <p className="text-xs text-gray-600">Sent 3 days ago</p>
                    </div>
                  </div>
                  <Badge variant="outline">Delivered</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminNotificationManager;
