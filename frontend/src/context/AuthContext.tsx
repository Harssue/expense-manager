import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

interface AuthContextType {
  user: any;
  login: (token: string, refresh: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode token or fetch profile? For now just assume logged in if token exists
      // In real app, verify token or fetch /me
      setUser({ name: 'User' }); 
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, refresh: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refresh', refresh);
    setUser({ name: 'User' });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
