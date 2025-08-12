import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@/config/theme';

type Props = {
    initialTitle?: string;
    initialBody?: string;
    initialTags?: string[];
    onSubmit: (data: { title: string; body: string; tags: string[] }) => Promise<void>;
    submitting: boolean;
    submitLabel: string;
};

export function NoteEditor({
                               initialTitle = '',
                               initialBody = '',
                               initialTags = [],
                               onSubmit,
                               submitting,
                               submitLabel
                           }: Props) {
    const [title, setTitle] = useState(initialTitle);
    const [body, setBody] = useState(initialBody);
    const [tags, setTags] = useState<string[]>(initialTags);
    const [tagInput, setTagInput] = useState('');
    const [titleFocused, setTitleFocused] = useState(false);
    const [bodyFocused, setBodyFocused] = useState(false);
    const [tagFocused, setTagFocused] = useState(false);

    const addTag = () => {
        const newTag = tagInput.trim();
        if (newTag && !tags.includes(newTag) && newTag.length <= 20) {
            setTags([...tags, newTag]);
            setTagInput('');
        } else if (newTag.length > 20) {
            Alert.alert('Tag too long', 'Tags must be 20 characters or less');
        } else if (tags.includes(newTag)) {
            Alert.alert('Duplicate tag', 'This tag already exists');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert('Title Required', 'Please enter a title for your note');
            return;
        }

        await onSubmit({
            title: title.trim(),
            body: body.trim(),
            tags: tags.filter(tag => tag.trim().length > 0)
        });
    };

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.form}>
                {/* Title Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                        style={[
                            styles.titleInput,
                            titleFocused && styles.inputFocused,
                            !title.trim() && styles.inputError
                        ]}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Enter note title..."
                        placeholderTextColor={theme.colors.textSecondary}
                        multiline={false}
                        returnKeyType="next"
                        onFocus={() => setTitleFocused(true)}
                        onBlur={() => setTitleFocused(false)}
                        maxLength={100}
                    />
                    {title.length > 80 && (
                        <Text style={styles.characterCount}>
                            {title.length}/100
                        </Text>
                    )}
                </View>

                {/* Body Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Content</Text>
                    <TextInput
                        style={[
                            styles.bodyInput,
                            bodyFocused && styles.inputFocused
                        ]}
                        value={body}
                        onChangeText={setBody}
                        placeholder="Write your thoughts here..."
                        placeholderTextColor={theme.colors.textSecondary}
                        multiline
                        textAlignVertical="top"
                        returnKeyType="default"
                        onFocus={() => setBodyFocused(true)}
                        onBlur={() => setBodyFocused(false)}
                        scrollEnabled={false}
                    />
                </View>

                {/* Tags Section */}
                <View style={styles.inputGroup}>
                    <View style={styles.tagHeader}>
                        <Text style={styles.label}>Tags</Text>
                        <Text style={styles.tagCount}>
                            {tags.length}/10
                        </Text>
                    </View>

                    {/* Add Tag Input */}
                    <View style={styles.tagInputContainer}>
                        <TextInput
                            style={[
                                styles.tagInput,
                                tagFocused && styles.inputFocused
                            ]}
                            value={tagInput}
                            onChangeText={setTagInput}
                            placeholder="Add a tag..."
                            placeholderTextColor={theme.colors.textSecondary}
                            returnKeyType="done"
                            onSubmitEditing={addTag}
                            onFocus={() => setTagFocused(true)}
                            onBlur={() => setTagFocused(false)}
                            maxLength={20}
                            editable={tags.length < 10}
                        />
                        <Pressable
                            style={[
                                styles.addTagButton,
                                (!tagInput.trim() || tags.length >= 10) && styles.addTagButtonDisabled
                            ]}
                            onPress={addTag}
                            disabled={!tagInput.trim() || tags.length >= 10}
                        >
                            <Ionicons name="add" size={16} color="white" />
                        </Pressable>
                    </View>

                    {/* Tags Display */}
                    {tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {tags.map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                    <Pressable onPress={() => removeTag(tag)} style={styles.tagRemove}>
                                        <Ionicons name="close" size={12} color={theme.colors.textSecondary} />
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    )}

                    {tags.length === 0 && (
                        <Text style={styles.tagHint}>
                            Add tags to organize and find your notes easily
                        </Text>
                    )}
                </View>

                {/* Character Statistics */}
                <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>Words</Text>
                        <Text style={styles.statValue}>
                            {body.trim() ? body.trim().split(/\s+/).length : 0}
                        </Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>Characters</Text>
                        <Text style={styles.statValue}>{body.length}</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>Tags</Text>
                        <Text style={styles.statValue}>{tags.length}</Text>
                    </View>
                </View>
            </View>

            {/* Submit Button */}
            <View style={styles.submitContainer}>
                <Pressable
                    style={[
                        styles.submitButton,
                        submitting && styles.submitButtonDisabled,
                        !title.trim() && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={submitting || !title.trim()}
                >
                    {submitting ? (
                        <>
                            <Ionicons name="cloud-upload-outline" size={18} color="white" />
                            <Text style={styles.submitButtonText}>Saving...</Text>
                        </>
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                            <Text style={styles.submitButtonText}>{submitLabel}</Text>
                        </>
                    )}
                </Pressable>

                {!title.trim() && (
                    <Text style={styles.submitHint}>
                        Title is required to save your note
                    </Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        lineHeight: 22,
    },
    titleInput: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        lineHeight: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    bodyInput: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: theme.colors.textPrimary,
        minHeight: 200,
        maxHeight: 400,
        lineHeight: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    inputFocused: {
        borderColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    characterCount: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        textAlign: 'right',
        marginTop: 4,
        lineHeight: 16,
    },
    tagHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tagCount: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        lineHeight: 16,
    },
    tagInputContainer: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    tagInput: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: theme.colors.textPrimary,
        lineHeight: 22,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    addTagButton: {
        backgroundColor: theme.colors.primary,
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    addTagButtonDisabled: {
        backgroundColor: theme.colors.textSecondary,
        opacity: 0.5,
        shadowOpacity: 0.1,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight,
        borderColor: theme.colors.primary,
        borderWidth: 1,
        paddingLeft: 12,
        paddingRight: 8,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    tagText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.primary,
        lineHeight: 18,
    },
    tagRemove: {
        padding: 2,
        borderRadius: 10,
    },
    tagHint: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
        marginTop: 8,
        lineHeight: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    stat: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '500',
        marginBottom: 4,
        lineHeight: 16,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        lineHeight: 24,
    },
    submitContainer: {
        marginTop: 32,
        paddingBottom: 40,
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.6,
        backgroundColor: theme.colors.textSecondary,
        shadowOpacity: 0.1,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 20,
    },
    submitHint: {
        fontSize: 14,
        color: theme.colors.error,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 18,
    },
});
