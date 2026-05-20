import { useState, useEffect, useRef, useCallback } from 'react';
import { AgentConnection, ConnectionState, AgentEvent } from '@golf-concierge/shared';
import { AudioCapture } from '../lib/audio-capture';
import { AudioPlayer } from '../lib/audio-player';

const AGENT_ENDPOINT = process.env.EXPO_PUBLIC_AGENT_ENDPOINT || 'ws://localhost:8080';

export interface ChatMessage {
  id: string;
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

    // Audio player for responses
    const player = new AudioPlayer((speaking) => setIsSpeaking(speaking));
    audioPlayerRef.current = player;

    conn.onStateChange(setState);

    // Handle audio output from Nova Sonic
    conn.on('audioOutput', (event: AgentEvent) => {
      if (event.type === 'audioOutput' && event.content) {
        player.enqueue(event.content);
      }
    });

    // Handle text output (transcript of agent's spoken response)
    conn.on('textOutput', (event: AgentEvent) => {
      if (event.type === 'textOutput') {
        setMessages((prev) => [
          ...prev,
          { id: `agent_${Date.now()}`, role: 'agent', text: (event as { data?: { content?: string } }).data?.content || '', timestamp: new Date() },
        ]);
      }
    });

    // Handle text responses
    conn.on('textResponse', (event: AgentEvent) => {
      if (event.type === 'textResponse') {
        setMessages((prev) => [
          ...prev,
          { id: `agent_${Date.now()}`, role: 'agent', text: event.text, timestamp: new Date() },
        ]);
      }
    });

    // Handle transcript events
    conn.on('transcript', (event: AgentEvent) => {
      if (event.type === 'transcript' && event.role === 'agent' && event.isFinal) {
        setMessages((prev) => [
          ...prev,
          { id: `agent_tr_${Date.now()}`, role: 'agent', text: event.text, timestamp: new Date() },
        ]);
      }
    });

    // Audio ready -- server has set up the Bedrock session
    conn.on('audioReady', () => {
      setIsAudioReady(true);
    });

    // Session closed
    conn.on('sessionClosed', () => {
      setIsAudioReady(false);
    });

    conn.connect();

    return () => {
      conn.disconnect();
      player.interrupt();
    };
  }, []);

  // Start voice recording and streaming
  const startRecording = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn || !isAudioReady) return;

    // If agent is speaking, interrupt (barge-in)
    if (audioPlayerRef.current?.isSpeaking) {
      await audioPlayerRef.current.interrupt();
    }

    // Start audio session if not already started
    conn.startAudioSession();

    const capture = new AudioCapture((base64Pcm) => {
      conn.sendAudio(base64Pcm);
    });
    audioCaptureRef.current = capture;

    await capture.start();
    setIsRecording(true);
  }, [isAudioReady]);

  // Stop voice recording
  const stopRecording = useCallback(async () => {
    if (audioCaptureRef.current) {
      await audioCaptureRef.current.stop();
      audioCaptureRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const sendText = useCallback((text: string) => {
    connectionRef.current?.sendText(text);
    setMessages((prev) => [
      ...prev,
      { id: `user_${Date.now()}`, role: 'user', text, timestamp: new Date() },
    ]);
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
    connection: connectionRef,
  };
}
