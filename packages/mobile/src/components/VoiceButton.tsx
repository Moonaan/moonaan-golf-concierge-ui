import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  isRecording: boolean;
  isSpeaking: boolean;
  isAudioReady: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export default function VoiceButton({ isRecording, isSpeaking, isAudioReady, onPress, disabled }: Props) {
  const isDisabled = disabled || !isAudioReady;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        isRecording && styles.recordingButton,
        isSpeaking && !isRecording && styles.speakingButton,
        isDisabled && styles.disabled,
      ]}
    >
      {isRecording && <View style={styles.pulseDot} />}
      <Text style={styles.icon}>
        {isRecording ? '⏹' : isSpeaking ? '🔊' : '🎙'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E4F3D',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  recordingButton: {
    backgroundColor: '#7B1E1E',
  },
  speakingButton: {
    backgroundColor: '#2E6B4F',
  },
  disabled: {
    opacity: 0.5,
  },
  pulseDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF5350',
  },
  icon: {
    fontSize: 20,
  },
});
