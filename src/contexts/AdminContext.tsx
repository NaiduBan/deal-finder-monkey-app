
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminContextType {
  adminUser: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (token) {
        const { data, error } = await supabase.rpc('verify_admin_session', {
          p_token: token
        });

        if (data && data.length > 0) {
          setAdminUser({
            id: data[0].admin_id,
            name: data[0].admin_name,
            email: data[0].admin_email,
            role: data[0].admin_role
          });
        } else {
          localStorage.removeItem('admin_token');
        }
      }
    } catch (error) {
      console.error('Error checking admin session:', error);
      localStorage.removeItem('admin_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.rpc('authenticate_admin', {
        p_email: email,
        p_password: password
      });

      if (error || !data || data.length === 0) {
        return { success: false, error: 'Invalid credentials' };
      }

      const adminData = data[0];
      const user = {
        id: adminData.admin_id,
        name: adminData.admin_name,
        email: adminData.admin_email,
        role: adminData.admin_role
      };

      setAdminUser(user);
      localStorage.setItem('admin_token', adminData.session_token);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    setAdminUser(null);
    localStorage.removeItem('admin_token');
  };

  return (
    <AdminContext.Provider 
      value={{
        adminUser,
        isLoading,
        login,
        logout,
        isAuthenticated: !!adminUser
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
