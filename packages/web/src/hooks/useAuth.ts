// ============================================================
// useAuth — Cognito authentication state management
// Demo mode: returns logged-in user without Cognito
// ============================================================

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { DEMO_MODE } from '@/lib/mock-api';
import { DEMO_USER } from '@/lib/mock-data';

export interface AuthUser {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAuthenticated: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<{ needsConfirmation: boolean }>;
  confirmRegistration: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  refreshSession: () => Promise<void>;
  loginAsDemo: () => void;
}

export type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const DEMO_AUTH_USER: AuthUser = {
  userId: DEMO_USER.userId,
  email: DEMO_USER.email,
  firstName: DEMO_USER.firstName,
  lastName: DEMO_USER.lastName,
  isAuthenticated: true,
};

export function useAuthProvider(): AuthContextType {
  const [state, setState] = useState<AuthState>({
    user: DEMO_MODE ? DEMO_AUTH_USER : null,
    isLoading: !DEMO_MODE,
    isAuthenticated: DEMO_MODE,
    error: null,
  });

  const setError = (error: string | null) =>
    setState((prev) => ({ ...prev, error }));

  const clearError = () => setError(null);

  useEffect(() => {
    if (DEMO_MODE) {
      // Already set up in initial state
      return;
    }
    checkAuth();
  }, []);

  async function checkAuth() {
    if (DEMO_MODE) return;
    try {
      const { getCurrentUser, fetchAuthSession } = await import('aws-amplify/auth');
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken;
      const claims = idToken?.payload;

      setState({
        user: {
          userId: user.userId,
          email: claims?.email as string || '',
          firstName: claims?.given_name as string,
          lastName: claims?.family_name as string,
          isAuthenticated: true,
        },
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  }

  const loginAsDemo = useCallback(() => {
    setState({
      user: DEMO_AUTH_USER,
      isLoading: false,
      isAuthenticated: true,
      error: null,
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (DEMO_MODE) {
      loginAsDemo();
      return;
    }
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const { signIn } = await import('aws-amplify/auth');
      const result = await signIn({ username: email, password });
      if (result.isSignedIn) {
        await checkAuth();
      } else if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        throw new Error('Please verify your email first.');
      }
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Login failed',
      }));
      throw err;
    }
  }, [loginAsDemo]);

  const register = useCallback(
    async (params: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    }) => {
      if (DEMO_MODE) {
        loginAsDemo();
        return { needsConfirmation: false };
      }
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const { signUp } = await import('aws-amplify/auth');
        const result = await signUp({
          username: params.email,
          password: params.password,
          options: {
            userAttributes: {
              email: params.email,
              given_name: params.firstName,
              family_name: params.lastName,
              ...(params.phone && { phone_number: params.phone }),
            },
          },
        });
        setState((prev) => ({ ...prev, isLoading: false }));
        return {
          needsConfirmation: result.nextStep?.signUpStep === 'CONFIRM_SIGN_UP',
        };
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err.message || 'Registration failed',
        }));
        throw err;
      }
    },
    [loginAsDemo],
  );

  const confirmRegistration = useCallback(
    async (email: string, code: string) => {
      if (DEMO_MODE) return;
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const { confirmSignUp } = await import('aws-amplify/auth');
        await confirmSignUp({ username: email, confirmationCode: code });
        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err.message || 'Confirmation failed',
        }));
        throw err;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    if (DEMO_MODE) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
      return;
    }
    try {
      const { signOut } = await import('aws-amplify/auth');
      await signOut();
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    if (DEMO_MODE) return;
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const { resetPassword } = await import('aws-amplify/auth');
      await resetPassword({ username: email });
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Password reset failed',
      }));
      throw err;
    }
  }, []);

  const confirmForgotPassword = useCallback(
    async (email: string, code: string, newPassword: string) => {
      if (DEMO_MODE) return;
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const { confirmResetPassword } = await import('aws-amplify/auth');
        await confirmResetPassword({
          username: email,
          confirmationCode: code,
          newPassword,
        });
        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err.message || 'Password reset confirmation failed',
        }));
        throw err;
      }
    },
    [],
  );

  const refreshSession = useCallback(async () => {
    if (DEMO_MODE) return;
    await checkAuth();
  }, []);

  return {
    ...state,
    login,
    register,
    confirmRegistration,
    logout,
    forgotPassword,
    confirmForgotPassword,
    clearError,
    refreshSession,
    loginAsDemo,
  };
}

export { AuthContext };
