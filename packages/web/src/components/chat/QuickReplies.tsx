// ============================================================
// QuickReplies — Tappable contextual response chips
// ============================================================

interface QuickRepliesProps {
  replies: string[];
  onSelect: (reply: string) => void;
}

export function QuickReplies({ replies, onSelect }: QuickRepliesProps) {
  if (!replies.length) return null;

  return (
    <div className="px-3 pb-1 pt-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {replies.map((reply) => (
          <button
            key={reply}
            onClick={() => onSelect(reply)}
            className="flex-shrink-0 px-4 py-2 rounded-full 
                       border border-golf-green-300 bg-golf-green-50 
                       text-golf-green-700 text-sm font-medium
                       hover:bg-golf-green-100 active:bg-golf-green-200
                       transition-all whitespace-nowrap"
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
}
