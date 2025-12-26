export const colors = {
  light: {
    background: '#ffffff',
    foreground: '#0f172a',
    primary: '#1e293b',
    'primary-foreground': '#f8fafc',
    secondary: '#f1f5f9',
    'secondary-foreground': '#1e293b',
    muted: '#f1f5f9',
    'muted-foreground': '#64748b',
    accent: '#f1f5f9',
    'accent-foreground': '#1e293b',
    destructive: '#ef4444',
    'destructive-foreground': '#f8fafc',
    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#0f172a',
  },
  dark: {
    background: '#0b0b16',
    foreground: '#f8fafc',
    primary: '#f8fafc',
    'primary-foreground': '#1e293b',
    secondary: '#1e293b',
    'secondary-foreground': '#f8fafc',
    muted: '#1e293b',
    'muted-foreground': '#94a3b8',
    accent: '#1e293b',
    'accent-foreground': '#f8fafc',
    destructive: '#991b1b',
    'destructive-foreground': '#f8fafc',
    border: '#1e293b',
    input: '#1e293b',
    ring: '#cbd5e1',
  },
};

export type ColorScheme = 'light' | 'dark';

export function getColors(scheme: ColorScheme) {
  return colors[scheme];
}

