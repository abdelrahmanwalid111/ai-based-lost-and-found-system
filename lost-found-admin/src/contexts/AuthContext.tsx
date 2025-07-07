"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('[AuthContext] Initializing auth context...');
    // Check for existing session on mount
    const savedToken = localStorage.getItem('adminToken');
    const savedUser = localStorage.getItem('adminUser');

    console.log('[AuthContext] Saved token exists:', !!savedToken);
    console.log('[AuthContext] Saved user exists:', !!savedUser);

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('[AuthContext] Restoring session for user:', parsedUser.email);
        setToken(savedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('[AuthContext] Error parsing saved user:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
    setIsLoading(false);
    console.log('[AuthContext] Auth context initialized');
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('[AuthContext] Sign in attempt for:', email);
    
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('[AuthContext] Sign in response:', { status: response.status, data });

    if (!response.ok) {
      throw new Error(data.error || 'Sign in failed');
    }

    console.log('[AuthContext] Setting user and token...');
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminUser', JSON.stringify(data.user));
    
    console.log('[AuthContext] Sign in successful, user set:', data.user.email);
  };

  const signOut = async () => {
    console.log('[AuthContext] Signing out...');
    
    try {
      // Call the signout API endpoint
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        console.warn('[AuthContext] Signout API call failed, but continuing with local signout');
      } else {
        console.log('[AuthContext] Signout API call successful');
      }
    } catch (error) {
      console.warn('[AuthContext] Signout API call error:', error);
    }
    
    // Clear local state regardless of API call result
    console.log('[AuthContext] Clearing local auth state...');
    setToken(null);
    setUser(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    console.log('[AuthContext] Redirecting to signin page...');
    try {
      router.push('/signin');
      // Fallback redirect if router.push doesn't work
      setTimeout(() => {
        if (window.location.pathname !== '/signin') {
          console.log('[AuthContext] Router redirect failed, using window.location');
          window.location.href = '/signin';
        }
      }, 100);
    } catch (error) {
      console.error('[AuthContext] Router error, using window.location fallback:', error);
      window.location.href = '/signin';
    }
    console.log('[AuthContext] Signout complete');
  };

  const value = {
    user,
    token,
    isLoading,
    signIn,
    signOut,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
  };

  console.log('[AuthContext] Current auth state:', {
    hasUser: !!user,
    hasToken: !!token,
    isAuthenticated: value.isAuthenticated,
    isAdmin: value.isAdmin,
    isLoading
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 