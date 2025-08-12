import React, { createContext, useContext, ReactNode } from 'react';
import { useAppTheme } from '@/hooks/useAppTheme';

type ThemeContextType = ReturnType<typeof useAppTheme>;

const _ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const themeValue = useAppTheme();

    return (
        <_ThemeContext.Provider value={themeValue}>
            {children}
        </_ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(_ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export default function ThemeContextFile() {
    return null; // This component will never be rendered as a route
}
