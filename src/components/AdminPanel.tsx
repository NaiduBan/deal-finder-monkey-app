
import React from 'react';
import AdminRoute from './AdminRoute';
import AdminDashboard from './AdminDashboard';

const AdminPanel = () => {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
};

export default AdminPanel;
