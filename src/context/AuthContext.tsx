import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AdminUser {
  name: string;
  email: string;
  role: string;
  initials: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AdminUser;
  login: (email?: string, password?: string) => Promise<boolean>;
  logout: () => void;
}

const DEFAULT_ADMIN: AdminUser = {
  name: 'Admin',
  email: 'admin@biopepti.com',
  role: 'Catalog Manager',
  initials: 'AD',
};

const AUTH_STORAGE_KEY = 'biopepti_admin_auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      // Default to true for instant smooth evaluation unless explicitly logged out
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const [user, setUser] = useState<AdminUser>(() => {
    try {
      const stored = localStorage.getItem('biopepti_admin_user');
      return stored ? JSON.parse(stored) : DEFAULT_ADMIN;
    } catch {
      return DEFAULT_ADMIN;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, String(isAuthenticated));
    } catch (e) {
      console.error(e);
    }
  }, [isAuthenticated]);

  const login = async (email?: string, password?: string): Promise<boolean> => {
    // Mock login delay
    await new Promise((res) => setTimeout(res, 350));
    const cleanEmail = email?.trim() || 'admin@biopepti.com';
    const cleanName = cleanEmail.split('@')[0] || 'Admin';
    const initials = cleanName.substring(0, 2).toUpperCase() || 'AD';

    const newUser: AdminUser = {
      name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
      email: cleanEmail,
      role: 'Store Admin',
      initials,
    };

    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('biopepti_admin_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem(AUTH_STORAGE_KEY, 'false');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
