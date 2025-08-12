import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { useTheme } from '@/contexts/_ThemeContext';
import { createNote } from '@/services/notes';
import { useHaptics } from '@/hooks/useHaptics';

export default function CreateNoteScreen() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [tags, setTags] = useState('');
    const [creating, setCreating] = useState(false);
    const [isTagsFocused, setIsTagsFocused] = useState(false);

    const haptics = useHaptics();

    // Process tags for validation and display
    const processedTags = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

    const handleCreate = async () => {
        if (!title.trim()) {
            haptics.error();
            Alert.alert('Please enter a title');
            return;
        }

        try {
            setCreating(true);
            haptics.impactMedium();

            const noteData = {
                title: title.trim(),
                body: body.trim(),
                tags: processedTags,
            };

            const newNote = await createNote(noteData);

            haptics.success();

            setTitle('');
            setBody('');
            setTags('');

            router.push(`/note/${newNote.id}`);

        } catch (error) {
            console.error('Error creating note:', error);
            haptics.error();
            Alert.alert('Error', 'Failed to create note. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const removeTag = (tagToRemove: string) => {
        haptics.impactLight();
        const remainingTags = processedTags.filter(tag => tag !== tagToRemove);
        setTags(remainingTags.join(', '));
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={[styles.header, {
                    backgroundColor: theme.colors.surface,
                    borderBottomColor: theme.colors.border
                }]}>
                    <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                        Create Note
                    </Text>
                </View>

                {/* ✅ FIXED: Scrollable content with proper bottom padding for fixed button */}
                <ScrollView
                    style={[styles.content, { backgroundColor: theme.colors.background }]}
                    contentContainerStyle={[
                        styles.contentContainer,
                        { paddingBottom: 100 } // ✅ Space for fixed button + extra margin
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={[styles.noteCard, { backgroundColor: theme.colors.surface }]}>
                        {/* Title Input */}
                        <TextInput
                            style={[styles.titleInput, {
                                color: theme.colors.textPrimary,
                                borderBottomColor: theme.colors.border,
                                backgroundColor: theme.colors.background
                            }]}
                            placeholder="Note title..."
                            value={title}
                            onChangeText={setTitle}
                            placeholderTextColor={theme.colors.textSecondary}
                            autoFocus
                            multiline
                            onFocus={() => haptics.selection()}
                        />

                        {/* Tags Section */}
                        <View style={styles.tagsSection}>
                            <View style={styles.tagsHeader}>
                                <View style={styles.tagsHeaderLeft}>
                                    <Ionicons
                                        name="pricetag"
                                        size={16}
                                        color={isTagsFocused || tags.trim() ? theme.colors.primary : theme.colors.textSecondary}
                                    />
                                    <Text style={[
                                        styles.tagsLabel,
                                        { color: isTagsFocused || tags.trim() ? theme.colors.primary : theme.colors.textSecondary }
                                    ]}>
                                        Tags
                                    </Text>
                                </View>
                                {processedTags.length > 0 && (
                                    <View style={[styles.tagsBadge, { backgroundColor: theme.colors.primary }]}>
                                        <Text style={styles.tagsBadgeText}>
                                            {processedTags.length}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={[
                                styles.tagsInputContainer,
                                {
                                    borderColor: isTagsFocused ? theme.colors.primary : theme.colors.border,
                                    backgroundColor: isTagsFocused || tags.trim() ? theme.colors.primaryLight : theme.colors.background,
                                    borderWidth: isTagsFocused ? 2 : 1,
                                }
                            ]}>
                                <TextInput
                                    style={[styles.tagsInput, { color: theme.colors.textPrimary }]}
                                    placeholder="Add tags separated by commas"
                                    value={tags}
                                    onChangeText={setTags}
                                    placeholderTextColor={theme.colors.textSecondary}
                                    onFocus={() => {
                                        setIsTagsFocused(true);
                                        haptics.selection();
                                    }}
                                    onBlur={() => setIsTagsFocused(false)}
                                    multiline
                                />
                                {tags.trim() && (
                                    <Pressable
                                        style={styles.clearTagsButton}
                                        onPress={() => {
                                            haptics.impactLight();
                                            setTags('');
                                        }}
                                    >
                                        <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
                                    </Pressable>
                                )}
                            </View>

                            {/* Tag Preview */}
                            {processedTags.length > 0 && (
                                <View style={[styles.tagPreviewContainer, { borderTopColor: theme.colors.border }]}>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.tagPreviewScroll}
                                    >
                                        {processedTags.map((tag, index) => (
                                            <View key={index} style={[styles.tagPreviewChip, { backgroundColor: theme.colors.primaryLight }]}>
                                                <Text style={[styles.tagPreviewText, { color: theme.colors.primary }]}>
                                                    #{tag}
                                                </Text>
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

                        {/* Body Input */}
                        <TextInput
                            style={[styles.bodyInput, {
                                color: theme.colors.textPrimary,
                                backgroundColor: theme.colors.background,
                                borderColor: theme.colors.border
                            }]}
                            placeholder="Start writing..."
                            value={body}
                            onChangeText={setBody}
                            placeholderTextColor={theme.colors.textSecondary}
                            multiline
                            textAlignVertical="top"
                            onFocus={() => haptics.selection()}
                        />
                    </View>
                </ScrollView>

                {/* ✅ FIXED: Button positioned above keyboard, outside scroll area */}
                <View style={[styles.fixedButtonContainer, {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                    paddingBottom: insets.bottom || 20
                }]}>
                    <Pressable
                        style={[
                            styles.createButton,
                            {
                                backgroundColor: title.trim() ? theme.colors.primary : theme.colors.textSecondary,
                                opacity: creating ? 0.7 : 1,
                            }
                        ]}
                        onPress={handleCreate}
                        disabled={!title.trim() || creating}
                        onPressIn={() => haptics.impactLight()}
                    >
                        <Ionicons
                            name={creating ? "hourglass" : "checkmark"}
                            size={20}
                            color="white"
                        />
                        <Text style={styles.createButtonText}>
                            {creating ? 'Creating...' : 'Create Note'}
                        </Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
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
    noteCard: {
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    titleInput: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 24,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderBottomWidth: 2,
    },

    // Tags section
    tagsSection: {
        marginBottom: 24,
    },
    tagsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    tagsHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tagsLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    tagsBadge: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        minWidth: 24,
        alignItems: 'center',
    },
    tagsBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    tagsInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 4,
        minHeight: 48,
    },
    tagsInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 0,
        textAlignVertical: 'top',
    },
    clearTagsButton: {
        padding: 8,
        marginTop: 8,
    },

    // Tag preview
    tagPreviewContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    tagPreviewScroll: {
        paddingRight: 20,
    },
    tagPreviewChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 8,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        gap: 8,
    },
    tagPreviewText: {
        fontSize: 14,
        fontWeight: '600',
    },
    removeTagButton: {
        padding: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },

    bodyInput: {
        fontSize: 16,
        lineHeight: 24,
        minHeight: 200,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        textAlignVertical: 'top',
    },

    // ✅ FIXED: Button container positioned above keyboard
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 0,

    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});
