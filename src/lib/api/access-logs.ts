import { fetchApi } from './client';
import type { Pagination } from './types';

export interface AccessLog {
  id: number;
  source: string;
  path: string;
  ip: string;
  user_agent: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAccessLogInput {
  source: string;
  path: string;
  ip: string;
  user_agent: string;
}

export interface UpdateAccessLogInput {
  source?: string;
  path?: string;
  ip?: string;
  user_agent?: string;
}

export interface AccessLogListParams {
  page?: number;
  perPage?: number;
  source?: string;
  path?: string;
  ip?: string;
}

export const accessLogsApi = {
  list: (params: AccessLogListParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.perPage) searchParams.set('per_page', params.perPage.toString());
    if (params.source) searchParams.set('source', params.source);
    if (params.path) searchParams.set('path', params.path);
    if (params.ip) searchParams.set('ip', params.ip);
    const query = searchParams.toString();
    return fetchApi<{ access_logs: AccessLog[]; pagination: Pagination }>(
      `/access-logs${query ? `?${query}` : ''}`
    );
  },

  get: (id: number) => fetchApi<{ access_log: AccessLog }>(`/access-logs/${id}`),

  create: (data: CreateAccessLogInput) =>
    fetchApi<{ message: string; access_log: AccessLog }>('/access-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateAccessLogInput) =>
    fetchApi<{ message: string; access_log: AccessLog }>(`/access-logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<{ message: string }>(`/access-logs/${id}`, {
      method: 'DELETE',
    }),
};
