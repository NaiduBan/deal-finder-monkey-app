import React, { createContext, useState, useEffect, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchUserProfile, upsertUserProfile, mockSignIn, mockSignUp, mockSignOut } from '@/services/mockApiService';

interface MockUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}

interface MockSession {
  user: MockUser;
  access_token: string;
}

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  location?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
}

interface MockAuthContextType {
  session: MockSession | null;
  user: MockUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<MockSession | null>(null);
  const [user, setUser] = useState<MockUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session in localStorage
    const initializeAuth = async () => {
      try {
        const storedSession = localStorage.getItem('mock_session');
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          setSession(parsedSession);
          setUser(parsedSession.user);
          
          // Fetch user profile
          const profile = await fetchUserProfile(parsedSession.user.id);
          if (profile) {
            setUserProfile(profile);
          }
        }
      } catch (error) {
        console.error('Error initializing mock auth:', error);
        localStorage.removeItem('mock_session');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await mockSignIn(email, password);
      
      if (result.success && result.user) {
        const mockSession = {
          user: result.user,
          access_token: `mock_token_${Date.now()}`
        };
        
        setSession(mockSession);
        setUser(result.user);
        localStorage.setItem('mock_session', JSON.stringify(mockSession));
        
        // Fetch or create user profile
        let profile = await fetchUserProfile(result.user.id);
        if (!profile) {
          profile = await upsertUserProfile({
            id: result.user.id,
            email: result.user.email,
            name: result.user.user_metadata?.name || '',
            avatar_url: result.user.user_metadata?.avatar_url || ''
          });
        }
        
        if (profile) {
          setUserProfile(profile);
        }
        
        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in.",
        });
        
        return { success: true };
      }
      
      return { success: false, error: result.error || 'Sign in failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Sign in failed' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true);
      const result = await mockSignUp(email, password, metadata);
      
      if (result.success && result.user) {
        const mockSession = {
          user: result.user,
          access_token: `mock_token_${Date.now()}`
        };
        
        setSession(mockSession);
        setUser(result.user);
        localStorage.setItem('mock_session', JSON.stringify(mockSession));
        
        // Create user profile
        const profile = await upsertUserProfile({
          id: result.user.id,
          email: result.user.email,
          name: metadata?.name || result.user.user_metadata?.name || '',
          location: metadata?.location || '',
          phone: metadata?.phone || '',
          avatar_url: result.user.user_metadata?.avatar_url || ''
        });
        
        if (profile) {
          setUserProfile(profile);
        }
        
        toast({
          title: "Account created!",
          description: "Your account has been created successfully.",
        });
        
        return { success: true };
      }
      
      return { success: false, error: result.error || 'Sign up failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Sign up failed' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await mockSignOut();
      
      setSession(null);
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('mock_session');
      
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred while signing out",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const storedSession = localStorage.getItem('mock_session');
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
        setUser(parsedSession.user);
        
        if (parsedSession.user) {
          const profile = await fetchUserProfile(parsedSession.user.id);
          if (profile) {
            setUserProfile(profile);
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      const updatedProfile = await upsertUserProfile({
        id: user.id,
        ...userProfile,
        ...updates,
        updated_at: new Date().toISOString()
      });

      if (updatedProfile) {
        setUserProfile(updatedProfile);
        
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive",
      });
    }
  };

  const value = {
    session,
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
    updateProfile
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = (): MockAuthContextType => {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};