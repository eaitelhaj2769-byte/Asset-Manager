import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useResults, Subject } from '@/contexts/ResultsContext';
import { Spacing, BorderRadius, Colors } from '@/constants/theme';

import emptyResultsImage from '../../assets/images/empty-results.png';

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { currentResult, isLoading, fetchResults } = useResults();

  const handleRefresh = async () => {
    if (currentResult?.studentId) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await fetchResults(currentResult.studentId);
    }
  };

  const getStatusColor = (status: Subject['status']) => {
    switch (status) {
      case 'V':
      case 'AC':
        return theme.success;
      case 'NV':
        return theme.error;
      case 'ABJ':
        return theme.warning;
      case 'ABI':
        return theme.disabled;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusText = (status: Subject['status']) => {
    switch (status) {
      case 'V':
        return t.passed;
      case 'NV':
        return t.failed;
      case 'AC':
        return t.passedIntegration;
      case 'ABJ':
        return t.justifiedAbsence;
      case 'ABI':
        return t.unjustifiedAbsence;
      default:
        return status;
    }
  };

  const validGrades = currentResult?.subjects.filter(s => s.grade !== null) || [];
  const calculatedGpa = validGrades.length > 0 
    ? validGrades.reduce((sum, s) => sum + (s.grade || 0), 0) / validGrades.length
    : 0;

  const passedCount = currentResult?.subjects.filter(
    s => s.status === 'V' || s.status === 'AC'
  ).length || 0;
  
  const failedCount = currentResult?.subjects.filter(
    s => s.status === 'NV'
  ).length || 0;

  const renderSubjectItem = ({ item, index }: { item: Subject; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 50).springify()}>
      <View style={[styles.subjectItem, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.subjectInfo}>
          <ThemedText style={styles.subjectName} numberOfLines={2}>
            {item.name}
          </ThemedText>
        </View>
        <View style={styles.subjectGrade}>
          <ThemedText 
            style={[
              styles.gradeValue,
              { color: getStatusColor(item.status) }
            ]}
          >
            {item.grade !== null ? item.grade.toFixed(2) : '--'}
          </ThemedText>
        </View>
        <View style={styles.subjectStatus}>
          <View 
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(item.status) }
            ]} 
          />
          <ThemedText 
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) }
            ]}
          >
            {getStatusText(item.status)}
          </ThemedText>
        </View>
      </View>
    </Animated.View>
  );

  const renderHeader = () => (
    <>
      {currentResult ? (
        <>
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Card style={styles.studentCard}>
              <ThemedText type="h4">{currentResult.studentName}</ThemedText>
              <View style={styles.studentMeta}>
                <View style={styles.metaItem}>
                  <Feather name="calendar" size={14} color={theme.textSecondary} />
                  <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
                    {currentResult.academicYear}
                  </ThemedText>
                </View>
                <View style={styles.metaItem}>
                  <Feather name="book" size={14} color={theme.textSecondary} />
                  <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
                    {currentResult.semester}
                  </ThemedText>
                </View>
              </View>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Card style={styles.summaryCard}>
              <ThemedText type="h4" style={styles.summaryTitle}>
                {t.summary}
              </ThemedText>
              
              <View style={styles.gpaContainer}>
                <ThemedText style={[styles.gpaLabel, { color: theme.textSecondary }]}>
                  {t.semesterGpa}
                </ThemedText>
                <ThemedText type="h1" style={[styles.gpaValue, { color: theme.primary }]}>
                  {calculatedGpa.toFixed(2)}
                </ThemedText>
                <View style={[styles.gpaDisclaimer, { backgroundColor: theme.warning + '10' }]}>
                  <Feather name="alert-circle" size={14} color={theme.warning} />
                  <ThemedText style={[styles.disclaimerText, { color: theme.textSecondary }]}>
                    {t.gpaDisclaimer}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={[styles.statBadge, { backgroundColor: theme.success + '20' }]}>
                    <ThemedText style={[styles.statNumber, { color: theme.success }]}>
                      {passedCount}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                    {t.passedSubjects}
                  </ThemedText>
                </View>
                
                <View style={styles.statItem}>
                  <View style={[styles.statBadge, { backgroundColor: theme.error + '20' }]}>
                    <ThemedText style={[styles.statNumber, { color: theme.error }]}>
                      {failedCount}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                    {t.failedSubjects}
                  </ThemedText>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statBadge, { backgroundColor: theme.primary + '20' }]}>
                    <ThemedText style={[styles.statNumber, { color: theme.primary }]}>
                      {currentResult.earnedCredits}/{currentResult.totalCredits}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                    {t.credits}
                  </ThemedText>
                </View>
              </View>
            </Card>
          </Animated.View>

          <View style={styles.subjectsHeader}>
            <ThemedText type="h4">{t.subject}</ThemedText>
          </View>
        </>
      ) : null}
    </>
  );

  const renderEmpty = () => (
    <Animated.View 
      entering={FadeInDown.delay(100).springify()}
      style={styles.emptyContainer}
    >
      <Image 
        source={emptyResultsImage} 
        style={styles.emptyImage} 
        resizeMode="contain" 
      />
      <ThemedText type="h4" style={styles.emptyTitle}>
        {t.noResultsYet}
      </ThemedText>
      <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
        {t.enterIdFirst}
      </ThemedText>
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={currentResult?.subjects || []}
        renderItem={renderSubjectItem}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={currentResult ? null : renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
          !currentResult && styles.emptyListContent,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  studentCard: {
    marginBottom: Spacing.lg,
  },
  studentMeta: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    gap: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: 14,
  },
  summaryCard: {
    marginBottom: Spacing['2xl'],
  },
  summaryTitle: {
    marginBottom: Spacing.lg,
  },
  gpaContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  gpaLabel: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  gpaValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  gpaDisclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    gap: Spacing.xs,
  },
  disclaimerText: {
    fontSize: 12,
    flex: 1,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.xs,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
  },
  subjectsHeader: {
    marginBottom: Spacing.md,
  },
  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '500',
  },
  subjectGrade: {
    width: 60,
    alignItems: 'center',
  },
  gradeValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  subjectStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    justifyContent: 'flex-end',
    gap: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyImage: {
    width: 180,
    height: 180,
    marginBottom: Spacing.xl,
    opacity: 0.8,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    maxWidth: 280,
  },
});
