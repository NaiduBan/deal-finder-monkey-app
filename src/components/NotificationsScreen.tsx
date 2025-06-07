
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Bell, CheckCircle, Clock, Gift, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
        return <Gift className="w-5 h-5 text-monkeyGreen" />;
      case 'expiry':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'system':
        return <Bell className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'offer':
      case 'preference':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-monkeyGreen text-white">
            New Offer
          </span>
        );
      case 'expiry':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500 text-white">
            Expiring Soon
          </span>
        );
      case 'system':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
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
      <div className="bg-monkeyGreen text-white py-4 px-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/home" className="p-1">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <Bell className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-monkeyYellow text-black text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-monkeyYellow text-black px-3 py-1.5 rounded-full text-sm font-medium hover:bg-yellow-400 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white px-4 py-3 shadow-sm">
        <div className="flex space-x-1 overflow-x-auto">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-monkeyGreen text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
          
          <button
            onClick={() => {
              setNotifications([]);
              setUnreadCount(0);
              toast({
                title: "Cleared",
                description: "All notifications have been cleared"
              });
            }}
            className="ml-auto px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-monkeyGreen"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl p-4 shadow-sm border-l-4 relative ${
                    notification.read ? 'border-gray-300' : 'border-monkeyGreen'
                  }`}
                >
                  {/* Dismiss Button */}
                  <button
                    onClick={() => dismissNotification(notification.id)}
                    className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-start space-x-3 pr-8">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`text-sm font-semibold ${
                          notification.read ? 'text-gray-600' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h3>
                      </div>
                      
                      <p className={`text-sm mb-3 leading-relaxed ${
                        notification.read ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.created_at)}
                        </span>
                        
                        {getNotificationBadge(notification.type)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeFilter === 'All' ? 'No notifications yet' : `No ${activeFilter.toLowerCase()} notifications`}
                </h3>
                <p className="text-gray-500">
                  {activeFilter === 'All' 
                    ? "We'll notify you when there are new offers and updates."
                    : `No ${activeFilter.toLowerCase()} notifications to show.`
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
