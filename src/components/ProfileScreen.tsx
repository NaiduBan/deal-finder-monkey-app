import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, User, Mail, Phone, MapPin, Settings, Bookmark, Bell, Shield, LogOut, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ProfileScreen = () => {
  const { user } = useUser();
  const { session, signOut, userProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const profileStats = [
    {
      label: 'Saved Offers',
      value: user.savedOffers?.length || 0,
      icon: Bookmark,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  const menuItems = [
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Manage your notification preferences',
      link: '/notifications',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Settings,
      label: 'Preferences',
      description: 'Set your store, brand and category preferences',
      link: '/preferences/stores',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Shield,
      label: 'Privacy & Security',
      description: 'Manage your account security',
      link: '/settings',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="pb-16 bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <Link to="/home" className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-semibold">Profile</h1>
            <div className="w-8 h-8"></div>
          </div>
          
          {/* Profile Info */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">
                {userProfile?.name || user.name || 'User'}
              </h2>
              <p className="text-white/80 text-sm">
                {userProfile?.email || user.email || 'user@example.com'}
              </p>
              {session?.user && (
                <Badge className="mt-2 bg-white/20 text-white border-white/30">
                  Verified Member
                </Badge>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="text-white border-white/30 hover:bg-white/20 bg-transparent"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-green-200">
            <CardContent className="p-4 text-center">
              <Mail className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900 text-xs">
                {userProfile?.email || user.email || 'Not provided'}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-green-200">
            <CardContent className="p-4 text-center">
              <MapPin className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-medium text-gray-900 text-xs">
                {userProfile?.location || user.location || 'India'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Activity</h3>
          <div className="grid grid-cols-1 gap-3">
            {profileStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-full ${stat.bgColor}`}>
                          <IconComponent className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{stat.label}</p>
                          <p className="text-sm text-gray-600">Track your activity</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Menu Items */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Settings</h3>
          <div className="space-y-3">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Link key={index} to={item.link}>
                  <Card className="border-green-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-full ${item.bgColor}`}>
                          <IconComponent className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sign Out */}
        {session?.user && (
          <div className="pt-4">
            <Button 
              onClick={handleSignOut}
              disabled={isLoading}
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoading ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;
