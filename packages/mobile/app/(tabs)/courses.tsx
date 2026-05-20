import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../lib/theme';
import { useChat } from '../../hooks/useChat';
import api from '../../lib/api';
import type { Course } from '../../lib/types';

const REGIONS = ['All', 'Branson', 'Lake of Ozarks', 'KC', 'STL'] as const;

export default function CoursesScreen() {
  const router = useRouter();
  const { sendMessage } = useChat();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await api.get<{ courses: Course[] }>('/courses');
      setCourses(data.courses);
    } catch {
      // Keep existing data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourses();
  }, []);

  const filtered = courses.filter((c) => {
    const matchesSearch =
      !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchesRegion =
      selectedRegion === 'All' || c.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const handleCourseTap = (course: Course) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(`Tell me about ${course.name}`);
    router.push('/(tabs)/chat');
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline'}
          size={12}
          color={colors.accent}
        />
      );
    }
    return stars;
  };

  const renderCourse = ({ item }: { item: Course }) => (
    <Pressable
      onPress={() => handleCourseTap(item)}
      style={({ pressed }) => [styles.courseCard, pressed && styles.courseCardPressed]}
    >
      <View style={styles.courseHeader}>
        <Text style={styles.courseName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.regionBadge}>
          <Text style={styles.regionBadgeText}>{item.region}</Text>
        </View>
      </View>

      <View style={styles.courseDetails}>
        <View style={styles.starsRow}>{renderStars(item.rating)}</View>
        <Text style={styles.priceRange}>{item.priceRange}</Text>
      </View>

      {item.nextAvailableTeeTime && (
        <View style={styles.nextTeeTime}>
          <Ionicons name="time-outline" size={12} color={colors.textMuted} />
          <Text style={styles.nextTeeTimeText}>
            Next: {new Date(item.nextAvailableTeeTime).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        </View>
      )}

      <Ionicons
        name="chevron-forward"
        size={16}
        color={colors.textMuted}
        style={styles.chevron}
      />
    </Pressable>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyState}>
        <Ionicons name="golf-outline" size={48} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>No courses found</Text>
        <Text style={styles.emptySubtitle}>
          {search
            ? 'Try adjusting your search or filters'
            : 'Pull down to refresh'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.screenTitle}>Courses</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Region Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
        style={styles.chipsScroll}
      >
        {REGIONS.map((region) => (
          <Pressable
            key={region}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedRegion(region);
            }}
            style={[
              styles.chip,
              selectedRegion === region && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                selectedRegion === region && styles.chipTextActive,
              ]}
            >
              {region}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Course List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderCourse}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    marginHorizontal: spacing.base,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text,
    height: '100%',
  },
  clearButton: {
    padding: spacing.xs,
  },
  chipsScroll: {
    maxHeight: 48,
  },
  chipsContainer: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primary,
  },
  listContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  courseCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    gap: spacing.sm,
    ...shadows.card,
  },
  courseCardPressed: {
    opacity: 0.8,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  courseName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  regionBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  regionBadgeText: {
    fontSize: fontSize.xs,
    color: colors.accent,
    fontWeight: '600',
  },
  courseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  priceRange: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  nextTeeTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  nextTeeTimeText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  chevron: {
    position: 'absolute',
    right: spacing.base,
    top: '50%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxxl * 2,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
