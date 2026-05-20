import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';
import type { ChatMessage } from '../lib/types';

const CACHE_KEY = 'chat_messages';
const MAX_CACHED = 100;

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  quickReplies: string[];
  sendMessage: (content: string) => Promise<void>;
  sendVoice: (audioUri: string) => Promise<void>;
  loadOlderMessages: () => Promise<boolean>;
  clearChat: () => void;
}

export const ChatContext = createContext<ChatState>({
  messages: [],
  isTyping: false,
  quickReplies: [],
  sendMessage: async () => {},
  sendVoice: async () => {},
  loadOlderMessages: async () => false,
  clearChat: () => {},
});

export function useChatProvider(): ChatState {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const hasMore = useRef(true);
  const pageRef = useRef(0);

  // Load cached messages on mount
  useEffect(() => {
    loadCachedMessages();
  }, []);

  // Cache messages when they change
  useEffect(() => {
    if (messages.length > 0) {
      cacheMessages(messages);
    }
  }, [messages]);

  const loadCachedMessages = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as ChatMessage[];
        setMessages(parsed);
        // Restore quick replies from last assistant message
        const lastAssistant = parsed.find((m) => m.role === 'assistant');
        if (lastAssistant?.quickReplies) {
          setQuickReplies(lastAssistant.quickReplies);
        }
      } else {
        // First time — add welcome message
        const welcome: ChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content:
            "Hey there! ⛳ I'm your Missouri Golf Trail concierge. I can help you find courses, book tee times, plan golf trips, and more. What are you looking for today?",
          timestamp: new Date().toISOString(),
          quickReplies: [
            'Find a tee time',
            'Plan a golf trip',
            'Browse courses',
            "What's available this weekend?",
          ],
        };
        setMessages([welcome]);
        setQuickReplies(welcome.quickReplies!);
      }
    } catch {
      // Start fresh on cache error
    }
  };

  const cacheMessages = async (msgs: ChatMessage[]) => {
    try {
      const toCache = msgs.slice(0, MAX_CACHED);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(toCache));
    } catch {}
  };

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [userMessage, ...prev]);
    setQuickReplies([]);
    setIsTyping(true);

    try {
      const response = await api.post<{
        message: ChatMessage;
        quickReplies?: string[];
      }>('/chat', { message: content });

      const assistantMessage: ChatMessage = {
        ...response.message,
        id: response.message.id || `ai_${Date.now()}`,
        timestamp: response.message.timestamp || new Date().toISOString(),
      };

      setMessages((prev) => [assistantMessage, ...prev]);

      if (response.quickReplies?.length) {
        setQuickReplies(response.quickReplies);
        assistantMessage.quickReplies = response.quickReplies;
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content:
          "Sorry, I'm having trouble connecting right now. Please try again in a moment. 🏌️",
        timestamp: new Date().toISOString(),
        quickReplies: ['Try again'],
      };
      setMessages((prev) => [errorMessage, ...prev]);
      setQuickReplies(['Try again']);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const sendVoice = useCallback(async (audioUri: string) => {
    setIsTyping(true);
    try {
      // Upload audio for transcription
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'voice.m4a',
      } as any);

      const transcription = await api.request<{ text: string }>('/chat/transcribe', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (transcription.text) {
        setIsTyping(false);
        await sendMessage(transcription.text);
      }
    } catch {
      setIsTyping(false);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "I couldn't catch that. Could you try again or type your request?",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [errorMessage, ...prev]);
    }
  }, [sendMessage]);

  const loadOlderMessages = useCallback(async (): Promise<boolean> => {
    if (!hasMore.current) return false;
    pageRef.current += 1;

    try {
      const response = await api.get<{ messages: ChatMessage[]; hasMore: boolean }>(
        `/chat/history?page=${pageRef.current}`
      );
      if (response.messages.length) {
        setMessages((prev) => [...prev, ...response.messages]);
      }
      hasMore.current = response.hasMore;
      return response.hasMore;
    } catch {
      return false;
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setQuickReplies([]);
    AsyncStorage.removeItem(CACHE_KEY);
    pageRef.current = 0;
    hasMore.current = true;
  }, []);

  return {
    messages,
    isTyping,
    quickReplies,
    sendMessage,
    sendVoice,
    loadOlderMessages,
    clearChat,
  };
}

export function useChat() {
  return useContext(ChatContext);
}
