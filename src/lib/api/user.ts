import { fetchApi, fetchApiFormData } from './client';
import type { User } from './auth';

export interface UpdateProfileInput {
  name?: string;
}

export interface AvatarResponse {
  message: string;
  avatar: string;
}

export interface ProfileResponse {
  message: string;
  user: User;
}

export interface EmailChangeRequestInput {
  email: string;
}

export interface EmailChangeRequestResponse {
  message: string;
  code?: string; // Only in development
}

export interface EmailChangeVerifyInput {
  email: string;
  code: string;
}

export interface ChangePasswordInput {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export const userApi = {
  updateProfile: (data: UpdateProfileInput) =>
    fetchApi<ProfileResponse>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return fetchApiFormData<AvatarResponse>('/user/avatar', formData);
  },

  deleteAvatar: () =>
    fetchApi<{ message: string }>('/user/avatar', {
      method: 'DELETE',
    }),

  emailChangeRequest: (data: EmailChangeRequestInput) =>
    fetchApi<EmailChangeRequestResponse>('/user/email/request', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  emailChangeVerify: (data: EmailChangeVerifyInput) =>
    fetchApi<ProfileResponse>('/user/email/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  changePassword: (data: ChangePasswordInput) =>
    fetchApi<{ message: string }>('/user/password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
