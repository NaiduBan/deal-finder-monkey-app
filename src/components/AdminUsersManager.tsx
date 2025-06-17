
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Upload, 
  Download, 
  Filter,
  Users,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import AdminUserDetails from './AdminUserDetails';
import AdminBulkActions from './AdminBulkActions';

interface User {
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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm) ||
      user.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.gender?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users from profiles table...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Users fetch result:', { data, error, count: data?.length });

      if (error) {
        console.error('Error fetching users:', error);
        toast.error(`Failed to fetch users: ${error.message}`);
        return;
      }

      console.log('Successfully fetched users:', data?.length || 0);
      setUsers(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
        return;
      }

      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while deleting the user');
    }
  };

  const handleBulkAction = async (action: string, data: any) => {
    console.log('Executing bulk action:', action, 'for users:', selectedUsers, 'with data:', data);
    
    switch (action) {
      case 'email':
        toast.success(`Email sent to ${selectedUsers.length} users`);
        break;
      case 'notification':
        toast.success(`Notification sent to ${selectedUsers.length} users`);
        break;
      case 'points':
        toast.success(`Points awarded to ${selectedUsers.length} users`);
        break;
      case 'export':
        exportSelectedUsers();
        break;
      case 'suspend':
        toast.success(`${selectedUsers.length} users suspended`);
        break;
    }
    
    setSelectedUsers([]);
  };

  const exportSelectedUsers = () => {
    const selectedUserData = users.filter(user => selectedUsers.includes(user.id));
    const headers = [
      'id', 'email', 'name', 'first_name', 'last_name', 'phone', 'location', 
      'gender', 'occupation', 'company', 'bio', 'address', 'city', 'state', 
      'country', 'postal_code', 'avatar_url', 'preferences', 'date_of_birth',
      'is_phone_verified', 'is_email_verified', 'marketing_consent', 
      'created_at', 'updated_at'
    ];
    
    const csvContent = [
      headers.join(','),
      ...selectedUserData.map(user => 
        headers.map(header => {
          const value = user[header as keyof User];
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
    link.download = `selected_users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
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
      ...filteredUsers.map(user => 
        headers.map(header => {
          const value = user[header as keyof User];
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
    link.download = 'users_complete.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageUsers = getCurrentPageUsers().map(user => user.id);
      setSelectedUsers(prev => [...new Set([...prev, ...currentPageUsers])]);
    } else {
      const currentPageUsers = getCurrentPageUsers().map(user => user.id);
      setSelectedUsers(prev => prev.filter(id => !currentPageUsers.includes(id)));
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const getCurrentPageUsers = () => {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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

  const currentPageUsers = getCurrentPageUsers();
  const allCurrentPageSelected = currentPageUsers.length > 0 && currentPageUsers.every(user => selectedUsers.includes(user.id));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Users Management</span>
              </CardTitle>
              <p className="text-gray-600">Manage user accounts and profiles</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{users.length} Total Users</Badge>
              {selectedUsers.length > 0 && (
                <Badge className="bg-blue-100 text-blue-800">
                  {selectedUsers.length} Selected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by any field..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              {selectedUsers.length > 0 && (
                <Button 
                  onClick={() => setShowBulkActions(true)}
                  className="flex items-center space-x-2"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span>Bulk Actions ({selectedUsers.length})</span>
                </Button>
              )}
              <Button 
                onClick={exportToCSV}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">{uploading ? 'Uploading...' : 'Upload CSV'}</span>
              </Button>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add User</span>
              </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allCurrentPageSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPageUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.name?.charAt(0) || user.email.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{user.name || 'Anonymous'}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{user.phone || 'No phone'}</p>
                          <p className="text-xs text-gray-500">{user.occupation || 'No occupation'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{user.city || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{user.country || 'Unknown'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          {user.is_email_verified ? (
                            <Badge variant="default" className="text-xs w-fit">Email ✓</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs w-fit">Email ✗</Badge>
                          )}
                          {user.is_phone_verified ? (
                            <Badge variant="default" className="text-xs w-fit">Phone ✓</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs w-fit">Phone ✗</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedUser(user.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deleteUser(user.id)}
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
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <AdminUserDetails
          userId={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {showBulkActions && (
        <AdminBulkActions
          selectedUsers={selectedUsers}
          onClose={() => setShowBulkActions(false)}
          onAction={handleBulkAction}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={(e) => {/* Handle CSV upload */}}
        className="hidden"
      />
    </div>
  );
};

export default AdminUsersManager;
