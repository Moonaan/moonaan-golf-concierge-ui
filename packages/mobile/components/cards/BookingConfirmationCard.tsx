import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Share, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
} from 'react-native-reanimated';
import * as Calendar from 'expo-calendar';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';
import type { BookingConfirmationCard as ConfirmationData } from '@golf-concierge/shared';

interface Props {
  data: ConfirmationData;
}

export default function BookingConfirmationCard({ data }: Props) {
  const checkScale = useSharedValue(0);

  useEffect(() => {
    checkScale.value = withDelay(200, withSpring(1, { damping: 8, stiffness: 100 }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleAddToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') return;

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar =
        calendars.find((c) => c.isPrimary) ||
        calendars.find((c) => c.allowsModifications) ||
        calendars[0];

      if (!defaultCalendar) return;

      const startDate = new Date(`${data.date}T${data.teeTime}`);
      const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // 4 hours

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: `Golf: ${data.courseName}`,
        startDate,
        endDate,
        location: data.courseAddress,
        notes: `Confirmation: ${data.confirmationCode}\nPlayers: ${data.players}\nTotal: $${data.totalCharged}`,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `⛳ Golf Booking Confirmed!\n\n${data.courseName}\n${formatDate(data.date)} at ${data.teeTime}\n${data.players} player${data.players > 1 ? 's' : ''}\nConfirmation: ${data.confirmationCode}\n\nBooked via Missouri Golf Trail`,
      });
    } catch {}
  };

  const handleDirections = () => {
    if (!data.courseAddress) return;
    const address = encodeURIComponent(data.courseAddress);
    const url = Platform.select({
      ios: `maps://app?daddr=${address}`,
      android: `google.navigation:q=${address}`,
      default: `https://maps.google.com/maps?daddr=${address}`,
    });
    Linking.openURL(url!);
  };

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
      <Animated.View style={[styles.checkCircle, checkStyle]}>
        <Ionicons name="checkmark" size={32} color={colors.text} />
      </Animated.View>

      <Text style={styles.confirmedText}>Booking Confirmed!</Text>

      <View style={styles.details}>
        <Text style={styles.courseName}>{data.courseName}</Text>
        <Text style={styles.dateTime}>
          {formatDate(data.date)} at {data.teeTime}
        </Text>
        <Text style={styles.players}>
          {data.players} player{data.players > 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.codeContainer}>
        <Text style={styles.codeLabel}>Confirmation Code</Text>
        <Text style={styles.code}>{data.confirmationCode}</Text>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Charged</Text>
        <Text style={styles.totalAmount}>${data.totalCharged}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={handleAddToCalendar} style={styles.actionButton}>
          <Ionicons name="calendar-outline" size={18} color={colors.accent} />
          <Text style={styles.actionText}>Calendar</Text>
        </Pressable>
        <Pressable onPress={handleShare} style={styles.actionButton}>
          <Ionicons name="share-outline" size={18} color={colors.accent} />
          <Text style={styles.actionText}>Share</Text>
        </Pressable>
        <Pressable onPress={handleDirections} style={styles.actionButton}>
          <Ionicons name="navigate-outline" size={18} color={colors.accent} />
          <Text style={styles.actionText}>Directions</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginTop: spacing.sm,
    alignItems: 'center',
    gap: spacing.md,
  },
  checkCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmedText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.success,
  },
  details: {
    alignItems: 'center',
    gap: 4,
  },
  courseName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  dateTime: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  players: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  codeContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    width: '100%',
  },
  codeLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  code: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 3,
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  totalAmount: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.base,
    marginTop: spacing.xs,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  actionText: {
    fontSize: fontSize.xs,
    color: colors.accent,
    fontWeight: '600',
  },
});
