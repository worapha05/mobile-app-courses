import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { useSession } from '../../hooks/useFieldShelf';

export default function TabsLayout() {
  const session = useSession();

  if (session.isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!session.data) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="index" options={{ title: 'สินค้า' }} />
      <Tabs.Screen name="scan" options={{ title: 'สแกน' }} />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'โปรไฟล์',
          tabBarIcon: () => <Text>Profile</Text>,
        }}
      />
    </Tabs>
  );
}
