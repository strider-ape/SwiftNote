import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useSafeBottomSpacing() {
    const insets = useSafeAreaInsets();

    const getBottomSpacing = (additionalPadding = 0) => {
        return Platform.select({
            ios: Math.max(insets.bottom + additionalPadding, 20),
            android: insets.bottom > 0
                ? insets.bottom + additionalPadding  // Gesture navigation
                : 16 + additionalPadding,            // Button navigation
            default: 20 + additionalPadding
        });
    };

    const hasGestureNavigation = Platform.OS === 'android' && insets.bottom > 0;
    const hasHomeIndicator = Platform.OS === 'ios' && insets.bottom > 20;

    return {
        bottomSpacing: getBottomSpacing(),
        safeAreaBottom: insets.bottom,
        hasGestureNavigation,
        hasHomeIndicator,
        getBottomSpacing,
    };
}
