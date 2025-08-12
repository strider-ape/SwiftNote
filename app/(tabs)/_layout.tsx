import { Tabs } from 'expo-router';
import { Platform, Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics'; // ✅ Add haptics import
import { useTheme } from '@/contexts/_ThemeContext'; // ✅ Add dark mode import
import { useRef, useEffect } from 'react';

export default function TabLayout() {
    const { theme, isDark } = useTheme(); // ✅ Add dark mode hook
    const insets = useSafeAreaInsets();

    // Calculate tab bar height based on navigation type
    const getTabBarHeight = () => {
        const baseHeight = 60;

        if (Platform.OS === 'ios') {
            return insets.bottom > 20
                ? baseHeight + insets.bottom // iPhone X+ with home indicator
                : baseHeight + 20; // Older iPhones
        } else {
            return insets.bottom > 0
                ? baseHeight + insets.bottom + 8 // Android gesture navigation
                : baseHeight + 28; // Android navigation buttons
        }
    };

    const getTabBarPadding = () => {
        if (Platform.OS === 'ios') {
            return Math.max(insets.bottom - 4, 8);
        } else {
            return insets.bottom > 0 ? insets.bottom : 16; // Extra padding for button navigation
        }
    };

    // Custom animated tab icon component with haptic feedback
    const AnimatedTabIcon = ({ name, color, size, focused }: {
        name: keyof typeof Ionicons.glyphMap;
        color: string;
        size: number;
        focused: boolean;
    }) => {
        const scaleAnim = useRef(new Animated.Value(focused ? 1.1 : 1)).current;
        const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0.7)).current;

        useEffect(() => {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: focused ? 1.15 : 1,
                    useNativeDriver: true,
                    tension: 150,
                    friction: 8,
                }),
                Animated.timing(opacityAnim, {
                    toValue: focused ? 1 : 0.7,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            // ✅ Add haptic feedback when tab becomes focused
            if (focused && Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
        }, [focused]);

        return (
            <Animated.View
                style={{
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                }}
            >
                <Ionicons name={name} size={size} color={color} />
            </Animated.View>
        );
    };

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary, // ✅ Dynamic active color
                tabBarInactiveTintColor: theme.colors.textSecondary, // ✅ Dynamic inactive color
                tabBarStyle: {
                    height: getTabBarHeight(),
                    paddingBottom: getTabBarPadding(),
                    paddingTop: 4,
                    backgroundColor: theme.colors.surface, // ✅ Dynamic background
                    borderTopWidth: isDark ? 1 : 0, // ✅ Border for dark mode
                    borderTopColor: theme.colors.border, // ✅ Dynamic border color
                    shadowColor: isDark ? 'transparent' : '#000', // ✅ No shadow in dark mode
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0,
                    shadowRadius: 0,
                    elevation: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    lineHeight: 16,
                    marginTop: -2,
                },
                tabBarIconStyle: {
                    marginBottom: 0,
                    marginTop: -4,
                },
                // Custom tab button styling
                tabBarItemStyle: {
                    paddingTop: 4,
                },
                tabBarBackground: () => (
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: theme.colors.surface, // ✅ Dynamic background
                        }}
                    />
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size, focused }) => (
                        <AnimatedTabIcon
                            name="home"
                            color={color}
                            size={size}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="create"
                options={{
                    title: 'Create',
                    tabBarIcon: ({ color, size, focused }) => (
                        <AnimatedTabIcon
                            name="add-circle"
                            color={color}
                            size={size}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size, focused }) => (
                        <AnimatedTabIcon
                            name="settings"
                            color={color}
                            size={size}
                            focused={focused}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
