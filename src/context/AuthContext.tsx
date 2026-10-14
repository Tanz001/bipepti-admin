import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import * as authApi from '../lib/authApi';
import { getToken, USER_KEY } from '../lib/api';

export interface AdminUser {
  name: string;
  email: string;
  role: string;
  initials: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AdminUser;
  authReady: boolean;
  login: (email?: string, password?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: { name: string; email: string; role?: string }) => Promise<void>;
}

const DEFAULT_ADMIN: AdminUser = {
  name: 'Admin',
  email: 'admin@biopepti.com',
  role: 'Store Admin',
  initials: 'AD',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authReady, setAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_ADMIN;
    } catch {
      return DEFAULT_ADMIN;
    }
  });

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = getToken();
      if (!token) {
        if (!cancelled) {
          setIsAuthenticated(false);
          setAuthReady(true);
        }
        return;
      }

      try {
        const me = await authApi.fetchMe();
        if (!cancelled) {
          setUser(me);
          setIsAuthenticated(true);
        }
      } catch {
        authApi.clearAuthSession();
        if (!cancelled) setIsAuthenticated(false);
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email?: string, password?: string): Promise<boolean> => {
    if (!email?.trim() || !password) {
      throw new Error('Email and password are required');
    }
    const loggedIn = await authApi.loginRequest(email.trim(), password);
    setUser(loggedIn);
    setIsAuthenticated(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    authApi.clearAuthSession();
    setIsAuthenticated(false);
  }, []);

  const updateProfile = useCallback(
    async (updates: { name: string; email: string; role?: string }) => {
      const next = await authApi.updateProfileRequest(updates);
      setUser(next);
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, authReady, login, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
