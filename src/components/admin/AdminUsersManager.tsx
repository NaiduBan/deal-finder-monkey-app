
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  Eye, 
  Download, 
  Upload,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
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
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  avatar_url?: string;
  preferences?: any;
  date_of_birth?: string;
  is_phone_verified?: boolean;
  is_email_verified?: boolean;
  marketing_consent?: boolean;
  created_at: string;
  updated_at?: string;
}

const AdminUsersManager = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    const filtered = profiles.filter(profile =>
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.phone?.includes(searchTerm) ||
      profile.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.gender?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProfiles(filtered);
  }, [profiles, searchTerm]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        toast.error(`Failed to fetch profiles: ${error.message}`);
        return;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred while fetching profiles');
    } finally {
      setLoading(false);
    }
  };

  const deleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) {
        console.error('Error deleting profile:', error);
        toast.error('Failed to delete profile');
        return;
      }

      setProfiles(profiles.filter(profile => profile.id !== profileId));
      toast.success('Profile deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while deleting the profile');
    }
  };

  const exportToCSV = () => {
    const headers = [
      'id', 'email', 'name', 'first_name', 'last_name', 'phone', 'location', 
      'gender', 'occupation', 'company', 'bio', 'address', 'city', 'state', 
      'country', 'postal_code', 'avatar_url', 'date_of_birth',
      'is_phone_verified', 'is_email_verified', 'marketing_consent', 
      'created_at', 'updated_at'
    ];
    
    const csvContent = [
      headers.join(','),
      ...profiles.map(profile => 
        headers.map(header => {
          const value = profile[header as keyof Profile];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Users...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Users Management</CardTitle>
              <p className="text-gray-600">Manage all user profiles and data</p>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {profiles.length} Total Users
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by name, email, phone, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={exportToCSV} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
            <Button className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Add User</span>
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Professional</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={profile.avatar_url} />
                          <AvatarFallback>
                            {profile.name?.charAt(0) || profile.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile.name || 'No Name'}</p>
                          <p className="text-sm text-gray-500">{profile.email}</p>
                          <p className="text-xs text-gray-400">{profile.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {profile.phone && (
                          <div className="flex items-center space-x-1 text-sm">
                            <Phone className="h-3 w-3" />
                            <span>{profile.phone}</span>
                          </div>
                        )}
                        {profile.email && (
                          <div className="flex items-center space-x-1 text-sm">
                            <Mail className="h-3 w-3" />
                            <span>{profile.email}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {profile.city && (
                          <div className="flex items-center space-x-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            <span>{profile.city}, {profile.state}</span>
                          </div>
                        )}
                        <p className="text-xs text-gray-500">{profile.country}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {profile.occupation && (
                          <p className="text-sm font-medium">{profile.occupation}</p>
                        )}
                        {profile.company && (
                          <p className="text-xs text-gray-500">{profile.company}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {profile.is_email_verified ? (
                          <Badge variant="default" className="text-xs">Email ✓</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Email ✗</Badge>
                        )}
                        {profile.is_phone_verified ? (
                          <Badge variant="default" className="text-xs">Phone ✓</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Phone ✗</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(profile.created_at).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedUser(profile)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="font-medium">Full Name</label>
                                    <p>{selectedUser.name || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Email</label>
                                    <p>{selectedUser.email || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Phone</label>
                                    <p>{selectedUser.phone || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Gender</label>
                                    <p>{selectedUser.gender || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Occupation</label>
                                    <p>{selectedUser.occupation || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Company</label>
                                    <p>{selectedUser.company || 'N/A'}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="font-medium">Bio</label>
                                  <p>{selectedUser.bio || 'N/A'}</p>
                                </div>
                                <div>
                                  <label className="font-medium">Address</label>
                                  <p>{selectedUser.address || 'N/A'}</p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteProfile(profile.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredProfiles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersManager;
