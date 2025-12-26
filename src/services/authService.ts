// Auth Service for API calls

import { api } from './api';
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  ResendConfirmationEmailRequest,
  UpdateProfileRequest,
  AccountProfile,
} from '@/types/auth';

export const authService = {
  // Register new account
  async register(data: RegisterRequest) {
    return api.post<RegisterResponse>('/auth/register', data);
  },

  // Login
  async login(data: LoginRequest) {
    const response = await api.post<LoginResponse>('/auth/login', data);
    if (response.data) {
      api.setAccessToken(response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response;
  },

  // Refresh token
  async refreshToken(data: RefreshTokenRequest) {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh-token', data);
    if (response.data) {
      api.setAccessToken(response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response;
  },

  // Logout
  async logout() {
    const response = await api.post('/auth/logout');
    api.setAccessToken(null);
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return response;
  },

  // Confirm email
  async confirmEmail(email: string, token: string) {
    const params = new URLSearchParams({ email, token });
    return api.get(`/auth/confirm-email?${params.toString()}`);
  },

  // Resend confirmation email
  async resendConfirmationEmail(data: ResendConfirmationEmailRequest) {
    return api.post('/auth/resend-confirmation-email', data);
  },

  // Forgot password
  async forgotPassword(data: ForgotPasswordRequest) {
    return api.post('/auth/forgot-password', data);
  },

  // Reset password (from email link)
  async resetPassword(email: string, token: string, data: ResetPasswordRequest) {
    const params = new URLSearchParams({ email, token });
    return api.post(`/auth/reset-password?${params.toString()}`, data);
  },

  // Change password (authenticated)
  async changePassword(data: ChangePasswordRequest) {
    return api.post('/auth/change-password', data);
  },

  // Get account profile
  async getProfile() {
    return api.get<AccountProfile>('/accounts/profile');
  },

  // Update account profile
  async updateProfile(data: UpdateProfileRequest) {
    return api.patch<AccountProfile>('/accounts/profile', data);
  },
};
