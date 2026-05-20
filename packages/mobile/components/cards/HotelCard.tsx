import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';
import type { HotelOptionCard as HotelData } from '@golf-concierge/shared';

interface Props {
  data: HotelData;
  onBook: (text: string) => void;
}

const AMENITY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  wifi: 'wifi',
  pool: 'water',
  breakfast: 'cafe',
  gym: 'fitness',
  parking: 'car',
  spa: 'leaf',
  bar: 'wine',
  restaurant: 'restaurant',
};

export default function HotelCard({ data, onBook }: Props) {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={12}
          color={colors.accent}
        />
      );
    }
    return stars;
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.hotelName}>{data.name}</Text>
          <View style={styles.stars}>{renderStars(data.rating)}</View>
        </View>
        <View style={styles.priceTag}>
          <Text style={styles.price}>${data.pricePerNight}</Text>
          <Text style={styles.perNight}>/night</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={14} color={colors.textMuted} />
        <Text style={styles.infoText}>{data.distanceToCourse} to course</Text>
      </View>

      {data.amenities.length > 0 && (
        <View style={styles.amenities}>
          {data.amenities.slice(0, 5).map((amenity, i) => (
            <View key={i} style={styles.amenityChip}>
              <Ionicons
                name={AMENITY_ICONS[amenity.toLowerCase()] || 'checkmark-circle'}
                size={12}
                color={colors.textSecondary}
              />
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>
      )}

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onBook(`Book ${data.name}`);
        }}
        style={styles.bookButton}
      >
        <Text style={styles.bookButtonText}>Book Hotel</Text>
      </Pressable>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  hotelName: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.text,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.accent,
  },
  perNight: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  amenityText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  bookButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  bookButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
