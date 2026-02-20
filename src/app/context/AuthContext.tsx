import * as React from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<any>(null);
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error getting session:', err);
        if (mounted) setLoading(false);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
        }
      });

      return subscription;
    }

    const subscriptionPromise = initAuth();

    return () => {
      mounted = false;
      subscriptionPromise.then(sub => sub?.unsubscribe());
    };
  }, []);

  const signIn = React.useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = React.useCallback(async (email: string, password: string, name: string) => {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-116da2c5/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Signup failed');
    await signIn(email, password);
  }, [signIn]);

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const signInWithOAuth = React.useCallback(async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  }, []);

  const value = React.useMemo(() => ({
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithOAuth
  }), [user, session, loading, signIn, signUp, signOut, signInWithOAuth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}