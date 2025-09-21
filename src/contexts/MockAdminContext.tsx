import React, { createContext, useContext, useState, useEffect } from 'react';
import { authenticateAdmin, verifyAdminSession } from '@/services/mockApiService';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface MockAdminContextType {
  adminUser: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const MockAdminContext = createContext<MockAdminContextType | undefined>(undefined);

export const useMockAdmin = () => {
  const context = useContext(MockAdminContext);
  if (context === undefined) {
    throw new Error('useMockAdmin must be used within a MockAdminProvider');
  }
  return context;
};

export const MockAdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('mock_admin_token');
      if (token) {
        const adminData = await verifyAdminSession(token);
        
        if (adminData) {
          setAdminUser({
            id: adminData.admin_id,
            name: adminData.admin_name,
            email: adminData.admin_email,
            role: adminData.admin_role
          });
        } else {
          localStorage.removeItem('mock_admin_token');
        }
      }
    } catch (error) {
      console.error('Error checking admin session:', error);
      localStorage.removeItem('mock_admin_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await authenticateAdmin(email, password);

      if (!result.success) {
        return { success: false, error: result.error || 'Invalid credentials' };
      }

      const adminData = result.data;
      const user = {
        id: adminData.admin_id,
        name: adminData.admin_name,
        email: adminData.admin_email,
        role: adminData.admin_role
      };

      setAdminUser(user);
      localStorage.setItem('mock_admin_token', adminData.session_token);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    setAdminUser(null);
    localStorage.removeItem('mock_admin_token');
  };

  return (
    <MockAdminContext.Provider 
      value={{
        adminUser,
        isLoading,
        login,
        logout,
        isAuthenticated: !!adminUser
      }}
    >
      {children}
    </MockAdminContext.Provider>
  );
};