import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Alert, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { FilterModal, FilterOptions, type SortOption, type DateFilter } from '@/components/FilterModal';
import { useTheme } from '@/contexts/_ThemeContext'; // ✅ Use dynamic theme
import { listNotes, type Note } from '@/services/notes';
import { useHaptics } from '@/hooks/useHaptics';

export default function HomeScreen() {
    const { theme } = useTheme(); // ✅ Get current theme (light/dark)
    const insets = useSafeAreaInsets();
    const [notes, setNotes] = useState<Note[]>([]);
    const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [allTags, setAllTags] = useState<string[]>([]);

    const haptics = useHaptics();

    const [filters, setFilters] = useState<FilterOptions>({
        sortBy: 'recent',
        dateFilter: 'all',
        selectedTags: [],
        withTagsOnly: false,
        longNotesOnly: false,
    });

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const calculateTagUsage = useCallback((notes: Note[]): Record<string, number> => {
        const tagUsage: Record<string, number> = {};

        notes.forEach(note => {
            if (note.tags && Array.isArray(note.tags)) {
                note.tags.forEach(tag => {
                    tagUsage[tag] = (tagUsage[tag] || 0) + 1;
                });
            }
        });

        return tagUsage;
    }, []);

    const fetchNotes = useCallback(async () => {
        let mounted = true;

        try {
            setLoading(true);
            const data = await listNotes();

            if (mounted) {
                setNotes(data);

                const tags = new Set<string>();
                data.forEach(note => {
                    if (note.tags && Array.isArray(note.tags)) {
                        note.tags.forEach(tag => {
                            if (tag && typeof tag === 'string') {
                                tags.add(tag);
                            }
                        });
                    }
                });
                setAllTags(Array.from(tags));
            }
        } catch (error) {
            if (mounted) {
                console.error('Error fetching notes:', error);
                haptics.error();
                Alert.alert('Error', 'Failed to load notes. Please try again.');
            }
        } finally {
            if (mounted) {
                setLoading(false);
            }
        }

        return () => {
            mounted = false;
        };
    }, []);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        haptics.selection();
        await fetchNotes();
        setRefreshing(false);
        haptics.impactLight();
    }, [fetchNotes]);

    const sortNotes = (notesToSort: Note[], sortBy: SortOption): Note[] => {
        const sorted = [...notesToSort];

        switch (sortBy) {
            case 'recent':
                return sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            case 'alphabetical':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'mostEdited':
                return sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            default:
                return sorted;
        }
    };

    const filterByDate = (notesToFilter: Note[], dateFilter: DateFilter): Note[] => {
        if (dateFilter === 'all') return notesToFilter;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return notesToFilter.filter(note => {
            const noteDate = new Date(note.created_at);

            switch (dateFilter) {
                case 'today':
                    return noteDate >= today;
                case 'thisWeek':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return noteDate >= weekAgo;
                case 'thisMonth':
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return noteDate >= monthAgo;
                default:
                    return true;
            }
        });
    };

    const applyFiltersAndSort = useCallback(() => {
        let filtered = notes;

        if (searchQuery.trim()) {
            filtered = filtered.filter(note =>
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (note.body && note.body.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        filtered = filterByDate(filtered, filters.dateFilter);

        if (filters.selectedTags.length > 0) {
            filtered = filtered.filter(note =>
                note.tags && Array.isArray(note.tags) && filters.selectedTags.some(tag => note.tags!.includes(tag))
            );
        }

        if (filters.withTagsOnly) {
            filtered = filtered.filter(note => note.tags && Array.isArray(note.tags) && note.tags.length > 0);
        }

        if (filters.longNotesOnly) {
            filtered = filtered.filter(note => note.body && note.body.length >= 100);
        }

        filtered = sortNotes(filtered, filters.sortBy);

        setFilteredNotes(filtered);
    }, [notes, searchQuery, filters]);

    const clearAllFilters = () => {
        haptics.impactMedium();
        setSearchQuery('');
        setFilters({
            sortBy: 'recent',
            dateFilter: 'all',
            selectedTags: [],
            withTagsOnly: false,
            longNotesOnly: false,
        });
    };

    const hasActiveFilters = () => {
        return searchQuery.trim() !== '' ||
            filters.dateFilter !== 'all' ||
            filters.selectedTags.length > 0 ||
            filters.withTagsOnly ||
            filters.longNotesOnly ||
            filters.sortBy !== 'recent';
    };

    const getActiveFiltersText = () => {
        const activeFilters = [];

        if (filters.sortBy !== 'recent') {
            const sortLabels = {
                alphabetical: 'A-Z',
                mostEdited: 'Recent',
                oldest: 'Oldest'
            };
            activeFilters.push(`📅 ${sortLabels[filters.sortBy] || filters.sortBy}`);
        }

        if (filters.selectedTags.length > 0) {
            activeFilters.push(`🏷️ ${filters.selectedTags.slice(0, 2).join(', ')}${filters.selectedTags.length > 2 ? '...' : ''}`);
        }

        if (filters.dateFilter !== 'all') {
            activeFilters.push(`📆 ${filters.dateFilter}`);
        }

        return activeFilters.join(' • ');
    };

    const handleNotePress = (note: Note) => {
        haptics.impactLight();
        router.push(`/note/${note.id}`);
    };

    const handleFilterPress = () => {
        haptics.selection();
        setShowFilterModal(true);
    };

    const handleFilterModalClose = () => {
        haptics.impactLight();
        setShowFilterModal(false);
    };

    const handleFilterApply = (newFilters: FilterOptions) => {
        haptics.success();
        setFilters(newFilters);
        setShowFilterModal(false);
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotes();
        }, [])
    );

    React.useEffect(() => {
        applyFiltersAndSort();
    }, [applyFiltersAndSort]);

    const renderNote = ({ item }: { item: Note }) => (
        <Pressable
            style={[styles.noteCard, { backgroundColor: theme.colors.surface }]} // ✅ Dynamic background
            onPress={() => handleNotePress(item)}
            onPressIn={() => haptics.selection()}
        >
            <Text style={[styles.noteTitle, { color: theme.colors.textPrimary }]} numberOfLines={2}>
                {item.title}
            </Text>

            <Text style={[styles.notePreview, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                {item.body || 'No content'}
            </Text>

            {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                <View style={styles.noteTags}>
                    {item.tags.slice(0, 3).map((tag, index) => (
                        <View key={index} style={[styles.noteTag, { backgroundColor: theme.colors.primaryLight }]}>
                            <Text style={[styles.noteTagText, { color: theme.colors.primary }]}>
                                #{tag}
                            </Text>
                        </View>
                    ))}
                    {item.tags.length > 3 && (
                        <Text style={[styles.moreTagsText, { color: theme.colors.textSecondary }]}>
                            +{item.tags.length - 3}
                        </Text>
                    )}
                </View>
            )}
        </Pressable>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons
                name={hasActiveFilters() ? "funnel-outline" : "document-text-outline"}
                size={48}
                color={theme.colors.textSecondary} // ✅ Dynamic icon color
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                {hasActiveFilters() ? 'No notes match your filters' : 'No notes yet'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                {hasActiveFilters()
                    ? 'Try adjusting your search or filters'
                    : 'Create your first note to get started'
                }
            </Text>
            {hasActiveFilters() && (
                <Pressable
                    style={[styles.clearFiltersButton, { backgroundColor: theme.colors.primary }]}
                    onPress={clearAllFilters}
                    onPressIn={() => haptics.impactLight()}
                >
                    <Text style={styles.clearFiltersText}>Clear all filters</Text>
                </Pressable>
            )}
        </View>
    );

    return (
        <ScreenWrapper addTabSpacing={false}>
            {/* ✅ Compact header with dynamic theming */}
            <View style={[styles.greetingSection, { backgroundColor: theme.colors.background }]}>
                <View style={styles.greetingRow}>
                    <View style={styles.greetingLeft}>
                        <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
                            {getGreeting()}
                        </Text>
                        <Text style={[styles.appName, { color: theme.colors.textPrimary }]}>
                            SwiftNote
                        </Text>
                    </View>
                    <Text style={[
                        styles.notesCountTop,
                        {
                            color: theme.colors.primary,
                            backgroundColor: theme.colors.primaryLight
                        }
                    ]}>
                        {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                    </Text>
                </View>
            </View>

            {/* ✅ Search section with dynamic theming */}
            <View style={[styles.searchSection, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
                    <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.textPrimary }]}
                        placeholder="Search..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={theme.colors.textSecondary}
                        onFocus={() => haptics.selection()}
                        onSubmitEditing={() => haptics.impactLight()}
                    />
                    {searchQuery.trim() && (
                        <Pressable
                            onPress={() => {
                                haptics.impactLight();
                                setSearchQuery('');
                            }}
                            style={styles.clearButton}
                        >
                            <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
                        </Pressable>
                    )}
                    <Pressable
                        onPress={handleFilterPress}
                        style={[styles.filterButton, hasActiveFilters() && styles.filterButtonActive]}
                        onPressIn={() => haptics.selection()}
                    >
                        <Ionicons
                            name="options-outline"
                            size={18}
                            color={hasActiveFilters() ? theme.colors.primary : theme.colors.textSecondary}
                        />
                    </Pressable>
                </View>

                {hasActiveFilters() && (
                    <View style={[styles.activeFiltersContainer, { backgroundColor: theme.colors.primaryLight }]}>
                        <Text style={[styles.activeFiltersText, { color: theme.colors.primary }]}>
                            {getActiveFiltersText()}
                        </Text>
                    </View>
                )}
            </View>

            {/* ✅ Notes list with dynamic theming */}
            <FlatList
                data={filteredNotes}
                renderItem={renderNote}
                keyExtractor={(item) => item.id}
                style={styles.list}
                contentContainerStyle={[
                    styles.listContainer,
                    filteredNotes.length === 0 && styles.emptyListContainer,
                    { paddingBottom: insets.bottom + 85 }
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={theme.colors.primary} // ✅ Dynamic refresh color
                        colors={[theme.colors.primary]}
                    />
                }
                ListEmptyComponent={renderEmptyState}
                ItemSeparatorComponent={() => <View style={styles.noteSeparator} />}
            />

            <FilterModal
                visible={showFilterModal}
                onClose={handleFilterModalClose}
                onApply={handleFilterApply}
                currentFilters={filters}
                availableTags={allTags}
                tagUsageCount={calculateTagUsage(notes)}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    // ✅ Layout-only styles (no colors)
    greetingSection: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 8,
    },
    greetingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    greetingLeft: {
        flex: 1,
    },
    greeting: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 18,
        marginBottom: 2,
    },
    appName: {
        fontSize: 28,
        fontWeight: '800',
        lineHeight: 34,
        letterSpacing: -0.3,
    },
    notesCountTop: {
        fontSize: 13,
        fontWeight: '600',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    searchSection: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 4,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        marginLeft: 8,
        lineHeight: 18,
    },
    clearButton: {
        padding: 3,
        marginRight: 6,
    },
    filterButton: {
        padding: 3,
    },
    filterButtonActive: {
        borderRadius: 6,
    },
    activeFiltersContainer: {
        marginTop: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    activeFiltersText: {
        fontSize: 11,
        fontWeight: '500',
        lineHeight: 14,
    },
    list: {
        flex: 1,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingTop: 4,
    },
    emptyListContainer: {
        flexGrow: 1,
    },
    noteCard: {
        padding: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    noteTitle: {
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 24,
        marginBottom: 8,
    },
    notePreview: {
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 8,
    },
    noteTags: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 0,
    },
    noteTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    noteTagText: {
        fontSize: 11,
        fontWeight: '500',
        lineHeight: 14,
    },
    moreTagsText: {
        fontSize: 11,
        fontWeight: '500',
        lineHeight: 14,
    },
    noteSeparator: {
        height: 8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
        lineHeight: 24,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    clearFiltersButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    clearFiltersText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 18,
    },
});
