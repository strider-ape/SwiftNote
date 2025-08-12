import React from 'react';
import { View, StyleSheet, Platform, StatusBar, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/_ThemeContext';

interface ScreenWrapperProps {
    children: React.ReactNode;
    addTabSpacing?: boolean;
    style?: ViewStyle;
}

export function ScreenWrapper({ children, addTabSpacing = false, style }: ScreenWrapperProps) {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();

    return (
        <>
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={theme.colors.background}
                translucent={false}
            />
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.colors.background,
                        paddingTop: insets.top,
                        paddingBottom: addTabSpacing ? 0 : insets.bottom,
                    },
                    style
                ]}
            >
                {children}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
