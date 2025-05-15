
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, User, MapPin, Bell, Heart, Ticket, CreditCard, LogOut, ChevronRight, Settings } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { mockUser, mockOffers } from '@/mockData';

const ProfileScreen = () => {
  const { toast } = useToast();
  const [user, setUser] = useState(mockUser);
  const [notifications, setNotifications] = useState({
    offers: true,
    expiry: true,
    location: false,
  });
  
  const savedOffers = mockOffers.filter(offer => 
    user.savedOffers.includes(offer.id)
  );
  
  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => {
      const newSettings = { ...prev, [type]: !prev[type] };
      
      toast({
        title: `${type} notifications ${newSettings[type] ? 'enabled' : 'disabled'}`,
        description: `You will ${newSettings[type] ? 'now' : 'no longer'} receive ${type} notifications`,
      });
      
      return newSettings;
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
      <div className="bg-white p-6 flex items-center space-x-4 shadow-sm">
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
      </div>
      
      {/* Points card */}
      <div className="mx-4 mt-4 p-4 bg-monkeyGreen rounded-xl text-white flex justify-between items-center">
        <div>
          <p className="text-sm opacity-90">Loyalty Points</p>
          <p className="text-2xl font-bold">{user.points} pts</p>
        </div>
        <Link 
          to="/points" 
          className="bg-monkeyYellow text-black px-3 py-1 rounded-full text-sm font-semibold"
        >
          Redeem
        </Link>
      </div>
      
      {/* Saved offers */}
      <div className="m-4 bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-2 flex items-center">
          <Heart className="w-5 h-5 mr-2 text-monkeyGreen" /> 
          Saved Offers
        </h3>
        
        {savedOffers.length > 0 ? (
          <div className="space-y-3">
            {savedOffers.map(offer => (
              <Link key={offer.id} to={`/offer/${offer.id}`} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                <img src={offer.imageUrl} alt={offer.title} className="w-12 h-12 object-cover rounded-md mr-3" />
                <div className="flex-1">
                  <p className="font-medium">{offer.title}</p>
                  <p className="text-sm text-gray-600">{offer.store}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No saved offers yet</p>
        )}
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
      
      {/* Preferences */}
      <div className="m-4 bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-2">Preferences</h3>
        
        <Link to="/preferences/brands" className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
          <span>Favorite Brands</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>
        
        <Link to="/preferences/stores" className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
          <span>Preferred Stores</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>
        
        <Link to="/preferences/banks" className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
          <span>Bank Offers</span>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">{user.preferences.banks.length} selected</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>
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
