import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types/database';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const initAuth = async () => {
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem('auth_user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // モック認証: localStorage に登録済みユーザーがあれば照合
      const stored = localStorage.getItem('mock_users');
      const users: User[] = stored ? JSON.parse(stored) : [];
      const found = users.find(u => u.email === email);
      if (found) {
        const passwords = JSON.parse(localStorage.getItem('mock_passwords') || '{}');
        if (passwords[email] === password) {
          setUser(found);
          localStorage.setItem('auth_user', JSON.stringify(found));
          return true;
        }
        return false;
      }
      // デモ用管理者アカウント
      if (email === 'admin@nagato-fudosan.jp' && password === 'admin123') {
        const adminUser: User = { id: 'admin', name: '管理者', email, role: 'admin', isActive: true, emailVerified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setUser(adminUser);
        localStorage.setItem('auth_user', JSON.stringify(adminUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const stored = localStorage.getItem('mock_users');
      const users: User[] = stored ? JSON.parse(stored) : [];
      if (users.find(u => u.email === userData.email)) {
        return false; // すでに登録済み
      }
      const newUser: User = {
        ...userData,
        id: `user_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem('mock_users', JSON.stringify(users));
      setUser(newUser);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
