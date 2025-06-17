
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface AdminUsersStatsProps {
  totalUsers: number;
  selectedCount: number;
}

const AdminUsersStats = ({ totalUsers, selectedCount }: AdminUsersStatsProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Badge variant="secondary">{totalUsers} Total Users</Badge>
      {selectedCount > 0 && (
        <Badge className="bg-blue-100 text-blue-800">
          {selectedCount} Selected
        </Badge>
      )}
    </div>
  );
};

export default AdminUsersStats;
