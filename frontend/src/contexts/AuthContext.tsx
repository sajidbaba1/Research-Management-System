import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  institution?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  institution?: string;
  department?: string;
  role?: string;
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
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ username, password });
      const { token: authToken } = response;
      
      setToken(authToken);
      localStorage.setItem('token', authToken);
      
      // You might want to decode JWT or make another API call to get user info
      // For now, we'll store minimal user info
      const userInfo = {
        id: 1, // This would come from JWT decode or user profile API
        username,
        email: '', // Would come from user profile
        firstName: '',
        lastName: '',
        role: 'USER'
      };
      
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    try {
      setIsLoading(true);
      await authAPI.signup(userData);
      // After successful signup, automatically log in
      await login(userData.username, userData.password);
    } catch (error: any) {
      console.error('Signup failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Signup failed. Please try again.';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    signup,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
