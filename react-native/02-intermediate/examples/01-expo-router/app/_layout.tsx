import { Stack } from 'expo-router';

/**
 * Root layout — Stack ครอบทั้งแอป
 * หน้าใน (tabs) จะเป็นกลุ่มแท็บ; หน้า product/[id] ถูก push ทับด้านบน
 */
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="product/[id]"
        options={{ title: 'รายละเอียดสินค้า', presentation: 'card' }}
      />
    </Stack>
  );
}
