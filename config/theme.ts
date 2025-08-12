import { useColorScheme } from 'react-native';
import { useMemo } from 'react';

export const lightTheme = {
    colors: {
        primary: '#3b82f6',
        primaryLight: '#dbeafe',
        background: '#f8fafc',
        surface: '#ffffff',
        textPrimary: '#1f2937',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        error: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
    }
};

export const darkTheme = {
    colors: {
        primary: '#60a5fa',
        primaryLight: '#1e3a8a',
        background: '#0f172a',
        surface: '#1e293b',
        textPrimary: '#f1f5f9',
        textSecondary: '#94a3b8',
        border: '#334155',
        error: '#f87171',
        warning: '#fbbf24',
        success: '#34d399',
    }
};

export const getTheme = (isDark: boolean) => isDark ? darkTheme : lightTheme;

// Keep original theme export for backward compatibility
export const theme = lightTheme;
