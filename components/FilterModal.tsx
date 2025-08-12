import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    Pressable,
    ScrollView,
    Switch,
    Animated,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/contexts/_ThemeContext'; // ✅ Add dark mode
import { useHaptics } from '@/hooks/useHaptics';

const { height: screenHeight } = Dimensions.get('window');

export type SortOption = 'recent' | 'alphabetical' | 'mostEdited' | 'oldest';
export type DateFilter = 'all' | 'today' | 'thisWeek' | 'thisMonth';

export interface FilterOptions {
    sortBy: SortOption;
    dateFilter: DateFilter;
    selectedTags: string[];
    withTagsOnly: boolean;
    longNotesOnly: boolean;
}

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: FilterOptions) => void;
    currentFilters: FilterOptions;
    availableTags: string[];
    tagUsageCount: Record<string, number>;
}

export function FilterModal({
                                visible,
                                onClose,
                                onApply,
                                currentFilters,
                                availableTags,
                                tagUsageCount,
                            }: FilterModalProps) {
    const { theme, isDark } = useTheme(); // ✅ Get current theme
    const insets = useSafeAreaInsets();
    const haptics = useHaptics();

    const [localFilters, setLocalFilters] = useState<FilterOptions>(currentFilters);

    React.useEffect(() => {
        if (visible) {
            setLocalFilters(currentFilters);
        }
    }, [visible, currentFilters]);

    const handleApply = () => {
        haptics.success();
        onApply(localFilters);
    };

    const handleReset = () => {
        haptics.impactMedium();
        const resetFilters: FilterOptions = {
            sortBy: 'recent',
            dateFilter: 'all',
            selectedTags: [],
            withTagsOnly: false,
            longNotesOnly: false,
        };
        setLocalFilters(resetFilters);
    };

    const toggleTag = (tag: string) => {
        haptics.impactLight();
        setLocalFilters(prev => ({
            ...prev,
            selectedTags: prev.selectedTags.includes(tag)
                ? prev.selectedTags.filter(t => t !== tag)
                : [...prev.selectedTags, tag],
        }));
    };

    const hasActiveFilters = () => {
        return (
            localFilters.sortBy !== 'recent' ||
            localFilters.dateFilter !== 'all' ||
            localFilters.selectedTags.length > 0 ||
            localFilters.withTagsOnly ||
            localFilters.longNotesOnly
        );
    };

    const sortOptions: { value: SortOption; label: string; icon: string; description: string }[] = [
        { value: 'recent', label: 'Most Recent', icon: 'time', description: 'Recently updated notes first' },
        { value: 'alphabetical', label: 'A-Z', icon: 'text', description: 'Alphabetical by title' },
        { value: 'oldest', label: 'Oldest First', icon: 'calendar', description: 'Oldest notes first' },
        { value: 'mostEdited', label: 'Most Edited', icon: 'create', description: 'Recently modified notes' },
    ];

    const dateOptions: { value: DateFilter; label: string; icon: string; description: string }[] = [
        { value: 'all', label: 'All Time', icon: 'infinite', description: 'Show all notes' },
        { value: 'today', label: 'Today', icon: 'today', description: 'Notes created today' },
        { value: 'thisWeek', label: 'This Week', icon: 'calendar-outline', description: 'Notes from past 7 days' },
        { value: 'thisMonth', label: 'This Month', icon: 'calendar', description: 'Notes from past 30 days' },
    ];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                {/* ✅ Enhanced header with dark mode */}
                <View style={[styles.header, {
                    backgroundColor: theme.colors.surface,
                    borderBottomColor: theme.colors.border,
                    paddingTop: 16
                }]}>
                    <View style={styles.headerContent}>
                        <Pressable
                            onPress={onClose}
                            style={[styles.headerButton, { backgroundColor: theme.colors.background }]}
                            onPressIn={() => haptics.impactLight()}
                        >
                            <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
                        </Pressable>

                        <View style={styles.headerCenter}>
                            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                                Filter & Sort
                            </Text>
                            {hasActiveFilters() && (
                                <View style={[styles.activeIndicator, { backgroundColor: theme.colors.primary }]}>
                                    <Text style={styles.activeIndicatorText}>Active</Text>
                                </View>
                            )}
                        </View>

                        <Pressable
                            onPress={handleReset}
                            style={[styles.headerButton, { backgroundColor: theme.colors.background }]}
                            onPressIn={() => haptics.impactLight()}
                        >
                            <Text style={[styles.resetButtonText, { color: theme.colors.primary }]}>
                                Reset
                            </Text>
                        </Pressable>
                    </View>
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={[
                        styles.contentContainer,
                        { paddingBottom: insets.bottom + 120 }
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ✅ Sort Section with enhanced design */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="swap-vertical" size={20} color={theme.colors.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                                Sort By
                            </Text>
                        </View>

                        <View style={[styles.optionsCard, { backgroundColor: theme.colors.surface }]}>
                            {sortOptions.map((option, index) => (
                                <Pressable
                                    key={option.value}
                                    style={[
                                        styles.optionItem,
                                        index === sortOptions.length - 1 && styles.lastOptionItem,
                                        localFilters.sortBy === option.value && [
                                            styles.selectedOption,
                                            { backgroundColor: theme.colors.primaryLight }
                                        ],
                                        { borderBottomColor: theme.colors.border }
                                    ]}
                                    onPress={() => {
                                        haptics.selection();
                                        setLocalFilters(prev => ({ ...prev, sortBy: option.value }));
                                    }}
                                >
                                    <View style={styles.optionLeft}>
                                        <View style={[
                                            styles.optionIcon,
                                            localFilters.sortBy === option.value && {
                                                backgroundColor: theme.colors.primary
                                            }
                                        ]}>
                                            <Ionicons
                                                name={option.icon as any}
                                                size={18}
                                                color={localFilters.sortBy === option.value ? 'white' : theme.colors.textSecondary}
                                            />
                                        </View>
                                        <View style={styles.optionText}>
                                            <Text style={[
                                                styles.optionLabel,
                                                { color: theme.colors.textPrimary },
                                                localFilters.sortBy === option.value && { fontWeight: '600' }
                                            ]}>
                                                {option.label}
                                            </Text>
                                            <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                                                {option.description}
                                            </Text>
                                        </View>
                                    </View>
                                    {localFilters.sortBy === option.value && (
                                        <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                                    )}
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* ✅ Date Filter Section with enhanced design */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                                Date Range
                            </Text>
                        </View>

                        <View style={[styles.optionsCard, { backgroundColor: theme.colors.surface }]}>
                            {dateOptions.map((option, index) => (
                                <Pressable
                                    key={option.value}
                                    style={[
                                        styles.optionItem,
                                        index === dateOptions.length - 1 && styles.lastOptionItem,
                                        localFilters.dateFilter === option.value && [
                                            styles.selectedOption,
                                            { backgroundColor: theme.colors.primaryLight }
                                        ],
                                        { borderBottomColor: theme.colors.border }
                                    ]}
                                    onPress={() => {
                                        haptics.selection();
                                        setLocalFilters(prev => ({ ...prev, dateFilter: option.value }));
                                    }}
                                >
                                    <View style={styles.optionLeft}>
                                        <View style={[
                                            styles.optionIcon,
                                            localFilters.dateFilter === option.value && {
                                                backgroundColor: theme.colors.primary
                                            }
                                        ]}>
                                            <Ionicons
                                                name={option.icon as any}
                                                size={18}
                                                color={localFilters.dateFilter === option.value ? 'white' : theme.colors.textSecondary}
                                            />
                                        </View>
                                        <View style={styles.optionText}>
                                            <Text style={[
                                                styles.optionLabel,
                                                { color: theme.colors.textPrimary },
                                                localFilters.dateFilter === option.value && { fontWeight: '600' }
                                            ]}>
                                                {option.label}
                                            </Text>
                                            <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                                                {option.description}
                                            </Text>
                                        </View>
                                    </View>
                                    {localFilters.dateFilter === option.value && (
                                        <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                                    )}
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* ✅ Tags Section with enhanced design */}
                    {availableTags.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="pricetag" size={20} color={theme.colors.primary} />
                                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                                    Filter by Tags
                                </Text>
                                {localFilters.selectedTags.length > 0 && (
                                    <View style={[styles.tagsBadge, { backgroundColor: theme.colors.primary }]}>
                                        <Text style={styles.tagsBadgeText}>
                                            {localFilters.selectedTags.length}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={[styles.tagsContainer, { backgroundColor: theme.colors.surface }]}>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.tagsScrollContent}
                                >
                                    {availableTags
                                        .sort((a, b) => (tagUsageCount[b] || 0) - (tagUsageCount[a] || 0))
                                        .map((tag) => (
                                            <Pressable
                                                key={tag}
                                                style={[
                                                    styles.tagChip,
                                                    localFilters.selectedTags.includes(tag) ? {
                                                        backgroundColor: theme.colors.primary,
                                                    } : {
                                                        backgroundColor: theme.colors.background,
                                                        borderColor: theme.colors.border,
                                                        borderWidth: 1,
                                                    }
                                                ]}
                                                onPress={() => toggleTag(tag)}
                                            >
                                                <Text style={[
                                                    styles.tagChipText,
                                                    {
                                                        color: localFilters.selectedTags.includes(tag)
                                                            ? 'white'
                                                            : theme.colors.textPrimary
                                                    }
                                                ]}>
                                                    #{tag}
                                                </Text>
                                                <View style={[
                                                    styles.tagUsageCount,
                                                    {
                                                        backgroundColor: localFilters.selectedTags.includes(tag)
                                                            ? 'rgba(255,255,255,0.3)'
                                                            : theme.colors.primaryLight
                                                    }
                                                ]}>
                                                    <Text style={[
                                                        styles.tagUsageText,
                                                        {
                                                            color: localFilters.selectedTags.includes(tag)
                                                                ? 'white'
                                                                : theme.colors.primary
                                                        }
                                                    ]}>
                                                        {tagUsageCount[tag] || 0}
                                                    </Text>
                                                </View>
                                            </Pressable>
                                        ))}
                                </ScrollView>
                            </View>
                        </View>
                    )}

                    {/* ✅ Additional Filters Section with enhanced design */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="options" size={20} color={theme.colors.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                                Additional Filters
                            </Text>
                        </View>

                        <View style={[styles.optionsCard, { backgroundColor: theme.colors.surface }]}>
                            <View style={[styles.switchItem, { borderBottomColor: theme.colors.border }]}>
                                <View style={styles.switchLeft}>
                                    <Ionicons name="pricetag" size={18} color={theme.colors.textSecondary} />
                                    <View style={styles.switchText}>
                                        <Text style={[styles.switchLabel, { color: theme.colors.textPrimary }]}>
                                            Only Tagged Notes
                                        </Text>
                                        <Text style={[styles.switchDescription, { color: theme.colors.textSecondary }]}>
                                            Show only notes with tags
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={localFilters.withTagsOnly}
                                    onValueChange={(value) => {
                                        haptics.selection();
                                        setLocalFilters(prev => ({ ...prev, withTagsOnly: value }));
                                    }}
                                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                    thumbColor="white"
                                />
                            </View>

                            <View style={[styles.switchItem, styles.lastSwitchItem, { borderBottomColor: theme.colors.border }]}>
                                <View style={styles.switchLeft}>
                                    <Ionicons name="document-text" size={18} color={theme.colors.textSecondary} />
                                    <View style={styles.switchText}>
                                        <Text style={[styles.switchLabel, { color: theme.colors.textPrimary }]}>
                                            Long Notes Only
                                        </Text>
                                        <Text style={[styles.switchDescription, { color: theme.colors.textSecondary }]}>
                                            Show notes with 100+ characters
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={localFilters.longNotesOnly}
                                    onValueChange={(value) => {
                                        haptics.selection();
                                        setLocalFilters(prev => ({ ...prev, longNotesOnly: value }));
                                    }}
                                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                    thumbColor="white"
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* ✅ Enhanced bottom actions */}
                <View style={[styles.bottomActions, {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                    paddingBottom: insets.bottom + 20
                }]}>
                    <Pressable
                        style={[styles.cancelButton, { backgroundColor: theme.colors.background }]}
                        onPress={onClose}
                        onPressIn={() => haptics.impactLight()}
                    >
                        <Text style={[styles.cancelButtonText, { color: theme.colors.textPrimary }]}>
                            Cancel
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleApply}
                        onPressIn={() => haptics.impactMedium()}
                    >
                        <Ionicons name="checkmark" size={20} color="white" />
                        <Text style={styles.applyButtonText}>
                            Apply Filters
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        borderBottomWidth: 1,
        paddingBottom: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    headerButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    activeIndicator: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    activeIndicatorText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: '600',
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
    },
    tagsBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 24,
        alignItems: 'center',
    },
    tagsBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    optionsCard: {
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    lastOptionItem: {
        borderBottomWidth: 0,
    },
    selectedOption: {
        borderRadius: 12,
        marginHorizontal: 4,
        marginVertical: 2,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 16,
    },
    optionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
    },
    optionText: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 20,
    },
    optionDescription: {
        fontSize: 14,
        lineHeight: 18,
        marginTop: 2,
    },
    tagsContainer: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    tagsScrollContent: {
        paddingRight: 20,
        gap: 12,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 8,
        paddingVertical: 8,
        borderRadius: 16,
        gap: 8,
    },
    tagChipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    tagUsageCount: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        minWidth: 20,
        alignItems: 'center',
    },
    tagUsageText: {
        fontSize: 12,
        fontWeight: '600',
    },
    switchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    lastSwitchItem: {
        borderBottomWidth: 0,
    },
    switchLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 16,
    },
    switchText: {
        flex: 1,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 20,
    },
    switchDescription: {
        fontSize: 14,
        lineHeight: 18,
        marginTop: 2,
    },
    bottomActions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    applyButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});
