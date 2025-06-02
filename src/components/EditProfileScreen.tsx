
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, User, Mail, MapPin, Phone, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const EditProfileScreen = () => {
  const { userProfile, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    location: userProfile?.location || '',
    phone: userProfile?.phone || ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateProfile(formData);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      navigate('/profile');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen ${isMobile ? 'pb-16' : 'pt-20'} dark:from-gray-900 dark:to-gray-800`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className={`${isMobile ? 'p-4' : 'max-w-[1440px] mx-auto px-6 py-8'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/profile" className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <h1 className={`font-semibold ${isMobile ? 'text-xl' : 'text-3xl'}`}>Edit Profile</h1>
            </div>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-white/20 hover:bg-white/30 border-white/30"
              size={isMobile ? "default" : "lg"}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`space-y-6 ${isMobile ? 'p-4' : 'max-w-[1440px] mx-auto px-6 py-8'}`}>
        {/* Profile Picture Section */}
        <Card className="border-green-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-green-600" />
              <span>Profile Picture</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-green-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <Button variant="outline" className="mb-2">
                  Upload Photo
                </Button>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="border-green-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-green-600" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Full Name</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="border-green-200 focus:border-green-500 dark:border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className="border-green-200 focus:border-green-500 dark:border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Phone Number</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  className="border-green-200 focus:border-green-500 dark:border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Location</span>
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter your location"
                  className="border-green-200 focus:border-green-500 dark:border-gray-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button - Mobile */}
        {isMobile && (
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EditProfileScreen;
