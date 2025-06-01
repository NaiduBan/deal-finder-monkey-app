
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, User, Mail, Phone, MapPin, Settings, Bookmark, Bell, Shield, LogOut, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import DarkModeToggle from '@/components/DarkModeToggle';

const ProfileScreen = () => {
  const { user } = useUser();
  const { session, signOut, userProfile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
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
    <div className={`bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 min-h-screen ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white py-8 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <Link to="/home" className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-xl font-semibold">Profile</h1>
              <div className="flex items-center space-x-2">
                <DarkModeToggle />
                <Link to="/settings" className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <Settings className="w-5 h-5" />
                </Link>
              </div>
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
              <Link to="/edit-profile">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-white border-white/30 hover:bg-white/20 bg-transparent"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white">
          <div className="max-w-[1440px] mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-6">
                <Link to="/home" className="p-3 hover:bg-white/20 rounded-full transition-colors">
                  <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                  <h1 className="text-4xl font-bold text-white">Profile</h1>
                  <p className="text-white/80 text-lg mt-2">Manage your account and preferences</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <DarkModeToggle />
                <Link to="/settings" className="p-3 hover:bg-white/20 rounded-full transition-colors">
                  <Settings className="w-6 h-6" />
                </Link>
              </div>
            </div>
            
            {/* Desktop Profile Info */}
            <div className="flex items-center space-x-8">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {userProfile?.name || user.name || 'User'}
                </h2>
                <p className="text-white/80 text-lg mb-4">
                  {userProfile?.email || user.email || 'user@example.com'}
                </p>
                {session?.user && (
                  <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm">
                    Verified Member
                  </Badge>
                )}
              </div>
              <Link to="/edit-profile">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-white border-white/30 hover:bg-white/20 bg-transparent"
                >
                  <Edit2 className="w-5 h-5 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`space-y-8 ${isMobile ? 'p-4' : 'w-full'}`}>
        <div className={`${!isMobile ? 'max-w-[1440px] mx-auto px-6 py-8' : ''}`}>
          {/* Quick Info */}
          <div className={`grid gap-6 mb-8 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
            <Card className="border-green-200 dark:border-green-700 dark:bg-gray-800">
              <CardContent className={`text-center ${isMobile ? 'p-4' : 'p-6'}`}>
                <Mail className={`text-green-600 dark:text-green-400 mx-auto mb-3 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
                <p className={`text-gray-600 dark:text-gray-300 mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>Email</p>
                <p className={`font-medium text-gray-900 dark:text-gray-100 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {userProfile?.email || user.email || 'Not provided'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 dark:border-green-700 dark:bg-gray-800">
              <CardContent className={`text-center ${isMobile ? 'p-4' : 'p-6'}`}>
                <MapPin className={`text-green-600 dark:text-green-400 mx-auto mb-3 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
                <p className={`text-gray-600 dark:text-gray-300 mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>Location</p>
                <p className={`font-medium text-gray-900 dark:text-gray-100 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {userProfile?.location || user.location || 'India'}
                </p>
              </CardContent>
            </Card>

            {!isMobile && (
              <>
                <Card className="border-green-200 dark:border-green-700 dark:bg-gray-800">
                  <CardContent className="p-6 text-center">
                    <Bookmark className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-300 mb-2">Saved Offers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {user.savedOffers?.length || 0}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-green-200 dark:border-green-700 dark:bg-gray-800">
                  <CardContent className="p-6 text-center">
                    <Shield className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-300 mb-2">Member Since</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      Dec 2024
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Stats - Mobile only */}
          {isMobile && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Your Activity</h3>
              <div className="grid grid-cols-1 gap-3">
                {profileStats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <Card key={index} className="border-green-200 dark:border-green-700 dark:bg-gray-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-3 rounded-full ${stat.bgColor}`}>
                              <IconComponent className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">{stat.label}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">Track your activity</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div>
            <h3 className={`font-semibold text-gray-900 dark:text-gray-100 mb-6 ${isMobile ? 'text-lg' : 'text-2xl'}`}>Settings & Preferences</h3>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Link key={index} to={item.link}>
                    <Card className="border-green-200 dark:border-green-700 dark:bg-gray-800 hover:shadow-lg transition-all duration-200 hover:border-green-300">
                      <CardContent className={isMobile ? 'p-4' : 'p-6'}>
                        <div className="flex items-center space-x-4">
                          <div className={`rounded-full ${item.bgColor} ${isMobile ? 'p-3' : 'p-4'}`}>
                            <IconComponent className={`${item.color} ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold text-gray-900 dark:text-gray-100 ${isMobile ? 'text-base' : 'text-lg'}`}>{item.label}</p>
                            <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-sm' : 'text-base'}`}>{item.description}</p>
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
            <div className="pt-8">
              <Button 
                onClick={handleSignOut}
                disabled={isLoading}
                variant="outline"
                size={isMobile ? "default" : "lg"}
                className={`text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950 ${isMobile ? 'w-full' : 'w-auto px-8'}`}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLoading ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
