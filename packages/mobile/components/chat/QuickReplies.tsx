import React from 'react';
import { ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';

interface Props {
  replies: string[];
  onSelect: (reply: string) => void;
}

export default function QuickReplies({ replies, onSelect }: Props) {
  const handlePress = (reply: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(reply);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {replies.map((reply, index) => (
        <Pressable
          key={`${reply}-${index}`}
          onPress={() => handlePress(reply)}
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
        >
          <Text style={styles.chipText}>{reply}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  chipPressed: {
    backgroundColor: colors.surfaceLight,
    transform: [{ scale: 0.95 }],
  },
  chipText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
