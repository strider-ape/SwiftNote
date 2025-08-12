import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { useTheme } from '@/contexts/_ThemeContext'; // ✅ Dark mode
import { getNote, updateNote, type Note } from '@/services/notes';
import { useHaptics } from '@/hooks/useHaptics';

export default function EditNoteScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [note, setNote] = useState<Note | null>(null);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagsInput, setTagsInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isTagsFocused, setIsTagsFocused] = useState(false);

    const haptics = useHaptics();

    const processedTags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

    const fetchNote = useCallback(async () => {
        if (!id) return;
        let mounted = true;
        try {
            setLoading(true);
            const noteData = await getNote(id);
            if (mounted) {
                setNote(noteData);
                setTitle(noteData.title);
                setBody(noteData.body);
                if (noteData.tags && Array.isArray(noteData.tags)) {
                    setTags(noteData.tags);
                    setTagsInput(noteData.tags.join(', '));
                }
            }
        } catch (error) {
            if (mounted) {
                console.error('Error fetching note:', error);
                haptics.error();
                Alert.alert('Error', 'Failed to load note for editing.');
                router.back();
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

    const handleSave = async () => {
        if (!title.trim()) {
            haptics.error();
            Alert.alert('Error', 'Please enter a title for your note.');
            return;
        }
        try {
            setSaving(true);
            haptics.impactMedium();
            await updateNote(id!, {
                title: title.trim(),
                body: body.trim(),
                tags: processedTags,
            });
            setHasUnsavedChanges(false);
            haptics.success();
            router.back();
        } catch (error) {
            console.error('Error saving note:', error);
            haptics.error();
            Alert.alert('Error', 'Failed to save note. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        if (hasUnsavedChanges) {
            haptics.warning();
            Alert.alert(
                'Unsaved Changes',
                'You have unsaved changes. What would you like to do?',
                [
                    { text: 'Keep Editing', style: 'cancel', onPress: () => haptics.impactLight() },
                    { text: 'Discard Changes', style: 'destructive', onPress: () => { haptics.impactMedium(); router.back(); } },
                    { text: 'Save Changes', onPress: () => { haptics.impactLight(); handleSave(); } }
                ]
            );
        } else {
            haptics.impactLight();
            router.back();
        }
    };

    const checkForChanges = useCallback(() => {
        if (!note) return;
        const currentTags = processedTags;
        const originalTags = note.tags || [];
        const hasChanges =
            title.trim() !== note.title ||
            body.trim() !== note.body ||
            JSON.stringify(currentTags.sort()) !== JSON.stringify(originalTags.sort());
        setHasUnsavedChanges(hasChanges);
    }, [title, body, processedTags, note]);

    const removeTag = (tagToRemove: string) => {
        haptics.impactLight();
        const remainingTags = processedTags.filter(tag => tag !== tagToRemove);
        setTagsInput(remainingTags.join(', '));
    };

    useFocusEffect(
        useCallback(() => {
            fetchNote();
        }, [fetchNote])
    );

    React.useEffect(() => {
        checkForChanges();
    }, [checkForChanges]);

    if (loading) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <ScreenWrapper>
                    <View style={styles.loadingContainer}>
                        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                            Loading note...
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
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    {/* ✅ Header without white circle background */}
                    <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
                        <Pressable
                            onPress={handleBack}
                            style={styles.backButton} // now transparent
                            onPressIn={() => haptics.impactLight()}
                        >
                            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                        </Pressable>
                        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Edit Note</Text>
                        <Pressable
                            onPress={handleSave}
                            style={[
                                styles.saveHeaderButton,
                                { backgroundColor: hasUnsavedChanges ? theme.colors.primary : 'transparent', opacity: saving ? 0.6 : 1 }
                            ]}
                            disabled={saving}
                            onPressIn={() => haptics.impactMedium()}
                        >
                            {saving ? (
                                <Text style={[styles.saveHeaderText, { color: 'white' }]}>Saving...</Text>
                            ) : (
                                <Text style={[styles.saveHeaderText, { color: hasUnsavedChanges ? 'white' : theme.colors.primary }]}>
                                    Save
                                </Text>
                            )}
                        </Pressable>
                    </View>

                    <ScrollView
                        style={[styles.content, { backgroundColor: theme.colors.background }]}
                        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={[styles.inputCard, { backgroundColor: theme.colors.surface }]}>

                            {/* Title Section */}
                            <View style={styles.inputSection}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                                    <Text style={[styles.sectionLabel, { color: theme.colors.textPrimary }]}>Title</Text>
                                </View>
                                <TextInput
                                    style={[styles.titleInput, { color: theme.colors.textPrimary, backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                                    placeholder="Enter note title..."
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholderTextColor={theme.colors.textSecondary}
                                    autoFocus
                                    onFocus={() => haptics.selection()}
                                />
                            </View>

                            {/* Tags Section */}
                            <View style={styles.inputSection}>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.sectionLeft}>
                                        <Ionicons
                                            name="pricetag"
                                            size={18}
                                            color={isTagsFocused || tagsInput.trim() ? theme.colors.primary : theme.colors.textSecondary}
                                        />
                                        <Text style={[styles.sectionLabel, { color: isTagsFocused || tagsInput.trim() ? theme.colors.primary : theme.colors.textSecondary }]}>
                                            Tags
                                        </Text>
                                    </View>
                                    {processedTags.length > 0 && (
                                        <View style={[styles.tagsBadge, { backgroundColor: theme.colors.primary }]}>
                                            <Text style={styles.tagsBadgeText}>{processedTags.length}</Text>
                                        </View>
                                    )}
                                </View>

                                <TextInput
                                    style={[
                                        styles.tagsInput,
                                        { borderColor: isTagsFocused ? theme.colors.primary : theme.colors.border,
                                            backgroundColor: isTagsFocused || tagsInput.trim() ? theme.colors.primaryLight : theme.colors.background,
                                            borderWidth: isTagsFocused ? 2 : 1,
                                            color: theme.colors.textPrimary
                                        }
                                    ]}
                                    placeholder="Add tags separated by commas"
                                    value={tagsInput}
                                    onChangeText={setTagsInput}
                                    placeholderTextColor={theme.colors.textSecondary}
                                    onFocus={() => { setIsTagsFocused(true); haptics.selection(); }}
                                    onBlur={() => setIsTagsFocused(false)}
                                />

                                {/* Tag Preview */}
                                {processedTags.length > 0 && (
                                    <View style={styles.tagPreviewContainer}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagPreviewScroll}>
                                            {processedTags.map((tag, index) => (
                                                <View key={index} style={[styles.tagPreviewChip, { backgroundColor: theme.colors.primaryLight }]}>
                                                    <Text style={[styles.tagPreviewText, { color: theme.colors.primary }]}>#{tag}</Text>
                                                    <Pressable
                                                        style={styles.removeTagButton}
                                                        onPress={() => removeTag(tag)}
                                                        onPressIn={() => haptics.impactLight()}
                                                    >
                                                        <Ionicons name="close" size={14} color={theme.colors.textSecondary} />
                                                    </Pressable>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                            {/* Content Section */}
                            <View style={styles.inputSection}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="document-text-outline" size={18} color={theme.colors.primary} />
                                    <Text style={[styles.sectionLabel, { color: theme.colors.textPrimary }]}>Content</Text>
                                    <Text style={[styles.characterCount, { color: theme.colors.textSecondary, backgroundColor: theme.colors.background }]}>
                                        {body.length} characters
                                    </Text>
                                </View>
                                <TextInput
                                    style={[styles.bodyInput, { color: theme.colors.textPrimary, backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                                    placeholder="Write your note content here..."
                                    value={body}
                                    onChangeText={setBody}
                                    placeholderTextColor={theme.colors.textSecondary}
                                    multiline
                                    textAlignVertical="top"
                                    onFocus={() => haptics.selection()}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: 16 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'transparent', // ✅ No white background
    },
    headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center', marginHorizontal: 16 },
    saveHeaderButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, minWidth: 80, alignItems: 'center' },
    saveHeaderText: { fontSize: 16, fontWeight: '600' },
    content: { flex: 1 },
    contentContainer: { padding: 20 },
    inputCard: { borderRadius: 20, padding: 24 },
    inputSection: { marginBottom: 28 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionLabel: { fontSize: 16, fontWeight: '600' },
    characterCount: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    titleInput: { fontSize: 20, fontWeight: '600', paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 },
    tagsInput: { fontSize: 16, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, minHeight: 48 },
    bodyInput: { fontSize: 16, paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, minHeight: 200, lineHeight: 24, textAlignVertical: 'top' },
    tagsBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, minWidth: 24, alignItems: 'center' },
    tagsBadgeText: { fontSize: 12, fontWeight: '600', color: 'white' },
    tagPreviewContainer: { marginTop: 12 },
    tagPreviewScroll: { paddingRight: 20 },
    tagPreviewChip: { flexDirection: 'row', alignItems: 'center', paddingLeft: 12, paddingRight: 8, paddingVertical: 8, borderRadius: 20, marginRight: 8, gap: 8 },
    tagPreviewText: { fontSize: 14, fontWeight: '600' },
    removeTagButton: { padding: 4, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.3)' },
});
