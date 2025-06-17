
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface AdminUsersFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const AdminUsersFilters = ({ searchTerm, onSearchChange }: AdminUsersFiltersProps) => {
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        placeholder="Search users by any field..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default AdminUsersFilters;
