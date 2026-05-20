import React, { useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChat } from '../../hooks/useChat';
import ChatMessage from '../../components/chat/ChatMessage';
import ChatInput from '../../components/chat/ChatInput';
import QuickReplies from '../../components/chat/QuickReplies';
import { colors, spacing, fontSize } from '../../lib/theme';
import type { ChatMessage as ChatMessageType } from '@golf-concierge/shared';

export default function ChatScreen() {
  const { messages, isTyping, quickReplies, sendMessage, sendVoice, loadOlderMessages } =
    useChat();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const handleSend = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  const handleQuickReply = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessageType }) => <ChatMessage message={item} onSendMessage={handleSend} />,
    [handleSend]
  );

  const keyExtractor = useCallback((item: ChatMessageType) => item.id, []);

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <Text style={styles.headerTitle}>Missouri Golf Trail</Text>
      <Text style={styles.headerSubtitle}>AI Concierge</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: 0 }]}>
      {renderHeader()}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          inverted
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onEndReached={() => loadOlderMessages()}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={renderTypingIndicator}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 80,
          }}
        />
        {quickReplies.length > 0 && (
          <QuickReplies replies={quickReplies} onSelect={handleQuickReply} />
        )}
        <ChatInput
          onSend={handleSend}
          onVoice={sendVoice}
          disabled={isTyping}
        />
        <View style={{ height: insets.bottom || spacing.sm }} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: fontSize.xs,
    color: colors.accent,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  messageList: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  typingContainer: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  typingBubble: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    maxWidth: 80,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.8 },
});
