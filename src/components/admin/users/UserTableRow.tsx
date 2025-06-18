
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';

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

interface UserTableRowProps {
  profile: Profile;
  onDelete: (profileId: string) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ profile, onDelete }) => {
  return (
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
            onClick={() => onDelete(profile.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
