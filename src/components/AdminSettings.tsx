
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  RefreshCw, 
  Shield, 
  Settings2, 
  Users, 
  Bell,
  Download,
  Upload
} from 'lucide-react';

const AdminSettings = () => {
  const handleDataRefresh = () => {
    // Implementation for data refresh
    console.log('Refreshing data...');
  };

  const handleExportData = () => {
    // Implementation for data export
    console.log('Exporting data...');
  };

  const handleImportData = () => {
    // Implementation for data import
    console.log('Importing data...');
  };

  return (
    <div className="space-y-6">
      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings2 className="h-5 w-5" />
            <span>System Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Maintenance Mode</h4>
              <p className="text-sm text-gray-600">Put the application in maintenance mode</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">New User Registration</h4>
              <p className="text-sm text-gray-600">Allow new users to register</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-gray-600">Send system email notifications</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              onClick={handleDataRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh All Data</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              onClick={handleImportData}
            >
              <Upload className="h-4 w-4" />
              <span>Import Data</span>
            </Button>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Data Safety</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Always backup your data before performing bulk operations. These actions cannot be undone.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* User Management Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">User Profile Verification</h4>
              <p className="text-sm text-gray-600">Require manual verification for new profiles</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto-approve Comments</h4>
              <p className="text-sm text-gray-600">Automatically approve user comments and reviews</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Daily Notifications</h4>
              <p className="text-sm text-gray-600">Send daily offer notifications to users</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Admin Alerts</h4>
              <p className="text-sm text-gray-600">Receive alerts for system events</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-600">Version</h4>
              <Badge variant="outline">v1.0.0</Badge>
            </div>
            <div>
              <h4 className="font-medium text-gray-600">Environment</h4>
              <Badge>Production</Badge>
            </div>
            <div>
              <h4 className="font-medium text-gray-600">Database</h4>
              <Badge variant="outline">PostgreSQL</Badge>
            </div>
            <div>
              <h4 className="font-medium text-gray-600">Last Updated</h4>
              <Badge variant="outline">{new Date().toLocaleDateString()}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
