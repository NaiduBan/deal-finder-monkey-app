
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Bell, X, Tag, Clock, AlertCircle, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'offer' | 'expiry' | 'system' | 'preference';
  is_read: boolean;
  offer_id?: string;
  created_at: string;
}

const NotificationsScreen = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications from database
  useEffect(() => {
    const loadNotifications = async () => {
      if (!session?.user) {
        // Load sample notifications for non-authenticated users
        setNotifications([
          {
            id: 'sample1',
            title: 'Welcome to OffersMonkey',
            message: 'Start discovering amazing deals around you',
            type: 'system',
            is_read: false,
            created_at: new Date().toISOString()
          }
        ]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .or(`user_id.eq.${session.user.id},user_id.is.null`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setNotifications(data || []);
      } catch (error) {
        console.error('Error loading notifications:', error);
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [session, toast]);

  // Real-time subscription for notifications
  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('New notification:', payload);
          setNotifications(prev => [payload.new as Notification, ...prev]);
          
          // Show toast for new notification
          toast({
            title: payload.new.title,
            description: payload.new.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, toast]);

  const markAsRead = async (id: string) => {
    if (!session?.user) {
      // For non-authenticated users, just update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!session?.user) {
      // For non-authenticated users, just update local state
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      toast({
        title: "Notification deleted",
        description: "The notification has been removed",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      setNotifications(prev => prev.filter(notif => notif.id !== id));
      toast({
        title: "Notification deleted",
        description: "The notification has been removed",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    if (!session?.user) {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      toast({
        title: "All notifications read",
        description: "All notifications have been marked as read",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      toast({
        title: "All notifications read",
        description: "All notifications have been marked as read",
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        variant: "destructive"
      });
    }
  };

  const clearAll = async () => {
    if (!session?.user) {
      setNotifications([]);
      toast({
        title: "Notifications cleared",
        description: "All notifications have been removed",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', session.user.id);

      if (error) throw error;

      setNotifications([]);
      toast({
        title: "Notifications cleared",
        description: "All notifications have been removed",
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast({
        title: "Error",
        description: "Failed to clear notifications",
        variant: "destructive"
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'offer':
        return <Gift className="w-5 h-5 text-green-600" />;
      case 'expiry':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'preference':
        return <Tag className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notif => notif.type === activeTab);
  
  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="pb-16 bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-lg">
        <Link to="/home" className="p-2 hover:bg-white/20 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div className="flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          <h1 className="text-xl font-semibold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-white text-green-600">{unreadCount}</Badge>
          )}
        </div>
        <button 
          onClick={markAllAsRead}
          className="text-xs bg-white text-green-600 px-3 py-1.5 rounded-full font-medium hover:bg-green-50 transition-colors"
        >
          Mark all read
        </button>
      </div>
      
      {/* Notifications content */}
      <div className="p-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-white shadow-sm">
              <TabsTrigger value="all" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">All</TabsTrigger>
              <TabsTrigger value="offer" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">Offers</TabsTrigger>
              <TabsTrigger value="expiry" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">Expiring</TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">System</TabsTrigger>
            </TabsList>
            
            <button 
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear All
            </button>
          </div>
          
          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`relative border-l-4 transition-all hover:shadow-md ${
                      notification.is_read 
                        ? 'border-l-gray-200 bg-white' 
                        : 'border-l-green-500 bg-green-50/50'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <button 
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                      
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-xs text-gray-500">{formatTime(notification.created_at)}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                notification.type === 'offer' 
                                  ? 'bg-green-50 text-green-800 border-green-200' 
                                  : notification.type === 'expiry' 
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : notification.type === 'preference'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-gray-50 text-gray-800 border-gray-200'
                              }`}
                            >
                              {notification.type === 'offer' 
                                ? 'New Offer' 
                                : notification.type === 'expiry'
                                ? 'Expiring Soon'
                                : notification.type === 'preference'
                                ? 'Preference Match'
                                : 'System'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Bell className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">You don't have any notifications at the moment</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationsScreen;
