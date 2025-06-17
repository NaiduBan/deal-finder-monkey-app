
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Download, MoreHorizontal } from 'lucide-react';

interface AdminUsersActionsProps {
  selectedCount: number;
  uploading: boolean;
  onBulkActions: () => void;
  onExportCSV: () => void;
  onUploadClick: () => void;
}

const AdminUsersActions = ({
  selectedCount,
  uploading,
  onBulkActions,
  onExportCSV,
  onUploadClick
}: AdminUsersActionsProps) => {
  return (
    <div className="flex items-center space-x-2">
      {selectedCount > 0 && (
        <Button 
          onClick={onBulkActions}
          className="flex items-center space-x-2"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span>Bulk Actions ({selectedCount})</span>
        </Button>
      )}
      <Button 
        onClick={onExportCSV}
        variant="outline"
        className="flex items-center space-x-2"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Export CSV</span>
      </Button>
      <Button 
        onClick={onUploadClick}
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
  );
};

export default AdminUsersActions;
