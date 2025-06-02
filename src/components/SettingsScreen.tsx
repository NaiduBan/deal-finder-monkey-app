
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Moon, Globe, Bell, Shield, Smartphone, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useTheme } from './ThemeProvider';

const SettingsScreen = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
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
    
    toast({
      title: "Setting updated",
      description: `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} has been updated`,
    });
  };

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
    toast({
      title: "Theme updated",
      description: `Switched to ${checked ? 'dark' : 'light'} mode`,
    });
  };
  
  return (
    <div className="pb-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-green-600 dark:bg-green-700 text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/profile">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold">Settings</h1>
        <div className="w-6"></div>
      </div>
      
      {/* Settings sections */}
      <div className="m-4 space-y-6">
        {/* Display settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">Display</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
                ) : (
                  <Moon className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Use darker colors for night viewing</p>
                </div>
              </div>
              <Switch 
                checked={theme === 'dark'} 
                onCheckedChange={handleThemeToggle}
                className="data-[state=checked]:bg-green-600" 
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
                <p className="font-medium text-gray-900 dark:text-gray-100">Language</p>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Bell className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Push Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Receive notifications about new offers</p>
                </div>
              </div>
              <Switch 
                checked={settings.pushNotifications} 
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                className="data-[state=checked]:bg-green-600" 
              />
            </div>
          </div>
        </div>
        
        {/* Privacy settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-900 dark:text-gray-100">
            <Shield className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" /> 
            Privacy
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Location Sharing</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Allow app to access your location</p>
              </div>
              <Switch 
                checked={settings.locationSharing} 
                onCheckedChange={(checked) => handleSettingChange('locationSharing', checked)}
                className="data-[state=checked]:bg-green-600" 
              />
            </div>
          </div>
        </div>
        
        {/* Data usage settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-900 dark:text-gray-100">
            <Smartphone className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" /> 
            Data Usage
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Download Images</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">When to download offer images</p>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">About</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-gray-600 dark:text-gray-300">Version</p>
              <p className="text-gray-900 dark:text-gray-100">1.0.0</p>
            </div>
            <Separator />
            <Link to="/terms" className="block py-2 text-green-600 dark:text-green-400">
              Terms and Conditions
            </Link>
            <Separator />
            <Link to="/privacy" className="block py-2 text-green-600 dark:text-green-400">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
