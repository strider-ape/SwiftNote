import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { useTheme } from '@/contexts/_ThemeContext';
import { useHaptics } from '@/hooks/useHaptics';
import { deleteAllNotes } from '@/services/notes'; // ✅ Import the delete function

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const [hapticFeedback, setHapticFeedback] = useState(true);
    const { theme, isDark, setTheme, userPreference } = useTheme();

    const haptics = useHaptics();

    useEffect(() => {
        let mounted = true;

        const loadPreferences = async () => {
            try {
                const savedHaptic = await AsyncStorage.getItem('hapticEnabled');

                if (mounted) {
                    if (savedHaptic !== null) {
                        setHapticFeedback(savedHaptic === 'true');
                    }
                }
            } catch (error) {
                if (mounted) {
                    console.log('Error loading preferences:', error);
                }
            }
        };

        loadPreferences();

        return () => {
            mounted = false;
        };
    }, []);

    const toggleHaptic = async (value: boolean) => {
        haptics.selection();
        setHapticFeedback(value);
        try {
            await AsyncStorage.setItem('hapticEnabled', value.toString());
        } catch (error) {
            console.log('Error saving haptic preference:', error);
        }
    };

    const handleThemeSelection = (themeOption: 'light' | 'dark') => {
        haptics.selection();
        setTheme(themeOption);
    };

    // ✅ FIXED: Single warning with actual delete functionality
    const handleDeleteAllNotes = () => {
        haptics.warning();

        Alert.alert(
            'Delete All Notes',
            'This will permanently delete all your notes. This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => haptics.impactLight(),
                },
                {
                    text: 'Delete All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            haptics.impactHeavy();

                            // ✅ Actually delete all notes
                            await deleteAllNotes();

                            haptics.success();
                            Alert.alert(
                                'Success',
                                'All notes have been deleted successfully.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => haptics.impactLight(),
                                    }
                                ]
                            );
                        } catch (error) {
                            console.error('Error deleting all notes:', error);
                            haptics.error();
                            Alert.alert(
                                'Error',
                                'Failed to delete notes. Please try again.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => haptics.impactLight(),
                                    }
                                ]
                            );
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScreenWrapper>
            <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Settings</Text>
            </View>

            <ScrollView
                style={[styles.content, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={[
                    styles.contentContainer,
                    { paddingBottom: insets.bottom + 20 }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Appearance Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Appearance</Text>

                    <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }]}>
                        {['light', 'dark'].map((themeOption, index) => (
                            <Pressable
                                key={themeOption}
                                style={[
                                    styles.settingItem,
                                    index === 1 && styles.lastSettingItem,
                                    { borderBottomColor: theme.colors.border }
                                ]}
                                onPress={() => handleThemeSelection(themeOption as 'light' | 'dark')}
                                onPressIn={() => haptics.impactLight()}
                            >
                                <View style={styles.settingLeft}>
                                    <Ionicons
                                        name={themeOption === 'light' ? 'sunny' : 'moon'}
                                        size={20}
                                        color={theme.colors.textSecondary}
                                    />
                                    <View>
                                        <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>
                                            {themeOption === 'light' ? 'Light Mode' : 'Dark Mode'}
                                        </Text>
                                        <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                                            {themeOption === 'light'
                                                ? 'Use light colors for all screens'
                                                : 'Use dark colors for all screens'
                                            }
                                        </Text>
                                    </View>
                                </View>
                                {(userPreference === themeOption ||
                                    (userPreference === 'system' && ((themeOption === 'dark' && isDark) || (themeOption === 'light' && !isDark)))) && (
                                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                                )}
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Preferences</Text>

                    <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }]}>
                        <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="phone-portrait" size={20} color={theme.colors.textSecondary} />
                                <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>Haptic Feedback</Text>
                            </View>
                            <Switch
                                value={hapticFeedback}
                                onValueChange={toggleHaptic}
                                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                thumbColor={hapticFeedback ? 'white' : '#f3f4f6'}
                            />
                        </View>
                    </View>
                </View>

                {/* Storage Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Storage</Text>

                    <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }]}>
                        <Pressable
                            style={[styles.settingItem, styles.lastSettingItem, { borderBottomColor: theme.colors.border }]}
                            onPress={handleDeleteAllNotes}
                            onPressIn={() => haptics.impactLight()}
                        >
                            <View style={styles.settingLeft}>
                                <Ionicons name="trash" size={20} color="#ef4444" />
                                <View>
                                    <Text style={[styles.settingTitle, { color: '#ef4444' }]}>Delete All Notes</Text>
                                    <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>Permanently remove all notes</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#ef4444" />
                        </Pressable>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>About</Text>

                    <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }]}>
                        <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                                <View>
                                    <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>SwiftNote</Text>
                                    <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>Version 1.0.0</Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.settingItem, styles.lastSettingItem, { borderBottomColor: theme.colors.border }]}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="code-slash" size={20} color={theme.colors.textSecondary} />
                                <View>
                                    <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>Built with React Native</Text>
                                    <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>Expo SDK 51</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    settingCard: {
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    lastSettingItem: {
        borderBottomWidth: 0,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 16,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    settingSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
});
