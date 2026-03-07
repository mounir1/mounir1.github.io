import React, { createContext, useState, useMemo, useContext } from 'react';
import { themes } from '@/constants/themes';

export type CustomTheme = keyof typeof themes;

interface CustomThemeContextType {
  theme: CustomTheme;
  setTheme: (theme: CustomTheme) => void;
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(
  undefined
);

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<CustomTheme>('default');

  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <CustomThemeContext.Provider value={themeValue}>
      {children}
    </CustomThemeContext.Provider>
  );
};

export const useCustomTheme = () => {
  const context = useContext(CustomThemeContext);
  if (!context) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider');
  }
  return context;
};
