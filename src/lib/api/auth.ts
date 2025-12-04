import { fetchApi } from './client';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface UserResponse {
  user: User;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterResponse {
  message: string;
  code?: string; // Only in development
}

export interface VerifyCodeInput {
  email: string;
  code: string;
}

export interface PasswordResetRequestInput {
  email: string;
}

export interface PasswordResetInput {
  email: string;
  code: string;
  password: string;
  password_confirmation: string;
}

export const authApi = {
  login: (data: LoginInput) =>
    fetchApi<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    fetchApi<{ message: string }>('/logout', {
      method: 'POST',
    }),

  getUser: () => fetchApi<UserResponse>('/user'),

  // Registration
  register: (data: RegisterInput) =>
    fetchApi<RegisterResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  registerVerify: (data: VerifyCodeInput) =>
    fetchApi<LoginResponse>('/register/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Password reset
  passwordResetRequest: (data: PasswordResetRequestInput) =>
    fetchApi<RegisterResponse>('/password/reset-request', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  passwordResetVerify: (data: VerifyCodeInput) =>
    fetchApi<{ message: string }>('/password/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  passwordReset: (data: PasswordResetInput) =>
    fetchApi<{ message: string }>('/password/reset', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
