import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, Platform, StatusBar, Dimensions, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@/config/theme';
import { useHaptics } from '@/hooks/useHaptics';
import { getNote, updateNote, type Note } from '@/services/notes';
import { NoteEditor } from '@/components/NoteEditor';

export default function EditNoteModal() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const noteId = typeof id === 'string' ? id : '';

    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { impactLight, success, error: errorHaptic, selection } = useHaptics(true);

    const statusBarHeight = Platform.OS === 'ios'
        ? (Dimensions.get('window').height > 800 ? 44 : 20)
        : StatusBar.currentHeight || 24;

    // Load note once on mount - no focus effects to prevent infinite loop
    useEffect(() => {
        let mounted = true;

        const loadNote = async () => {
            if (!noteId) {
                Alert.alert('Error', 'Invalid note ID');
                router.back();
                return;
            }

            try {
                console.log('Modal: Loading note once:', noteId);
                const data = await getNote(noteId);
                if (mounted) {
                    setNote(data);
                    setLoading(false);
                }
            } catch (error: any) {
                if (mounted) {
                    console.error('Modal load error:', error);
                    setLoading(false);
                    errorHaptic();
                    Alert.alert('Error', 'Failed to load note', [
                        { text: 'Go Back', onPress: () => router.back() }
                    ]);
                }
            }
        };

        loadNote();

        return () => { mounted = false; };
    }, [noteId, errorHaptic]);

    const handleClose = () => {
        selection();
        router.back();
    };

    const onUpdate = async (payload: { title: string; body: string; tags: string[] }) => {
        if (!noteId || !payload.title.trim()) {
            Alert.alert('Title required', 'Please add a title for your note');
            return;
        }

        try {
            setSaving(true);
            impactLight();
            console.log('Modal: Updating note:', noteId);

            await updateNote(noteId, {
                title: payload.title,
                body: payload.body,
                tags: payload.tags.length > 0 ? payload.tags : null,
            });

            success();
            console.log('Modal: Note updated successfully');

            Alert.alert(
                'Note Updated',
                'Your changes have been saved successfully!',
                [
                    {
                        text: 'View Note',
                        onPress: () => router.replace(`/note/${noteId}`)
                    },
                    {
                        text: 'Continue Editing',
                        style: 'cancel'
                    }
                ]
            );
        } catch (error: any) {
            console.error('Modal: Update error:', error);
            errorHaptic();
            Alert.alert('Error', error?.message ?? 'Failed to update note');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { paddingTop: statusBarHeight + 24 }]}>
                <View style={styles.header}>
                    <Pressable onPress={handleClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Loading...</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading your note...</Text>
                    <Pressable style={styles.cancelButton} onPress={handleClose}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    if (!note) {
        return (
            <SafeAreaView style={[styles.container, { paddingTop: statusBarHeight + 24 }]}>
                <View style={styles.header}>
                    <Pressable onPress={handleClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Error</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
                    <Text style={styles.errorText}>Note not found</Text>
                    <Text style={styles.errorSubtitle}>This note may have been deleted or is not accessible.</Text>
                    <Pressable style={styles.button} onPress={handleClose}>
                        <Text style={styles.buttonText}>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { paddingTop: statusBarHeight + 24 }]}>
            <View style={styles.header}>
                <Pressable onPress={handleClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                </Pressable>
                <Text style={styles.headerTitle}>Edit Note</Text>
                <View style={styles.headerSpacer} />
            </View>

            <View style={styles.editorContainer}>
                <NoteEditor
                    initialTitle={note.title}
                    initialBody={note.body}
                    initialTags={note.tags || []}
                    onSubmit={onUpdate}
                    submitting={saving}
                    submitLabel="Update Note"
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        lineHeight: 24,
    },
    headerSpacer: {
        width: 32,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    loadingText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginTop: 16,
        marginBottom: 32,
        lineHeight: 22,
    },
    cancelButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: theme.colors.border,
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.textPrimary,
        lineHeight: 18,
    },
    errorText: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
        lineHeight: 26,
    },
    errorSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
    },
    button: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 18,
    },
    editorContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
});
