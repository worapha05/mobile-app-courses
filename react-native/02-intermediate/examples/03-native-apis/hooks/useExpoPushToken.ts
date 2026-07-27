import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useCallback, useState } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function resolveEasProjectId(): string | undefined {
  return (
    Constants.easConfig?.projectId ??
    (Constants.expoConfig?.extra?.eas?.projectId as string | undefined)
  );
}

export function useExpoPushToken() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async () => {
    setError(null);
    if (!Device.isDevice) {
      setError('Push ต้องทดสอบบนเครื่องจริง');
      return null;
    }

    const current = await Notifications.getPermissionsAsync();
    let finalStatus = current.status;
    if (current.status !== 'granted') {
      const asked = await Notifications.requestPermissionsAsync();
      finalStatus = asked.status;
    }
    if (finalStatus !== 'granted') {
      setError('ผู้ใช้ยังไม่อนุญาตการแจ้งเตือน');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const projectId = resolveEasProjectId();
    if (!projectId) {
      setError('ตั้ง extra.eas.projectId ใน app config ก่อนเรียก getExpoPushTokenAsync');
      return null;
    }

    const push = await Notifications.getExpoPushTokenAsync({ projectId });
    setToken(push.data);
    return push.data;
  }, []);

  return { token, error, register };
}
