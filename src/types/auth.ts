// Auth Types for API Integration

export interface RegisterRequest {
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string;
  RePassword: string;
}

export interface RegisterResponse {
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  balance: number;
  createdAt: string;
}

export interface LoginRequest {
  Email: string;
  Password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  RefreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ResendConfirmationEmailRequest {
  email: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
}

export interface AccountProfile {
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  balance: number;
  updatedAt?: string;
  createdAt: string;
}

export interface User {
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  balance: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
