import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { apiFetch } from '../lib/api';
import { supabase } from '../lib/supabase';
import type { AppUser, MyAccount, Student } from '../lib/types';

interface AuthContextValue {
  session: Session | null;
  user: AppUser | null;
  student: Student | null;
  openSession: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [openSession, setOpenSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccount = useCallback(async (nextSession: Session | null) => {
    if (!nextSession) {
      setUser(null);
      setStudent(null);
      setOpenSession(null);
      return;
    }

    try {
      const account = await apiFetch<MyAccount>('/me', {
        token: nextSession.access_token,
      });
      setUser(account.user);
      setStudent(account.student);
      setOpenSession(account.session);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load your account.');
      setUser(null);
      setStudent(null);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) {
          return;
        }
        setSession(data.session);
        loadAccount(data.session).finally(() => {
          if (active) {
            setLoading(false);
          }
        });
      })
      .catch(() => {
        if (active) {
          setError('Could not restore your session.');
          setLoading(false);
        }
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void loadAccount(nextSession);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadAccount]);

  const refresh = useCallback(async () => {
    await loadAccount(session);
  }, [loadAccount, session]);

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setStudent(null);
    setOpenSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      student,
      openSession,
      loading,
      error,
      refresh,
      signOut,
    }),
    [session, user, student, openSession, loading, error, refresh, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
