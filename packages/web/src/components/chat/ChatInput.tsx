// ============================================================
// ChatInput — Auto-resizing text input with voice & send
// ============================================================

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react';
import { Send, Mic } from 'lucide-react';
import { VoiceInput } from './VoiceInput';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxHeight = 4 * 24; // ~4 lines
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, onSend, disabled]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleVoiceResult = useCallback(
    (transcript: string) => {
      setIsVoiceMode(false);
      if (transcript.trim()) {
        onSend(transcript.trim());
      }
    },
    [onSend],
  );

  if (isVoiceMode) {
    return (
      <VoiceInput
        onResult={handleVoiceResult}
        onCancel={() => setIsVoiceMode(false)}
      />
    );
  }

  const hasText = text.trim().length > 0;

  return (
    <div className="flex items-end gap-2 p-3 bg-white border-t border-gray-200">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message your concierge..."
          disabled={disabled}
          rows={1}
          className="w-full resize-none rounded-2xl border border-gray-300 bg-gray-50 
                     px-4 py-3 text-[15px] leading-6 outline-none
                     focus:border-golf-green-500 focus:ring-2 focus:ring-golf-green-500/20
                     disabled:opacity-50 transition-all placeholder:text-gray-400"
          style={{ minHeight: '48px', maxHeight: '96px' }}
        />
      </div>

      {/* Mic / Send toggle */}
      {hasText ? (
        <button
          onClick={handleSend}
          disabled={disabled}
          className="flex-shrink-0 w-11 h-11 rounded-full bg-golf-green-700 
                     flex items-center justify-center text-white
                     hover:bg-golf-green-600 active:bg-golf-green-800 
                     disabled:opacity-50 transition-all"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={() => setIsVoiceMode(true)}
          disabled={disabled}
          className="flex-shrink-0 w-11 h-11 rounded-full bg-gray-100 
                     flex items-center justify-center text-gray-600
                     hover:bg-gray-200 active:bg-gray-300 
                     disabled:opacity-50 transition-all"
          aria-label="Voice input"
        >
          <Mic className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
