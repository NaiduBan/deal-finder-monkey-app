
import React from 'react';
import { Button } from '@/components/ui/button';

interface AdminUsersPaginationProps {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  usersPerPage: number;
  onPageChange: (page: number) => void;
}

const AdminUsersPagination = ({
  currentPage,
  totalPages,
  totalUsers,
  usersPerPage,
  onPageChange
}: AdminUsersPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-gray-600">
        Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
      </p>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AdminUsersPagination;
