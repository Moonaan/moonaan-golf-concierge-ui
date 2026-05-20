// ============================================================
// VoiceInput — Web Speech API voice-to-text with auto-send
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface VoiceInputProps {
  onResult: (transcript: string) => void;
  onCancel: () => void;
}

// Extend window for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

type SpeechRecognitionType = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognition(): SpeechRecognitionType | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as SpeechRecognitionType | null;
}

export function VoiceInput({ onResult, onCancel }: VoiceInputProps) {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionType> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAndSend = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser. Try Chrome or Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      const currentTranscript = final || interim;
      setTranscript(currentTranscript);

      // Reset silence timer on every result
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      // Auto-send after 1.5s of silence (only if we have final text)
      if (final) {
        silenceTimerRef.current = setTimeout(() => {
          onResult(final);
        }, 1500);
      }
    };

    recognition.onerror = (event: Event & { error: string }) => {
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access and try again.');
      } else if (event.error !== 'aborted') {
        setError('Voice recognition error. Please try again.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // Start listening immediately
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setError('Could not start voice recognition.');
    }

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      recognition.abort();
    };
  }, [onResult]);

  if (error) {
    return (
      <div className="flex items-center gap-3 p-3 bg-white border-t border-gray-200">
        <div className="flex-1 text-sm text-red-500 px-3">{error}</div>
        <button
          onClick={onCancel}
          className="flex-shrink-0 w-11 h-11 rounded-full bg-gray-100 
                     flex items-center justify-center text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white border-t border-gray-200">
      {/* Pulsing red dot */}
      <div className="flex-shrink-0 relative">
        <div
          className={`w-4 h-4 rounded-full bg-red-500 ${
            isListening ? 'animate-pulse' : ''
          }`}
        />
        {isListening && (
          <div className="absolute inset-0 w-4 h-4 rounded-full bg-red-500 animate-ping opacity-75" />
        )}
      </div>

      {/* Transcript preview */}
      <div className="flex-1 min-h-[44px] flex items-center">
        {transcript ? (
          <p className="text-[15px] text-gray-900">{transcript}</p>
        ) : (
          <p className="text-[15px] text-gray-400 animate-pulse">Listening...</p>
        )}
      </div>

      {/* Send / Cancel buttons */}
      {transcript && (
        <button
          onClick={stopAndSend}
          className="flex-shrink-0 px-4 py-2 rounded-full bg-golf-green-700 
                     text-white text-sm font-medium hover:bg-golf-green-600 transition-all"
        >
          Send
        </button>
      )}

      <button
        onClick={() => {
          recognitionRef.current?.abort();
          onCancel();
        }}
        className="flex-shrink-0 w-11 h-11 rounded-full bg-gray-100 
                   flex items-center justify-center text-gray-600
                   hover:bg-gray-200 transition-all"
        aria-label="Cancel voice input"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
