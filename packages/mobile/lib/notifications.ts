import * as Notifications from 'expo-notifications';
import * as Device from 'expo-constants';
import { Platform } from 'react-native';
import { router } from 'expo-router';

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Device.default.expoConfig?.extra?.eas?.projectId,
    });

    // TODO(MGC-16): register token with Bedrock AgentCore notifications backend

    // Android notification channel
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('bookings', {
        name: 'Booking Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#C4A35A',
      });

      Notifications.setNotificationChannelAsync('weather', {
        name: 'Weather Alerts',
        importance: Notifications.AndroidImportance.DEFAULT,
      });

      Notifications.setNotificationChannelAsync('waitlist', {
        name: 'Waitlist Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500],
      });
    }

    return tokenData.data;
  } catch {
    return null;
  }
}

export function setupNotificationListeners() {
  // Handle notification taps
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;

    switch (data?.type) {
      case 'booking_reminder':
      case 'booking_confirmed':
        router.push('/(tabs)/rounds');
        break;
      case 'waitlist_available':
        router.push('/(tabs)/chat');
        break;
      case 'weather_alert':
        router.push('/(tabs)/chat');
        break;
      default:
        router.push('/(tabs)/chat');
    }
  });

  return () => subscription.remove();
}
