interface AgentChatBubbleProps {
  role: 'user' | 'agent';
  text: string;
}

export function AgentChatBubble({ role, text }: AgentChatBubbleProps) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
        isUser
          ? 'bg-green-700 text-white rounded-br-sm'
          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}
