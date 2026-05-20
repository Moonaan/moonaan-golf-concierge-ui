// ============================================================
// ChatBubble — Message bubble with rich content support
// ============================================================

import { useState } from 'react';
import type { ChatMessage } from '@golf-concierge/shared';
import { CourseOptionCard } from './CourseOptionCard';
import { TripItineraryCard } from './TripItineraryCard';
import { BookingConfirmationCard } from './BookingConfirmationCard';
import { HotelOptionCard } from './HotelOptionCard';

interface ChatBubbleProps {
  message: ChatMessage;
  onAction?: (action: string, data?: unknown) => void;
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return isToday ? time : `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`;
}

// Simple markdown-ish rendering (bold, links)
function renderContent(content: string): JSX.Element[] {
  const parts: JSX.Element[] = [];
  const regex = /(\*\*(.+?)\*\*)|(\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(content)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{content.slice(lastIndex, match.index)}</span>);
    }

    if (match[1]) {
      // Bold
      parts.push(<strong key={key++} className="font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      // Link
      parts.push(
        <a
          key={key++}
          href={match[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-80"
        >
          {match[4]}
        </a>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(<span key={key++}>{content.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : [<span key={0}>{content}</span>];
}

export function ChatBubble({ message, onAction }: ChatBubbleProps) {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) return null;

  return (
    <div
      className={`flex gap-2 animate-chat-in ${isUser ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
      onTouchStart={() => setShowTimestamp((prev) => !prev)}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-golf-green-700 flex items-center justify-center mt-1">
          <span className="text-white text-xs font-bold">⛳</span>
        </div>
      )}

      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Text bubble */}
        {message.content && (
          <div
            className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap ${
              isUser
                ? 'bg-golf-green-500 text-white rounded-br-md'
                : 'bg-golf-green-700 text-white rounded-bl-md'
            }`}
          >
            {renderContent(message.content)}
          </div>
        )}

        {/* Rich content cards */}
        {message.cards && message.cards.length > 0 && (
          <div className="mt-2 w-full space-y-2">
            {message.cards.map((card, i) => {
              switch (card.type) {
                case 'course_option':
                  return (
                    <CourseOptionCard
                      key={`${card.courseId}-${i}`}
                      course={card}
                      onBook={() => onAction?.('book_course', card)}
                    />
                  );

                case 'trip_itinerary':
                  return (
                    <TripItineraryCard
                      key={`trip-${i}`}
                      trip={card}
                      onBookAll={() => onAction?.('book_trip', card)}
                      onModify={() => onAction?.('modify_trip', card)}
                    />
                  );

                case 'booking_confirmation':
                  return <BookingConfirmationCard key={`booking-${i}`} booking={card} />;

                case 'hotel_option':
                  return (
                    <HotelOptionCard
                      key={`${card.hotelId}-${i}`}
                      hotel={card}
                      onBook={() => onAction?.('book_hotel', card)}
                    />
                  );

                case 'map_location':
                  return (
                    <div key={`map-${i}`} className="rounded-xl overflow-hidden border border-white/10">
                      <div className="bg-golf-green-800 h-40 flex items-center justify-center text-white/60 text-sm">
                        <div className="text-center">
                          <span className="text-2xl block mb-1">📍</span>
                          {card.name}
                        </div>
                      </div>
                    </div>
                  );

                case 'weather_alert': {
                  const golfability = card.golfability ?? 0;
                  return (
                    <div key={`weather-${i}`} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">
                          {golfability >= 70 ? '☀️' : golfability >= 40 ? '⛅' : '🌧️'}
                        </span>
                        <span className="font-semibold text-gray-900">{card.location}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>High {card.high}° / Low {card.low}°</p>
                        <p>Wind: {card.windSpeed} mph</p>
                        <p>Rain: {card.precipitation}%</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500">Golf Score:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-golf-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${golfability}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-golf-green-700">
                            {golfability}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                case 'payment_request':
                  return (
                    <div key={`payment-${i}`} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Amount Due</p>
                        <p className="text-3xl font-bold text-gray-900">${card.amount}</p>
                        <p className="text-sm text-gray-500 mt-1">{card.description}</p>
                        <button className="btn-primary mt-3 w-full text-sm py-2.5">
                          Pay Now
                        </button>
                      </div>
                    </div>
                  );

                default:
                  return null;
              }
            })}
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-[11px] text-gray-400 mt-1 px-1 transition-opacity duration-200 ${
            showTimestamp ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
