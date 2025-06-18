
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface UserStatsProps {
  totalUsers: number;
}

const UserStats: React.FC<UserStatsProps> = ({ totalUsers }) => {
  return (
    <Badge variant="secondary">{totalUsers} Total Users</Badge>
  );
};

export default UserStats;
