import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthContext, useAuthProvider } from '../hooks/useAuth';
import { ChatContext, useChatProvider } from '../hooks/useChat';
import { colors } from '../lib/theme';

export default function RootLayout() {
  const auth = useAuthProvider();
  const chat = useChatProvider();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthContext.Provider value={auth}>
          <ChatContext.Provider value={chat}>
            <StatusBar style="light" backgroundColor={colors.background} />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="login"
                options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
              />
              <Stack.Screen
                name="signup"
                options={{ animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="course/[id]"
                options={{ animation: 'slide_from_right' }}
              />
            </Stack>
          </ChatContext.Provider>
        </AuthContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
