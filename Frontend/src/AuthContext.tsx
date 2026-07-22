import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { UserData } from './api';
import { authApi } from './api';

interface AuthContextType {
  user: UserData | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserData, refreshToken: string) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(() => {
    try {
      const saved = sessionStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [refreshToken, setRefreshToken] = useState<string | null>(
    () => sessionStorage.getItem('refreshToken')
  );

  const setAuth = useCallback((userData: UserData, token: string) => {
    setUser(userData);
    setRefreshToken(token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('refreshToken', token);
  }, []);

  const clearAuth = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setRefreshToken(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('refreshToken');
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      refreshToken,
      isAuthenticated: !!user,
      setAuth,
      clearAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
