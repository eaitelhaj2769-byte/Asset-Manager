import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  Pressable,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useResults } from '@/contexts/ResultsContext';
import { Spacing, BorderRadius, Colors } from '@/constants/theme';

import emptyHomeImage from '../../assets/images/empty-home.png';
import fsjesLogo from '../../assets/images/fsjes-logo.png';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const { recentSearches, isLoading, error, fetchResults } = useResults();
  
  const [studentId, setStudentId] = useState('');
  const [inputError, setInputError] = useState('');

  const validateAndFetch = async () => {
    const trimmedId = studentId.trim();
    
    if (!trimmedId || trimmedId.length < 5) {
      setInputError(t.invalidStudentId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    setInputError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await fetchResults(trimmedId);
  };

  const handleRecentSearch = async (id: string) => {
    setStudentId(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchResults(id);
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
        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          style={styles.logoContainer}
        >
          <Image source={fsjesLogo} style={styles.logo} resizeMode="contain" />
          <ThemedText type="h2" style={styles.appTitle}>
            {t.appName}
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Card style={styles.disclaimerCard}>
            <ThemedText style={[styles.disclaimerText, { color: theme.textSecondary }]}>
              {t.disclaimer}
            </ThemedText>
          </Card>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(300).springify()}
          style={styles.inputSection}
        >
          <ThemedText type="h4" style={styles.sectionTitle}>
            {t.enterStudentId}
          </ThemedText>
          
          <View style={[
            styles.inputContainer,
            { 
              backgroundColor: theme.backgroundDefault,
              borderColor: inputError ? Colors.light.error : theme.border,
            },
          ]}>
            <Feather 
              name="user" 
              size={20} 
              color={theme.textSecondary} 
              style={styles.inputIcon}
            />
            <TextInput
              style={[
                styles.input,
                { 
                  color: theme.text,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
              placeholder={t.studentIdPlaceholder}
              placeholderTextColor={theme.textSecondary}
              value={studentId}
              onChangeText={(text) => {
                setStudentId(text);
                if (inputError) setInputError('');
              }}
              keyboardType="number-pad"
              autoCorrect={false}
              autoCapitalize="none"
              testID="input-student-id"
            />
          </View>
          
          {inputError ? (
            <ThemedText style={styles.errorText}>{inputError}</ThemedText>
          ) : null}
          
          {error ? (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          ) : null}

          <Button 
            onPress={validateAndFetch}
            disabled={isLoading}
            style={styles.submitButton}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              t.viewResults
            )}
          </Button>
        </Animated.View>

        {recentSearches.length > 0 ? (
          <Animated.View 
            entering={FadeInDown.delay(400).springify()}
            style={styles.recentSection}
          >
            <ThemedText type="h4" style={styles.sectionTitle}>
              {t.recentSearches}
            </ThemedText>
            
            <View style={styles.recentList}>
              {recentSearches.map((id, index) => (
                <RecentSearchItem
                  key={id}
                  studentId={id}
                  onPress={() => handleRecentSearch(id)}
                  delay={index * 50}
                  theme={theme}
                />
              ))}
            </View>
          </Animated.View>
        ) : (
          <Animated.View 
            entering={FadeInUp.delay(400).springify()}
            style={styles.emptyState}
          >
            <Image 
              source={emptyHomeImage} 
              style={styles.emptyImage} 
              resizeMode="contain" 
            />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              {t.noRecentSearches}
            </ThemedText>
          </Animated.View>
        )}
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

function RecentSearchItem({ 
  studentId, 
  onPress, 
  delay,
  theme,
}: { 
  studentId: string; 
  onPress: () => void; 
  delay: number;
  theme: typeof Colors.light;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[
          styles.recentItem,
          { backgroundColor: theme.backgroundDefault },
          animatedStyle,
        ]}
      >
        <Feather name="clock" size={18} color={theme.textSecondary} />
        <ThemedText style={styles.recentId}>{studentId}</ThemedText>
        <Feather name="chevron-right" size={18} color={theme.textSecondary} />
      </AnimatedPressable>
    </Animated.View>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.md,
  },
  appTitle: {
    textAlign: 'center',
  },
  disclaimerCard: {
    marginBottom: Spacing['2xl'],
  },
  disclaimerText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: Spacing['2xl'],
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  recentSection: {
    marginBottom: Spacing['2xl'],
  },
  recentList: {
    gap: Spacing.sm,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    gap: Spacing.md,
  },
  recentId: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: Spacing.lg,
    opacity: 0.8,
  },
  emptyText: {
    textAlign: 'center',
  },
});
