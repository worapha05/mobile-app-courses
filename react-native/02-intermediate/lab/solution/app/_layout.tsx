import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { queryClient } from '../lib/query';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'เข้าสู่ระบบ', headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ title: 'รายละเอียด' }} />
      </Stack>
    </QueryClientProvider>
  );
}
