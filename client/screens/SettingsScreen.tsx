import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
  useColorScheme as useSystemColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useResults } from '@/contexts/ResultsContext';
import { Spacing, BorderRadius, Colors } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const languages: { id: Language; label: string; nativeLabel: string }[] = [
  { id: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
  { id: 'fr', label: 'French', nativeLabel: 'Français' },
  { id: 'en', label: 'English', nativeLabel: 'English' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { clearCache } = useResults();
  const systemColorScheme = useSystemColorScheme();

  const [showCacheCleared, setShowCacheCleared] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLanguage(lang);
  };

  const handleClearCache = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await clearCache();
    setShowCacheCleared(true);
    setTimeout(() => setShowCacheCleared(false), 2000);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              {t.language}
            </ThemedText>
            
            <Card style={styles.optionsCard}>
              {languages.map((lang, index) => (
                <LanguageOption
                  key={lang.id}
                  lang={lang}
                  isSelected={language === lang.id}
                  isLast={index === languages.length - 1}
                  onSelect={() => handleLanguageChange(lang.id)}
                  theme={theme}
                />
              ))}
            </Card>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              {t.appearance}
            </ThemedText>
            
            <Card style={styles.optionsCard}>
              <View style={styles.optionRow}>
                <View style={styles.optionInfo}>
                  <Ionicons 
                    name={isDark ? 'moon-outline' : 'sunny-outline'} 
                    size={20} 
                    color={theme.primary} 
                  />
                  <ThemedText style={styles.optionLabel}>
                    {isDark ? t.darkMode : t.lightMode}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.systemNote, { color: theme.textSecondary }]}>
                  System
                </ThemedText>
              </View>
            </Card>
            
            <ThemedText style={[styles.helpText, { color: theme.textSecondary }]}>
              Theme follows your device settings
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              {t.dataManagement}
            </ThemedText>
            
            <ClearCacheButton
              onPress={handleClearCache}
              showSuccess={showCacheCleared}
              theme={theme}
              t={t}
            />
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(400).springify()}
          style={styles.footer}
        >
          <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
            {t.designedBy}
          </ThemedText>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

function LanguageOption({
  lang,
  isSelected,
  isLast,
  onSelect,
  theme,
}: {
  lang: { id: Language; label: string; nativeLabel: string };
  isSelected: boolean;
  isLast: boolean;
  onSelect: () => void;
  theme: typeof Colors.light;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onSelect}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[
        styles.languageOption,
        !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border },
        animatedStyle,
      ]}
    >
      <View style={styles.languageInfo}>
        <ThemedText style={styles.languageNative}>
          {lang.nativeLabel}
        </ThemedText>
        <ThemedText style={[styles.languageLabel, { color: theme.textSecondary }]}>
          {lang.label}
        </ThemedText>
      </View>
      
      <View 
        style={[
          styles.radioOuter,
          { borderColor: isSelected ? theme.primary : theme.border }
        ]}
      >
        {isSelected ? (
          <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

function ClearCacheButton({
  onPress,
  showSuccess,
  theme,
  t,
}: {
  onPress: () => void;
  showSuccess: boolean;
  theme: typeof Colors.light;
  t: any;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[
        styles.clearCacheButton,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.optionInfo}>
        <Ionicons 
          name={showSuccess ? 'checkmark-circle-outline' : 'trash-outline'} 
          size={20} 
          color={showSuccess ? theme.success : theme.error} 
        />
        <ThemedText 
          style={[
            styles.optionLabel,
            { color: showSuccess ? theme.success : theme.error }
          ]}
        >
          {showSuccess ? t.cacheCleared : t.clearCache}
        </ThemedText>
      </View>
      
      <Ionicons 
        name="chevron-forward" 
        size={18} 
        color={theme.textSecondary} 
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing['2xl'],
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  optionsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  languageInfo: {
    flex: 1,
  },
  languageNative: {
    fontSize: 16,
    fontWeight: '500',
  },
  languageLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  systemNote: {
    fontSize: 14,
  },
  helpText: {
    fontSize: 12,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  clearCacheButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing['3xl'],
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: 14,
  },
});
