import { useState, useEffect, useRef, useCallback } from 'react';
import { AgentConnection, ConnectionState, AgentEvent } from '@golf-concierge/shared';
import { AudioCapture } from '../lib/audio-capture';
import { AudioPlayer } from '../lib/audio-player';

const AGENT_ENDPOINT = import.meta.env.VITE_AGENT_ENDPOINT || 'ws://localhost:8080';

export interface ChatMessage {
  role: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export function useAgentConnection() {
  const connectionRef = useRef<AgentConnection | null>(null);
  const audioCaptureRef = useRef<AudioCapture | null>(null);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const [state, setState] = useState<ConnectionState>('disconnected');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);

  useEffect(() => {
    const conn = new AgentConnection(AGENT_ENDPOINT);
    connectionRef.current = conn;

    const player = new AudioPlayer((speaking) => setIsSpeaking(speaking));
    audioPlayerRef.current = player;

    conn.onStateChange(setState);

    conn.on('audioOutput', (event: AgentEvent) => {
      if (event.type === 'audioOutput' && event.content) {
        player.enqueue(event.content);
      }
    });

    conn.on('textOutput', (event: AgentEvent) => {
      if (event.type === 'textOutput') {
        setMessages((prev) => [
          ...prev,
          { role: 'agent', text: (event as any).data?.content || '', timestamp: new Date() },
        ]);
      }
    });

    conn.on('textResponse', (event: AgentEvent) => {
      if (event.type === 'textResponse') {
        setMessages((prev) => [...prev, { role: 'agent', text: event.text, timestamp: new Date() }]);
      }
    });

    conn.on('transcript', (event: AgentEvent) => {
      if (event.type === 'transcript' && event.role === 'agent' && event.isFinal) {
        setMessages((prev) => [...prev, { role: 'agent', text: event.text, timestamp: new Date() }]);
      }
    });

    conn.on('audioReady', () => setIsAudioReady(true));
    conn.on('sessionClosed', () => setIsAudioReady(false));

    conn.connect();
    return () => {
      conn.disconnect();
      player.interrupt();
    };
  }, []);

  const startRecording = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn || !isAudioReady) return;

    if (audioPlayerRef.current?.isSpeaking) {
      await audioPlayerRef.current.interrupt();
    }

    conn.startAudioSession();

    const capture = new AudioCapture((base64Pcm) => {
      conn.sendAudio(base64Pcm);
    });
    audioCaptureRef.current = capture;
    await capture.start();
    setIsRecording(true);
  }, [isAudioReady]);

  const stopRecording = useCallback(async () => {
    if (audioCaptureRef.current) {
      await audioCaptureRef.current.stop();
      audioCaptureRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const sendText = useCallback((text: string) => {
    connectionRef.current?.sendText(text);
    setMessages((prev) => [...prev, { role: 'user', text, timestamp: new Date() }]);
  }, []);

  const sendPaymentConfirmed = useCallback((paymentIntentId: string, bookingId: string) => {
    connectionRef.current?.sendPaymentConfirmed(paymentIntentId, bookingId);
  }, []);

  return {
    state,
    messages,
    isRecording,
    isSpeaking,
    isAudioReady,
    startRecording,
    stopRecording,
    sendText,
    sendPaymentConfirmed,
  };
}
