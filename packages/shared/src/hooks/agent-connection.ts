import { ClientEvent, AgentEvent } from '../protocol';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export type AgentEventHandler = (event: AgentEvent) => void;

export class AgentConnection {
  private ws: WebSocket | null = null;
  private _state: ConnectionState = 'disconnected';
  private _isAudioReady = false;
  private listeners: Map<string, Set<AgentEventHandler>> = new Map();
  private stateListeners: Set<(state: ConnectionState) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly endpoint: string) {}

  get isAudioReady(): boolean {
    return this._isAudioReady;
  }

  get state(): ConnectionState {
    return this._state;
  }

  connect(): void {
    if (this._state === 'connected' || this._state === 'connecting') return;

    this.setState('connecting');
    this.ws = new WebSocket(this.endpoint);

    this.ws.onopen = () => {
      this.setState('connected');
      this.reconnectAttempts = 0;
      this._isAudioReady = false;
      this.send({ type: 'sessionStart' });
      this.initializeSession();
    };

    this.ws.onmessage = (event) => {
      try {
        const raw = JSON.parse(
          typeof event.data === 'string' ? event.data : new TextDecoder().decode(event.data),
        );
        // Server sends { type, data } — construct AgentEvent by spreading data properties
        const agentEvent: AgentEvent =
          raw.data !== undefined
            ? ({ type: raw.type, ...raw.data } as AgentEvent)
            : (raw as AgentEvent);

        if (agentEvent.type === 'audioReady') {
          this._isAudioReady = true;
        }

        this.dispatch(agentEvent);
      } catch (err) {
        console.error('Failed to parse agent event:', err);
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
      if (this._state !== 'disconnected') {
        this.attemptReconnect();
      }
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }

  /** Send initializeConnection to create the Bedrock session */
  initializeSession(): void {
    this.send({ type: 'initializeConnection' });
  }

  /** Start the audio stream (promptStart + systemPrompt + audioStart) */
  startAudioSession(): void {
    this.send({ type: 'promptStart' });
    this.send({ type: 'systemPrompt' }); // use server default
    this.send({ type: 'audioStart' });
  }

  /** Stop the audio stream and close the session */
  stopAudioSession(): void {
    this._isAudioReady = false;
    this.send({ type: 'stopAudio' });
  }

  disconnect(): void {
    this.setState('disconnected');
    this._isAudioReady = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(event: ClientEvent): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send — WebSocket not connected');
      return;
    }
    this.ws.send(JSON.stringify(event));
  }

  sendAudio(base64Audio: string, sampleRate: number = 16000): void {
    this.send({ type: 'audioFrame', data: base64Audio, sampleRate });
  }

  sendText(text: string): void {
    this.send({ type: 'textMessage', text });
  }

  sendPaymentConfirmed(paymentIntentId: string, bookingId: string): void {
    this.send({ type: 'paymentConfirmed', paymentIntentId, bookingId });
  }

  on(eventType: AgentEvent['type'] | '*', handler: AgentEventHandler): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);
    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(handler);
    };
  }

  onStateChange(handler: (state: ConnectionState) => void): () => void {
    this.stateListeners.add(handler);
    return () => {
      this.stateListeners.delete(handler);
    };
  }

  private dispatch(event: AgentEvent): void {
    // Dispatch to specific type listeners
    this.listeners.get(event.type)?.forEach((h) => h(event));
    // Dispatch to wildcard listeners
    this.listeners.get('*')?.forEach((h) => h(event));
  }

  private setState(state: ConnectionState): void {
    this._state = state;
    this.stateListeners.forEach((h) => h(state));
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setState('disconnected');
      return;
    }

    this.setState('reconnecting');
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }
}
