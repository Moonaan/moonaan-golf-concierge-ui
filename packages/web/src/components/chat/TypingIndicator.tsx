// ============================================================
// TypingIndicator — Three-dot animation for AI thinking state
// ============================================================

export function TypingIndicator() {
  return (
    <div className="flex gap-2 justify-start animate-chat-in">
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-golf-green-700 flex items-center justify-center">
        <span className="text-white text-xs font-bold">⛳</span>
      </div>

      <div className="bg-golf-green-700 rounded-2xl rounded-bl-md px-5 py-4">
        <div className="flex gap-1.5">
          <div
            className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
            style={{ animationDelay: '0ms', animationDuration: '600ms' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
            style={{ animationDelay: '150ms', animationDuration: '600ms' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
            style={{ animationDelay: '300ms', animationDuration: '600ms' }}
          />
        </div>
      </div>
    </div>
  );
}
