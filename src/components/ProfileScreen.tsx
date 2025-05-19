
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, User, MapPin, Bell, Settings, Edit, ChevronRight, LogOut } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';

const ProfileScreen = () => {
  const { toast } = useToast();
  const { user, updatePoints } = useUser();
  const [notifications, setNotifications] = useState({
    offers: true,
    expiry: true,
    location: false,
  });
  
  // Profile edit state
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState(user.phone);
  const [profileLocation, setProfileLocation] = useState(user.location);
  
  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => {
      const newSettings = { ...prev, [type]: !prev[type] };
      
      // Give points for enabling notifications
      if (newSettings[type] && !prev[type]) {
        updatePoints(10);
        
        toast({
          title: `${type} notifications enabled`,
          description: `You received 10 points for enabling ${type} notifications!`,
        });
      } else {
        toast({
          title: `${type} notifications ${newSettings[type] ? 'enabled' : 'disabled'}`,
          description: `You will ${newSettings[type] ? 'now' : 'no longer'} receive ${type} notifications`,
        });
      }
      
      return newSettings;
    });
  };
  
  const handleProfileUpdate = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated",
    });
  };
  
  const handleLocationUpdate = () => {
    toast({
      title: "Location updated",
      description: "Your location has been updated",
    });
  };
  
  const handleLogout = () => {
    toast({
      title: 'Logged out successfully',
      description: 'You have been logged out of your account',
    });
    // In a real app, this would navigate to login and clear user session
  };

  return (
    <div className="pb-16 bg-monkeyBackground min-h-screen">
      {/* Header */}
      <div className="bg-monkeyGreen text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/home">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold">My Profile</h1>
        <Link to="/settings">
          <Settings className="w-6 h-6" />
        </Link>
      </div>
      
      {/* Profile info */}
      <div className="bg-white p-6 flex items-center space-x-4 shadow-sm relative">
        <div className="bg-monkeyGreen/10 rounded-full p-3">
          <User className="w-12 h-12 text-monkeyGreen" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-600">{user.phone}</p>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <MapPin className="w-3 h-3 mr-1" />
            {user.location}
          </div>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <button className="absolute top-4 right-4 p-2 rounded-full bg-gray-100">
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium leading-none">Name</label>
                <Input 
                  id="name" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium leading-none">Phone</label>
                <Input 
                  id="phone" 
                  value={profilePhone} 
                  onChange={(e) => setProfilePhone(e.target.value)} 
                />
              </div>
              <Button onClick={handleProfileUpdate} className="w-full bg-monkeyGreen hover:bg-monkeyGreen/90">Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Location Edit */}
      <div className="m-4 bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-2 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-monkeyGreen" /> 
          Location
        </h3>
        
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <span>{user.location}</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Location</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium leading-none">Location</label>
                <Input 
                  id="location" 
                  value={profileLocation} 
                  onChange={(e) => setProfileLocation(e.target.value)} 
                  placeholder="Enter your city, state"
                />
              </div>
              <Button onClick={handleLocationUpdate} className="w-full bg-monkeyGreen hover:bg-monkeyGreen/90">Update Location</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Notification settings */}
      <div className="m-4 bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-2 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-monkeyGreen" /> 
          Notification Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">New Offers</p>
              <p className="text-sm text-gray-600">Get notified about new deals</p>
            </div>
            <Switch 
              checked={notifications.offers} 
              onCheckedChange={() => handleNotificationChange('offers')}
              className="data-[state=checked]:bg-monkeyGreen" 
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Expiring Offers</p>
              <p className="text-sm text-gray-600">Reminders for offers about to expire</p>
            </div>
            <Switch 
              checked={notifications.expiry} 
              onCheckedChange={() => handleNotificationChange('expiry')}
              className="data-[state=checked]:bg-monkeyGreen" 
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Location-based Alerts</p>
              <p className="text-sm text-gray-600">Alerts when near offer locations</p>
            </div>
            <Switch 
              checked={notifications.location} 
              onCheckedChange={() => handleNotificationChange('location')}
              className="data-[state=checked]:bg-monkeyGreen" 
            />
          </div>
        </div>
      </div>
      
      {/* Logout button */}
      <div className="m-4">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 py-3 text-red-500 bg-white rounded-xl shadow-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;
