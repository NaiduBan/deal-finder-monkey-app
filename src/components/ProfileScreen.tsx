import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, User, Mail, MapPin, Settings, Bookmark, Bell, Shield, LogOut, Edit2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import EditProfile from './EditProfile';
import DarkModeToggle from './DarkModeToggle';

const ProfileScreen = () => {
  const { user } = useUser();
  const { session, signOut, userProfile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const menuItems = [
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Manage your notification preferences',
      link: '/notifications',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/50'
    },
    {
      icon: Settings,
      label: 'Preferences',
      description: 'Set your store, brand and category preferences',
      link: '/preferences',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/50'
    },
    {
      icon: Shield,
      label: 'Privacy & Security',
      description: 'Manage your account security',
      link: '/settings',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/50'
    }
  ];

  const quickInfoItems = [
    {
      icon: Mail,
      label: 'Email',
      value: userProfile?.email || user.email || 'Not provided',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/50'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: userProfile?.location || user.location || 'India',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/50'
    },
    {
      icon: Bookmark,
      label: 'Saved Offers',
      value: user.savedOffers?.length || 0,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-100 dark:bg-rose-900/50',
      desktopOnly: true
    }
  ]

  const userName = userProfile?.name || user.name || 'User';
  const userEmail = userProfile?.email || user.email || 'user@example.com';
  const userInitials = userName.split(' ').map(name => name[0]).join('').toUpperCase();

  return (
    <div className={`bg-gray-50 dark:bg-gray-900 min-h-screen ${isMobile ? 'pb-16' : ''}`}>
      {/* Header */}
      <div className={`${isMobile ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 dark:from-green-600 dark:via-emerald-600 dark:to-teal-700 text-white relative overflow-hidden' : 'bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50'}`}>
        <div className={`${isMobile ? 'relative z-10 px-4 py-6' : 'max-w-7xl mx-auto px-6 py-16'}`}>
          {isMobile ? (
             <>
              <div className="absolute inset-0 bg-black/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              </div>
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <Link to="/home" className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors">
                  <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-lg font-semibold">My Profile</h1>
                <DarkModeToggle />
              </div>
              
              <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                <Avatar className="w-24 h-24 border-4 border-white/20 shadow-lg">
                  <AvatarFallback className="bg-white/20 text-white text-2xl font-bold backdrop-blur-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">{userName}</h2>
                  <p className="text-white/80 text-sm">{userEmail}</p>
                  {session?.user && (
                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 px-3 py-1">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                
                <Button 
                  variant="secondary" 
                  onClick={() => setIsEditModalOpen(true)} 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm mt-4"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-8">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-900 shadow-lg">
                <User className="w-16 h-16 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-1">{userName}</h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">{userEmail}</p>
                {session?.user && <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800 px-3 py-1 text-sm font-medium">Verified Member</Badge>}
              </div>
              <div className="flex items-center space-x-4">
                 <DarkModeToggle />
                 <Button size="lg" onClick={() => setIsEditModalOpen(true)}>
                   <Edit2 className="w-5 h-5 mr-2" />
                   Edit Profile
                 </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`${isMobile ? 'p-4 space-y-6 -mt-4' : 'max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats Card for Mobile */}
            {isMobile && (
              <Card className="dark:bg-gray-800/50 shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {user.savedOffers?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Saved</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {session?.user ? '✓' : '–'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Verified</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {userProfile?.location ? '📍' : '–'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="dark:bg-gray-800/50 shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} flex items-center gap-2`}>
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickInfoItems.map((item, index) => {
                  if (item.desktopOnly && isMobile) return null;
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                      <div className={`rounded-full p-2 ${item.bgColor}`}>
                        <IconComponent className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.label}</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {!isMobile && session?.user && (
              <Card className="dark:bg-gray-800/50">
                <CardHeader><CardTitle className="text-xl">Sign Out</CardTitle></CardHeader>
                <CardContent>
                  <Button onClick={handleSignOut} disabled={isLoading} variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20">
                    <LogOut className="w-4 h-4 mr-2" />
                    {isLoading ? 'Signing out...' : 'Sign Out'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            <Card className="dark:bg-gray-800/50 shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} flex items-center gap-2`}>
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  Settings & Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {menuItems.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <Link key={index} to={item.link} className="block group">
                        <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                          <div className={`rounded-xl p-3 ${item.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                            <IconComponent className={`w-5 h-5 ${item.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{item.label}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.description}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {isMobile && session?.user && (
            <div className="pt-2">
              <Button 
                onClick={handleSignOut} 
                disabled={isLoading} 
                variant="outline" 
                size="lg" 
                className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 bg-white/80 backdrop-blur-sm"
              >
                <LogOut className="w-5 h-5 mr-2" />
                {isLoading ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <EditProfile 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </div>
  );
};

export default ProfileScreen;
