// ============================================================
// ChatPage — THE main page. Full-screen chat interface.
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { QuickReplies } from '@/components/chat/QuickReplies';
import { TypingIndicator } from '@/components/chat/TypingIndicator';

export function ChatPage() {
  const { messages, isTyping, quickReplies, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest message
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Scroll to bottom on initial load
  useEffect(() => {
    scrollToBottom('instant');
  }, [scrollToBottom]);

  const handleAction = useCallback(
    (_action: string, _data?: unknown) => {
      // Rich card actions → send as chat message
      // e.g., "Book Buffalo Ridge Springs at 9:20 AM"
      sendMessage(`Yes, let's do it!`);
    },
    [sendMessage],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4 py-4"
      >
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} onAction={handleAction} />
          ))}

          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick replies + Input bar */}
      <div className="flex-shrink-0 max-w-2xl mx-auto w-full">
        <QuickReplies replies={quickReplies} onSelect={sendMessage} />
        <ChatInput onSend={sendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}
