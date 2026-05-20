// ============================================================
// useChat — Chat state management with API integration
// Demo mode: uses mock responses
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage, ChatApiResponse } from '@golf-concierge/shared';
import { DEMO_MODE, mockChat } from '@/lib/mock-api';
import { DEMO_CHAT_HISTORY } from '@/lib/mock-data';

const STORAGE_KEY = 'golf-concierge-chat-history';
const SESSION_KEY = 'golf-concierge-session-id';
const API_BASE = import.meta.env.VITE_API_ENDPOINT || '/api';

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

function loadHistory(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ChatMessage[];
      return parsed;
    }
  } catch {
    // corrupted storage, start fresh
  }
  return [];
}

function saveHistory(messages: ChatMessage[]) {
  try {
    const toSave = messages.slice(-200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hey! 👋 I'm your Missouri Golf Trail concierge. I can find tee times, plan trips, and handle everything from booking to check-in. What are you looking for?",
  timestamp: new Date().toISOString(),
  quickReplies: [
    'Find me a tee time this weekend',
    'Plan a golf trip',
    "What's the best course near Branson?",
  ],
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const history = loadHistory();
    if (history.length > 0) return history;
    // In demo mode, load the scripted conversation
    if (DEMO_MODE) return DEMO_CHAT_HISTORY;
    return [WELCOME_MESSAGE];
  });
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>(
    () => messages[messages.length - 1]?.quickReplies || [],
  );
  const sessionId = useRef(getSessionId());

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setQuickReplies([]);
      setIsTyping(true);

      try {
        let data: ChatApiResponse;

        if (DEMO_MODE) {
          data = await mockChat(trimmed);
        } else {
          try {
            const res = await fetch(`${API_BASE}/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: sessionId.current,
                message: trimmed,
              }),
            });
            if (!res.ok) throw new Error('API unavailable');
            data = await res.json();
          } catch {
            // Fall back to mock
            data = await mockChat(trimmed);
          }
        }

        const assistantMsg: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
          cards: data.cards,
          quickReplies: data.quickReplies,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setQuickReplies(data.quickReplies || []);
      } catch {
        const errorMsg: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content:
            "Sorry, I'm having trouble connecting right now. Give me a sec and try again.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [],
  );

  const clearChat = useCallback(() => {
    const initial = DEMO_MODE ? DEMO_CHAT_HISTORY : [WELCOME_MESSAGE];
    setMessages(initial);
    setQuickReplies(initial[initial.length - 1]?.quickReplies || []);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
    sessionId.current = getSessionId();
  }, []);

  return {
    messages,
    isTyping,
    quickReplies,
    sendMessage,
    clearChat,
  };
}
