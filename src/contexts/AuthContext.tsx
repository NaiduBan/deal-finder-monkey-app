
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  location?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Function to fetch user profile from profiles table
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception fetching user profile:', error);
      return null;
    }
  };

  // Function to create or update user profile
  const upsertUserProfile = async (user: User, additionalData?: any) => {
    try {
      const profileData = {
        id: user.id,
        email: user.email,
        name: additionalData?.name || user.user_metadata?.name || '',
        location: additionalData?.location || user.user_metadata?.location || '',
        phone: additionalData?.phone || user.user_metadata?.phone || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('Error upserting user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception upserting user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Setup auth listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, currentSession?.user?.id);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (event === 'SIGNED_IN' && currentSession?.user) {
          // Fetch or create user profile
          setTimeout(async () => {
            const profile = await fetchUserProfile(currentSession.user.id);
            if (profile) {
              setUserProfile(profile);
            } else {
              // Create new profile if it doesn't exist
              const newProfile = await upsertUserProfile(currentSession.user);
              if (newProfile) {
                setUserProfile(newProfile);
              }
            }
            if (mounted) {
              setLoading(false);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          // Clear all localStorage data that might cause conflicts
          localStorage.removeItem('user');
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('sb-vtxtnyivbmvcmxuuqknn-auth-token');
          if (mounted) {
            setLoading(false);
          }
          setTimeout(() => {
            toast({
              title: "Logged out",
              description: "You've been successfully logged out.",
            });
          }, 0);
        } else if (event === 'TOKEN_REFRESHED') {
          // Handle token refresh
          console.log('Token refreshed');
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession?.user && mounted) {
          console.log('Existing session found:', existingSession.user.id);
          setSession(existingSession);
          setUser(existingSession.user);
          
          // Fetch user profile
          const profile = await fetchUserProfile(existingSession.user.id);
          if (profile) {
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

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clear all local state and localStorage
      setSession(null);
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('user');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-vtxtnyivbmvcmxuuqknn-auth-token');
      
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
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setUserProfile(data);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
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
    updateProfile
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
