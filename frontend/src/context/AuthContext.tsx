import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import type { User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      logout();
    }
  };

  useEffect(() => {
    // Check initial local token
    const token = localStorage.getItem('access_token');
    if (token) {
      authService.getCurrentUser()
        .then((currentUser) => {
          setUser(currentUser);
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    // Listen for Supabase auth state changes (e.g. Google OAuth redirect, Email login)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (event === 'SIGNED_IN' && session?.access_token) {
        try {
          const res = await authService.supabaseSync(session.access_token);
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('refresh_token', res.refresh_token);
          localStorage.setItem('user_role', res.role);
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          console.error('Failed to sync Supabase user session:', err);
        }
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // 1. Try Supabase Auth first
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data?.session?.access_token) {
        const res = await authService.supabaseSync(data.session.access_token);
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('refresh_token', res.refresh_token);
        localStorage.setItem('user_role', res.role);
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        return;
      }

      // 2. Fallback to direct FastAPI Auth
      const res = await authService.login(email, password);
      localStorage.setItem('access_token', res.access_token);
      localStorage.setItem('refresh_token', res.refresh_token);
      localStorage.setItem('user_role', res.role);

      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      // Register in Supabase Auth & FastAPI DB
      try {
        await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.full_name,
              role: data.role
            }
          }
        });
      } catch (_) {}

      await authService.register(data);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        logout,
        register,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
