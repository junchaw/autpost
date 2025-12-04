import { useEffect, useState, useCallback } from 'react';
import { themeChange } from 'theme-change';

// If you update the themes, remember to update the index.css file as well.
// See: https://daisyui.com/docs/themes/
export type Theme = 'system' | 'light' | 'dark' | 'emerald' | 'cyberpunk' | 'aqua' | 'dracula';

// If you update the themes, remember to update the Banner component as well.
// See: https://daisyui.com/docs/themes/
export const THEMES: { name: string; value: Theme }[] = [
  { name: 'System', value: 'system' },
  { name: 'Light', value: 'light' },
  { name: 'Dark', value: 'dark' },
  { name: 'Emerald', value: 'emerald' },
  { name: 'Cyberpunk', value: 'cyberpunk' },
  { name: 'Aqua', value: 'aqua' },
  { name: 'Dracula', value: 'dracula' },
];

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.setAttribute('data-theme', effectiveTheme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    return stored || 'system';
  });

  const handleSystemThemeChange = useCallback(() => {
    if (theme === 'system') {
      applyTheme('system');
    }
  }, [theme]);

  useEffect(() => {
    // Initialize theme-change
    themeChange(false);
    // Apply initial theme
    applyTheme(theme);
  }, []);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [handleSystemThemeChange]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return { theme, setTheme };
}
