import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  FlatList,
  ListRenderItemInfo,
  TextInput,
  Pressable,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAgentConnection } from '../hooks/useAgentConnection';
import type { AgentTranscriptMessage } from '@golf-concierge/shared';
import ChatBubble from '../components/ChatBubble';
import VoiceButton from '../components/VoiceButton';
import PaymentSheet from '../components/PaymentSheet';
import OtpInput from '../components/OtpInput';

const CONNECTION_STATE_LABELS: Record<string, string> = {
  disconnected: 'Offline',
  connecting: 'Connecting...',
  reconnecting: 'Reconnecting...',
  connected: '',
};

export default function ChatScreen() {
  const {
    state,
    messages,
    isRecording,
    isSpeaking,
    isAudioReady,
    startRecording,
    stopRecording,
    sendText,
    sendPaymentConfirmed,
    connection,
  } = useAgentConnection();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    sendText(text);
    setInputText('');
  }, [inputText, sendText]);

  const statusLabel = CONNECTION_STATE_LABELS[state];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Golf Concierge</Text>
        {statusLabel ? (
          <Text style={styles.statusText}>{statusLabel}</Text>
        ) : null}
      </View>

      {/* Message list */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item: AgentTranscriptMessage) => item.id}
          renderItem={({ item }: ListRenderItemInfo<AgentTranscriptMessage>) => <ChatBubble message={item} />}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            state === 'connected' ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Ask me about tee times, courses, or plan your golf trip!
                </Text>
              </View>
            ) : null
          }
        />

        {/* Input bar */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom || 12 }]}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Message your concierge..."
            placeholderTextColor="#6B9B87"
            multiline
            maxLength={2000}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            returnKeyType="send"
            editable={state === 'connected'}
          />
          <VoiceButton
            isRecording={isRecording}
            isSpeaking={isSpeaking}
            isAudioReady={isAudioReady}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={state !== 'connected'}
          />
          {inputText.trim().length > 0 && (
            <Pressable
              style={[styles.sendButton, state !== 'connected' && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={state !== 'connected'}
            >
              <Text style={styles.sendIcon}>▶</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Overlays — payment and OTP appear above everything else */}
      <PaymentSheet connection={connection} onPaymentConfirmed={sendPaymentConfirmed} />
      <OtpInput connection={connection} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2E23',
  },
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1E4F3D',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusText: {
    fontSize: 12,
    color: '#C4A35A',
    marginTop: 2,
  },
  messageList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyText: {
    color: '#6B9B87',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#0F2E23',
    borderTopWidth: 0.5,
    borderTopColor: '#1E4F3D',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#163B2E',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C4A35A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    color: '#0F2E23',
    fontSize: 16,
    fontWeight: '700',
  },
});
