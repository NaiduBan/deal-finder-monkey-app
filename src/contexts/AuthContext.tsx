
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { fetchUserProfile, createUserProfile, updateUserProfile } from '@/services/supabaseService';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  location?: string;
  date_of_birth?: string;
  gender?: string;
  occupation?: string;
  company?: string;
  avatar_url?: string;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  preferences?: any;
  is_email_verified?: boolean;
  is_phone_verified?: boolean;
  marketing_consent?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, currentSession?.user?.id);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (event === 'SIGNED_IN' && currentSession?.user) {
          setTimeout(async () => {
            try {
              let profile = await fetchUserProfile(currentSession.user.id);
              
              if (!profile) {
                console.log('No profile found, creating new profile');
                profile = await createUserProfile(currentSession.user.id, {
                  email: currentSession.user.email,
                  name: currentSession.user.user_metadata?.name || '',
                  first_name: currentSession.user.user_metadata?.first_name || '',
                  last_name: currentSession.user.user_metadata?.last_name || '',
                  avatar_url: currentSession.user.user_metadata?.avatar_url || '',
                  location: 'India'
                });
              }
              
              if (profile && mounted) {
                setUserProfile(profile);
              }
            } catch (error) {
              console.error('Error handling user profile:', error);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          localStorage.removeItem('user');
          setTimeout(() => {
            toast({
              title: "Logged out",
              description: "You've been successfully logged out.",
            });
          }, 0);
        }
      }
    );

    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession?.user && mounted) {
          console.log('Existing session found:', existingSession.user.id);
          setSession(existingSession);
          setUser(existingSession.user);
          
          const profile = await fetchUserProfile(existingSession.user.id);
          if (profile && mounted) {
            setUserProfile(profile);
          }
        } else {
          console.log('No session found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {}
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        toast({
          title: "Account created",
          description: "Your account has been created successfully!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error.message || "An error occurred while creating your account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message || "An error occurred while signing in",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
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
      const { data: { session: refreshedSession } } = await supabase.auth.getSession();
      setSession(refreshedSession);
      setUser(refreshedSession?.user ?? null);
      
      if (refreshedSession?.user) {
        const profile = await fetchUserProfile(refreshedSession.user.id);
        if (profile) {
          setUserProfile(profile);
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      const updatedProfile = await updateUserProfile(user.id, updates);
      
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
    signOut,
    refreshSession,
    updateProfile,
    signUp,
    signIn
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
