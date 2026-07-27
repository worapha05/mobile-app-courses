import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { unlockWithBiometrics } from '../lib/biometrics';

export function BiometricGateDemo() {
  const [message, setMessage] = useState('ล็อกอยู่ — ยังไม่เปิดข้อมูลอ่อนไหว');
  const [unlocked, setUnlocked] = useState(false);

  async function onUnlock() {
    const result = await unlockWithBiometrics();
    if (!result.ok) {
      setUnlocked(false);
      setMessage(`ล้มเหลว: ${result.reason}`);
      return;
    }
    setUnlocked(true);
    setMessage(`ปลดล็อกด้วย ${result.method} — อ่าน token จาก SecureStore ได้`);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Biometric Gate</Text>
      <Text style={styles.body}>{message}</Text>
      <Pressable style={styles.btn} onPress={() => void onUnlock()}>
        <Text style={styles.btnText}>{unlocked ? 'ยืนยันอีกครั้ง' : 'Unlock'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#111827',
    gap: 10,
  },
  title: { color: '#f9fafb', fontWeight: '900', fontSize: 18 },
  body: { color: '#9ca3af', lineHeight: 20 },
  btn: {
    backgroundColor: '#34d399',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnText: { fontWeight: '800', color: '#064e3b' },
});
