import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../config/theme';

type Props = {
    title: string;
    body: string;
    tags?: string[] | null;
    updatedAt: string;
    onPress: () => void;
    onLongPress: () => void;
};

export function NoteCard({ title, body, tags, updatedAt, onPress, onLongPress }: Props) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
        return date.toLocaleDateString();
    };

    // Generate a color based on title for variety
    const getCardAccent = (title: string) => {
        const colors = [
            '#3b82f6', // Blue
            '#8b5cf6', // Purple
            '#06d6a0', // Teal
            '#f59e0b', // Orange
            '#ef4444', // Red
            '#10b981', // Green
            '#ec4899', // Pink
            '#6366f1', // Indigo
        ];
        const index = title.length % colors.length;
        return colors[index];
    };

    const accentColor = getCardAccent(title);

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={({ pressed }) => [
                styles.card,
                { borderLeftColor: accentColor },
                pressed && styles.cardPressed
            ]}
        >
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>{title}</Text>
                {body && <Text style={styles.body} numberOfLines={3}>{body}</Text>}

                {tags && tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {tags.slice(0, 3).map((tag, index) => (
                            <View key={index} style={[styles.tag, { backgroundColor: `${accentColor}15` }]}>
                                <Text style={[styles.tagText, { color: accentColor }]}>{tag}</Text>
                            </View>
                        ))}
                        {tags.length > 3 && (
                            <Text style={styles.moreTagsText}>+{tags.length - 3} more</Text>
                        )}
                    </View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.date}>{formatDate(updatedAt)}</Text>
                    <View style={[styles.statusDot, { backgroundColor: accentColor }]} />
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius,
        borderLeftWidth: 4,
        shadowColor: theme.colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 8,
        lineHeight: 24, // Increased from 22
    },
    body: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        lineHeight: 22, // Increased from 20
        marginBottom: 12,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
        alignItems: 'center',
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
        lineHeight: 16, // Added proper line height
    },
    moreTagsText: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
        lineHeight: 16, // Added proper line height
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    date: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        lineHeight: 16, // Added proper line height
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
