import * as Haptics from 'expo-haptics';
import { useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type HapticsEnabled = boolean;

export function useHaptics(defaultEnabled: boolean = true) {
    const [enabled, setEnabled] = useState<HapticsEnabled>(defaultEnabled);
    const hasLoaded = useRef(false);

    useEffect(() => {
        if (hasLoaded.current) return;

        const loadHapticPreference = async () => {
            try {
                const savedPreference = await AsyncStorage.getItem('hapticEnabled');
                if (savedPreference !== null) {
                    setEnabled(savedPreference === 'true');
                } else {
                    setEnabled(defaultEnabled);
                }
                hasLoaded.current = true;
            } catch (error) {
                console.log('Error loading haptic preference:', error);
                hasLoaded.current = true;
            }
        };

        loadHapticPreference();
    }, []);

    // ✅ FIXED: All functions now check enabled state before executing
    const selection = useCallback(() => {
        if (!enabled) return; // Early return if disabled
        Haptics.selectionAsync().catch(console.log);
    }, [enabled]);

    const success = useCallback(() => {
        if (!enabled) return; // Early return if disabled
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(console.log);
    }, [enabled]);

    const warning = useCallback(() => {
        if (!enabled) return; // Early return if disabled
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(console.log);
    }, [enabled]);

    const error = useCallback(() => {
        if (!enabled) return; // Early return if disabled
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(console.log);
    }, [enabled]);

    const impactLight = useCallback(() => {
        if (!enabled) return; // Early return if disabled
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(console.log);
    }, [enabled]);

    const impactMedium = useCallback(() => {
        if (!enabled) return; // Early return if disabled
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(console.log);
    }, [enabled]);

    const impactHeavy = useCallback(() => {
        if (!enabled) return; // Early return if disabled
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(console.log);
    }, [enabled]);

    return {
        selection,
        success,
        warning,
        error,
        impactLight,
        impactMedium,
        impactHeavy,
        enabled
    };
}
