import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { colors as colorTokens } from './tokens';

type ThemeMode = 'light' | 'dark';

type Theme = {
  mode: ThemeMode;
  colors: typeof colorTokens.dark;
  toggle: () => void;
};

const ThemeContext = createContext<Theme | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemScheme === 'light' ? 'light' : 'dark');

  const toggle = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const value = useMemo<Theme>(() => {
    const colors = mode === 'light' ? colorTokens.light : colorTokens.dark;
    return { mode, colors, toggle };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
