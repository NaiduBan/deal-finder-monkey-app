
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import UserStats from './admin/users/UserStats';
import UserSearch from './admin/users/UserSearch';
import UserActions from './admin/users/UserActions';
import UserTable from './admin/users/UserTable';
import EmptyUsersState from './admin/users/EmptyUsersState';
import LoadingState from './admin/users/LoadingState';

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
    }
  };

  const exportToCSV = () => {
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
    return <LoadingState />;
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
            <UserStats totalUsers={profiles.length} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <UserSearch 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm} 
            />
            <UserActions
              onExportCSV={exportToCSV}
              onUploadCSV={handleCSVUpload}
              uploading={uploading}
              hasUsers={profiles.length > 0}
            />
          </div>

          {profiles.length === 0 ? (
            <EmptyUsersState onRefresh={fetchProfiles} />
          ) : (
            <>
              <UserTable 
                profiles={filteredProfiles} 
                onDeleteProfile={deleteProfile} 
              />

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
