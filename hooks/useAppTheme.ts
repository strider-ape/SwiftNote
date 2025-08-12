import { useColorScheme } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from '@/config/theme';

type ThemePreference = 'system' | 'light' | 'dark';

export const useAppTheme = () => {
    const systemScheme = useColorScheme();
    const [userPreference, setUserPreference] = useState<ThemePreference>('system');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved preference
    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const saved = await AsyncStorage.getItem('themePreference');
                if (saved && ['system', 'light', 'dark'].includes(saved)) {
                    setUserPreference(saved as ThemePreference);
                }
            } catch (error) {
                console.log('Error loading theme preference:', error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadThemePreference();
    }, []);

    // Save preference when changed
    const setTheme = async (preference: ThemePreference) => {
        try {
            setUserPreference(preference);
            await AsyncStorage.setItem('themePreference', preference);
        } catch (error) {
            console.log('Error saving theme preference:', error);
        }
    };

    const isDark = useMemo(() => {
        if (!isLoaded) return false; // Default to light while loading

        return userPreference === 'system'
            ? systemScheme === 'dark'
            : userPreference === 'dark';
    }, [systemScheme, userPreference, isLoaded]);

    const theme = useMemo(() => getTheme(isDark), [isDark]);

    return {
        theme,
        isDark,
        setTheme,
        userPreference,
        isLoaded
    };
};
