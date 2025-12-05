import { fetchApi } from './client';
import type { Pagination } from './types';

export interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateRoleInput {
  name: string;
  description?: string | null;
  permissions?: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string | null;
  permissions?: string[];
}

export interface RoleListParams {
  page?: number;
  perPage?: number;
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
}

export interface RoleBinding {
  id: number;
  user_id: number;
  role_id: number;
  user: UserSummary;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface CreateRoleBindingInput {
  user_id: number;
  role_id: number;
}

export interface RoleBindingListParams {
  page?: number;
  perPage?: number;
  user_id?: number;
  role_id?: number;
}

export interface UserListParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export const rolesApi = {
  list: (params: RoleListParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.perPage) searchParams.set('per_page', params.perPage.toString());
    const query = searchParams.toString();
    return fetchApi<{ roles: Role[]; pagination: Pagination }>(`/roles${query ? `?${query}` : ''}`);
  },

  get: (id: number) => fetchApi<{ role: Role }>(`/roles/${id}`),

  create: (data: CreateRoleInput) =>
    fetchApi<{ message: string; role: Role }>('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateRoleInput) =>
    fetchApi<{ message: string; role: Role }>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<{ message: string }>(`/roles/${id}`, {
      method: 'DELETE',
    }),
};

export const roleBindingsApi = {
  list: (params: RoleBindingListParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.perPage) searchParams.set('per_page', params.perPage.toString());
    if (params.user_id) searchParams.set('user_id', params.user_id.toString());
    if (params.role_id) searchParams.set('role_id', params.role_id.toString());
    const query = searchParams.toString();
    return fetchApi<{ role_bindings: RoleBinding[]; pagination: Pagination }>(
      `/role-bindings${query ? `?${query}` : ''}`
    );
  },

  get: (id: number) => fetchApi<{ role_binding: RoleBinding }>(`/role-bindings/${id}`),

  create: (data: CreateRoleBindingInput) =>
    fetchApi<{ message: string; role_binding: RoleBinding }>('/role-bindings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<{ message: string }>(`/role-bindings/${id}`, {
      method: 'DELETE',
    }),
};

export const usersApi = {
  list: (params: UserListParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.perPage) searchParams.set('per_page', params.perPage.toString());
    if (params.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    return fetchApi<{ users: UserSummary[]; pagination: Pagination }>(
      `/users${query ? `?${query}` : ''}`
    );
  },
};
