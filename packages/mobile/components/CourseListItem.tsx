import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../lib/theme';
import type { Course } from '../lib/types';

interface Props {
  course: Course;
}

export default function CourseListItem({ course }: Props) {
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

  return (
    <Pressable
      onPress={() => router.push(`/course/${course.id}`)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {course.name}
          </Text>
          <View style={styles.regionBadge}>
            <Text style={styles.regionText}>{course.region}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.stars}>{renderStars(course.rating)}</View>
          <Text style={styles.price}>{course.priceRange}</Text>
        </View>

        {course.nextAvailableTeeTime && (
          <View style={styles.teeTimeRow}>
            <Ionicons name="time-outline" size={13} color={colors.textMuted} />
            <Text style={styles.teeTimeText}>
              Next: {course.nextAvailableTeeTime}
            </Text>
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  pressed: {
    backgroundColor: colors.surfaceLight,
    transform: [{ scale: 0.98 }],
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  regionBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  regionText: {
    fontSize: fontSize.xs,
    color: colors.accent,
    fontWeight: '600',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  price: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  teeTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  teeTimeText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
