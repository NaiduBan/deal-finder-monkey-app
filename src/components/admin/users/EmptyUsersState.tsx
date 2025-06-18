
import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyUsersStateProps {
  onRefresh: () => void;
}

const EmptyUsersState: React.FC<EmptyUsersStateProps> = ({ onRefresh }) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">👥</div>
      <h3 className="text-lg font-semibold mb-2">No User Profiles Found</h3>
      <p className="text-gray-500 mb-4">
        There are currently no user profiles in the database. 
        Users need to sign up to create profiles.
      </p>
      <Button onClick={onRefresh} variant="outline">
        Refresh Data
      </Button>
    </div>
  );
};

export default EmptyUsersState;
