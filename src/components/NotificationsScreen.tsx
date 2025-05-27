
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Bell, CheckCircle, Clock, Gift, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'offer' | 'expiry' | 'system' | 'preference';
  created_at: string;
  read: boolean;
}

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        if (!session?.user) {
          // Show sample notifications for non-authenticated users
          setNotifications([
            {
              id: '1',
              title: 'Welcome to OffersMonkey!',
              message: 'Get started by setting your preferences to see personalized offers.',
              type: 'system',
              created_at: new Date().toISOString(),
              read: false
            },
            {
              id: '2',
              title: 'New Travel Offers Available',
              message: 'Check out amazing flight deals with up to 40% off on domestic flights.',
              type: 'offer',
              created_at: new Date(Date.now() - 3600000).toISOString(),
              read: false
            },
            {
              id: '3',
              title: 'Fashion Sale Ending Soon',
              message: 'Your favorite fashion brands are having a sale. Don\'t miss out!',
              type: 'expiry',
              created_at: new Date(Date.now() - 7200000).toISOString(),
              read: true
            }
          ]);
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
        }

        if (!data || data.length === 0) {
          // Show sample notifications if no data
          setNotifications([
            {
              id: '1',
              title: 'Welcome to OffersMonkey!',
              message: 'Get started by setting your preferences to see personalized offers.',
              type: 'system',
              created_at: new Date().toISOString(),
              read: false
            },
            {
              id: '2',
              title: 'New Offers Available',
              message: 'We found new offers based on your preferences. Check them out!',
              type: 'preference',
              created_at: new Date(Date.now() - 3600000).toISOString(),
              read: false
            }
          ]);
        } else {
          setNotifications(data.map(item => ({
            id: item.id,
            title: item.title,
            message: item.message,
            type: item.type as 'offer' | 'expiry' | 'system' | 'preference',
            created_at: item.created_at,
            read: false // Add read status logic if needed
          })));
        }
      } catch (error) {
        console.error('Error in loadNotifications:', error);
        // Fallback to sample notifications
        setNotifications([
          {
            id: '1',
            title: 'Welcome to OffersMonkey!',
            message: 'Get started by exploring amazing offers and deals.',
            type: 'system',
            created_at: new Date().toISOString(),
            read: false
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [session]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'offer':
        return <Gift className="w-5 h-5 text-monkeyGreen" />;
      case 'expiry':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'system':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'preference':
        return <CheckCircle className="w-5 h-5 text-monkeyGreen" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-monkeyGreen text-white py-4 px-4 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Link to="/home" className="p-1">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-semibold">Notifications</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-monkeyGreen"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${
                    notification.read ? 'border-gray-300' : 'border-monkeyGreen'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${
                          notification.read ? 'text-gray-600' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      <p className={`mt-1 text-sm ${
                        notification.read ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                <p className="text-gray-500">
                  We'll notify you when there are new offers and updates.
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
