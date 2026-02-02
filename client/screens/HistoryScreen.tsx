import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  Pressable,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useResults, SemesterResult } from '@/contexts/ResultsContext';
import { Spacing, BorderRadius, Colors } from '@/constants/theme';

import emptyHistoryImage from '../../assets/images/empty-history.png';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const { history, removeFromHistory } = useResults();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = async (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await removeFromHistory(id);
  };

  const chartWidth = SCREEN_WIDTH - Spacing.lg * 4;
  const chartHeight = 180;
  const padding = 40;

  const getGpaColor = (gpa: number) => {
    if (gpa >= 12) return theme.success;
    if (gpa >= 10) return theme.warning;
    return theme.error;
  };

  const renderChart = () => {
    if (history.length < 2) return null;

    const reversedHistory = [...history].reverse();
    const gpas = reversedHistory.map(h => h.gpa);
    const maxGpa = Math.max(...gpas, 20);
    const minGpa = Math.min(...gpas, 0);
    const range = maxGpa - minGpa || 1;

    const points = gpas.map((gpa, index) => {
      const x = padding + (index / (gpas.length - 1)) * (chartWidth - padding * 2);
      const y = chartHeight - padding - ((gpa - minGpa) / range) * (chartHeight - padding * 2);
      return { x, y, gpa };
    });

    const pathD = points.reduce((acc, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      const prev = points[index - 1];
      const cp1x = prev.x + (point.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (point.x - prev.x) / 2;
      const cp2y = point.y;
      return `${acc} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${point.x} ${point.y}`;
    }, '');

    return (
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <Card style={styles.chartCard}>
          <ThemedText type="h4" style={styles.chartTitle}>
            {t.gpaOverTime}
          </ThemedText>
          <Svg width={chartWidth} height={chartHeight}>
            <Line
              x1={padding}
              y1={chartHeight - padding}
              x2={chartWidth - padding}
              y2={chartHeight - padding}
              stroke={theme.border}
              strokeWidth={1}
            />
            <Line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={chartHeight - padding}
              stroke={theme.border}
              strokeWidth={1}
            />
            
            <Path
              d={pathD}
              stroke={theme.primary}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {points.map((point, index) => (
              <React.Fragment key={index}>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={6}
                  fill={theme.backgroundRoot}
                  stroke={getGpaColor(point.gpa)}
                  strokeWidth={3}
                />
                <SvgText
                  x={point.x}
                  y={point.y - 12}
                  fontSize={10}
                  fill={theme.text}
                  textAnchor="middle"
                >
                  {point.gpa.toFixed(1)}
                </SvgText>
              </React.Fragment>
            ))}
          </Svg>
        </Card>
      </Animated.View>
    );
  };

  const renderSemesterItem = ({ item, index }: { item: SemesterResult; index: number }) => {
    const isExpanded = expandedId === item.id;
    const passedCount = item.subjects.filter(s => s.status === 'V' || s.status === 'AC').length;
    const totalCount = item.subjects.length;

    return (
      <Animated.View entering={FadeInRight.delay(index * 100 + 200).springify()}>
        <SemesterCard
          item={item}
          isExpanded={isExpanded}
          passedCount={passedCount}
          totalCount={totalCount}
          onToggle={() => toggleExpand(item.id)}
          onDelete={() => handleDelete(item.id)}
          theme={theme}
          t={t}
          getGpaColor={getGpaColor}
        />
      </Animated.View>
    );
  };

  const renderEmpty = () => (
    <Animated.View 
      entering={FadeInDown.delay(100).springify()}
      style={styles.emptyContainer}
    >
      <Image 
        source={emptyHistoryImage} 
        style={styles.emptyImage} 
        resizeMode="contain" 
      />
      <ThemedText type="h4" style={styles.emptyTitle}>
        {t.noHistory}
      </ThemedText>
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={history}
        renderItem={renderSemesterItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderChart}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
          history.length === 0 && styles.emptyListContent,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

function SemesterCard({
  item,
  isExpanded,
  passedCount,
  totalCount,
  onToggle,
  onDelete,
  theme,
  t,
  getGpaColor,
}: {
  item: SemesterResult;
  isExpanded: boolean;
  passedCount: number;
  totalCount: number;
  onToggle: () => void;
  onDelete: () => void;
  theme: typeof Colors.light;
  t: any;
  getGpaColor: (gpa: number) => string;
}) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(isExpanded ? 180 : 0);

  React.useEffect(() => {
    rotation.value = withTiming(isExpanded ? 180 : 0, { duration: 200 });
  }, [isExpanded]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <AnimatedPressable
      onPress={onToggle}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[
        styles.semesterCard,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.semesterHeader}>
        <View style={styles.semesterInfo}>
          <ThemedText type="h4">{item.semester}</ThemedText>
          <ThemedText style={[styles.semesterYear, { color: theme.textSecondary }]}>
            {item.academicYear}
          </ThemedText>
        </View>
        
        <View style={[styles.gpaBadge, { backgroundColor: getGpaColor(item.gpa) + '20' }]}>
          <ThemedText style={[styles.gpaText, { color: getGpaColor(item.gpa) }]}>
            {item.gpa.toFixed(2)}
          </ThemedText>
        </View>
        
        <Animated.View style={chevronStyle}>
          <Feather name="chevron-down" size={20} color={theme.textSecondary} />
        </Animated.View>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
          <View 
            style={[
              styles.progressFill,
              { 
                backgroundColor: theme.success,
                width: `${(passedCount / totalCount) * 100}%`,
              }
            ]} 
          />
        </View>
        <ThemedText style={[styles.progressText, { color: theme.textSecondary }]}>
          {passedCount}/{totalCount} {t.passedSubjects.toLowerCase()}
        </ThemedText>
      </View>

      {isExpanded ? (
        <View style={[styles.expandedContent, { borderTopColor: theme.border }]}>
          {item.subjects.map((subject, index) => (
            <View key={index} style={styles.subjectRow}>
              <ThemedText style={styles.expandedSubject} numberOfLines={1}>
                {subject.name}
              </ThemedText>
              <ThemedText 
                style={[
                  styles.expandedGrade,
                  { 
                    color: subject.status === 'V' || subject.status === 'AC' 
                      ? theme.success 
                      : subject.status === 'NV' 
                        ? theme.error 
                        : theme.textSecondary 
                  }
                ]}
              >
                {subject.grade !== null ? subject.grade.toFixed(2) : '--'}
              </ThemedText>
            </View>
          ))}
          
          <Pressable 
            onPress={onDelete}
            style={({ pressed }) => [
              styles.deleteButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Feather name="trash-2" size={16} color={theme.error} />
            <ThemedText style={{ color: theme.error, marginLeft: Spacing.xs }}>
              Delete
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
    </AnimatedPressable>
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
  chartCard: {
    marginBottom: Spacing['2xl'],
    alignItems: 'center',
  },
  chartTitle: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
  },
  semesterCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  semesterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  semesterInfo: {
    flex: 1,
  },
  semesterYear: {
    fontSize: 14,
    marginTop: 2,
  },
  gpaBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginRight: Spacing.md,
  },
  gpaText: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: Spacing.md,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
  },
  expandedContent: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  expandedSubject: {
    flex: 1,
    fontSize: 14,
    marginRight: Spacing.md,
  },
  expandedGrade: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    padding: Spacing.sm,
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
    textAlign: 'center',
  },
});
