
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminContextType {
  isAdmin: boolean;
  adminUser: any | null;
  loading: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Admin credentials (in production, store these securely)
const ADMIN_CREDENTIALS = {
  email: 'admin@monkeyoffers.com',
  password: 'MonkeyAdmin123!'
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if admin is already logged in
    const adminData = localStorage.getItem('adminSession');
    if (adminData) {
      try {
        const parsed = JSON.parse(adminData);
        setIsAdmin(true);
        setAdminUser(parsed);
      } catch (error) {
        localStorage.removeItem('adminSession');
      }
    }
    setLoading(false);
  }, []);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        const adminData = {
          id: 'admin-001',
          email: ADMIN_CREDENTIALS.email,
          name: 'System Administrator',
          role: 'admin',
          loginTime: new Date().toISOString()
        };
        
        setIsAdmin(true);
        setAdminUser(adminData);
        localStorage.setItem('adminSession', JSON.stringify(adminData));
        
        toast({
          title: "Admin login successful",
          description: "Welcome to the admin panel",
        });
        
        return true;
      } else {
        toast({
          title: "Invalid credentials",
          description: "Please check your admin credentials",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An error occurred during login",
        variant: "destructive",
      });
      return false;
    }
  };

  const adminLogout = async () => {
    setIsAdmin(false);
    setAdminUser(null);
    localStorage.removeItem('adminSession');
    
    toast({
      title: "Logged out",
      description: "Admin session ended",
    });
  };

  const value = {
    isAdmin,
    adminUser,
    loading,
    adminLogin,
    adminLogout
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
