import type { ScreenSize, ResponsiveSize } from '../lib/api';

export const DEFAULT_SIZES: Record<ScreenSize, ResponsiveSize> = {
  sm: { widthMode: 'column', width: 24, height: 300 },
  md: { widthMode: 'column', width: 12, height: 400 },
  lg: { widthMode: 'column', width: 8, height: 400 },
};

export const SCREEN_SIZE_LABELS: Record<ScreenSize, string> = {
  sm: 'Small (mobile devices)',
  md: 'Medium (tablets)',
  lg: 'Large (desktops)',
};
