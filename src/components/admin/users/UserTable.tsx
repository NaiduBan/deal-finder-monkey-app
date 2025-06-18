
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import UserTableRow from './UserTableRow';

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

interface UserTableProps {
  profiles: Profile[];
  onDeleteProfile: (profileId: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ profiles, onDeleteProfile }) => {
  return (
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
          {profiles.map((profile) => (
            <UserTableRow 
              key={profile.id} 
              profile={profile} 
              onDelete={onDeleteProfile} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
