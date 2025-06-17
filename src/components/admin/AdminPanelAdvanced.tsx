
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLogin from '../AdminLogin';
import AdminLayout from './AdminLayout';
import AdminDashboard from './dashboard/AdminDashboard';
import AdminUsersAdvanced from './users/AdminUsersAdvanced';
import AdminOffersAdvanced from './offers/AdminOffersAdvanced';
import AdminCuelinkAdvanced from './cuelink/AdminCuelinkAdvanced';
import AdminCategoriesAdvanced from './categories/AdminCategoriesAdvanced';
import AdminBannersAdvanced from './banners/AdminBannersAdvanced';
import AdminAnalyticsAdvanced from './analytics/AdminAnalyticsAdvanced';

const AdminPanelAdvanced = () => {
  const { isAuthenticated, isLoading } = useAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <Routes>
      <Route path="/*" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        
        {/* Analytics */}
        <Route path="analytics" element={<AdminAnalyticsAdvanced />} />
        <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Reports</h1><p className="text-gray-600 mt-2">Advanced reporting system coming soon...</p></div>} />
        
        {/* User Management */}
        <Route path="users" element={<AdminUsersAdvanced />} />
        <Route path="user-segments" element={<div className="p-6"><h1 className="text-2xl font-bold">User Segments</h1><p className="text-gray-600 mt-2">User segmentation tools coming soon...</p></div>} />
        <Route path="user-journey" element={<div className="p-6"><h1 className="text-2xl font-bold">User Journey</h1><p className="text-gray-600 mt-2">User journey analytics coming soon...</p></div>} />
        
        {/* Content Management */}
        <Route path="offers" element={<AdminOffersAdvanced />} />
        <Route path="cuelink" element={<AdminCuelinkAdvanced />} />
        <Route path="categories" element={<AdminCategoriesAdvanced />} />
        <Route path="banners" element={<AdminBannersAdvanced />} />
        
        {/* Communication */}
        <Route path="email-campaigns" element={<div className="p-6"><h1 className="text-2xl font-bold">Email Campaigns</h1><p className="text-gray-600 mt-2">Email campaign management coming soon...</p></div>} />
        <Route path="notifications" element={<div className="p-6"><h1 className="text-2xl font-bold">Notifications</h1><p className="text-gray-600 mt-2">Notification management coming soon...</p></div>} />
        <Route path="chat-support" element={<div className="p-6"><h1 className="text-2xl font-bold">Chat Support</h1><p className="text-gray-600 mt-2">Chat support system coming soon...</p></div>} />
        
        {/* Business Intelligence */}
        <Route path="revenue" element={<div className="p-6"><h1 className="text-2xl font-bold">Revenue Analytics</h1><p className="text-gray-600 mt-2">Revenue analytics coming soon...</p></div>} />
        <Route path="conversion" element={<div className="p-6"><h1 className="text-2xl font-bold">Conversion Funnel</h1><p className="text-gray-600 mt-2">Conversion funnel analysis coming soon...</p></div>} />
        <Route path="ab-testing" element={<div className="p-6"><h1 className="text-2xl font-bold">A/B Testing</h1><p className="text-gray-600 mt-2">A/B testing platform coming soon...</p></div>} />
        
        {/* System */}
        <Route path="system" element={<div className="p-6"><h1 className="text-2xl font-bold">System Health</h1><p className="text-gray-600 mt-2">System health monitoring coming soon...</p></div>} />
        <Route path="database" element={<div className="p-6"><h1 className="text-2xl font-bold">Database Management</h1><p className="text-gray-600 mt-2">Database management tools coming soon...</p></div>} />
        <Route path="security" element={<div className="p-6"><h1 className="text-2xl font-bold">Security</h1><p className="text-gray-600 mt-2">Security management coming soon...</p></div>} />
        <Route path="audit" element={<div className="p-6"><h1 className="text-2xl font-bold">Audit Logs</h1><p className="text-gray-600 mt-2">Audit logging system coming soon...</p></div>} />
        <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-gray-600 mt-2">System settings coming soon...</p></div>} />
      </Route>
    </Routes>
  );
};

export default AdminPanelAdvanced;
