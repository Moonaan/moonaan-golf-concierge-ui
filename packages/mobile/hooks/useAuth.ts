import { createContext, useContext, useCallback } from 'react';
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../lib/api';
import type { User } from '../lib/types';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
}

interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  ghinNumber?: string;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  continueAsGuest: () => {},
});

export function useAuthProvider(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        const userData = await api.get<User>('/auth/me');
        setUser(userData);
      }
    } catch {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password }, { skipAuth: true });
    await SecureStore.setItemAsync('auth_token', response.accessToken);
    await SecureStore.setItemAsync('refresh_token', response.refreshToken);
    setUser(response.user);
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    const response = await api.post('/auth/signup', data, { skipAuth: true });
    await SecureStore.setItemAsync('auth_token', response.accessToken);
    await SecureStore.setItemAsync('refresh_token', response.refreshToken);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {} // best-effort
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('refresh_token');
    setUser(null);
  }, []);

  const continueAsGuest = useCallback(() => {
    setUser({
      id: 'guest',
      email: '',
      name: 'Guest',
      memberSince: new Date().toISOString(),
      tier: 'guest',
      preferences: {
        pace: 'moderate',
        cartOrWalk: 'no_preference',
        notificationsEnabled: false,
        weatherAlerts: true,
        bookingReminders: true,
      },
    });
    setLoading(false);
  }, []);

  return {
    user,
    isAuthenticated: !!user && user.id !== 'guest',
    loading,
    login,
    signup,
    logout,
    continueAsGuest,
  };
}

export function useAuth() {
  return useContext(AuthContext);
}
