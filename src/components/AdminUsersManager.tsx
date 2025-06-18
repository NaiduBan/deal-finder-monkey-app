
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Edit, Trash2, Plus, Upload, Download } from 'lucide-react';
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      console.log('Fetching profiles from database...');
      
      // First, let's check if we have any profiles at all
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      console.log('Total profiles in database:', count);

      if (countError) {
        console.error('Error counting profiles:', countError);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Profiles fetch result:', { data, error, count: data?.length });
      console.log('Raw profiles data:', data);

      if (error) {
        console.error('Error fetching profiles:', error);
        toast.error(`Failed to fetch profiles: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.log('No profiles found in database');
        toast.info('No user profiles found. Users need to sign up first.');
        setProfiles([]);
        return;
      }

      console.log('Successfully fetched profiles:', data.length);
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

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const profileData = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const profile: any = {};
          headers.forEach((header, index) => {
            if (values[index] && values[index] !== 'N/A') {
              profile[header] = values[index];
            }
          });
          if (profile.id || profile.email) {
            profileData.push(profile);
          }
        }
      }

      if (profileData.length === 0) {
        toast.error('No valid profile data found in CSV');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) {
        console.error('Error uploading profiles:', error);
        toast.error('Failed to upload profiles');
        return;
      }

      toast.success(`Successfully uploaded ${profileData.length} profiles`);
      fetchProfiles();
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast.error('Error processing CSV file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const exportToCSV = () => {
    // Export all profiles, not just filtered ones for admin purposes
    const headers = [
      'id', 'email', 'name', 'first_name', 'last_name', 'phone', 'location', 
      'gender', 'occupation', 'company', 'bio', 'address', 'city', 'state', 
      'country', 'postal_code', 'avatar_url', 'preferences', 'date_of_birth',
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
    link.download = `profiles_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading User Profiles...</CardTitle>
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
              <CardTitle>User Profiles Management</CardTitle>
              <p className="text-gray-600">Manage all user profiles from the database</p>
            </div>
            <Badge variant="secondary">{profiles.length} Total Users</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by name, email, city, occupation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={exportToCSV}
              variant="outline"
              className="flex items-center space-x-2"
              disabled={profiles.length === 0}
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>{uploading ? 'Uploading...' : 'Upload CSV'}</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
          </div>

          {profiles.length === 0 && !loading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-semibold mb-2">No User Profiles Found</h3>
              <p className="text-gray-500 mb-4">
                There are currently no user profiles in the database. 
                Users need to sign up to create profiles.
              </p>
              <Button onClick={fetchProfiles} variant="outline">
                Refresh Data
              </Button>
            </div>
          ) : (
            <>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">User ID</TableHead>
                      <TableHead className="min-w-[200px]">Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Occupation</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead className="min-w-[200px]">Bio</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Postal Code</TableHead>
                      <TableHead>Avatar URL</TableHead>
                      <TableHead>Date of Birth</TableHead>
                      <TableHead>Phone Verified</TableHead>
                      <TableHead>Email Verified</TableHead>
                      <TableHead>Marketing Consent</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Updated At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium text-xs">{profile.id}</TableCell>
                        <TableCell className="font-medium">{profile.email || 'N/A'}</TableCell>
                        <TableCell>{profile.name || 'N/A'}</TableCell>
                        <TableCell>{profile.first_name || 'N/A'}</TableCell>
                        <TableCell>{profile.last_name || 'N/A'}</TableCell>
                        <TableCell>{profile.phone || 'N/A'}</TableCell>
                        <TableCell>{profile.location || 'N/A'}</TableCell>
                        <TableCell>{profile.gender || 'N/A'}</TableCell>
                        <TableCell>{profile.occupation || 'N/A'}</TableCell>
                        <TableCell>{profile.company || 'N/A'}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{profile.bio || 'N/A'}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{profile.address || 'N/A'}</TableCell>
                        <TableCell>{profile.city || 'N/A'}</TableCell>
                        <TableCell>{profile.state || 'N/A'}</TableCell>
                        <TableCell>{profile.country || 'N/A'}</TableCell>
                        <TableCell>{profile.postal_code || 'N/A'}</TableCell>
                        <TableCell className="max-w-[100px] truncate">{profile.avatar_url || 'N/A'}</TableCell>
                        <TableCell>{profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                          {profile.is_phone_verified ? (
                            <Badge variant="default" className="text-xs">Yes</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {profile.is_email_verified ? (
                            <Badge variant="default" className="text-xs">Yes</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {profile.marketing_consent ? (
                            <Badge variant="default" className="text-xs">Yes</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
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

              {filteredProfiles.length === 0 && searchTerm && (
                <div className="text-center py-8 text-gray-500">
                  No users found matching "{searchTerm}". Try a different search term.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersManager;
