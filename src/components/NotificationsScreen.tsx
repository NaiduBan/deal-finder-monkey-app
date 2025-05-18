
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Bell, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  type: 'offer' | 'expiry' | 'system';
}

const NotificationsScreen = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif1',
      title: 'New Electronics Deals',
      description: 'Check out the latest electronics deals at Best Buy',
      time: '2 hours ago',
      isRead: false,
      type: 'offer'
    },
    {
      id: 'notif2',
      title: 'Expiring Soon!',
      description: 'Your saved Nike discount expires in 24 hours',
      time: '5 hours ago',
      isRead: false,
      type: 'expiry'
    },
    {
      id: 'notif3',
      title: 'Welcome to OffersMonkey',
      description: 'Start discovering amazing deals around you',
      time: '1 day ago',
      isRead: true,
      type: 'system'
    },
    {
      id: 'notif4',
      title: '30% Off at Amazon',
      description: 'Limited time offer on selected electronics',
      time: '2 days ago',
      isRead: true,
      type: 'offer'
    },
    {
      id: 'notif5',
      title: 'Profile Updated',
      description: 'Your profile information has been updated successfully',
      time: '3 days ago',
      isRead: true,
      type: 'system'
    }
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast({
      title: "Notification deleted",
      description: "The notification has been removed",
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    toast({
      title: "All notifications read",
      description: "All notifications have been marked as read",
    });
  };

  const clearAll = () => {
    setNotifications([]);
    toast({
      title: "Notifications cleared",
      description: "All notifications have been removed",
    });
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notif => notif.type === activeTab);
  
  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <div className="pb-16 bg-monkeyBackground min-h-screen">
      {/* Header */}
      <div className="bg-monkeyGreen text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/home">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div className="flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          <h1 className="text-xl font-semibold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-monkeyYellow text-black">{unreadCount}</Badge>
          )}
        </div>
        <button 
          onClick={markAllAsRead}
          className="text-xs bg-monkeyYellow text-black px-2 py-1 rounded-full"
        >
          Mark all read
        </button>
      </div>
      
      {/* Notifications content */}
      <div className="p-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="offer">Offers</TabsTrigger>
              <TabsTrigger value="expiry">Expiring</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
            
            <button 
              onClick={clearAll}
              className="text-xs text-gray-500"
            >
              Clear All
            </button>
          </div>
          
          <TabsContent value={activeTab}>
            {filteredNotifications.length > 0 ? (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`relative border-l-4 ${
                      notification.isRead 
                        ? 'border-l-gray-200' 
                        : 'border-l-monkeyGreen bg-monkeyGreen/5'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <button 
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                      
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">{notification.time}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            notification.type === 'offer' 
                              ? 'bg-green-50 text-green-800 border-green-200' 
                              : notification.type === 'expiry' 
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {notification.type === 'offer' 
                            ? 'New Offer' 
                            : notification.type === 'expiry'
                            ? 'Expiring Soon'
                            : 'System'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-gray-500">No notifications</p>
                <p className="text-sm text-gray-400">You don't have any notifications at the moment</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationsScreen;
