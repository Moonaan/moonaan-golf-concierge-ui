import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useChat } from '../../hooks/useChat';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';
import type { Course } from '../../lib/types';

const AMENITY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Driving Range': 'golf-outline',
  'Pro Shop': 'bag-handle-outline',
  Restaurant: 'restaurant-outline',
  Bar: 'wine-outline',
  'Practice Green': 'flag-outline',
  Lodging: 'bed-outline',
  Cart: 'car-outline',
  Lessons: 'school-outline',
};

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { sendMessage } = useChat();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      // TODO(MGC-16): rewire to Bedrock AgentCore courses backend
    } finally {
      setLoading(false);
    }
  };

  const handleChatToBook = () => {
    if (!course) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sendMessage(`I want to play at ${course.name}`);
    router.push('/(tabs)/chat');
  };

  const handleCall = () => {
    if (!course) return;
    Linking.openURL(`tel:${course.phone}`);
  };

  if (!course) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>{loading ? 'Loading...' : 'Course not found'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={[colors.primaryLight, colors.primary, colors.background]}
          style={[styles.hero, { paddingTop: insets.top + spacing.base }]}
        >
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>

          <View style={styles.heroContent}>
            <Ionicons name="golf" size={48} color={colors.accent} />
            <Text style={styles.heroTitle}>{course.name}</Text>
            <Text style={styles.heroRegion}>{course.region}</Text>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{course.par}</Text>
            <Text style={styles.statLabel}>Par</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{course.slope}</Text>
            <Text style={styles.statLabel}>Slope</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{course.courseRating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{course.yardage.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Yards</Text>
          </View>
        </View>

        {/* Description */}
        {course.description && (
          <View style={styles.section}>
            <Text style={styles.description}>{course.description}</Text>
          </View>
        )}

        {/* Amenities */}
        {course.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {course.amenities.map((amenity, i) => (
                <View key={i} style={styles.amenityItem}>
                  <Ionicons
                    name={AMENITY_ICONS[amenity] || 'checkmark-circle-outline'}
                    size={20}
                    color={colors.accent}
                  />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Price & Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.detailText}>{course.priceRange}</Text>
          </View>
          <Pressable onPress={handleCall} style={styles.detailRow}>
            <Ionicons name="call-outline" size={18} color={colors.accent} />
            <Text style={[styles.detailText, { color: colors.accent }]}>{course.phone}</Text>
          </Pressable>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.detailText}>{course.address}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || spacing.base }]}>
        <Pressable onPress={handleChatToBook} style={styles.ctaButton}>
          <Ionicons name="chatbubbles" size={20} color={colors.primary} />
          <Text style={styles.ctaText}>Chat to Book</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
  },
  hero: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  heroTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  heroRegion: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.base,
    marginTop: -spacing.base,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  section: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '45%',
  },
  amenityText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  detailText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
  },
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  ctaText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
  },
});
