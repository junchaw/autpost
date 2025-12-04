const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export type WidthMode = 'column' | 'fixed';
export type ScreenSize = 'sm' | 'md' | 'lg';

export interface ResponsiveSize {
  widthMode: WidthMode;
  width: number;
  height: number;
}

export interface PanelConfig {
  panel: string;
  sm?: ResponsiveSize;
  md?: ResponsiveSize;
  lg?: ResponsiveSize;
}

export interface DashboardConfig {
  panels: PanelConfig[];
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}/api${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  health: () => fetchApi<{ status: string; timestamp: string }>('/health'),

  config: {
    get: (userId = 'default') => fetchApi<{ config: DashboardConfig }>(`/config?user_id=${userId}`),

    update: (config: DashboardConfig, userId = 'default') =>
      fetchApi<{ message: string; config: DashboardConfig }>('/config', {
        method: 'POST',
        body: JSON.stringify({ config, user_id: userId }),
      }),
  },
};
