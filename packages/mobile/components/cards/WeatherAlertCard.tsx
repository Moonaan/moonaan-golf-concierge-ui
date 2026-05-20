import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';
import type { WeatherAlertCard as WeatherData } from '@golf-concierge/shared';

interface Props {
  data: WeatherData;
  onAction: (text: string) => void;
}

const WEATHER_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  sunny: 'sunny',
  cloudy: 'cloud',
  rainy: 'rainy',
  stormy: 'thunderstorm',
  partly_cloudy: 'partly-sunny',
  windy: 'flag',
  snow: 'snow',
};

export default function WeatherAlertCard({ data, onAction }: Props) {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.card}>
      <View style={styles.weatherRow}>
        <View style={styles.weatherIcon}>
          <Ionicons
            name={(data.icon && WEATHER_ICONS[data.icon]) || 'cloud'}
            size={28}
            color={colors.warning}
          />
        </View>
        <View style={styles.weatherInfo}>
          <Text style={styles.temp}>{data.temp}°F</Text>
          <Text style={styles.condition}>{data.condition}</Text>
        </View>
        <View style={styles.rainBadge}>
          <Ionicons name="water" size={14} color={colors.warning} />
          <Text style={styles.rainText}>{data.precipitation}%</Text>
        </View>
      </View>

      <Text style={styles.message}>{data.message}</Text>

      <View style={styles.actions}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onAction('Move my tee time');
          }}
          style={styles.moveButton}
        >
          <Text style={styles.moveButtonText}>Move My Tee Time</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onAction('Keep my tee time');
          }}
          style={styles.keepButton}
        >
          <Text style={styles.keepButtonText}>Keep It</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 183, 77, 0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 183, 77, 0.3)',
    padding: spacing.base,
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  weatherIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 183, 77, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherInfo: {
    flex: 1,
  },
  temp: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  condition: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  rainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 183, 77, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  rainText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.warning,
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.warning,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  moveButton: {
    flex: 1,
    backgroundColor: colors.warning,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  moveButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  keepButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  keepButtonText: {
    color: colors.warning,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
