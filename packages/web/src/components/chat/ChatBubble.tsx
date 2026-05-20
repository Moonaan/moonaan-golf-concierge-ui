// ============================================================
// ChatBubble — Message bubble with rich content support
// ============================================================

import { useState } from 'react';
import type { ChatMessage } from '@/types/chat';
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

        {/* Rich content */}
        {message.richContent && (
          <div className="mt-2 w-full">
            {message.richContent.type === 'course_options' && (
              <div className="space-y-2">
                {message.richContent.courses.map((course) => (
                  <CourseOptionCard
                    key={course.courseId}
                    course={course}
                    onBook={() => onAction?.('book_course', course)}
                  />
                ))}
              </div>
            )}

            {message.richContent.type === 'trip_itinerary' && (
              <TripItineraryCard
                trip={message.richContent.trip}
                onBookAll={() => onAction?.('book_trip', message.richContent)}
                onModify={() => onAction?.('modify_trip', message.richContent)}
              />
            )}

            {message.richContent.type === 'booking_confirmation' && (
              <BookingConfirmationCard booking={message.richContent.booking} />
            )}

            {message.richContent.type === 'hotel_options' && (
              <div className="space-y-2">
                {message.richContent.hotels.map((hotel) => (
                  <HotelOptionCard
                    key={hotel.hotelId}
                    hotel={hotel}
                    onBook={() => onAction?.('book_hotel', hotel)}
                  />
                ))}
              </div>
            )}

            {message.richContent.type === 'map_location' && (
              <div className="rounded-xl overflow-hidden border border-white/10">
                <div className="bg-golf-green-800 h-40 flex items-center justify-center text-white/60 text-sm">
                  <div className="text-center">
                    <span className="text-2xl block mb-1">📍</span>
                    {message.richContent.name}
                  </div>
                </div>
              </div>
            )}

            {message.richContent.type === 'weather_alert' && (
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">
                    {message.richContent.forecast.golfability >= 70 ? '☀️' : message.richContent.forecast.golfability >= 40 ? '⛅' : '🌧️'}
                  </span>
                  <span className="font-semibold text-gray-900">{message.richContent.forecast.location}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>High {message.richContent.forecast.high}° / Low {message.richContent.forecast.low}°</p>
                  <p>Wind: {message.richContent.forecast.windSpeed} mph</p>
                  <p>Rain: {message.richContent.forecast.precipitation}%</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Golf Score:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-golf-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${message.richContent.forecast.golfability}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-golf-green-700">
                      {message.richContent.forecast.golfability}/100
                    </span>
                  </div>
                </div>
              </div>
            )}

            {message.richContent.type === 'payment_request' && (
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Amount Due</p>
                  <p className="text-3xl font-bold text-gray-900">${message.richContent.amount}</p>
                  <p className="text-sm text-gray-500 mt-1">{message.richContent.description}</p>
                  <button className="btn-primary mt-3 w-full text-sm py-2.5">
                    Pay Now
                  </button>
                </div>
              </div>
            )}
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
