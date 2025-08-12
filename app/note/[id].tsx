import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { useTheme } from '@/contexts/_ThemeContext'; // ✅ Add dark mode
import { getNote, deleteNote, type Note } from '@/services/notes';
import { useHaptics } from '@/hooks/useHaptics';

export default function NoteDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { theme } = useTheme(); // ✅ Get current theme
    const insets = useSafeAreaInsets();
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const haptics = useHaptics();

    const fetchNote = useCallback(async () => {
        if (!id) return;

        let mounted = true;

        try {
            setLoading(true);
            setError(null);
            const fetchedNote = await getNote(id);

            if (mounted) {
                setNote(fetchedNote);
            }
        } catch (err) {
            if (mounted) {
                console.error('Error fetching note:', err);
                haptics.error();
                setError(err instanceof Error ? err.message : 'Failed to load note');
            }
        } finally {
            if (mounted) {
                setLoading(false);
            }
        }

        return () => {
            mounted = false;
        };
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            fetchNote();
        }, [fetchNote])
    );

    const handleEdit = () => {
        if (note) {
            haptics.impactLight();
            console.log('Navigating to edit from note:', note.id);
            router.push(`/edit/${note.id}`);
        }
    };

    const handleDelete = () => {
        if (!note) return;

        haptics.warning();

        Alert.alert(
            'Delete Note',
            `Are you sure you want to delete "${note.title}"? This action cannot be undone.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => haptics.impactLight(),
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            haptics.impactHeavy();
                            await deleteNote(note.id);
                            haptics.success();
                            router.back();
                        } catch (error) {
                            console.error('Error deleting note:', error);
                            haptics.error();
                            Alert.alert('Error', 'Failed to delete note. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const handleBack = () => {
        haptics.impactLight();
        router.back();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />

                <ScreenWrapper>
                    <View style={[styles.header, {
                        backgroundColor: theme.colors.surface,
                        borderBottomColor: theme.colors.border
                    }]}>
                        <Pressable
                            onPress={handleBack}
                            style={styles.backButton}
                            onPressIn={() => haptics.impactLight()}
                        >
                            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                        </Pressable>
                        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Note</Text>
                        <View style={styles.headerSpacer} />
                    </View>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                            Loading note...
                        </Text>
                    </View>
                </ScreenWrapper>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />

                <ScreenWrapper>
                    <View style={[styles.header, {
                        backgroundColor: theme.colors.surface,
                        borderBottomColor: theme.colors.border
                    }]}>
                        <Pressable
                            onPress={handleBack}
                            style={styles.backButton}
                            onPressIn={() => haptics.impactLight()}
                        >
                            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                        </Pressable>
                        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Note</Text>
                        <View style={styles.headerSpacer} />
                    </View>
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
                        <Text style={[styles.errorTitle, { color: theme.colors.textPrimary }]}>
                            Error Loading Note
                        </Text>
                        <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>
                            {error}
                        </Text>
                        <Pressable
                            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
                            onPress={fetchNote}
                            onPressIn={() => haptics.impactMedium()}
                        >
                            <Text style={styles.retryButtonText}>Try Again</Text>
                        </Pressable>
                    </View>
                </ScreenWrapper>
            </>
        );
    }

    if (!note) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />

                <ScreenWrapper>
                    <View style={[styles.header, {
                        backgroundColor: theme.colors.surface,
                        borderBottomColor: theme.colors.border
                    }]}>
                        <Pressable
                            onPress={handleBack}
                            style={styles.backButton}
                            onPressIn={() => haptics.impactLight()}
                        >
                            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                        </Pressable>
                        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Note</Text>
                        <View style={styles.headerSpacer} />
                    </View>
                    <View style={styles.errorContainer}>
                        <Ionicons name="document-outline" size={48} color={theme.colors.textSecondary} />
                        <Text style={[styles.errorTitle, { color: theme.colors.textPrimary }]}>
                            Note Not Found
                        </Text>
                        <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>
                            The note you&#39;re looking for doesn&#39;t exist.
                        </Text>
                    </View>
                </ScreenWrapper>
            </>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />

            <ScreenWrapper>
                {/* ✅ Header with dynamic theming */}
                <View style={[styles.header, {
                    backgroundColor: theme.colors.surface,
                    borderBottomColor: theme.colors.border
                }]}>
                    <Pressable
                        onPress={handleBack}
                        style={styles.backButton}
                        onPressIn={() => haptics.impactLight()}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Note</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView
                    style={[styles.content, { backgroundColor: theme.colors.background }]}
                    contentContainerStyle={[
                        styles.contentContainer,
                        { paddingBottom: insets.bottom + 100 }
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.noteContainer, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.noteTitle, { color: theme.colors.textPrimary }]}>
                            {note.title}
                        </Text>

                        <View style={[styles.noteMeta, { borderBottomColor: theme.colors.border }]}>
                            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                                Created: {formatDate(note.created_at)}
                            </Text>
                            {note.updated_at !== note.created_at && (
                                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                                    Updated: {formatDate(note.updated_at)}
                                </Text>
                            )}
                            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                                {note.body.length} characters • {note.body.trim().split(/\s+/).filter(word => word.length > 0).length} words
                            </Text>
                        </View>

                        {note.tags && Array.isArray(note.tags) && note.tags.length > 0 && (
                            <View style={styles.tagsContainer}>
                                <Text style={[styles.tagsLabel, { color: theme.colors.textPrimary }]}>
                                    Tags
                                </Text>
                                <View style={styles.tagsGrid}>
                                    {note.tags.map((tag, index) => (
                                        <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primaryLight }]}>
                                            <Text style={[styles.tagText, { color: theme.colors.primary }]}>
                                                #{tag}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View style={styles.bodyContainer}>
                            <Text style={[styles.bodyLabel, { color: theme.colors.textPrimary }]}>
                                Content
                            </Text>
                            <Text style={[styles.noteBody, { color: theme.colors.textPrimary }]}>
                                {note.body}
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={[styles.bottomActions, {
                    paddingBottom: insets.bottom + 20,
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border
                }]}>
                    <Pressable
                        style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleEdit}
                        onPressIn={() => haptics.impactMedium()}
                    >
                        <Ionicons name="create-outline" size={20} color="white" />
                        <Text style={styles.editButtonText}>Edit Note</Text>
                    </Pressable>

                    <Pressable
                        style={styles.deleteButton}
                        onPress={handleDelete}
                        onPressIn={() => haptics.warning()}
                    >
                        <Ionicons name="trash-outline" size={20} color="white" />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </Pressable>
                </View>
            </ScreenWrapper>
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
        marginRight: 12,
        borderRadius: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    noteContainer: {
        borderRadius: 16,
        padding: 20,
    },
    noteTitle: {
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 32,
        marginBottom: 16,
    },
    noteMeta: {
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    metaText: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 4,
    },
    tagsContainer: {
        marginBottom: 20,
    },
    tagsLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    tagsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    tagText: {
        fontSize: 14,
        fontWeight: '500',
    },
    bodyContainer: {
        marginTop: 4,
    },
    bodyLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    noteBody: {
        fontSize: 16,
        lineHeight: 24,
    },
    bottomActions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        gap: 12,
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ef4444',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        gap: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});
