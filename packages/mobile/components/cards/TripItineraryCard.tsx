import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';
import type { TripItineraryCard as TripData } from '@golf-concierge/shared';

interface Props {
  data: TripData;
  onBook: (text: string) => void;
}

export default function TripItineraryCard({ data, onBook }: Props) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  const toggleDay = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="map-outline" size={20} color={colors.accent} />
        <Text style={styles.title}>{data.tripName ?? 'Trip Plan'}</Text>
      </View>

      {data.days.map((day, index) => (
        <View key={index}>
          <Pressable onPress={() => toggleDay(index)} style={styles.dayHeader}>
            <View style={styles.dayHeaderLeft}>
              <Text style={styles.dayLabel}>Day {index + 1}</Text>
              <Text style={styles.dayInfo}>
                {formatDate(day.date)} • {day.courseName}
              </Text>
            </View>
            <Ionicons
              name={expandedDays.has(index) ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>

          {expandedDays.has(index) && (
            <Animated.View entering={FadeInDown.duration(200)} style={styles.dayDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                <Text style={styles.detailText}>Tee time: {day.teeTime}</Text>
              </View>
              {day.driveTimeFromHotel && (
                <View style={styles.detailRow}>
                  <Ionicons name="car-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.detailText}>Drive: {day.driveTimeFromHotel}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={14} color={colors.textMuted} />
                <Text style={styles.detailText}>${day.cost}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="star" size={14} color={colors.accent} />
                <Text style={styles.detailText}>{day.userRating ?? 0}/5 rating</Text>
              </View>
            </Animated.View>
          )}
        </View>
      ))}

      {data.hotel && (
        <View style={styles.hotelSection}>
          <Ionicons name="bed-outline" size={16} color={colors.textSecondary} />
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName}>{data.hotel.name}</Text>
            <Text style={styles.hotelDetail}>
              ${data.hotel.pricePerNight}/night
              {data.hotel.nights != null
                ? ` • ${data.hotel.nights} night${data.hotel.nights > 1 ? 's' : ''}`
                : ''}{' '}
              • {data.hotel.distanceToCourse} to course
            </Text>
          </View>
        </View>
      )}

      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total per person</Text>
        <Text style={styles.totalAmount}>${data.totalPerPerson}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onBook('Book everything for this trip');
          }}
          style={styles.bookButton}
        >
          <Text style={styles.bookButtonText}>Book Everything</Text>
        </Pressable>
        <Pressable
          onPress={() => onBook("I'd like to modify this trip")}
          style={styles.modifyButton}
        >
          <Text style={styles.modifyText}>Modify</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  dayHeaderLeft: {
    flex: 1,
  },
  dayLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dayInfo: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginTop: 2,
  },
  dayDetails: {
    paddingLeft: spacing.base,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  hotelSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  hotelDetail: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  totalAmount: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.accent,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  bookButton: {
    flex: 1,
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
  modifyButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modifyText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
