import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';

interface Props {
  onComplete: (audioUri: string) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onComplete, onCancel }: Props) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const pulseScale = useSharedValue(1);
  const dotOpacity = useSharedValue(1);

  useEffect(() => {
    startRecording();
    return () => {
      stopRecording(true);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    // Pulsing animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 600, easing: Easing.ease }),
        withTiming(1, { duration: 600, easing: Easing.ease })
      ),
      -1,
      true
    );

    // Blinking red dot
    dotOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        onCancel();
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      onCancel();
    }
  };

  const stopRecording = async (cancel = false) => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      if (!cancel) {
        const uri = recording.getURI();
        if (uri) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onComplete(uri);
          return;
        }
      }
    } catch {}

    onCancel();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => stopRecording(true)} style={styles.cancelButton}>
        <Ionicons name="close" size={24} color={colors.textSecondary} />
      </Pressable>

      <View style={styles.center}>
        <View style={styles.recordingInfo}>
          <Animated.View style={[styles.redDot, dotStyle]} />
          <Text style={styles.listeningText}>Listening...</Text>
          <Text style={styles.timer}>{formatDuration(duration)}</Text>
        </View>

        <Animated.View style={[styles.pulseRing, pulseStyle]}>
          <Pressable
            onPress={() => stopRecording(false)}
            style={styles.stopButton}
          >
            <Ionicons name="mic" size={32} color={colors.text} />
          </Pressable>
        </Animated.View>

        <Text style={styles.hint}>Tap to send</Text>
      </View>

      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  cancelButton: {
    padding: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.md,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },
  listeningText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  timer: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontVariant: ['tabular-nums'],
  },
  pulseRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 83, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  spacer: {
    width: 40,
  },
});
