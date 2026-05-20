export type AgentEvent =
  | AudioResponseEvent
  | TextResponseEvent
  | TranscriptEvent
  | PaymentRequiredEvent
  | OtpRequiredEvent
  | OtpVerifiedEvent
  | ToolActivityEvent
  | SessionEstablishedEvent
  | AudioOutputEvent
  | TextOutputEvent
  | ToolUseEvent
  | ToolResultEvent
  | AudioReadyEvent
  | SessionClosedEvent
  | ContentStartEvent
  | ContentEndEvent
  | AgentErrorEvent;

export interface AudioResponseEvent {
  type: 'audioResponse';
  data: string; // base64-encoded audio
}

export interface TextResponseEvent {
  type: 'textResponse';
  text: string;
  isFinal: boolean;
}

export interface TranscriptEvent {
  type: 'transcript';
  role: 'user' | 'agent';
  text: string;
  isFinal: boolean;
}

export interface PaymentRequiredEvent {
  type: 'paymentRequired';
  clientSecret: string;
  bookingId: string;
  amount: number;
  currency: string;
  courseName: string;
  date: string;
  teeTime: string;
}

export interface OtpRequiredEvent {
  type: 'otpRequired';
  identifier: string;
  identifierType: 'phone' | 'email';
}

export interface OtpVerifiedEvent {
  type: 'otpVerified';
  identifier: string;
}

export interface ToolActivityEvent {
  type: 'toolActivity';
  activity: string; // "Searching tee times...", "Checking weather..."
}

export interface SessionEstablishedEvent {
  type: 'sessionEstablished';
  sessionId: string;
}

export interface AudioOutputEvent {
  type: 'audioOutput';
  content: string; // base64-encoded PCM audio
}

export interface TextOutputEvent {
  type: 'textOutput';
  content: string;
}

export interface ToolUseEvent {
  type: 'toolUse';
  toolName: string;
  [key: string]: any;
}

export interface ToolResultEvent {
  type: 'toolResult';
  [key: string]: any;
}

export interface AudioReadyEvent {
  type: 'audioReady';
}

export interface SessionClosedEvent {
  type: 'sessionClosed';
}

export interface ContentStartEvent {
  type: 'contentStart';
  [key: string]: any;
}

export interface ContentEndEvent {
  type: 'contentEnd';
  [key: string]: any;
}

export interface AgentErrorEvent {
  type: 'error';
  [key: string]: any;
}
