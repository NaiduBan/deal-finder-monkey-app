
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Moon, Globe, Bell, Shield, Smartphone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const SettingsScreen = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    darkMode: false,
    language: 'english',
    pushNotifications: true,
    locationSharing: true,
    dataUsage: 'wifi-only',
  });

  const handleSettingChange = <T extends keyof typeof settings>(
    key: T,
    value: typeof settings[T]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    
    // Show toast notification
    toast({
      title: "Setting updated",
      description: `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} has been updated`,
    });
  };
  
  return (
    <div className="pb-16 bg-monkeyBackground min-h-screen">
      {/* Header */}
      <div className="bg-monkeyGreen text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/profile">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold">Settings</h1>
        <div className="w-6"></div> {/* For alignment */}
      </div>
      
      {/* Settings sections */}
      <div className="m-4 space-y-6">
        {/* Display settings */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Display</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Moon className="w-5 h-5 mr-3 text-monkeyGreen" />
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-gray-600">Use darker colors for night viewing</p>
                </div>
              </div>
              <Switch 
                checked={settings.darkMode} 
                onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                className="data-[state=checked]:bg-monkeyGreen" 
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-3 text-monkeyGreen" />
                <p className="font-medium">Language</p>
              </div>
              <Select 
                value={settings.language}
                onValueChange={(value) => handleSettingChange('language', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Notification settings */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Bell className="w-5 h-5 mr-3 text-monkeyGreen" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive notifications about new offers</p>
                </div>
              </div>
              <Switch 
                checked={settings.pushNotifications} 
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                className="data-[state=checked]:bg-monkeyGreen" 
              />
            </div>
          </div>
        </div>
        
        {/* Privacy settings */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-monkeyGreen" /> 
            Privacy
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Location Sharing</p>
                <p className="text-sm text-gray-600">Allow app to access your location</p>
              </div>
              <Switch 
                checked={settings.locationSharing} 
                onCheckedChange={(checked) => handleSettingChange('locationSharing', checked)}
                className="data-[state=checked]:bg-monkeyGreen" 
              />
            </div>
          </div>
        </div>
        
        {/* Data usage settings */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-monkeyGreen" /> 
            Data Usage
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Download Images</p>
                <p className="text-sm text-gray-600">When to download offer images</p>
              </div>
              <Select 
                value={settings.dataUsage}
                onValueChange={(value) => handleSettingChange('dataUsage', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">Always</SelectItem>
                  <SelectItem value="wifi-only">Wi-Fi Only</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* App info */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">About</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Version</p>
              <p>1.0.0</p>
            </div>
            <Separator />
            <Link to="/terms" className="block py-2 text-monkeyGreen">
              Terms and Conditions
            </Link>
            <Separator />
            <Link to="/privacy" className="block py-2 text-monkeyGreen">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
