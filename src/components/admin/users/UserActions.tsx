
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';

interface UserActionsProps {
  onExportCSV: () => void;
  onUploadCSV: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  hasUsers: boolean;
}

const UserActions: React.FC<UserActionsProps> = ({ 
  onExportCSV, 
  onUploadCSV, 
  uploading, 
  hasUsers 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button 
        onClick={onExportCSV}
        variant="outline"
        className="flex items-center space-x-2"
        disabled={!hasUsers}
      >
        <Download className="h-4 w-4" />
        <span>Export CSV</span>
      </Button>
      <Button 
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center space-x-2"
      >
        <Upload className="h-4 w-4" />
        <span>{uploading ? 'Uploading...' : 'Upload CSV'}</span>
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={onUploadCSV}
        className="hidden"
      />
    </>
  );
};

export default UserActions;
