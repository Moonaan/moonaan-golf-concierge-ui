import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';
import type { CourseOptionCard as CourseOptionData } from '@golf-concierge/shared';

interface Props {
  data: CourseOptionData;
  onBook: (text: string) => void;
}

export default function CourseOptionCard({ data, onBook }: Props) {
  const [expanded, setExpanded] = useState(false);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline'}
          size={14}
          color={colors.accent}
        />
      );
    }
    return stars;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} layout={Layout.springify()}>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <LinearGradient
          colors={[colors.primary, colors.surfaceLight]}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.courseName}>{data.courseName}</Text>
              <View style={styles.stars}>{renderStars(data.userRating ?? 0)}</View>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.price}>${data.price}</Text>
              {data.holes != null && <Text style={styles.holes}>{data.holes}H</Text>}
            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>
                {formatDate(data.teeTime)} • {formatTime(data.teeTime)}
              </Text>
            </View>
            {data.cartIncluded && (
              <View style={styles.detailItem}>
                <Ionicons name="car-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>Cart included</Text>
              </View>
            )}
          </View>

          {expanded && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.expandedContent}>
              <Text style={styles.expandedText}>
                {data.holes} holes • Rated {data.userRating ?? 0}/5 •{' '}
                {data.cartIncluded ? 'Cart included' : 'Walking only'}
              </Text>
            </Animated.View>
          )}

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onBook(`Book the ${formatTime(data.teeTime)} tee time at ${data.courseName}`);
            }}
            style={styles.bookButton}
          >
            <Text style={styles.bookButtonText}>Book This</Text>
          </Pressable>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  courseName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  priceTag: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.accent,
  },
  holes: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  details: {
    gap: spacing.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  expandedContent: {
    paddingTop: spacing.xs,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  expandedText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  bookButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  bookButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
