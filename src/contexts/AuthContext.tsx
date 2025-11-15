import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile, Organization, Player } from '../lib/supabase';
import { showToast, handleError } from '../lib/toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  organization: Organization | null;
  player: Player | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: { full_name: string; user_type: 'organization' | 'player' }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
          setOrganization(null);
          setPlayer(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile(profileData);

        if (profileData.user_type === 'organization') {
          const { data: orgData } = await supabase
            .from('organizations')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          setOrganization(orgData);
          setPlayer(null);
        } else if (profileData.user_type === 'player') {
          const { data: playerData } = await supabase
            .from('player_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          setPlayer(playerData);
          setOrganization(null);
        }
      }
    } catch (error) {
      handleError(error, 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: { full_name: string; user_type: 'organization' | 'player' }
  ) => {
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            user_type: userData.user_type,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Manually insert profile (RLS policy allows public insert during signup)
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: userData.full_name,
          user_type: userData.user_type,
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }
      }

      showToast.success('Account created successfully! Please check your email to verify your account.');
      return { error: null };
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to create account');
      return { error: new Error(errorMessage) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      showToast.success('Welcome back!');
      return { error: null };
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to sign in');
      return { error: new Error(errorMessage) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setOrganization(null);
    setPlayer(null);
    showToast.success('Signed out successfully');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      showToast.success('Profile updated successfully');

      return { error: null };
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to update profile');
      return { error: new Error(errorMessage) };
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const value = {
    user,
    session,
    profile,
    organization,
    player,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
