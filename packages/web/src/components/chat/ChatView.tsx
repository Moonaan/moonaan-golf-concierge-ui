import React, { useState, useRef, useEffect } from 'react';
import { useAgentConnection } from '../../hooks/useAgentConnection';
import { AgentChatBubble } from './AgentChatBubble';
import { VoiceButton } from './VoiceButton';

export function ChatView() {
  const { state, messages, isRecording, isSpeaking, isAudioReady, startRecording, stopRecording, sendText } =
    useAgentConnection();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendText(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-sand-50">
      {/* Header */}
      <header className="bg-green-900 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Missouri Golf Trail Concierge</h1>
        <span className={`text-xs px-2 py-1 rounded-full ${
          state === 'connected' ? 'bg-green-500' :
          state === 'connecting' || state === 'reconnecting' ? 'bg-yellow-500' : 'bg-red-500'
        }`}>
          {state}
        </span>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-xl mb-2">Welcome to the Missouri Golf Trail!</p>
            <p>Ask me about tee times, courses, or trip planning.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <AgentChatBubble key={i} role={msg.role} text={msg.text} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t bg-white px-4 py-3 flex items-center gap-3">
        <VoiceButton
          isRecording={isRecording}
          isSpeaking={isSpeaking}
          isAudioReady={isAudioReady}
          onPress={isRecording ? stopRecording : startRecording}
        />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={state !== 'connected'}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || state !== 'connected'}
          className="bg-green-700 text-white rounded-full px-4 py-2 disabled:opacity-50 hover:bg-green-800 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
