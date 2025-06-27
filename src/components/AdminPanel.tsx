
import React, { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsersManager from './admin/AdminUsersManager';
import AdminOffersManager from './admin/AdminOffersManager';
import AdminCuelinkManager from './AdminCuelinkManager';
import AdminCategoriesManager from './AdminCategoriesManager';
import AdminSettings from './AdminSettings';
import AdminBannersManager from './AdminBannersManager';
import { 
  LogOut, 
  BarChart3, 
  Users, 
  ShoppingBag, 
  Package, 
  FolderOpen, 
  Settings,
  Shield,
  LayoutGrid,
  Database,
  Activity,
  Bell
} from 'lucide-react';

const AdminPanel = () => {
  const { adminUser, logout } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">OffersMonkey CRM</h1>
                <p className="text-sm text-gray-500">Complete Admin Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{adminUser?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{adminUser?.role}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-2 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 lg:w-fit bg-white border shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="offers" className="flex items-center space-x-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">LMD Offers</span>
            </TabsTrigger>
            <TabsTrigger value="cuelink" className="flex items-center space-x-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Cuelink</span>
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center space-x-2 data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Banners</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center space-x-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2 data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <AdminDashboard />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6">
            <AdminUsersManager />
          </TabsContent>
          
          <TabsContent value="offers" className="space-y-6">
            <AdminOffersManager />
          </TabsContent>
          
          <TabsContent value="cuelink" className="space-y-6">
            <AdminCuelinkManager />
          </TabsContent>

          <TabsContent value="banners" className="space-y-6">
            <AdminBannersManager />
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-6">
            <AdminCategoriesManager />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">Detailed analytics and reporting features coming soon.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
