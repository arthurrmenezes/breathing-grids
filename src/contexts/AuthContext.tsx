import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/authService';
import { googleAuthService, GoogleSignInResponse } from '@/services/googleAuthService';
import { api } from '@/services/api';
import type { User, AuthState, LoginRequest, RegisterRequest } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (firstName: string, lastName: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const savedUser = localStorage.getItem('user');

      if (accessToken && refreshToken) {
        api.setAccessToken(accessToken);
        
        // Try to get user profile
        const profileResponse = await authService.getProfile();
        
        if (profileResponse.data) {
          const user: User = {
            accountId: profileResponse.data.accountId,
            firstName: profileResponse.data.firstName,
            lastName: profileResponse.data.lastName,
            email: profileResponse.data.email,
            balance: profileResponse.data.balance,
          };
          
          localStorage.setItem('user', JSON.stringify(user));
          
          setState({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } else if (profileResponse.status === 401 && refreshToken) {
          // Try to refresh token
          const refreshResponse = await authService.refreshToken({ RefreshToken: refreshToken });
          
          if (refreshResponse.data) {
            const newProfileResponse = await authService.getProfile();
            
            if (newProfileResponse.data) {
              const user: User = {
                accountId: newProfileResponse.data.accountId,
                firstName: newProfileResponse.data.firstName,
                lastName: newProfileResponse.data.lastName,
                email: newProfileResponse.data.email,
                balance: newProfileResponse.data.balance,
              };
              
              localStorage.setItem('user', JSON.stringify(user));
              
              setState({
                user,
                accessToken: refreshResponse.data.accessToken,
                refreshToken: refreshResponse.data.refreshToken,
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }
          }
          
          // Refresh failed, clear auth
          api.setAccessToken(null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          setState({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } else {
          // Use saved user if available
          if (savedUser) {
            setState({
              user: JSON.parse(savedUser),
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            setState(prev => ({ ...prev, isLoading: false }));
          }
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loginData: LoginRequest = { Email: email, Password: password };
    const response = await authService.login(loginData);

    if (response.error) {
      return { success: false, error: response.error };
    }

    if (response.data) {
      // Get user profile after login
      const profileResponse = await authService.getProfile();
      
      if (profileResponse.data) {
        const user: User = {
          accountId: profileResponse.data.accountId,
          firstName: profileResponse.data.firstName,
          lastName: profileResponse.data.lastName,
          email: profileResponse.data.email,
          balance: profileResponse.data.balance,
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        
        setState({
          user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
        
        return { success: true };
      }
    }

    return { success: false, error: 'Erro ao fazer login' };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const result = await googleAuthService.signIn();

    if (!result.success || !result.data) {
      return { success: false, error: result.error || 'Erro ao autenticar com Google' };
    }

    const googleData = result.data;

    // Set tokens
    api.setAccessToken(googleData.accessToken);
    localStorage.setItem('refreshToken', googleData.refreshToken);

    // Create user from Google response
    const user: User = {
      accountId: googleData.accountId,
      firstName: googleData.firstName || '',
      lastName: googleData.lastName || '',
      email: googleData.email,
      balance: 0, // Will be updated when fetching profile
    };

    localStorage.setItem('user', JSON.stringify(user));

    setState({
      user,
      accessToken: googleData.accessToken,
      refreshToken: googleData.refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });

    // Try to fetch full profile to get balance
    try {
      const profileResponse = await authService.getProfile();
      if (profileResponse.data) {
        const fullUser: User = {
          accountId: profileResponse.data.accountId,
          firstName: profileResponse.data.firstName,
          lastName: profileResponse.data.lastName,
          email: profileResponse.data.email,
          balance: profileResponse.data.balance,
        };
        localStorage.setItem('user', JSON.stringify(fullUser));
        setState(prev => ({ ...prev, user: fullUser }));
      }
    } catch (error) {
      // Profile fetch is optional, continue with basic user data
    }

    return { success: true };
  }, []);

  const register = useCallback(async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    const registerData: RegisterRequest = {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Password: password,
      RePassword: confirmPassword,
    };

    const response = await authService.register(registerData);

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const refreshAuth = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return false;
    }

    const response = await authService.refreshToken({ RefreshToken: refreshToken });

    if (response.data) {
      setState(prev => ({
        ...prev,
        accessToken: response.data!.accessToken,
        refreshToken: response.data!.refreshToken,
      }));
      return true;
    }

    return false;
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;
      
      const updatedUser = { ...prev.user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshAuth,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
