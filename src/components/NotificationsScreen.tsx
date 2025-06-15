
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Bell, Clock, Gift, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'offer' | 'expiry' | 'system' | 'preference';
  created_at: string;
  read: boolean;
}

type NotificationFilter = 'All' | 'Offers' | 'Expiring' | 'System';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('All');
  const [unreadCount, setUnreadCount] = useState(0);
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
  }, [session]);

  const loadNotifications = async () => {
    try {
      if (!session?.user) {
        // Show sample notifications for non-authenticated users
        const sampleNotifications = [
          {
            id: '1',
            title: 'New Electronics Deals',
            message: 'Check out the latest electronics deals at Best Buy',
            type: 'offer' as const,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            read: false
          },
          {
            id: '2',
            title: 'Expiring Soon!',
            message: 'Your saved Nike discount expires in 24 hours',
            type: 'expiry' as const,
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            read: false
          },
          {
            id: '3',
            title: 'Welcome to OffersMonkey',
            message: 'Start discovering amazing deals around you',
            type: 'system' as const,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            read: true
          },
          {
            id: '4',
            title: '30% off at Amazon',
            message: 'Limited time offer on selected electronics',
            type: 'offer' as const,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            read: false
          },
          {
            id: '5',
            title: 'Profile Updated',
            message: 'Your profile information has been updated successfully',
            type: 'system' as const,
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            read: true
          }
        ];
        
        setNotifications(sampleNotifications);
        setUnreadCount(sampleNotifications.filter(n => !n.read).length);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading notifications:', error);
        throw error;
      }

      if (data && data.length > 0) {
        const formattedNotifications = data.map(item => ({
          id: item.id,
          title: item.title,
          message: item.message,
          type: item.type as 'offer' | 'expiry' | 'system' | 'preference',
          created_at: item.created_at,
          read: item.read || false
        }));
        
        setNotifications(formattedNotifications);
        setUnreadCount(formattedNotifications.filter(n => !n.read).length);
      } else {
        // Fallback to sample notifications if no data
        const sampleNotifications = [
          {
            id: '1',
            title: 'Welcome to OffersMonkey!',
            message: 'Get started by setting your preferences to see personalized offers.',
            type: 'system' as const,
            created_at: new Date().toISOString(),
            read: false
          },
          {
            id: '2',
            title: 'New Offers Available',
            message: 'We found new offers based on your preferences. Check them out!',
            type: 'preference' as const,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            read: false
          }
        ];
        
        setNotifications(sampleNotifications);
        setUnreadCount(sampleNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error in loadNotifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredNotifications = () => {
    switch (activeFilter) {
      case 'Offers':
        return notifications.filter(n => n.type === 'offer' || n.type === 'preference');
      case 'Expiring':
        return notifications.filter(n => n.type === 'expiry');
      case 'System':
        return notifications.filter(n => n.type === 'system');
      default:
        return notifications;
    }
  };

  const markAllAsRead = async () => {
    if (!session?.user) {
      // For demo purposes, just update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', session.user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive"
      });
    }
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'offer':
      case 'preference':
        return <Gift className="w-6 h-6 text-spring-green-600" />;
      case 'expiry':
        return <Clock className="w-6 h-6 text-orange-500" />;
      case 'system':
        return <Bell className="w-6 h-6 text-blue-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'offer':
      case 'preference':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-spring-green-100 text-spring-green-800">
            New Offer
          </span>
        );
      case 'expiry':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Expiring Soon
          </span>
        );
      case 'system':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            System
          </span>
        );
      default:
        return null;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const filterOptions: NotificationFilter[] = ['All', 'Offers', 'Expiring', 'System'];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-spring-green-600 text-white py-4 px-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/home" className="p-1 -ml-1">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Notifications</h1>
            </div>
            {unreadCount > 0 && (
              <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="secondary"
              size="sm"
              className="bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
            >
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-[76px] z-10 border-b">
        <div className="flex space-x-2 overflow-x-auto -mb-1">
          {filterOptions.map((filter) => (
            <Button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              variant={activeFilter === filter ? 'default' : 'outline'}
              size="sm"
              className={`whitespace-nowrap rounded-full px-4 ${
                activeFilter === filter
                  ? 'bg-spring-green-600 hover:bg-spring-green-700 text-white'
                  : 'text-gray-700'
              }`}
            >
              {filter}
            </Button>
          ))}
          
          <Button
            onClick={() => {
              setNotifications([]);
              setUnreadCount(0);
              toast({
                title: "Cleared",
                description: "All notifications have been cleared"
              });
            }}
            variant="ghost"
            size="sm"
            className="ml-auto text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spring-green-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`relative overflow-hidden transition-all duration-300 shadow-sm ${
                    notification.read ? 'bg-white' : 'bg-spring-green-50'
                  }`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    notification.read ? 'bg-gray-300' : 'bg-spring-green-500'
                  }`}></div>
                  
                  <button
                    onClick={() => dismissNotification(notification.id)}
                    className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors z-10"
                    aria-label="Dismiss notification"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-start space-x-4 p-4">
                    <div className={`flex-shrink-0 mt-1 p-2 rounded-full ${
                      notification.read ? 'bg-gray-100' : 'bg-spring-green-100'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-6">
                      <h3 className={`text-base font-semibold mb-1 ${
                        notification.read ? 'text-gray-600 font-medium' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h3>
                      
                      <p className={`text-sm mb-3 leading-snug ${
                        notification.read ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatTime(notification.created_at)}</span>
                        {getNotificationBadge(notification.type)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-16 px-4 bg-white rounded-xl shadow-sm border">
                <div className="inline-block bg-spring-green-100 p-4 rounded-full mb-4">
                  <Bell className="w-12 h-12 text-spring-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {activeFilter === 'All' ? 'No notifications yet' : `No ${activeFilter.toLowerCase()} notifications`}
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  {activeFilter === 'All' 
                    ? "We'll notify you when there are new offers and updates. Stay tuned!"
                    : `Check back later for new ${activeFilter.toLowerCase()} notifications.`
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsScreen;
