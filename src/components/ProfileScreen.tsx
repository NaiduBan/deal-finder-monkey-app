
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, Heart, Bell, Award, LogOut, Edit, Camera, MapPin, Phone, Mail, Calendar, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const ProfileScreen = () => {
  const { session, signOut } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading profile:', error);
        } else {
          setProfileData(data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [session]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    {
      icon: Settings,
      title: 'Settings',
      subtitle: 'Manage your account',
      link: '/settings',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Heart,
      title: 'Saved Offers',
      subtitle: `${user.savedOffers?.length || 0} saved offers`,
      link: '/saved',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Manage notifications',
      link: '/notifications',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: Award,
      title: 'Points History',
      subtitle: 'View your rewards',
      link: '/points',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  if (isLoading) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen ${isMobile ? 'pb-16' : 'pt-20'} flex items-center justify-center`}>
        <div className={`animate-spin rounded-full border-4 border-blue-500 border-t-transparent ${isMobile ? 'h-12 w-12' : 'h-16 w-16'}`}></div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white sticky top-0 z-10 shadow-lg">
        <div className={`${isMobile ? 'py-8 px-4' : 'py-12 px-6 max-w-7xl mx-auto'}`}>
          <div className={`flex items-center space-x-4 ${isMobile ? '' : 'justify-center'}`}>
            <div className="relative">
              <Avatar className={isMobile ? 'h-20 w-20' : 'h-32 w-32'}>
                <AvatarImage src={profileData?.avatar_url || user.avatar} />
                <AvatarFallback className="text-white bg-white/20 text-2xl font-bold">
                  {getInitials(profileData?.name || user.name || user.email || 'U')}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 bg-white text-blue-600 hover:bg-gray-100"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h1 className={`font-bold text-white ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
                {profileData?.name || user.name || 'User'}
              </h1>
              <p className={`text-blue-100 ${isMobile ? 'text-sm' : 'text-lg'} flex items-center mt-1`}>
                <Mail className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                {profileData?.email || user.email}
              </p>
              {profileData?.phone && (
                <p className={`text-blue-100 ${isMobile ? 'text-sm' : 'text-base'} flex items-center mt-1`}>
                  <Phone className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  {profileData.phone}
                </p>
              )}
              {profileData?.location && (
                <p className={`text-blue-100 ${isMobile ? 'text-sm' : 'text-base'} flex items-center mt-1`}>
                  <MapPin className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  {profileData.location}
                </p>
              )}
            </div>
            {!isMobile && (
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="text-white border-white/30 hover:bg-white/20 bg-transparent"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`space-y-6 ${isMobile ? 'p-4' : 'p-8 max-w-7xl mx-auto'}`}>
        {/* Additional Info Cards */}
        {(profileData?.occupation || profileData?.company || profileData?.date_of_birth) && (
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {profileData?.occupation && (
              <Card className="border-blue-200">
                <CardContent className={isMobile ? 'p-4' : 'p-6'}>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Occupation</p>
                      <p className="font-semibold text-gray-900">{profileData.occupation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {profileData?.company && (
              <Card className="border-blue-200">
                <CardContent className={isMobile ? 'p-4' : 'p-6'}>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Briefcase className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Company</p>
                      <p className="font-semibold text-gray-900">{profileData.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {profileData?.date_of_birth && (
              <Card className="border-blue-200">
                <CardContent className={isMobile ? 'p-4' : 'p-6'}>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(profileData.date_of_birth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Menu Items */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link key={item.title} to={item.link}>
                <Card className="hover:shadow-md transition-shadow border-gray-200 hover:border-blue-300">
                  <CardContent className={isMobile ? 'p-6' : 'p-8'}>
                    <div className="flex items-center space-x-4">
                      <div className={`p-4 rounded-lg ${item.bgColor}`}>
                        <IconComponent className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} ${item.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                          {item.title}
                        </h3>
                        <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Sign Out Button for Mobile */}
        {isMobile && (
          <Card className="border-red-200">
            <CardContent className="p-6">
              <Button
                variant="destructive"
                onClick={handleSignOut}
                className="w-full"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;
