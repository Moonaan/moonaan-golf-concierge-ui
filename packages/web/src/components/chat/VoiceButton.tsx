interface VoiceButtonProps {
  isRecording: boolean;
  isSpeaking: boolean;
  isAudioReady: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function VoiceButton({ isRecording, isSpeaking, isAudioReady, onPress, disabled }: VoiceButtonProps) {
  const isDisabled = disabled || !isAudioReady;

  return (
    <button
      onClick={onPress}
      disabled={isDisabled}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
        isRecording
          ? 'bg-red-500 animate-pulse'
          : isSpeaking
            ? 'bg-green-600'
            : 'bg-gray-200 hover:bg-gray-300'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isRecording ? 'Stop recording' : isSpeaking ? 'Agent speaking...' : 'Start recording'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`w-5 h-5 ${isRecording || isSpeaking ? 'text-white' : 'text-gray-600'}`}
      >
        <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2Z" />
      </svg>
    </button>
  );
}
