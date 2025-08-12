import { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../config/theme';

type Props = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder = 'Search notes...' }: Props) {
    const [isFocused, setIsFocused] = useState(false);

    const handleClear = () => {
        onChangeText('');
    };

    return (
        <View style={styles.container}>
            <View style={[styles.searchWrapper, isFocused && styles.searchWrapperFocused]}>
                <Ionicons
                    name="search"
                    size={18}
                    color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
                    style={styles.searchIcon}
                />

                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.textSecondary}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    returnKeyType="search"
                    clearButtonMode="never"
                />

                {value.length > 0 && (
                    <Pressable onPress={handleClear} style={styles.clearButton}>
                        <Ionicons
                            name="close-circle"
                            size={16}
                            color={theme.colors.textSecondary}
                        />
                    </Pressable>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // No additional margins - handled by parent
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    searchWrapperFocused: {
        borderColor: theme.colors.primary,
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.textPrimary,
        paddingVertical: 4, // Increased from 0 to give more space
        lineHeight: 22, // Added proper line height
    },
    clearButton: {
        marginLeft: 8,
        padding: 4,
    },
});
