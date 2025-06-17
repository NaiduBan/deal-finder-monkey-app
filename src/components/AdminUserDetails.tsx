
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Activity,
  Heart,
  ShoppingBag,
  MessageSquare,
  TrendingUp,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface UserDetailsProps {
  userId: string;
  onClose: () => void;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  location?: string;
  gender?: string;
  occupation?: string;
  company?: string;
  bio?: string;
  created_at: string;
  avatar_url?: string;
}

interface UserActivity {
  saved_offers: number;
  total_points: number;
  checkins: number;
  reviews: number;
  comments: number;
}

const AdminUserDetails = ({ userId, onClose }: UserDetailsProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    fetchUserDetails();
    fetchUserActivity();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
      setFormData(data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to fetch user details');
    }
  };

  const fetchUserActivity = async () => {
    try {
      const [savedOffers, userPoints, checkins] = await Promise.all([
        supabase.from('saved_offers').select('id').eq('user_id', userId),
        supabase.from('user_points').select('points').eq('user_id', userId),
        supabase.from('daily_checkins').select('id').eq('user_id', userId)
      ]);

      const totalPoints = userPoints.data?.reduce((sum, p) => sum + p.points, 0) || 0;

      setActivity({
        saved_offers: savedOffers.data?.length || 0,
        total_points: totalPoints,
        checkins: checkins.data?.length || 0,
        reviews: 0,
        comments: 0
      });
    } catch (error) {
      console.error('Error fetching user activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', userId);

      if (error) throw error;
      
      setUser({ ...user!, ...formData });
      setEditing(false);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user.name?.charAt(0) || user.email.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-2xl">{user.name || 'Anonymous User'}</CardTitle>
              <p className="text-gray-600">{user.email}</p>
              <Badge variant="outline" className="mt-1">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {editing ? (
              <>
                <Button onClick={handleSave} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={() => setEditing(false)} variant="outline" size="sm">
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)} size="sm">
                Edit User
              </Button>
            )}
            <Button onClick={onClose} variant="outline" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Personal Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>First Name</Label>
                        {editing ? (
                          <Input
                            value={formData.first_name || ''}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm font-medium">{user.first_name || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        {editing ? (
                          <Input
                            value={formData.last_name || ''}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm font-medium">{user.last_name || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Bio</Label>
                      {editing ? (
                        <Textarea
                          value={formData.bio || ''}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm">{user.bio || 'No bio provided'}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Mail className="h-5 w-5" />
                      <span>Contact Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Phone</Label>
                      {editing ? (
                        <Input
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{user.phone || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Location</Label>
                      {editing ? (
                        <Input
                          value={formData.location || ''}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{user.location || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Occupation</Label>
                      {editing ? (
                        <Input
                          value={formData.occupation || ''}
                          onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm">{user.occupation || 'Not provided'}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              {activity && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Saved Offers</p>
                          <p className="text-2xl font-bold">{activity.saved_offers}</p>
                        </div>
                        <Heart className="h-8 w-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Points</p>
                          <p className="text-2xl font-bold">{activity.total_points}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Check-ins</p>
                          <p className="text-2xl font-bold">{activity.checkins}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Activities</p>
                          <p className="text-2xl font-bold">{activity.reviews + activity.comments}</p>
                        </div>
                        <Activity className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Preference management coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Notification
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Award Points
                    </Button>
                    <Button variant="outline" className="justify-start text-red-600 hover:text-red-700">
                      <X className="h-4 w-4 mr-2" />
                      Suspend Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserDetails;
