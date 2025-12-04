import { fetchApi } from './client';

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

export const configApi = {
  get: () => fetchApi<{ config: DashboardConfig }>('/config'),

  update: (config: DashboardConfig) =>
    fetchApi<{ message: string; config: DashboardConfig }>('/config', {
      method: 'POST',
      body: JSON.stringify({ config }),
    }),
};
