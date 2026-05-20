import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';
import type { ChatMessage as ChatMessageType } from '../../lib/types';
import CourseOptionCard from '../cards/CourseOptionCard';
import TripItineraryCard from '../cards/TripItineraryCard';
import BookingConfirmationCard from '../cards/BookingConfirmationCard';
import HotelCard from '../cards/HotelCard';
import WeatherAlertCard from '../cards/WeatherAlertCard';

interface Props {
  message: ChatMessageType;
  onSendMessage: (text: string) => void;
}

export default function ChatMessage({ message, onSendMessage }: Props) {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const isUser = message.role === 'user';

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const renderCard = (card: any, index: number) => {
    switch (card.type) {
      case 'course_option':
        return <CourseOptionCard key={index} data={card} onBook={onSendMessage} />;
      case 'trip_itinerary':
        return <TripItineraryCard key={index} data={card} onBook={onSendMessage} />;
      case 'booking_confirmation':
        return <BookingConfirmationCard key={index} data={card} />;
      case 'hotel':
        return <HotelCard key={index} data={card} onBook={onSendMessage} />;
      case 'weather_alert':
        return <WeatherAlertCard key={index} data={card} onAction={onSendMessage} />;
      default:
        return null;
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(300).springify()}
      style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}
    >
      {!isUser && (
        <View style={styles.avatar}>
          <Ionicons name="golf" size={16} color={colors.accent} />
        </View>
      )}
      <Pressable
        onLongPress={() => setShowTimestamp((prev) => !prev)}
        style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}
      >
        <Text style={[styles.messageText, isUser && styles.userText]}>
          {message.content}
        </Text>
        {message.cards?.map((card, i) => renderCard(card, i))}
        {showTimestamp && (
          <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 4,
  },
  bubble: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    flexShrink: 1,
  },
  userBubble: {
    backgroundColor: colors.primaryLight,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: colors.text,
    fontSize: fontSize.base,
    lineHeight: 22,
  },
  userText: {
    // slightly different weight for user messages
  },
  timestamp: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
});
