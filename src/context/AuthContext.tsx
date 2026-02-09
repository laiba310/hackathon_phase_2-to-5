'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for token on initial load
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode the token to get user info
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));

        // Check if token is expired
        const exp = decodedPayload.exp;
        const currentTime = Math.floor(Date.now() / 1000);

        if (exp && exp < currentTime) {
          console.log('Token has expired');
          localStorage.removeItem('token');
          setIsLoading(false);
          return;
        }

        const userData: User = {
          id: decodedPayload.user_id || decodedPayload.userId || 0,
          name: decodedPayload.name || decodedPayload.sub?.split('@')[0] || '',
          email: decodedPayload.sub || ''
        };
        setUser(userData);
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    try {
      // Decode the token to get user info
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));

      const userData: User = {
        id: decodedPayload.user_id || decodedPayload.userId || 0,
        name: decodedPayload.name || decodedPayload.sub?.split('@')[0] || '',
        email: decodedPayload.sub || ''
      };
      setUser(userData);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };

  const logout = () => {
    setIsLoggingOut(true);
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
    setIsLoggingOut(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isLoggingOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};