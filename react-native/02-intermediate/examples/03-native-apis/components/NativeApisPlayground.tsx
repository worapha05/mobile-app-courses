import { CameraView } from 'expo-camera';
import type { ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCameraPermission } from '../hooks/useCameraPermission';
import { useExpoPushToken } from '../hooks/useExpoPushToken';
import { useForegroundLocation } from '../hooks/useForegroundLocation';

/**
 * เดโมรวม — ในแอปจริงควรแยกหน้าและขอ permission เฉพาะตอนเข้าฟีเจอร์
 */
export function NativeApisPlayground() {
  const camera = useCameraPermission();
  const location = useForegroundLocation();
  const push = useExpoPushToken();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Native APIs</Text>

      <Section title="กล้อง">
        <Text style={styles.meta}>สถานะ: {camera.status}</Text>
        {camera.status !== 'granted' ? (
          <View style={styles.row}>
            <Btn label="ขอสิทธิ์กล้อง" onPress={() => void camera.request()} />
            {camera.status === 'denied' ? (
              <Btn label="เปิด Settings" onPress={() => void Linking.openSettings()} />
            ) : null}
          </View>
        ) : (
          <CameraView style={styles.camera} facing="back" />
        )}
      </Section>

      <Section title="ตำแหน่ง (Foreground)">
        <Text style={styles.meta}>สถานะ: {location.status}</Text>
        {location.coords ? (
          <Text style={styles.mono}>
            {location.coords.lat.toFixed(5)}, {location.coords.lng.toFixed(5)}
          </Text>
        ) : null}
        {location.error ? <Text style={styles.error}>{location.error}</Text> : null}
        <Btn label="อ่านพิกัด" onPress={() => void location.requestAndRead()} />
      </Section>

      <Section title="Push Notifications">
        <Text style={styles.meta}>{push.token ?? 'ยังไม่มี token'}</Text>
        {push.error ? <Text style={styles.error}>{push.error}</Text> : null}
        <Btn label="ลงทะเบียน Push" onPress={() => void push.register()} />
      </Section>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Btn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.btn}>
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 12, backgroundColor: '#f1f5f9' },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  cardTitle: { fontWeight: '800', fontSize: 16 },
  meta: { color: '#64748b' },
  mono: { fontFamily: 'monospace', color: '#0f172a' },
  error: { color: '#b91c1c' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn: {
    alignSelf: 'flex-start',
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: { color: '#fff', fontWeight: '700' },
  camera: { width: '100%', height: 180, borderRadius: 12, overflow: 'hidden' },
});
