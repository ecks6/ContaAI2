import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId?: string;
  preferences: {
    language: string;
    theme: string;
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
}

interface Company {
  _id: string;
  name: string;
  cui: string;
  regCom: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  vatRate: number;
  currency: string;
  fiscalYear: string;
  invoicePrefix: string;
  invoiceCounter: number;
  contactPerson: string;
  bankAccount: string;
  bankName: string;
  activityCode: string;
  employees: number;
  foundedYear: number;
  legalForm: string;
}

interface AuthContextType {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  setupCompany: (companyData: any) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  updateCompany: (companyData: Partial<Company>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          apiService.setToken(token);
          const response = await apiService.getCurrentUser();
          setUser(response.user);
          setCompany(response.company);
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      apiService.setToken(response.token);
      setUser(response.user);
      setCompany(response.company);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await apiService.register(userData);
      apiService.setToken(response.token);
      setUser(response.user);
      setCompany(response.company);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiService.removeToken();
    setUser(null);
    setCompany(null);
  };

  const setupCompany = async (companyData: any) => {
    try {
      const response = await apiService.setupCompany(companyData);
      setCompany(response.company);
    } catch (error) {
      throw error;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const updateCompany = (companyData: Partial<Company>) => {
    if (company) {
      setCompany({ ...company, ...companyData });
    }
  };

  const value = {
    user,
    company,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    setupCompany,
    updateUser,
    updateCompany,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};