
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit3, Save, X, User, Mail, MapPin, Phone, Calendar, LogOut } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useToast } from "@/hooks/use-toast";

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut, updateProfile } = useAuth();
  const { user: userContext } = useUser();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
    location: userProfile?.location || ''
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: userProfile?.name || '',
      phone: userProfile?.phone || '',
      location: userProfile?.location || ''
    });
  };

  const handleSave = async () => {
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: userProfile?.name || '',
      phone: userProfile?.phone || '',
      location: userProfile?.location || ''
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-semibold">Profile</h1>
          </div>
          
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="w-6 h-6" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24 border-4 border-green-200">
                <AvatarImage src={userProfile?.avatar_url} />
                <AvatarFallback className="bg-green-100 text-green-700 text-2xl font-bold">
                  {getInitials(userProfile?.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <CardTitle className="text-2xl text-gray-800">
                  {userProfile?.name || 'Guest User'}
                </CardTitle>
                <CardDescription className="text-lg">
                  {userProfile?.email || 'No email provided'}
                </CardDescription>
                {user && (
                  <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                    Verified Account
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Account Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{userContext.points || 0}</div>
                <div className="text-sm text-blue-700">Points Earned</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{userContext.savedOffers?.length || 0}</div>
                <div className="text-sm text-purple-700">Saved Offers</div>
              </div>
            </div>
            
            <Separator />
            
            {/* Profile Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                {user && !isEditing && (
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                {isEditing && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="w-4 h-4" />
                    </Button>
                    <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {/* Name */}
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <Label className="text-sm text-gray-600">Full Name</Label>
                    {isEditing ? (
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1"
                        placeholder="Enter your name"
                      />
                    ) : (
                      <div className="text-gray-800 font-medium">
                        {userProfile?.name || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Email */}
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <Label className="text-sm text-gray-600">Email Address</Label>
                    <div className="text-gray-800 font-medium">
                      {userProfile?.email || 'Not provided'}
                    </div>
                  </div>
                </div>
                
                {/* Phone */}
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <Label className="text-sm text-gray-600">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        value={editData.phone}
                        onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1"
                        placeholder="Enter your phone number"
                        type="tel"
                      />
                    ) : (
                      <div className="text-gray-800 font-medium">
                        {userProfile?.phone || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Location */}
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <Label className="text-sm text-gray-600">Location</Label>
                    {isEditing ? (
                      <Input
                        value={editData.location}
                        onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                        className="mt-1"
                        placeholder="Enter your location"
                      />
                    ) : (
                      <div className="text-gray-800 font-medium">
                        {userProfile?.location || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Member Since */}
                {userProfile?.created_at && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <Label className="text-sm text-gray-600">Member Since</Label>
                      <div className="text-gray-800 font-medium">
                        {formatDate(userProfile.created_at)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start h-12"
              onClick={() => navigate('/saved')}
            >
              <span className="text-2xl mr-3">💾</span>
              View Saved Offers
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-12"
              onClick={() => navigate('/preferences')}
            >
              <span className="text-2xl mr-3">⚙️</span>
              Manage Preferences
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-12"
              onClick={() => navigate('/points')}
            >
              <span className="text-2xl mr-3">🏆</span>
              Points History
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-12"
              onClick={() => navigate('/settings')}
            >
              <span className="text-2xl mr-3">🔧</span>
              Settings
            </Button>
          </CardContent>
        </Card>

        {/* Authentication Prompt for Guests */}
        {!user && (
          <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Sign in for Better Experience
              </h3>
              <p className="text-gray-600 mb-4">
                Create an account to save your preferences, earn points, and get personalized offers.
              </p>
              <Button 
                onClick={() => navigate('/login')}
                className="bg-green-600 hover:bg-green-700"
              >
                Sign In / Sign Up
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;
