import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';
import VoiceRecorder from './VoiceRecorder';

interface Props {
  onSend: (text: string) => void;
  onVoice: (audioUri: string) => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ChatInput({ onSend, onVoice, disabled }: Props) {
  const [text, setText] = useState('');
  const [inputHeight, setInputHeight] = useState(40);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const sendScale = useSharedValue(0);

  const hasText = text.trim().length > 0;

  // Animate send button in/out
  React.useEffect(() => {
    sendScale.value = withSpring(hasText ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [hasText]);

  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
    opacity: sendScale.value,
  }));

  const micButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(sendScale.value, [0, 1], [1, 0]) }],
    opacity: interpolate(sendScale.value, [0, 1], [1, 0]),
  }));

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(trimmed);
    setText('');
    setInputHeight(40);
  }, [text, disabled, onSend]);

  const handleContentSizeChange = (event: any) => {
    const height = Math.min(event.nativeEvent.contentSize.height, 100); // max ~4 lines
    setInputHeight(Math.max(40, height));
  };

  const handleVoiceComplete = useCallback(
    (audioUri: string) => {
      setIsRecording(false);
      onVoice(audioUri);
    },
    [onVoice]
  );

  if (isRecording) {
    return (
      <VoiceRecorder
        onComplete={handleVoiceComplete}
        onCancel={() => setIsRecording(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <View style={[styles.inputWrapper, { minHeight: inputHeight + 16 }]}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { height: inputHeight }]}
            value={text}
            onChangeText={setText}
            placeholder="Message your concierge..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={2000}
            onContentSizeChange={handleContentSizeChange}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            returnKeyType="default"
            editable={!disabled}
          />
        </View>

        <View style={styles.buttonContainer}>
          {/* Send button — slides in when text present */}
          <AnimatedPressable
            onPress={handleSend}
            style={[styles.sendButton, sendButtonStyle]}
            disabled={!hasText || disabled}
          >
            <Ionicons name="send" size={20} color={colors.text} />
          </AnimatedPressable>

          {/* Mic button — slides in when no text */}
          <AnimatedPressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsRecording(true);
            }}
            style={[styles.micButton, micButtonStyle]}
            disabled={disabled}
          >
            <Ionicons name="mic" size={22} color={colors.textSecondary} />
          </AnimatedPressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  input: {
    color: colors.text,
    fontSize: fontSize.base,
    lineHeight: 20,
    maxHeight: 100,
    ...Platform.select({
      ios: { paddingTop: 0 },
      android: { textAlignVertical: 'center' },
    }),
  },
  buttonContainer: {
    width: 40,
    height: 40,
    position: 'relative',
  },
  sendButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
