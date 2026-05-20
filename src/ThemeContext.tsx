import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check local storage or default to dark (since dark is the default premium style)
    const saved = localStorage.getItem('usama_portfolio_theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return 'dark'; // default
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove both to start clean
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('usama_portfolio_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
