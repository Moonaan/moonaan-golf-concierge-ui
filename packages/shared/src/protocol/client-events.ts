export type ClientEvent =
  | AudioFrameEvent
  | TextMessageEvent
  | PaymentConfirmedEvent
  | SessionStartEvent
  | InitializeConnectionEvent
  | PromptStartEvent
  | SystemPromptEvent
  | AudioStartEvent
  | StopAudioEvent;

export interface AudioFrameEvent {
  type: 'audioFrame';
  data: string; // base64-encoded PCM audio
  sampleRate: number;
}

export interface TextMessageEvent {
  type: 'textMessage';
  text: string;
}

export interface PaymentConfirmedEvent {
  type: 'paymentConfirmed';
  paymentIntentId: string;
  bookingId: string;
}

export interface SessionStartEvent {
  type: 'sessionStart';
}

export interface InitializeConnectionEvent {
  type: 'initializeConnection';
}

export interface PromptStartEvent {
  type: 'promptStart';
}

export interface SystemPromptEvent {
  type: 'systemPrompt';
  data?: string; // custom system prompt, or omit for default
}

export interface AudioStartEvent {
  type: 'audioStart';
}

export interface StopAudioEvent {
  type: 'stopAudio';
}
